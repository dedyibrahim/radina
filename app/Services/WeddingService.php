<?php

namespace App\Services;

use App\Models\MusicTrack;
use App\Models\Order;
use App\Models\Template;
use App\Models\Wedding;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WeddingService
{
    public function __construct(private OrderWorkflow $workflow) {}

    public function ensurePaid(Order $order): void
    {
        if ($order->payment?->status !== 'PAID' || $order->status === 'CANCELLED') {
            throw ValidationException::withMessages(['payment' => 'Pembayaran harus dikonfirmasi sebelum mengelola undangan.']);
        }
    }

    public function create(Order $order, int $adminId): Wedding
    {
        return DB::transaction(function () use ($order, $adminId) {
            $order = Order::lockForUpdate()->findOrFail($order->id);
            $this->ensurePaid($order);
            if ($order->wedding) {
                return $order->wedding->loadContent();
            }
            $type = $order->event_type ?? 'wedding';
            $wedding = Wedding::create(['order_id' => $order->id, 'template_id' => $order->template_id, 'slug' => $order->slug,
                'event_type' => $type, 'event_details' => InvitationEvent::details(['host_name' => $order->host_name ?? '', 'honoree_name' => $order->honoree_name ?? '']),
                'title' => $type === 'wedding' ? mb_substr('The Wedding of '.$order->bride_name.' & '.$order->groom_name, 0, 255) : $order->event_title, 'status' => 'DRAFT']);
            $initial = TemplateContent::initial(Template::findOrFail($order->template_id)->template_key);
            $wedding->update($type === 'wedding' ? $initial : array_merge($initial, InvitationEvent::initial($type)));
            if ($type === 'wedding') {
                foreach (['bride', 'groom'] as $role) {
                    $wedding->couples()->create(['role' => $role, 'full_name' => $order->{$role.'_name'}, 'nickname' => explode(' ', $order->{$role.'_name'})[0]]);
                }
            }
            $wedding->settings()->create($type === 'wedding' ? [] : ['enable_gift' => false]);
            $this->workflow->transition($order, 'CONTENT_PROCESS', $adminId);

            return $wedding->loadContent();
        });
    }

    public function save(Wedding $wedding, array $data, int $adminId): Wedding
    {
        return DB::transaction(function () use ($wedding, $data) {
            $order = Order::lockForUpdate()->findOrFail($wedding->order_id);
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $this->ensurePaid($order);
            abort_if($data['expected_updated_at'] !== $wedding->updated_at->toJSON(), 409, 'Konten telah diubah di sesi lain. Muat ulang sebelum menyimpan.');
            $selected = Template::findOrFail($data['template_id']);
            if ($selected->status !== 'ACTIVE' && $selected->id !== $wedding->template_id) {
                throw ValidationException::withMessages(['template_id' => 'Template yang dipilih tidak aktif.']);
            }
            $base = collect($data)->only(['title', 'slug', 'template_id', 'wedding_date', 'quote', 'quote_source', 'opening_text', 'closing_text', 'hashtag', 'cover_image', 'hero_image', 'closing_image', 'video_url', 'shipping_gift', 'section_content', 'section_order', 'event_type', 'event_details'])->all();
            $base += ['music_url' => $data['music']['music_url'] ?? null, 'volume' => $data['music']['volume'], 'autoplay_after_open' => $data['music']['autoplay_after_open'], 'livestream_platform' => $data['livestream']['platform'] ?? null, 'livestream_url' => $data['livestream']['url'] ?? null];
            if (array_key_exists('playlist', $data['music'])) {
                $playlist = [];
                foreach ($data['music']['playlist'] as $track) {
                    if (! empty($track['library_id'])) {
                        $library = MusicTrack::find($track['library_id']);
                        $saved = collect($wedding->music_playlist ?? [])->firstWhere('library_id', $track['library_id']);
                        if ($library?->is_active) {
                            $playlist[] = ['library_id' => $library->id, 'title' => $library->title, 'artist' => $library->artist, 'url' => $library->file_url, 'cover' => $library->cover_image, 'duration' => $library->duration];
                        } elseif ($saved) {
                            $playlist[] = $saved;
                        } else {
                            throw ValidationException::withMessages(['music.playlist' => 'Lagu library tidak tersedia.']);
                        }
                    } else {
                        $playlist[] = collect($track)->only(['title', 'artist', 'url', 'cover', 'duration'])->all();
                    }
                }
                $base['music_playlist'] = $playlist;
            }
            if (array_key_exists('shuffle', $data['music'])) {
                $base['music_shuffle'] = $data['music']['shuffle'];
            }
            if (array_key_exists('repeat', $data['music'])) {
                $base['music_repeat'] = $data['music']['repeat'];
            }
            $wedding->update($base);
            $order->update(['slug' => $data['slug'], 'event_type' => $wedding->event_type, 'event_title' => $wedding->title, 'host_name' => $wedding->event_details['host_name'] ?? null, 'honoree_name' => $wedding->event_details['honoree_name'] ?? null]);
            foreach (['bride', 'groom'] as $role) {
                if ($wedding->event_type !== 'wedding') {
                    continue;
                }
                $wedding->couples()->updateOrCreate(['role' => $role], collect($data[$role])->only(['full_name', 'nickname', 'father_name', 'mother_name', 'photo', 'instagram', 'family_order'])->all());
            }
            $fields = ['events' => ['type', 'title', 'date', 'start_time', 'end_time', 'timezone', 'venue', 'address', 'google_maps_url'], 'stories' => ['date_label', 'title', 'description', 'image'], 'gallery' => ['image', 'caption'], 'gifts' => ['bank', 'account_number', 'account_name', 'logo']];
            foreach ($fields as $relation => $allowed) {
                $existing = $wedding->{$relation}()->get();
                if ($relation === 'events') {
                    $data[$relation] = \App\Models\WeddingEvent::withVisibility($data[$relation], $existing);
                }
                $same = $existing->count() === count($data[$relation]);
                foreach ($data[$relation] as $index => $entry) {
                    if (! $same) {
                        break;
                    }
                    $current = $existing[$index];
                    if ((int) $current->sort_order !== $index) {
                        $same = false;
                        break;
                    }
                    foreach ($allowed as $field) {
                        $saved = $current->{$field};
                        $incoming = $entry[$field] ?? null;
                        if (in_array($field, ['start_time', 'end_time'])) {
                            $saved = substr((string) $saved, 0, 5);
                            $incoming = substr((string) $incoming, 0, 5);
                        }
                        if ($field === 'date' && $saved instanceof \DateTimeInterface) {
                            $saved = $saved->format('Y-m-d');
                        }
                        if ((string) $saved !== (string) $incoming) {
                            $same = false;
                            break;
                        }
                    }
                }
                if ($same) {
                    if ($relation === 'events') {
                        foreach ($data[$relation] as $index => $entry) {
                            $existing[$index]->fill(collect($entry)->only(['is_visible', 'show_on_map', 'use_for_countdown'])->all());
                            if ($existing[$index]->isDirty()) $existing[$index]->save();
                        }
                    }
                    continue;
                }
                $wedding->{$relation}()->delete();
                foreach ($data[$relation] as $index => $entry) {
                    $createFields = $relation === 'events' ? [...$allowed, 'is_visible', 'show_on_map', 'use_for_countdown'] : $allowed;
                    $wedding->{$relation}()->create(collect($entry)->only($createFields)->all() + ['sort_order' => $index]);
                }
            }
            $settings = collect($data['settings'])->filter(fn ($v, $key) => str_starts_with($key, 'enable_'))->all();
            $wedding->settings()->updateOrCreate(['wedding_id' => $wedding->id], $settings);
            // Microsecond precision avoids equal versions for rapid edits in the same second.
            $wedding->touch();

            return $wedding->fresh()->loadContent();
        });
    }

    public function publish(Wedding $wedding, int $adminId): Wedding
    {
        return DB::transaction(function () use ($wedding, $adminId) {
            $order = Order::lockForUpdate()->findOrFail($wedding->order_id);
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $this->ensurePaid($order);
            $wedding->loadContent();
            $this->validateForPublication($wedding);
            CustomerPortalService::assertApproved($wedding);
            if ($order->status === 'CONTENT_PROCESS') {
                $this->workflow->transition($order, 'READY', $adminId);
            }
            $this->workflow->transition($order, 'PUBLISHED', $adminId);
            $publishedAt = $wedding->published_at ?? now();
            $duration = $order->pricing_snapshot['package']['duration_days'] ?? null;
            $expiresAt = $wedding->expires_at;
            if (! $wedding->published_at && $duration) {
                $expiresAt = $publishedAt->copy()->addDays($duration);
            }
            $wedding->update(['status' => 'PUBLISHED', 'published_at' => $publishedAt, 'expires_at' => $expiresAt]);

            return $wedding->fresh()->loadContent();
        });
    }

    public function validateForPublication(Wedding $wedding): void
    {
        $wedding->loadContent();
        $errors = [];
        if (($wedding->event_type ?? 'wedding') === 'wedding') {
            foreach (['bride', 'groom'] as $role) {
                if (! $wedding->couples->firstWhere('role', $role)?->full_name) {
                    $errors[$role] = 'Nama pengantin wajib diisi.';
                }
            }
        } else {
            $details = $wedding->event_details ?? [];
            if (! ($details['host_name'] ?? '')) {
                $errors['event_details.host_name'] = 'Nama penyelenggara wajib diisi.';
            }
            if (InvitationEvent::profile($wedding->event_type)['honoree'] && ! ($details['honoree_name'] ?? '')) {
                $errors['event_details.honoree_name'] = 'Nama yang diundang untuk dirayakan wajib diisi.';
            }
            if (! $wedding->title) {
                $errors['title'] = 'Judul acara wajib diisi.';
            }
        }
        if (! $wedding->wedding_date) {
            $errors['wedding_date'] = 'Tanggal acara wajib diisi.';
        }
        if (! $wedding->events->contains(fn ($event) => $event->is_visible !== false)) {
            $errors['events'] = 'Aktifkan minimal satu acara untuk ditampilkan di undangan.';
        }
        $errors += EventCountdown::errors(\App\Models\WeddingEvent::withVisibility($wedding->events->toArray()));
        if (! $wedding->template || ! $wedding->slug) {
            $errors['template'] = 'Template dan slug wajib diisi.';
        }
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }
}

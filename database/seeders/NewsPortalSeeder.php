<?php

namespace Database\Seeders;

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\NewsTag;
use App\Models\User;
use App\Models\WriterEarning;
use App\Services\LegacyNewsSqlParser;
use App\Services\WriterPaymentService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

class NewsPortalSeeder extends Seeder
{
    public function run(): void
    {
        $sqlPath = database_path('import/portal_berita.sql');

        if (! File::exists($sqlPath)) {
            throw new RuntimeException("Sumber berita tidak ditemukan: {$sqlPath}");
        }

        $sql = File::get($sqlPath);
        $parser = app(LegacyNewsSqlParser::class);
        $categories = $parser->table($sql, 'categories');
        $posts = $parser->table($sql, 'posts');
        $tags = $parser->table($sql, 'tags');
        $postTags = collect($parser->table($sql, 'post_tag'))->groupBy('post_id');
        $featuredPostIds = collect($parser->table($sql, 'breaking_news'))->pluck('post_id');
        $authors = $this->seedAuthors();
        $adminId = User::where('role', User::ROLE_ADMIN)->value('id');

        $this->removePreviousDummyArticles();

        $categoryModels = collect($categories)
            ->filter(fn (array $category) => $category['deleted_at'] === null)
            ->mapWithKeys(function (array $category): array {
                $name = $this->cleanPlainText($category['name']);
                $model = NewsCategory::updateOrCreate(
                    ['slug' => $category['slug']],
                    [
                        'name' => $name,
                        'name_en' => $name,
                        'description' => "Berita, informasi, dan pembaruan seputar {$name}.",
                        'description_en' => "News, information, and updates about {$name}.",
                        'accent_color' => $this->categoryColor($category['slug']),
                        'cover_image_url' => $this->categoryCover($category['slug']),
                        'seo_title' => "{$name} - ".config('news.name'),
                        'seo_title_en' => "{$name} - ".config('news.name'),
                        'seo_description' => "Kumpulan berita terbaru dalam kategori {$name}.",
                        'seo_description_en' => "The latest stories in the {$name} category.",
                    ]
                );

                return [(int) $category['id'] => $model];
            });

        $tagModels = collect($tags)->mapWithKeys(function (array $tag): array {
            $name = $this->cleanPlainText($tag['name']);
            $model = NewsTag::updateOrCreate(
                ['slug' => $tag['slug']],
                [
                    'name' => $name,
                    'name_en' => $name,
                    'description' => "Kumpulan berita dengan topik {$name}.",
                    'description_en' => "A collection of stories about {$name}.",
                ]
            );

            return [(int) $tag['id'] => $model];
        });

        collect($posts)
            ->filter(fn (array $post) => $post['deleted_at'] === null)
            ->filter(fn (array $post) => strcasecmp((string) $post['post_status'], 'Published') === 0)
            ->sortBy('id')
            ->values()
            ->each(function (array $post, int $index) use (
                $authors,
                $adminId,
                $categoryModels,
                $tagModels,
                $postTags,
                $featuredPostIds
            ): void {
                $category = $categoryModels->get((int) $post['categories_id']);
                if (! $category) {
                    return;
                }

                $author = $authors->first();
                $title = $this->cleanPlainText($post['post_title']);
                $content = $this->cleanContent($post['post_content']);
                $excerpt = $this->cleanExcerpt($post['post_teaser'], $content);
                $publishedAt = Carbon::parse($post['created_at'] ?: now());
                $coverImage = '/images/news-imported/'.basename(str_replace('\\', '/', $post['post_image']));
                $imageAlt = $this->cleanPlainText($post['post_image_description']);

                $article = NewsArticle::updateOrCreate(
                    ['slug' => $post['slug']],
                    [
                        'category_id' => $category->id,
                        'user_id' => $author->id,
                        'title' => $title,
                        'title_en' => null,
                        'excerpt' => $excerpt,
                        'excerpt_en' => null,
                        'content' => $content,
                        'content_en' => null,
                        'cover_image_url' => $coverImage,
                        'cover_image_alt' => $imageAlt ?: $title,
                        'cover_image_alt_en' => null,
                        'status' => NewsArticle::STATUS_PUBLISHED,
                        'editorial_status' => NewsArticle::EDITORIAL_APPROVED,
                        'fact_check_status' => NewsArticle::FACT_VERIFIED,
                        'review_note' => 'Artikel sumber telah dimigrasikan dan ditinjau untuk Radina News.',
                        'approved_by' => $adminId,
                        'approved_at' => $publishedAt,
                        'fact_checked_by' => $adminId,
                        'fact_checked_at' => $publishedAt,
                        'is_featured' => $featuredPostIds->contains((int) $post['id']),
                        'reading_time' => max(2, (int) ceil(str_word_count(strip_tags($content)) / 180)),
                        'views_count' => 800 + ((int) $post['id'] * 173),
                        'published_at' => $publishedAt,
                        'seo_title' => Str::limit($title.' | '.config('news.name'), 160, ''),
                        'seo_title_en' => null,
                        'seo_description' => Str::limit($excerpt, 255, ''),
                        'seo_description_en' => null,
                        'seo_keywords' => implode(', ', array_filter([
                            $category->name,
                            'berita teknologi',
                            'radina news',
                        ])),
                        'seo_keywords_en' => null,
                        'og_image_url' => $coverImage,
                        'created_at' => $publishedAt,
                        'updated_at' => Carbon::parse($post['updated_at'] ?: $publishedAt),
                    ]
                );

                $articleTagIds = collect($postTags->get((int) $post['id'], []))
                    ->map(fn (array $relation) => $tagModels->get((int) $relation['tag_id'])?->id)
                    ->filter()
                    ->values();

                if ($articleTagIds->isEmpty()) {
                    $categoryTag = NewsTag::firstOrCreate(
                        ['slug' => $category->slug],
                        [
                            'name' => $category->name,
                            'name_en' => $category->name_en,
                            'description' => "Kumpulan berita {$category->name}.",
                            'description_en' => "A collection of {$category->name_en} stories.",
                        ]
                    );
                    $articleTagIds->push($categoryTag->id);
                }

                $article->tags()->sync($articleTagIds->all());
                $earning = app(WriterPaymentService::class)->creditArticleIfEligible($article);

                if ($earning && $earning->user_id !== $article->user_id) {
                    $earning->update(['user_id' => $article->user_id]);
                }
            });

        $this->seedCuratedTrendingArticles($authors->first(), $adminId);
        $this->removeUnusedPreviousCategories();
    }

    private function seedAuthors()
    {
        return collect([
            User::firstOrCreate(
                ['email' => 'shara@radina.net'],
                [
                    'name' => 'Shara',
                    'role' => User::ROLE_WRITER,
                    'article_fee' => 25000,
                    'password' => Hash::make('Editor@12345'),
                    'email_verified_at' => now(),
                ]
            ),
        ])->map(function (User $author): User {
            if (! $author->isWriter()) {
                $author->forceFill(['role' => User::ROLE_WRITER])->save();
            }

            return $author;
        });
    }

    private function removePreviousDummyArticles(): void
    {
        $articleIds = NewsArticle::query()
            ->where('cover_image_url', 'like', '/images/news-dummy/%')
            ->pluck('id');

        if ($articleIds->isEmpty()) {
            return;
        }

        WriterEarning::whereIn('article_id', $articleIds)->delete();
        NewsArticle::whereKey($articleIds)->delete();
    }

    private function removeUnusedPreviousCategories(): void
    {
        NewsCategory::query()
            ->whereIn('slug', ['teknologi', 'bisnis', 'startup', 'data-ai', 'infrastruktur', 'gaya-hidup'])
            ->doesntHave('articles')
            ->delete();
    }

    private function seedCuratedTrendingArticles(User $author, ?int $adminId): void
    {
        collect($this->curatedTrendingArticles())
            ->each(function (array $item, int $index) use ($author, $adminId): void {
                $category = NewsCategory::where('slug', $item['category_slug'])->first();

                if (! $category) {
                    return;
                }

                $publishedAt = Carbon::parse($item['published_at']);
                $content = $this->curatedArticleContent($item);

                $article = NewsArticle::updateOrCreate(
                    ['slug' => $item['slug']],
                    [
                        'category_id' => $category->id,
                        'user_id' => $author->id,
                        'title' => $item['title'],
                        'title_en' => null,
                        'excerpt' => $item['excerpt'],
                        'excerpt_en' => null,
                        'content' => $content,
                        'content_en' => null,
                        'cover_image_url' => $item['image'],
                        'cover_image_alt' => $item['image_alt'],
                        'cover_image_alt_en' => null,
                        'status' => NewsArticle::STATUS_PUBLISHED,
                        'editorial_status' => NewsArticle::EDITORIAL_APPROVED,
                        'fact_check_status' => NewsArticle::FACT_VERIFIED,
                        'review_note' => 'Artikel kurasi redaksi berdasarkan sumber terbuka yang diverifikasi pada 18 Juni 2026.',
                        'approved_by' => $adminId,
                        'approved_at' => $publishedAt,
                        'fact_checked_by' => $adminId,
                        'fact_checked_at' => $publishedAt,
                        'is_featured' => $index === 0,
                        'reading_time' => max(3, (int) ceil(str_word_count(strip_tags($content)) / 180)),
                        'views_count' => $item['views_count'],
                        'published_at' => $publishedAt,
                        'seo_title' => Str::limit($item['title'].' | '.config('news.name'), 160, ''),
                        'seo_title_en' => null,
                        'seo_description' => Str::limit($item['excerpt'], 255, ''),
                        'seo_description_en' => null,
                        'seo_keywords' => implode(', ', $item['keywords']),
                        'seo_keywords_en' => null,
                        'og_image_url' => $item['image'],
                        'created_at' => $publishedAt,
                        'updated_at' => $publishedAt,
                    ]
                );

                $tagIds = collect($item['tags'])
                    ->map(function (string $tag): int {
                        $model = NewsTag::firstOrCreate(
                            ['slug' => Str::slug($tag)],
                            [
                                'name' => $tag,
                                'name_en' => $tag,
                                'description' => "Kumpulan berita dengan topik {$tag}.",
                                'description_en' => "A collection of stories about {$tag}.",
                            ]
                        );

                        return $model->id;
                    })
                    ->all();

                $article->tags()->sync($tagIds);
            });
    }

    private function curatedArticleContent(array $item): string
    {
        $paragraphs = collect($item['paragraphs'])
            ->map(fn (string $paragraph) => '<p>'.$paragraph.'</p>')
            ->implode("\n\n");

        $takeaways = collect($item['takeaways'])
            ->map(fn (string $takeaway) => '<li>'.$takeaway.'</li>')
            ->implode("\n");

        return trim(<<<HTML
{$paragraphs}

<h2>Mengapa ramai dibahas?</h2>
<ul>
{$takeaways}
</ul>

<h2>Konteks untuk pembaca</h2>
<p>{$item['context']}</p>

<p><strong>Sumber rujukan:</strong> <a href="{$item['source_url']}" target="_blank" rel="nofollow noopener noreferrer">{$item['source_name']}</a>. Radina News merangkum informasi ini dengan bahasa sendiri untuk kebutuhan referensi digital pembaca Indonesia.</p>
HTML);
    }

    private function curatedTrendingArticles(): array
    {
        return [
            [
                'category_slug' => 'internet',
                'title' => 'Luhut Ungkap Masukan ke Presiden Banyak Diolah AI, Apa Dampaknya?',
                'slug' => 'luhut-ungkap-masukan-ke-presiden-banyak-diolah-ai-apa-dampaknya',
                'excerpt' => 'Pemanfaatan AI dalam penyusunan rekomendasi kebijakan kembali menjadi sorotan setelah Ketua DEN Luhut Binsar Pandjaitan menyebut banyak masukan ke Presiden diolah dengan bantuan kecerdasan buatan.',
                'image' => '/images/news-curated/ai-policy-dashboard.jpg',
                'image_alt' => 'Ilustrasi dashboard kebijakan berbasis kecerdasan buatan',
                'published_at' => '2026-06-18 16:30:00',
                'views_count' => 9280,
                'source_name' => 'CNN Indonesia',
                'source_url' => 'https://www.cnnindonesia.com/ekonomi/20260618130915-92-1370393/luhut-saran-ke-presiden-sebenarnya-banyak-yang-diolah-oleh-ai',
                'keywords' => ['AI Indonesia', 'Luhut', 'kecerdasan buatan', 'kebijakan digital', 'Radina News'],
                'tags' => ['AI', 'Kebijakan Digital', 'Indonesia'],
                'paragraphs' => [
                    'Kecerdasan buatan kembali menjadi bahan percakapan publik setelah Ketua Dewan Ekonomi Nasional Luhut Binsar Pandjaitan menyebut banyak masukan untuk Presiden telah diolah menggunakan AI. Pernyataan itu memperlihatkan bahwa pemanfaatan teknologi tidak lagi berhenti di sektor bisnis, tetapi mulai masuk ke proses analisis kebijakan.',
                    'Bagi pembaca, poin terpentingnya bukan sekadar penggunaan alat AI, melainkan bagaimana data, metode, dan pengawasan manusia ditempatkan dalam proses pengambilan keputusan. Rekomendasi berbasis AI dapat membantu memilah data besar lebih cepat, tetapi tetap membutuhkan validasi agar tidak menjadi sumber bias baru.',
                    'Isu ini ramai karena menyentuh dua hal sekaligus: efisiensi pemerintahan dan akuntabilitas. Ketika teknologi dipakai dalam penyusunan saran strategis, publik membutuhkan transparansi mengenai batas penggunaan, keamanan data, serta siapa yang bertanggung jawab atas keputusan akhir.',
                ],
                'takeaways' => [
                    'AI mulai diposisikan sebagai alat bantu analisis kebijakan.',
                    'Validasi manusia tetap penting agar rekomendasi tidak bias.',
                    'Transparansi penggunaan data menjadi isu utama bagi publik.',
                ],
                'context' => 'Di Indonesia, penggunaan AI untuk layanan publik dan pemerintahan perlu dibarengi tata kelola data, audit, serta standar etika yang jelas agar manfaat efisiensi tidak mengorbankan kepercayaan publik.',
            ],
            [
                'category_slug' => 'gadget',
                'title' => 'Android 17 Dirilis, Fitur Privasi dan Multitasking Jadi Perhatian Pengguna',
                'slug' => 'android-17-dirilis-fitur-privasi-dan-multitasking-jadi-perhatian-pengguna',
                'excerpt' => 'Android 17 mulai digulirkan untuk perangkat Pixel dan membuka jalan bagi produsen lain. Fitur multitasking, perangkat lipat, serta kontrol privasi menjadi pembaruan yang paling banyak dibahas.',
                'image' => '/images/news-curated/android-17-privacy.jpg',
                'image_alt' => 'Ilustrasi pembaruan Android 17 dengan fokus privasi dan multitasking',
                'published_at' => '2026-06-18 15:45:00',
                'views_count' => 8750,
                'source_name' => 'Gizmologi',
                'source_url' => 'https://gizmologi.id/news/android-17-resmi-dirilis/',
                'keywords' => ['Android 17', 'gadget', 'privasi Android', 'smartphone', 'Radina News'],
                'tags' => ['Android', 'Gadget', 'Privasi'],
                'paragraphs' => [
                    'Google mulai menggulirkan Android 17 versi stabil untuk perangkat Pixel yang kompatibel. Pembaruan ini juga disertai rilis source code ke Android Open Source Project sehingga produsen lain dapat mulai menyiapkan adopsi untuk lini perangkat mereka.',
                    'Alih-alih membawa perubahan visual besar, Android 17 menekankan penyempurnaan produktivitas, multitasking, perangkat layar besar, serta kontrol privasi. Fitur seperti jendela aplikasi mengambang dan pengelolaan akses data menjadi pembahasan utama di kalangan pengguna Android.',
                    'Bagi pengguna Indonesia, pembaruan ini relevan karena banyak perangkat Android lokal akan bergantung pada jadwal masing-masing produsen. Artinya, ketersediaan fitur tidak selalu seragam meski fondasi sistem operasinya sudah dirilis.',
                ],
                'takeaways' => [
                    'Android 17 mulai tersedia untuk perangkat Pixel.',
                    'Fokus pembaruan ada pada produktivitas, keamanan, dan privasi.',
                    'Adopsi di luar Pixel bergantung pada produsen perangkat.',
                ],
                'context' => 'Pengguna perlu mengecek kebijakan pembaruan merek perangkat masing-masing, terutama untuk ponsel lipat, tablet, dan perangkat kelas menengah yang jadwal pembaruannya sering berbeda.',
            ],
            [
                'category_slug' => 'game',
                'title' => 'Pokémon Champions Versi Mobile Rilis, Event Mega Raichu Jadi Magnet Pemain Baru',
                'slug' => 'pokemon-champions-versi-mobile-rilis-event-mega-raichu-jadi-magnet-pemain-baru',
                'excerpt' => 'The Pokémon Company merilis Pokémon Champions versi mobile dan menghadirkan event awal yang menarik perhatian komunitas game, termasuk pemain baru yang ingin masuk ke ekosistem kompetitif.',
                'image' => '/images/news-curated/mobile-game-arena.jpg',
                'image_alt' => 'Ilustrasi arena game mobile kompetitif dengan karakter monster digital',
                'published_at' => '2026-06-18 14:35:00',
                'views_count' => 7320,
                'source_name' => 'Gizmologi',
                'source_url' => 'https://gizmologi.id/news/pokemon-champions-versi-mobile-resmi-dirilis/',
                'keywords' => ['Pokémon Champions', 'game mobile', 'Mega Raichu', 'game Indonesia', 'Radina News'],
                'tags' => ['Game Mobile', 'Pokémon', 'Esports'],
                'paragraphs' => [
                    'Pokémon Champions versi mobile resmi dirilis dan langsung menjadi bahan pembicaraan komunitas game. Kehadiran versi mobile memperluas akses pemain yang selama ini mengikuti ekosistem Pokémon melalui konsol, kartu, atau gim lain.',
                    'Event Mega Raichu yang menyertai peluncuran menjadi daya tarik awal. Strategi ini lazim dipakai gim live service untuk membangun momentum, menarik pemain baru, dan membuat pemain lama kembali mencoba konten terbaru.',
                    'Di Indonesia, gim mobile masih menjadi pintu masuk terbesar bagi banyak pemain. Karena itu, peluncuran judul dengan nama besar seperti Pokémon berpotensi ramai di media sosial, komunitas Discord, dan grup pemain kasual.',
                ],
                'takeaways' => [
                    'Versi mobile memperluas akses pemain Pokémon.',
                    'Event awal membantu membangun momentum komunitas.',
                    'Pasar Indonesia sangat responsif terhadap game mobile populer.',
                ],
                'context' => 'Popularitas game mobile di Indonesia membuat setiap rilis besar berpotensi cepat menyebar, terutama ketika disertai event terbatas dan karakter yang sudah dikenal lintas generasi.',
            ],
            [
                'category_slug' => 'gadget',
                'title' => 'Galaxy Z Fold8 Ultra Dikaitkan dengan Spider-Man, Strategi Teaser Samsung Disorot',
                'slug' => 'galaxy-z-fold8-ultra-dikaitkan-dengan-spider-man-strategi-teaser-samsung-disorot',
                'excerpt' => 'Kolaborasi Samsung dengan Spider-Man: Brand New Day memicu dugaan kemunculan lebih awal Galaxy Z Fold8 Ultra. Rumor ini menjadi bahan diskusi karena menyatukan promosi film dan perangkat lipat premium.',
                'image' => '/images/news-curated/foldable-phone-cinema.jpg',
                'image_alt' => 'Ilustrasi ponsel lipat premium dengan nuansa promosi sinematik',
                'published_at' => '2026-06-18 13:55:00',
                'views_count' => 6890,
                'source_name' => 'Gizmologi',
                'source_url' => 'https://gizmologi.id/news/samsung-gandeng-spider-man-brand-new-day/',
                'keywords' => ['Samsung', 'Galaxy Z Fold8 Ultra', 'ponsel lipat', 'Spider-Man', 'Radina News'],
                'tags' => ['Samsung', 'Foldable', 'Smartphone'],
                'paragraphs' => [
                    'Samsung kembali menjadi sorotan setelah kolaborasi dengan Spider-Man: Brand New Day dikaitkan dengan dugaan kemunculan lebih awal Galaxy Z Fold8 Ultra. Strategi teaser seperti ini sering dipakai untuk membangun rasa penasaran sebelum peluncuran perangkat utama.',
                    'Ponsel lipat premium masih menjadi segmen yang sangat kompetitif. Setiap petunjuk mengenai desain, kamera, layar, atau kemampuan AI biasanya langsung memicu spekulasi karena pengguna ingin melihat apakah perangkat baru membawa peningkatan signifikan.',
                    'Bagi pasar Indonesia, seri Fold menjadi simbol inovasi sekaligus perangkat niche. Diskusi publik biasanya tidak hanya membahas harga, tetapi juga daya tahan engsel, pengalaman multitasking, dukungan aplikasi, dan nilai guna untuk pekerjaan mobile.',
                ],
                'takeaways' => [
                    'Kolaborasi promosi memicu rumor perangkat lipat baru.',
                    'Segmen foldable premium tetap menjadi arena inovasi merek besar.',
                    'Pengguna Indonesia menyoroti harga, daya tahan, dan produktivitas.',
                ],
                'context' => 'Sebelum ada pengumuman resmi, informasi terkait perangkat yang belum diluncurkan perlu dibaca sebagai rumor atau indikasi pemasaran, bukan spesifikasi final.',
            ],
            [
                'category_slug' => 'internet',
                'title' => 'Indonesia Bawa Agenda AI dan Transformasi Digital ke London Tech Week 2026',
                'slug' => 'indonesia-bawa-agenda-ai-dan-transformasi-digital-ke-london-tech-week-2026',
                'excerpt' => 'Indonesia memperkenalkan agenda kecerdasan artifisial dan transformasi digital di London Tech Week 2026, membuka ruang kerja sama internasional untuk ekosistem digital nasional.',
                'image' => '/images/news-curated/indonesia-digital-agenda.jpg',
                'image_alt' => 'Ilustrasi agenda transformasi digital Indonesia di forum teknologi global',
                'published_at' => '2026-06-18 12:40:00',
                'views_count' => 6410,
                'source_name' => 'Direktorat Jenderal Ekosistem Digital Komdigi',
                'source_url' => 'https://djed.komdigi.go.id/news/indonesia-perkenalkan-agenda-kecerdasan-artifisial-dan-transformasi-digital-di-london-tech-week-2026',
                'keywords' => ['AI Indonesia', 'London Tech Week 2026', 'transformasi digital', 'Komdigi', 'Radina News'],
                'tags' => ['Transformasi Digital', 'AI', 'Komdigi'],
                'paragraphs' => [
                    'Indonesia memperkenalkan agenda kecerdasan artifisial dan transformasi digital dalam forum London Tech Week 2026. Kehadiran ini menjadi bagian dari upaya memperlihatkan arah pembangunan ekosistem digital nasional kepada mitra global.',
                    'Agenda seperti ini penting karena kompetisi digital tidak hanya ditentukan oleh jumlah pengguna internet, tetapi juga kemampuan negara membangun talenta, infrastruktur, regulasi, keamanan siber, dan pemanfaatan AI yang bertanggung jawab.',
                    'Topik tersebut relevan bagi pelaku startup, industri teknologi, institusi pendidikan, dan pembuat kebijakan. Semakin jelas arah kebijakan AI nasional, semakin besar peluang kolaborasi lintas sektor dan investasi yang lebih terarah.',
                ],
                'takeaways' => [
                    'Indonesia mempromosikan agenda AI di forum teknologi global.',
                    'Transformasi digital membutuhkan kolaborasi talenta, infrastruktur, dan regulasi.',
                    'Arah kebijakan yang jelas penting bagi startup dan industri.',
                ],
                'context' => 'Keterlibatan Indonesia dalam forum global perlu diterjemahkan menjadi kebijakan yang berdampak di dalam negeri, termasuk literasi AI, keamanan data, dan dukungan bagi pelaku digital lokal.',
            ],
        ];
    }

    private function cleanExcerpt(?string $excerpt, string $content): string
    {
        $excerpt = $this->cleanPlainText((string) $excerpt);
        $excerpt = preg_replace('/^[\s\-–—:]+/u', '', $excerpt) ?? $excerpt;

        return Str::limit($excerpt ?: strip_tags($content), 1000, '');
    }

    private function cleanContent(string $content): string
    {
        $content = $this->fixEncoding($content);
        $content = preg_replace('/Al\s*Fatih\s*Dev(?:\.com)?/iu', '', $content) ?? $content;
        $content = preg_replace('/<strong>\s*<\/strong>\s*(?:&ndash;|&#8211;|–|—|-)?\s*/iu', '', $content) ?? $content;
        $content = preg_replace('/<\/?ins\b[^>]*>/iu', '', $content) ?? $content;
        $content = preg_replace('/\sdata-(?:ad|adsbygoogle)[\w-]*="[^"]*"/iu', '', $content) ?? $content;
        $content = str_replace(
            ['class="google-auto-placed ap_container"', 'class="google-auto-placed"'],
            '',
            $content
        );
        $content = preg_replace(
            '#href="(?:\.\./)+posts/([^"]+)"#iu',
            'href="/berita/$1"',
            $content
        ) ?? $content;
        $content = preg_replace('#https?://(?:www\.)?alfatihdev\.com[^\s"<]*#iu', '', $content) ?? $content;
        $content = preg_replace('/<div[^>]*>\s*<\/div>/iu', '', $content) ?? $content;
        $content = preg_replace('/<p[^>]*>\s*<\/p>/iu', '', $content) ?? $content;

        return trim($content);
    }

    private function cleanPlainText(?string $text): string
    {
        $text = html_entity_decode($this->fixEncoding((string) $text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/Al\s*Fatih\s*Dev(?:\.com)?/iu', '', $text) ?? $text;
        $text = preg_replace('/\s+/u', ' ', strip_tags($text)) ?? $text;

        return trim($text);
    }

    private function fixEncoding(string $value): string
    {
        return strtr($value, [
            'â€“' => '–',
            'â€”' => '—',
            'â€™' => '’',
            'â€œ' => '“',
            'â€' => '”',
            'Â ' => ' ',
            'Â' => '',
        ]);
    }

    private function categoryColor(string $slug): string
    {
        return match ($slug) {
            'berita' => '#1D4ED8',
            'internet' => '#0F766E',
            'gadget' => '#7C3AED',
            'sains' => '#0369A1',
            'game' => '#B45309',
            'tutorial' => '#475569',
            'video' => '#BE123C',
            default => '#2563EB',
        };
    }

    private function categoryCover(string $slug): string
    {
        return "/images/category-covers/{$slug}.webp";
    }
}

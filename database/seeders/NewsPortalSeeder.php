<?php

namespace Database\Seeders;

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\NewsTag;
use App\Models\User;
use App\Services\WriterPaymentService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class NewsPortalSeeder extends Seeder
{
    public function run(): void
    {
        $authors = collect([
            ['name' => 'Nadia Pramesti', 'email' => 'nadia@radina.net', 'article_fee' => 30000, 'bank_name' => 'BCA', 'bank_account_number' => '1234567890'],
            ['name' => 'Rafi Adhitama', 'email' => 'rafi@radina.net', 'article_fee' => 27500, 'bank_name' => 'BRI', 'bank_account_number' => '2345678901'],
            ['name' => 'Alya Salsabila', 'email' => 'alya@radina.net', 'article_fee' => 25000, 'bank_name' => 'Mandiri', 'bank_account_number' => '3456789012'],
            ['name' => 'Dimas Wicaksono', 'email' => 'dimas@radina.net', 'article_fee' => 25000, 'bank_name' => 'BNI', 'bank_account_number' => '4567890123'],
        ])->map(function (array $author): User {
            return User::updateOrCreate(
                ['email' => $author['email']],
                [
                    'name' => $author['name'],
                    'role' => User::ROLE_WRITER,
                    'article_fee' => $author['article_fee'],
                    'bank_name' => $author['bank_name'],
                    'bank_account_number' => $author['bank_account_number'],
                    'bank_account_holder' => $author['name'],
                    'password' => Hash::make('Editor@12345'),
                    'email_verified_at' => now(),
                ]
            );
        });

        $categories = collect([
            [
                'name' => 'Teknologi',
                'name_en' => 'Technology',
                'description' => 'Update produk, platform, AI, cloud, dan software enterprise yang sedang bergerak cepat.',
                'description_en' => 'Updates on products, platforms, AI, cloud, and fast-moving enterprise software.',
                'accent_color' => '#0F4C81',
                'cover_image_url' => '/images/news-dummy/technology-lead.png',
            ],
            [
                'name' => 'Bisnis',
                'name_en' => 'Business',
                'description' => 'Laporan strategi perusahaan, ekspansi pasar, monetisasi, dan pola konsumsi digital terbaru.',
                'description_en' => 'Reports on corporate strategy, market expansion, monetization, and digital consumer trends.',
                'accent_color' => '#0F766E',
                'cover_image_url' => '/images/news-dummy/business-strategy.png',
            ],
            [
                'name' => 'Startup',
                'name_en' => 'Startups',
                'description' => 'Pendanaan, validasi produk, akuisisi pengguna, dan gerak ekosistem startup Indonesia.',
                'description_en' => 'Funding, product validation, user acquisition, and Indonesia startup ecosystem updates.',
                'accent_color' => '#2563EB',
                'cover_image_url' => '/images/news-dummy/startup-founders.png',
            ],
            [
                'name' => 'Data & AI',
                'name_en' => 'Data & AI',
                'description' => 'Analisis data, machine learning, governance, dan dampak AI terhadap organisasi.',
                'description_en' => 'Data analytics, machine learning, governance, and the impact of AI on organizations.',
                'accent_color' => '#7C3AED',
                'cover_image_url' => '/images/news-dummy/data-ai-ops.png',
            ],
            [
                'name' => 'Infrastruktur',
                'name_en' => 'Infrastructure',
                'description' => 'Jaringan, data center, keamanan, edge computing, dan proyek digital berskala besar.',
                'description_en' => 'Networks, data centers, security, edge computing, and large-scale digital projects.',
                'accent_color' => '#475569',
                'cover_image_url' => '/images/news-dummy/infrastructure-datacenter.png',
            ],
            [
                'name' => 'Gaya Hidup',
                'name_en' => 'Lifestyle',
                'description' => 'Perubahan pola kerja, creator economy, kebiasaan digital, dan kultur internet.',
                'description_en' => 'Changing work patterns, the creator economy, digital habits, and internet culture.',
                'accent_color' => '#B45309',
                'cover_image_url' => '/images/news-dummy/lifestyle-creator-culture.png',
            ],
        ])->map(function (array $category): NewsCategory {
            $name = $category['name'];

            return NewsCategory::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    ...$category,
                    'slug' => Str::slug($name),
                    'seo_title' => "{$name} - ".config('news.name'),
                    'seo_title_en' => "{$category['name_en']} - ".config('news.name'),
                    'seo_description' => $category['description'],
                    'seo_description_en' => $category['description_en'],
                ]
            );
        });

        $tags = collect([
            ['name' => 'AI', 'name_en' => 'AI'],
            ['name' => 'Cloud', 'name_en' => 'Cloud'],
            ['name' => 'Cybersecurity', 'name_en' => 'Cybersecurity'],
            ['name' => 'Pendanaan', 'name_en' => 'Funding'],
            ['name' => 'SaaS', 'name_en' => 'SaaS'],
            ['name' => 'Regulasi', 'name_en' => 'Regulation'],
            ['name' => 'Produktivitas', 'name_en' => 'Productivity'],
            ['name' => 'E-Commerce', 'name_en' => 'E-Commerce'],
            ['name' => 'Telekomunikasi', 'name_en' => 'Telecommunications'],
            ['name' => 'Data Center', 'name_en' => 'Data Center'],
            ['name' => 'Fintech', 'name_en' => 'Fintech'],
            ['name' => 'Machine Learning', 'name_en' => 'Machine Learning'],
            ['name' => 'Media Digital', 'name_en' => 'Digital Media'],
            ['name' => 'UMKM', 'name_en' => 'SMEs'],
            ['name' => 'Startup Studio', 'name_en' => 'Startup Studio'],
            ['name' => 'Ekonomi Digital', 'name_en' => 'Digital Economy'],
            ['name' => 'Operasional', 'name_en' => 'Operations'],
            ['name' => 'Creator Economy', 'name_en' => 'Creator Economy'],
            ['name' => 'Enterprise', 'name_en' => 'Enterprise'],
            ['name' => 'Analitik', 'name_en' => 'Analytics'],
        ])->map(function (array $tag): NewsTag {
            return NewsTag::updateOrCreate(
                ['slug' => Str::slug($tag['name'])],
                [
                    'name' => $tag['name'],
                    'name_en' => $tag['name_en'],
                    'slug' => Str::slug($tag['name']),
                    'description' => "Kumpulan berita dengan topik {$tag['name']}.",
                    'description_en' => "A collection of stories about {$tag['name_en']}.",
                ]
            );
        });

        $storyAngles = [
            'Teknologi' => [
                'Platform observability baru membantu tim produk menurunkan waktu investigasi insiden di tengah ritme rilis yang semakin padat',
                'Perusahaan software lokal merilis orchestration layer untuk mempercepat eksperimen fitur di berbagai unit bisnis',
                'Vendor enterprise mengalihkan roadmap ke pengalaman mobile-first karena trafik operasional lapangan terus naik',
                'Tim engineering menata ulang kualitas release setelah laporan bug lintas divisi mulai memengaruhi pengalaman pelanggan',
                'Pengelola platform internal membangun dashboard terpadu agar pimpinan bisa membaca performa produk secara harian',
            ],
            'Bisnis' => [
                'Perusahaan distribusi digital menata ulang channel penjualan setelah recurring revenue menembus target semester',
                'Operator layanan premium memperluas kemitraan regional untuk mempercepat pertumbuhan pelanggan korporasi',
                'Unit bisnis baru difokuskan pada margin sehat setelah fase ekspansi agresif mulai dikaji ulang',
                'Perusahaan teknologi memperketat belanja pemasaran sambil menjaga momentum akuisisi di kota tier dua',
                'Eksekutif menilai disiplin eksekusi dan efisiensi penjualan kini lebih penting daripada ekspansi yang terlalu cepat',
            ],
            'Startup' => [
                'Startup B2B menyiapkan jalur monetisasi baru setelah uji coba produk dengan seratus klien awal menunjukkan retensi tinggi',
                'Pendiri memilih distribusi berbasis komunitas untuk menekan biaya akuisisi dan mempercepat validasi pasar',
                'Perusahaan rintisan sektor operasional menutup putaran dana baru untuk memperluas integrasi produknya',
                'Startup SaaS lokal membangun playbook onboarding baru agar pelanggan lebih cepat sampai ke titik aktivasi utama',
                'Tim pendiri menilai profitabilitas awal kini lebih penting daripada pertumbuhan yang tidak diikuti kualitas penggunaan',
            ],
            'Data & AI' => [
                'Eksperimen AI generatif naik kelas menjadi workflow produksi setelah guardrail dan evaluasi internal dinilai stabil',
                'Tim data memperketat governance ketika model prediksi permintaan dipakai langsung oleh unit komersial dan supply chain',
                'Organisasi besar mulai membangun lapisan monitoring model agar hasil inferensi dapat diaudit per unit bisnis',
                'Manajer produk AI menyeimbangkan kecepatan eksperimen dengan kebutuhan akurasi dan pelacakan sumber data',
                'Implementasi analitik real-time mendorong pengambilan keputusan yang lebih cepat pada operasi harian perusahaan',
            ],
            'Infrastruktur' => [
                'Penyedia jaringan memperluas node regional demi menekan latensi layanan penting untuk pelanggan bisnis',
                'Perusahaan memperbarui arsitektur keamanan setelah volume akses lintas perangkat dan lokasi meningkat tajam',
                'Proyek data center baru dirancang dengan fokus efisiensi energi dan ketersediaan untuk workload mission critical',
                'Tim infrastruktur menambah pengamatan kapasitas agar pertumbuhan trafik tidak langsung berubah menjadi bottleneck',
                'Audit keamanan internal memaksa organisasi mempercepat standardisasi akses dan logging pada sistem inti',
            ],
            'Gaya Hidup' => [
                'Creator dan merek mengubah format konten pendek menjadi kanal konversi ketika pola belanja impulsif kembali naik',
                'Tim remote membangun ritme kerja asinkron yang lebih sehat karena meeting harian mulai diganti dokumen keputusan',
                'Kebiasaan konsumsi informasi berubah cepat ketika pembaca menginginkan ringkasan tajam dan visual data yang singkat',
                'Pekerja digital kini lebih selektif memilih tools yang benar-benar mengurangi friksi kerja sehari-hari',
                'Ekonomi kreator mendorong brand menyusun kolaborasi yang lebih terukur daripada sekadar mengejar jangkauan besar',
            ],
        ];

        $storyAnglesEn = [
            'Teknologi' => [
                'A new observability platform helps product teams reduce incident investigation time amid increasingly frequent releases',
                'A local software company launches an orchestration layer to accelerate feature experiments across business units',
                'An enterprise vendor shifts its roadmap toward mobile-first experiences as field operations traffic continues to rise',
                'Engineering teams restructure release quality after cross-division bug reports begin affecting customer experience',
                'Internal platform managers build a unified dashboard so executives can monitor product performance every day',
            ],
            'Bisnis' => [
                'A digital distribution company restructures its sales channels after recurring revenue exceeds the semester target',
                'A premium service operator expands regional partnerships to accelerate corporate customer growth',
                'A new business unit focuses on healthy margins as aggressive expansion plans come under review',
                'A technology company tightens marketing spending while maintaining customer acquisition momentum in secondary cities',
                'Executives say disciplined execution and sales efficiency now matter more than expansion at any cost',
            ],
            'Startup' => [
                'A B2B startup prepares a new monetization path after trials with one hundred early clients show strong retention',
                'Founders choose community-led distribution to reduce acquisition costs and accelerate market validation',
                'An operations startup closes a new funding round to expand its product integrations',
                'A local SaaS startup builds a new onboarding playbook to help customers reach activation faster',
                'Founders say early profitability now matters more than growth that is not supported by product usage quality',
            ],
            'Data & AI' => [
                'A generative AI experiment moves into production after internal guardrails and evaluations prove stable',
                'Data teams tighten governance as demand forecasting models are adopted by commercial and supply chain units',
                'Large organizations build model monitoring layers so inference results can be audited by business unit',
                'AI product managers balance experiment speed with accuracy and data source traceability',
                'Real-time analytics implementation drives faster decision-making across daily operations',
            ],
            'Infrastruktur' => [
                'A network provider expands regional nodes to reduce latency for business-critical services',
                'A company renews its security architecture as access from multiple devices and locations rises sharply',
                'A new data center project prioritizes energy efficiency and availability for mission-critical workloads',
                'Infrastructure teams improve capacity monitoring to prevent traffic growth from creating bottlenecks',
                'An internal security audit pushes organizations to standardize access and logging across core systems',
            ],
            'Gaya Hidup' => [
                'Creators and brands turn short-form content into a conversion channel as impulse buying rises again',
                'Remote teams build healthier asynchronous routines as daily meetings are replaced by decision documents',
                'Information habits shift as readers demand sharper summaries and concise data visuals',
                'Digital workers become more selective about tools that genuinely reduce everyday friction',
                'The creator economy encourages brands to measure collaborations beyond headline reach',
            ],
        ];

        $cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Makassar'];
        $adminId = User::where('role', User::ROLE_ADMIN)->value('id');

        foreach ($categories as $category) {
            foreach ($storyAngles[$category->name] as $index => $angle) {
                $angleEn = $storyAnglesEn[$category->name][$index];
                $city = $cities[($index + strlen($category->slug)) % count($cities)];
                $title = $this->buildTitle($city, $angle);
                $titleEn = $this->buildTitle($city, $angleEn);
                $slug = Str::slug(Str::limit($title, 150, ''));
                $publishedAt = now()->subHours(random_int(2, 320))->subMinutes(random_int(0, 59));
                $excerpt = Str::limit($angle.'. Perkembangan ini memengaruhi strategi, ritme eksekusi, dan perilaku pengguna di pasar digital Indonesia.', 190);
                $excerptEn = Str::limit($angleEn.'. This development affects strategy, execution, and user behavior across Indonesia digital market.', 190);
                $content = $this->buildArticleContent($category->name, $city, $angle);
                $contentEn = $this->buildEnglishArticleContent($category->name_en, $city, $angleEn);
                $readingTime = max(4, (int) ceil(str_word_count(strip_tags($content)) / 180));
                $coverImage = $category->cover_image_url;
                $author = $authors[($category->id + $index) % $authors->count()];

                $article = NewsArticle::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'category_id' => $category->id,
                        'user_id' => $author->id,
                        'title' => $title,
                        'title_en' => $titleEn,
                        'slug' => $slug,
                        'excerpt' => $excerpt,
                        'excerpt_en' => $excerptEn,
                        'content' => $content,
                        'content_en' => $contentEn,
                        'cover_image_url' => $coverImage,
                        'cover_image_alt' => Str::limit("{$title} - {$category->name}", 180, ''),
                        'cover_image_alt_en' => Str::limit("{$titleEn} - {$category->name_en}", 180, ''),
                        'status' => NewsArticle::STATUS_PUBLISHED,
                        'editorial_status' => NewsArticle::EDITORIAL_APPROVED,
                        'fact_check_status' => NewsArticle::FACT_VERIFIED,
                        'approved_by' => $adminId,
                        'approved_at' => $publishedAt,
                        'fact_checked_by' => $adminId,
                        'fact_checked_at' => $publishedAt,
                        'is_featured' => $index < 2,
                        'reading_time' => $readingTime,
                        'views_count' => random_int(820, 24800),
                        'published_at' => $publishedAt,
                        'seo_title' => Str::limit($title.' | '.config('news.name'), 160, ''),
                        'seo_title_en' => Str::limit($titleEn.' | '.config('news.name'), 160, ''),
                        'seo_description' => $excerpt,
                        'seo_description_en' => $excerptEn,
                        'seo_keywords' => implode(', ', [
                            $category->name,
                            $city,
                            'portal berita',
                            'radina news',
                            $tags->random()->name,
                        ]),
                        'seo_keywords_en' => implode(', ', [
                            $category->name_en,
                            $city,
                            'news portal',
                            'radina news',
                            $tags->random()->name_en,
                        ]),
                        'og_image_url' => $coverImage,
                    ]
                );

                $article->tags()->sync(
                    $tags->random(random_int(3, 5))->pluck('id')->all()
                );

                app(WriterPaymentService::class)->creditArticleIfEligible($article);
            }
        }
    }

    private function buildTitle(string $city, string $angle): string
    {
        return Str::finish($city, ':').' '.$angle;
    }

    private function buildArticleContent(string $category, string $city, string $angle): string
    {
        $paragraphs = [
            "<p>{$angle}. Di {$city}, perubahan ini terlihat bukan hanya pada strategi pimpinan, tetapi juga pada ritme kerja tim produk, operasi, dan komersial yang harus menyesuaikan arah eksekusi harian.</p>",
            "<p>Dalam konteks {$category}, sinyal yang muncul menunjukkan bahwa perusahaan tidak lagi cukup menambah fitur atau memperbanyak kanal distribusi. Mereka mulai menuntut kualitas implementasi, visibilitas data, dan keputusan yang bisa dijalankan lebih cepat.</p>",
            '<h2>Mengapa perkembangan ini penting</h2>',
            '<p>Pergeseran seperti ini biasanya menjadi indikator bahwa pasar sedang bergerak ke fase yang lebih matang. Pertumbuhan tetap penting, tetapi disiplin eksekusi, pengalaman pengguna, dan efisiensi operasional mulai menjadi pembeda yang lebih nyata.</p>',
            '<ul><li>Tim produk perlu mengurangi siklus keputusan yang terlalu panjang.</li><li>Tim operasi membutuhkan indikator yang bisa dibaca lintas fungsi.</li><li>Pimpinan bisnis menuntut dampak yang lebih mudah diukur dari setiap inisiatif baru.</li></ul>',
            '<h2>Arah yang kemungkinan muncul berikutnya</h2>',
            '<p>Beberapa pelaku industri memperkirakan fase selanjutnya akan didominasi oleh organisasi yang paling cepat menerjemahkan insight menjadi tindakan. Mereka bukan selalu yang paling besar, tetapi yang paling disiplin membenahi proses inti.</p>',
            '<blockquote>Yang bertahan biasanya bukan yang paling agresif, tetapi yang paling rapi menghubungkan keputusan harian dengan hasil bisnis.</blockquote>',
            '<p>Perkembangan berikutnya akan ditentukan oleh kualitas pelaksanaan, ketahanan infrastruktur pendukung, dan kemampuan tim menjaga relevansi produk saat kondisi pasar bergerak cepat.</p>',
        ];

        return implode("\n", $paragraphs);
    }

    private function buildEnglishArticleContent(string $category, string $city, string $angle): string
    {
        $paragraphs = [
            "<p>{$angle}. In {$city}, the shift is visible not only in executive strategy but also in the daily rhythm of product, operations, and commercial teams.</p>",
            "<p>Within {$category}, companies can no longer rely on adding features or distribution channels alone. They increasingly demand better implementation quality, clearer data visibility, and faster execution.</p>",
            '<h2>Why this development matters</h2>',
            '<p>This type of shift often signals a more mature market. Growth still matters, but execution discipline, customer experience, and operating efficiency are becoming more meaningful competitive advantages.</p>',
            '<ul><li>Product teams need shorter decision cycles.</li><li>Operations teams need metrics that work across functions.</li><li>Business leaders expect measurable outcomes from every new initiative.</li></ul>',
            '<h2>What may happen next</h2>',
            '<p>Industry participants expect the next phase to favor organizations that can turn insight into action quickly. They may not be the largest players, but they are often the most disciplined in improving core processes.</p>',
            '<blockquote>Long-term winners are rarely the most aggressive. They are the teams that connect daily decisions to business outcomes most consistently.</blockquote>',
            '<p>Radina News will continue to monitor rollout quality, infrastructure resilience, and the ability of teams to keep products relevant as market conditions change.</p>',
        ];

        return implode("\n", $paragraphs);
    }
}

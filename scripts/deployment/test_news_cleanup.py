import unittest
from prepare_news_cleanup import remote_path


class CleanupSafetyTest(unittest.TestCase):
    def test_protected_and_unknown_paths_cannot_be_deleted(self):
        for path in [".env", "public/.env", "storage/app/public/image.webp", "storage/app/deploy-backups/a.encrypted", "app/Models/License.php", "app/Models/LicenseActivation.php", "app/Models/User.php", "config/license.php", "database/seeders/LicenseSeeder.php", "database/migrations/2026_04_24_142927_create_licenses_table.php", "app/Http/Controllers/Api/LicenseActivationController.php", "frontend/src/pages/admin/Licenses.vue", "vendor/autoload.php", "public/images/license-dashboard.svg", "public/images/news-dummy/../../.env", 'public/images/news-dummy/a";rm']:
            with self.subTest(path=path):
                self.assertIsNone(remote_path(path))

    def test_only_retired_news_files_map_to_exact_remote_paths(self):
        self.assertEqual("images/news-curated/article.jpg", remote_path("public/images/news-curated/article.jpg"))
        self.assertEqual("_app/app/Models/NewsArticle.php", remote_path("app/Models/NewsArticle.php"))
        self.assertEqual("_app/database/import/portal_berita.sql", remote_path("database/import/portal_berita.sql"))
        self.assertEqual("_app/database/migrations/2026_06_08_000001_create_news_portal_tables.php", remote_path("database/migrations/2026_06_08_000001_create_news_portal_tables.php"))


if __name__ == "__main__":
    unittest.main()

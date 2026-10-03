"""Generate exact-file FTP deletions for retired news files, never license/runtime data."""
import re
import subprocess
import sys

NEWS_PATHS = [
    r"public/images/news-[a-z-]+/[A-Za-z0-9_.-]+",
    r"public/images/radina-news-[A-Za-z0-9_.-]+",
    r"app/Models/(?:News[A-Za-z]+|WriterEarning|WriterWithdrawal)\.php",
    r"app/Http/Controllers/(?:News[A-Za-z]+|WriterFinanceController|WithdrawalAdminController)\.php",
    r"app/Services/(?:WriterPaymentService|LegacyNewsSqlParser)\.php",
    r"app/Support/ArticleContentFormatter\.php",
    r"config/(?:news|writer_payments|legal)\.php",
    r"database/import/portal_berita\.sql",
    r"database/migrations/[0-9_]+[a-z_]*(?:news|writer_payment)[a-z_]*\.php",
    r"database/seeders/NewsPortalSeeder\.php",
    r"resources/js/(?:Pages/News|Layouts/NewsLayout|Composables/useNewsLocale|Support/googlePublisherCenter|Components/Article[A-Za-z]*)[A-Za-z0-9_./-]*",
    r"resources/views/(?:company-profile|feed|news-sitemap|sitemap)\.blade\.php",
    r"resources/views/components/(?:google-adsense|google-analytics|google-publisher-center)\.blade\.php",
]


def remote_path(path):
    if not path or ".." in path or not re.fullmatch(r"[A-Za-z0-9_./-]+", path):
        return None
    if any(re.fullmatch(pattern, path) for pattern in NEWS_PATHS):
        return path[len("public/"):] if path.startswith("public/") else "_app/" + path
    return None


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Provide the previous production commit and the current commit.")
    paths = subprocess.check_output(["git", "diff", "--name-only", "--diff-filter=D", "--no-renames", sys.argv[1], sys.argv[2]], text=True).splitlines()
    for path in paths:
        target = remote_path(path)
        if target:
            print(f'rm -f "{target}"')

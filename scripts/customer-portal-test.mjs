import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { solveLoginCaptcha } from "./support/login-captcha.mjs";

const base = process.env.TEST_URL;
assert(
    base && ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
    "Use the isolated local test server.",
);
assert(process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD);
const dir = "test-results/customer-portal";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const admin = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    viewport: { width: 1440, height: 1000 },
});
const customer = await browser.newContext({
    viewport: { width: 390, height: 1000 },
});
const a = await admin.newPage(),
    c = await customer.newPage(),
    checks = [],
    errors = [];
for (const page of [a, c])
    page.on("pageerror", (error) => errors.push(error.message));
try {
    await a.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
    await a.getByLabel("Email admin").fill(process.env.TEST_ADMIN_EMAIL);
    await a
        .getByLabel("Kata sandi", { exact: false })
        .fill(process.env.TEST_ADMIN_PASSWORD);
    await solveLoginCaptcha(a);
    await a.getByRole("button", { name: "Masuk ke Workspace" }).click();
    await a.waitForURL(`${base}/admin`);
    const token = decodeURIComponent(
        (await admin.cookies()).find((cookie) => cookie.name === "XSRF-TOKEN")
            .value,
    );
    const headers = { "X-XSRF-TOKEN": token, Accept: "application/json" };
    const templates = (
        await (await admin.request.get(`${base}/api/templates`)).json()
    ).data;
    const slug = `customer-portal-${Date.now()}`;
    const created = await admin.request.post(`${base}/api/orders`, {
        data: {
            template_id: templates[0].id,
            customer_name: "Isolated Customer Portal",
            whatsapp: "081234567890",
            bride_name: "Original Bride",
            groom_name: "Original Groom",
            slug,
        },
    });
    assert.equal(created.status(), 201);
    const order = (await created.json()).data;
    assert.equal(
        (
            await admin.request.patch(
                `${base}/api/admin/orders/${order.id}/payment`,
                { headers },
            )
        ).status(),
        200,
    );
    const wedding = (
        await (
            await admin.request.post(
                `${base}/api/admin/orders/${order.id}/wedding`,
                { headers },
            )
        ).json()
    ).data;
    const path = `${base}/api/admin/weddings/${wedding.id}`;
    await a.goto(`${base}/admin/weddings/${wedding.id}`, {
        waitUntil: "networkidle",
    });
    await a.getByRole("button", { name: "Pelanggan", exact: true }).click();
    await a
        .getByRole("button", { name: "Buat Tautan Pelanggan", exact: true })
        .click();
    const linkField = a.getByLabel("Tautan pribadi pelanggan", { exact: true });
    await expect(linkField).toBeVisible();
    const link = await linkField.inputValue(),
        secret = new URL(link).pathname.split("/").pop();
    await a
        .getByRole("button", { name: "Salin Tautan Pelanggan", exact: true })
        .click();
    await expect
        .poll(() => a.evaluate(() => navigator.clipboard.readText()))
        .toBe(link);
    assert.equal(
        new URL(
            await a
                .getByRole("link", {
                    name: "Bagikan lewat WhatsApp",
                    exact: true,
                })
                .getAttribute("href"),
        ).pathname,
        "/6281234567890",
    );
    checks.push(
        "Administrator issued and copied a private customer link with the correct customer WhatsApp destination.",
    );

    await c.goto(link, { waitUntil: "networkidle" });
    await expect(
        c.getByRole("heading", { name: "Data & persetujuan undangan" }),
    ).toBeVisible();
    assert.equal(
        (
            await customer.request.get(`${base}/api/admin/licenses`, {
                headers: { Accept: "application/json" },
            })
        ).status(),
        401,
    );
    assert.equal(
        (
            await customer.request.put(
                `${base}/api/customer-portals/${secret}`,
                {
                    data: {
                        data: {},
                        expected_submission_version: 0,
                        submit: false,
                    },
                    headers: { Accept: "application/json" },
                },
            )
        ).status(),
        419,
    );
    await c
        .getByLabel("Nama lengkap pengantin wanita", { exact: true })
        .fill("Shara Customer");
    await c
        .getByLabel("Nama panggilan pengantin wanita", { exact: true })
        .fill("Shara");
    await c
        .getByLabel("Nama lengkap pengantin pria", { exact: true })
        .fill("Dedy Customer");
    await c
        .getByLabel("Nama panggilan pengantin pria", { exact: true })
        .fill("Dedy");
    await c
        .getByLabel("Tanggal pernikahan", { exact: true })
        .fill("2026-12-20");
    await c.getByRole("button", { name: "Simpan Draf", exact: true }).click();
    await expect(
        c.getByRole("button", { name: "Simpan Draf", exact: true }),
    ).toBeDisabled();
    await c.reload({ waitUntil: "networkidle" });
    await expect(
        c.getByLabel("Nama lengkap pengantin wanita", { exact: true }),
    ).toHaveValue("Shara Customer");
    assert.equal(
        (await (await admin.request.get(path)).json()).data.bride.full_name,
        "Original Bride",
    );
    checks.push(
        "An unauthenticated customer saved and restored a private draft; admin endpoints and requests without CSRF were denied, and live wedding content stayed unchanged.",
    );

    const uploading = c.waitForResponse(
        (response) =>
            response.url().endsWith(`/customer-portals/${secret}/media`) &&
            response.request().method() === "POST",
    );
    await c
        .getByLabel("Unggah foto cover", { exact: true })
        .setInputFiles("frontend/public/images/bouquets/buket-05.jpg");
    const uploadResponse = await uploading;
    assert.equal(uploadResponse.status(), 200);
    const photo = (await uploadResponse.json()).data[0].url;
    assert(photo.includes(`/weddings/${wedding.id}/customer/`));
    await expect(c.locator(".customer-photo-grid img").first()).toHaveAttribute(
        "src",
        photo,
    );
    await c.getByRole("button", { name: "Tambah Acara", exact: true }).click();
    await c.getByLabel("Nama acara 1", { exact: true }).fill("Akad Nikah");
    await c.getByLabel("Jenis acara 1", { exact: true }).selectOption("akad");
    await c.getByLabel("Tanggal acara 1", { exact: true }).fill("2026-12-20");
    await c.getByLabel("Jam mulai acara 1", { exact: true }).fill("09:00");
    await c.getByLabel("Jam selesai acara 1", { exact: true }).fill("10:00");
    await c.getByLabel("Lokasi acara 1", { exact: true }).fill("Gedung Awal");
    await c
        .getByLabel("Alamat acara 1", { exact: true })
        .fill("Jalan Mawar, Jakarta");
    await c
        .getByRole("button", { name: "Kirim Data ke Admin", exact: true })
        .click();
    await expect(c.locator(".customer-status")).toHaveText(
        "Data dikirim ke admin",
    );
    await a
        .getByRole("button", { name: "Muat Data Pelanggan", exact: true })
        .click();
    await expect(a.locator(".customer-proposal")).toContainText(
        "Shara Customer",
    );
    await a
        .getByRole("button", { name: "Terapkan Data Pelanggan", exact: true })
        .click();
    await a
        .getByRole("button", {
            name: "Ya, Terapkan Data Pelanggan",
            exact: true,
        })
        .click();
    await expect(a.getByRole("heading", { level: 1 })).toContainText("Shara");
    assert.equal(
        (await (await admin.request.get(path)).json()).data.cover_image,
        photo,
    );
    const deniedPublish = await admin.request.post(`${path}/publish`, {
        headers,
    });
    assert.equal(deniedPublish.status(), 422);
    assert((await deniedPublish.json()).errors.customer_approval);
    checks.push(
        "Customer uploaded a scoped photo and submitted complete data; administrator applied the proposal while publication remained blocked pending approval.",
    );

    await c
        .getByRole("button", { name: "Preview & Persetujuan", exact: true })
        .click();
    await expect(
        c.getByRole("button", {
            name: "Sudah Sesuai, Saya Setujui",
            exact: true,
        }),
    ).toBeVisible();
    await c
        .getByLabel("Catatan revisi", { exact: true })
        .fill("Mohon ubah lokasi akad menjadi Gedung Mawar.");
    await c
        .getByRole("button", { name: "Kirim Catatan Revisi", exact: true })
        .click();
    await expect(c.locator(".customer-status")).toHaveText("Revisi diminta");
    await a
        .getByRole("button", { name: "Muat Data Pelanggan", exact: true })
        .click();
    await expect(a.locator(".customer-revision")).toContainText("Gedung Mawar");
    await a.getByRole("button", { name: "Acara", exact: true }).click();
    await a.getByLabel("Venue", { exact: false }).fill("Gedung Mawar");
    await a.getByRole("button", { name: "Simpan", exact: true }).click();
    await expect(
        a.getByRole("button", { name: "Simpan", exact: true }),
    ).toBeDisabled();
    c.once("dialog", (dialog) => dialog.accept());
    await c
        .getByRole("button", {
            name: "Sudah Sesuai, Saya Setujui",
            exact: true,
        })
        .click();
    await expect(c.getByRole("alert")).toContainText("Preview sudah berubah");
    checks.push(
        "Customer revision notes reached the administrator, and approval of a preview changed in the meantime was rejected.",
    );

    await a.getByRole("button", { name: "Pelanggan", exact: true }).click();
    await a
        .getByRole("button", {
            name: "Kirim Preview untuk Ditinjau",
            exact: true,
        })
        .click();
    await c
        .getByRole("button", { name: "Muat Preview Terbaru", exact: true })
        .click();
    await expect(
        c.getByRole("button", {
            name: "Sudah Sesuai, Saya Setujui",
            exact: true,
        }),
    ).toBeVisible();
    c.once("dialog", (dialog) => dialog.accept());
    await c
        .getByRole("button", {
            name: "Sudah Sesuai, Saya Setujui",
            exact: true,
        })
        .click();
    await expect(c.locator(".customer-status")).toHaveText("Sudah disetujui");
    await a
        .getByRole("button", { name: "Muat Data Pelanggan", exact: true })
        .click();
    await expect(a.locator(".customer-manager-status")).toContainText(
        "Preview terbaru disetujui",
    );
    await a.getByRole("button", { name: "Publish", exact: true }).click();
    await a
        .getByRole("button", { name: "Publish Website", exact: true })
        .click();
    await a
        .getByRole("button", { name: "Ya, Publish Website", exact: true })
        .click();
    await expect(
        a.getByRole("link", { name: "Lihat Undangan", exact: true }),
    ).toBeVisible();
    assert.equal(
        (await customer.request.get(`${base}/api/weddings/${slug}`)).status(),
        200,
    );
    checks.push(
        "Customer approved the latest preview; the administrator published the wedding through the normal UI.",
    );

    await a.getByRole("button", { name: "Pelanggan", exact: true }).click();
    await c
        .getByRole("button", { name: "Isi Data Pernikahan", exact: true })
        .click();
    for (const width of [320, 390, 768, 1440]) {
        for (const [page, name] of [
            [a, "admin"],
            [c, "customer"],
        ]) {
            await page.setViewportSize({ width, height: 1000 });
            assert(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= innerWidth,
                ),
                `${name} overflow at ${width}px`,
            );
            await page.screenshot({ path: `${dir}/${name}-${width}.png` });
        }
    }
    checks.push(
        "Customer data forms and administrator link/review controls fit 320, 390, 768, and 1440px.",
    );
    a.once("dialog", (dialog) => dialog.accept());
    await a
        .getByRole("button", {
            name: "Buat Ulang Tautan Pelanggan",
            exact: true,
        })
        .click();
    await expect(linkField).not.toHaveValue(link);
    assert.equal(
        (
            await customer.request.get(`${base}/api/customer-portals/${secret}`)
        ).status(),
        404,
    );
    const nextSecret = new URL(await linkField.inputValue()).pathname
        .split("/")
        .pop();
    a.once("dialog", (dialog) => dialog.accept());
    await a
        .getByRole("button", { name: "Nonaktifkan Tautan", exact: true })
        .click();
    await expect(a.locator(".customer-manager-status")).toHaveText(
        "Tautan dinonaktifkan",
    );
    assert.equal(
        (
            await customer.request.get(
                `${base}/api/customer-portals/${nextSecret}`,
            )
        ).status(),
        404,
    );
    checks.push(
        "Rotating or revoking the private link immediately disabled previous customer access.",
    );
    assert.deepEqual(errors, []);
    console.log(
        `PASS ${checks.length} customer data, media, review, approval, publication, and access browser checks.`,
    );
} finally {
    await writeFile(
        `${dir}/report.json`,
        JSON.stringify({ checks, errors }, null, 2),
    );
    await browser.close();
}

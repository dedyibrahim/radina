import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { solveLoginCaptcha } from "./support/login-captcha.mjs";

const base = process.env.TEST_URL;
assert(
    base && ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
    "Use the isolated local test server.",
);
assert(
    process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD,
    "Set isolated administrator credentials.",
);
const resultDir = "test-results/wedding-import";
await mkdir(resultDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage(),
    checks = [],
    errors = [];
page.on("pageerror", (error) => errors.push(error.message));

function parseCsv(text) {
    const rows = [],
        row = [];
    let cell = "",
        quoted = false;
    text = text.replace(/^\uFEFF/, "");
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            if (quoted && text[i + 1] === '"') {
                cell += '"';
                i++;
            } else quoted = !quoted;
        } else if (!quoted && (char === ";" || char === "\n")) {
            row.push(cell.replace(/\r$/, ""));
            cell = "";
            if (char === "\n") {
                rows.push([...row]);
                row.length = 0;
            }
        } else cell += char;
    }
    if (cell || row.length) {
        row.push(cell.replace(/\r$/, ""));
        rows.push([...row]);
    }
    return rows;
}
function csv(rows) {
    return (
        "\uFEFF" +
        rows
            .map((row) =>
                row
                    .map(
                        (cell) =>
                            '"' + String(cell).replaceAll('"', '""') + '"',
                    )
                    .join(";"),
            )
            .join("\r\n") +
        "\r\n"
    );
}
async function download(label, filename) {
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: label, exact: true }).click();
    const file = await pending;
    await file.saveAs(`${resultDir}/${filename}`);
    return readFile(`${resultDir}/${filename}`, "utf8");
}

try {
    await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
    await page.getByLabel("Email admin").fill(process.env.TEST_ADMIN_EMAIL);
    await page
        .getByLabel("Kata sandi", { exact: false })
        .fill(process.env.TEST_ADMIN_PASSWORD);
    await solveLoginCaptcha(page);
    await page.getByRole("button", { name: "Masuk ke Workspace" }).click();
    await page.waitForURL(`${base}/admin`);
    const token = decodeURIComponent(
        (await context.cookies()).find((c) => c.name === "XSRF-TOKEN").value,
    );
    const csrf = { "X-XSRF-TOKEN": token, Accept: "application/json" };
    const templates = (
        await (await context.request.get(`${base}/api/templates`)).json()
    ).data;
    const slug = `import-browser-${Date.now()}`;
    const created = await context.request.post(`${base}/api/orders`, {
        data: {
            template_id: templates[0].id,
            customer_name: "Isolated Import Customer",
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
            await context.request.patch(
                `${base}/api/admin/orders/${order.id}/payment`,
                { headers: csrf },
            )
        ).status(),
        200,
    );
    const weddingResponse = await context.request.post(
        `${base}/api/admin/orders/${order.id}/wedding`,
        { headers: csrf },
    );
    assert.equal(weddingResponse.status(), 201);
    const wedding = (await weddingResponse.json()).data;
    await page.goto(`${base}/admin/weddings/${wedding.id}`, {
        waitUntil: "networkidle",
    });
    await page
        .getByRole("button", { name: "Impor / Ekspor", exact: true })
        .click();
    await expect(
        page.getByRole("heading", { name: "Impor & ekspor" }),
    ).toBeVisible();

    const blank = parseCsv(
        await download(
            "Unduh Template Pernikahan",
            "template-data-pernikahan.csv",
        ),
    );
    assert.deepEqual(blank[0], ["bagian", "kunci", "nilai", "petunjuk"]);
    assert(blank.slice(1).every((row) => row[2] === ""));
    const values = {
        title: "The Wedding of Shara & Dedy",
        wedding_date: "2026-12-20",
        "bride.full_name": "Shara Ibrahim",
        "bride.nickname": "Shara",
        "groom.full_name": "Dedy Ibrahim",
        "groom.nickname": "Dedy",
        "events.1.type": "akad",
        "events.1.title": "Akad Nikah",
        "events.1.date": "2026-12-20",
        "events.1.start_time": "09:00",
        "events.1.end_time": "10:00",
        "events.1.venue": "Gedung Jakarta",
        "events.1.address": "Jalan Mawar, Jakarta",
        "gift_methods.1.type": "BANK",
        "gift_methods.1.provider": "BCA",
        "gift_methods.1.account_number": "0012345678",
        "gift_methods.1.account_name": "Shara Ibrahim",
        "settings.enable_music": "tidak",
        "settings.enable_gallery": "tidak",
    };
    for (const row of blank.slice(1)) row[2] = values[row[1]] ?? "";
    await writeFile(`${resultDir}/filled-content.csv`, csv(blank));
    await page
        .getByLabel("File data pernikahan", { exact: true })
        .setInputFiles(`${resultDir}/filled-content.csv`);
    await page
        .getByRole("button", { name: "Periksa Data Pernikahan", exact: true })
        .click();
    await expect(page.locator(".import-preview").first()).toContainText(
        "Shara Ibrahim",
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "Original",
    );
    await page
        .getByRole("button", { name: "Impor & Simpan Pernikahan", exact: true })
        .click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "Shara",
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Dedy");
    const exported = parseCsv(
        await download("Ekspor Data Pernikahan", "data-pernikahan.csv"),
    );
    assert.equal(
        exported.find((row) => row[1] === "gift_methods.1.account_number")[2],
        "'0012345678",
    );
    assert.equal(
        exported.find((row) => row[1] === "bride.full_name")[2],
        "Shara Ibrahim",
    );
    checks.push(
        "Downloaded the actual blank customer template, filled it, previewed and saved all wedding details including encrypted gift account; exported the saved details.",
    );

    assert.deepEqual(
        parseCsv(await download("Unduh Template Tamu", "template-tamu.csv"))[0],
        ["nama", "alamat"],
    );
    const guestRows = [
        ["nama", "alamat"],
        ["Bapak Budi & Keluarga", "Jakarta"],
        ["bapak budi & keluarga", "jakarta"],
        ["Bapak Budi & Keluarga", "Bandung"],
        ['José, "Sahabat"', "Jalan Mawar; nomor 1"],
    ];
    await writeFile(`${resultDir}/guests.csv`, csv(guestRows));
    await page
        .getByLabel("File daftar tamu", { exact: true })
        .setInputFiles(`${resultDir}/guests.csv`);
    await page
        .getByRole("button", { name: "Periksa Daftar Tamu", exact: true })
        .click();
    await expect(page.locator(".import-preview")).toContainText(
        "3 tamu baru · 1 duplikat dilewati",
    );
    await page
        .getByRole("button", { name: "Impor Tamu & Buat Tautan", exact: true })
        .click();
    await expect(page.locator(".invitee-total")).toContainText(
        "3 tamu tersimpan",
    );
    const guestExport = parseCsv(
        await download("Unduh Tautan Tamu", "tautan-tamu.csv"),
    );
    assert.deepEqual(guestExport[0], ["nama", "alamat", "link_undangan"]);
    assert.equal(guestExport.length, 4);
    assert.notEqual(guestExport[1][2], guestExport[2][2]);
    for (const [name, address, link] of guestExport.slice(1)) {
        const url = new URL(link);
        assert.equal(url.origin, base);
        assert.equal(url.pathname, `/w/${slug}`);
        assert.equal(url.searchParams.get("to"), name);
        assert(!url.searchParams.has("alamat"));
        assert(!link.includes(encodeURIComponent(address)));
    }
    await page
        .getByRole("button", {
            name: "Salin tautan Bapak Budi & Keluarga",
            exact: true,
        })
        .first()
        .click();
    await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe(guestExport[1][2]);
    await page
        .getByRole("button", { name: "Periksa Daftar Tamu", exact: true })
        .click();
    await expect(page.locator(".import-preview")).toContainText(
        "0 tamu baru · 4 duplikat dilewati",
    );
    await expect(
        page.getByRole("button", {
            name: "Impor Tamu & Buat Tautan",
            exact: true,
        }),
    ).toBeDisabled();
    checks.push(
        "Imported guest names and addresses, skipped duplicates, downloaded actual personalized links, and verified copy and repeat-import behavior.",
    );

    await writeFile(
        `${resultDir}/invalid-guests.csv`,
        csv([
            ["nama", "alamat"],
            ["Valid Guest", "Jakarta"],
            ["Missing Address", ""],
        ]),
    );
    await page
        .getByLabel("File daftar tamu", { exact: true })
        .setInputFiles(`${resultDir}/invalid-guests.csv`);
    await page
        .getByRole("button", { name: "Periksa Daftar Tamu", exact: true })
        .click();
    await expect(page.getByRole("alert")).toContainText("Baris 3");
    await expect(page.locator(".invitee-total")).toContainText(
        "3 tamu tersimpan",
    );
    checks.push(
        "Invalid rows report their location and preserve the entire saved guest list.",
    );
    await page
        .getByLabel("File daftar tamu", { exact: true })
        .setInputFiles([]);
    await page
        .getByRole("button", { name: "Informasi Dasar", exact: true })
        .click();
    await page
        .getByLabel("Judul Undangan", { exact: false })
        .fill("Unsaved title");
    await page
        .getByRole("button", { name: "Impor / Ekspor", exact: true })
        .click();
    await expect(
        page.getByLabel("File data pernikahan", { exact: true }),
    ).toBeDisabled();
    await expect(page.getByRole("alert")).toContainText(
        "Simpan perubahan editor",
    );
    await page.getByRole("button", { name: "Simpan", exact: true }).click();
    await expect(
        page.getByLabel("File data pernikahan", { exact: true }),
    ).toBeEnabled();
    checks.push(
        "Unsaved manual editor changes block content imports until saved.",
    );

    for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        assert(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `Overflow at ${width}px`,
        );
        await page.locator(".wedding-import-export").scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${resultDir}/import-${width}.png` });
    }
    checks.push(
        "Import, export, and guest tables fit 320, 390, 768, and 1440px.",
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await page
        .getByRole("button", { name: "Publish Website", exact: true })
        .click();
    await page
        .getByRole("button", { name: "Ya, Publish Website", exact: true })
        .click();
    await expect(
        page.getByRole("link", { name: "Lihat Undangan", exact: true }),
    ).toBeVisible();
    const invitation = await context.newPage();
    invitation.on("pageerror", (error) => errors.push(error.message));
    await invitation.goto(guestExport[3][2], { waitUntil: "networkidle" });
    await expect(
        invitation.locator(".cover-guest, .new-cover-guest"),
    ).toContainText('José, "Sahabat"');
    checks.push(
        "Published the imported wedding and opened an exported guest link that displays the exact personalized guest name.",
    );
    assert.deepEqual(errors, []);
    console.log(
        `PASS ${checks.length} wedding content and guest import browser checks.`,
    );
} finally {
    await writeFile(
        `${resultDir}/report.json`,
        JSON.stringify({ checks, errors }, null, 2),
    );
    await browser.close();
}

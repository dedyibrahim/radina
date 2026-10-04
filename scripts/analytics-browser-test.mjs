import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";

const base = process.env.TEST_URL;
assert(
    base &&
        new URL(base).hostname === "127.0.0.1" &&
        new URL(base).port === "8001",
    "Use the isolated test server on port 8001",
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const context = await browser.newContext({ reducedMotion: "reduce" });
let rejectOrder = true,
    orderPosts = 0,
    tagLoads = 0;
// Inject server configuration locally; never send test events to Google or create orders.
await context.route("**/*", async (route) => {
    const request = route.request(),
        url = new URL(request.url());
    if (url.hostname === "www.googletagmanager.com") {
        tagLoads++;
        return route.fulfill({
            contentType: "application/javascript",
            body: "/* Analytics stub: keep the real application dataLayer */",
        });
    }
    if (url.origin !== new URL(base).origin) return route.abort();
    if (request.method() !== "GET") {
        if (url.pathname === "/api/check-order") return route.fulfill({ status: 404, json: { message: "Mock only" } });
        assert.equal(url.pathname, "/api/orders", "Unexpected test mutation");
        orderPosts++;
        if (rejectOrder)
            return route.fulfill({
                status: 422,
                json: { message: "Pesanan ditolak untuk pengujian." },
            });
        return route.fulfill({
            status: 201,
            json: {
                data: {
                    order_number: "GA-MOCK-PRIVATE",
                    whatsapp: "08000000000",
                    total: 149000,
                },
            },
        });
    }
    if (url.pathname.startsWith("/api/orders/GA-MOCK-PRIVATE"))
        return route.fulfill({ status: 404, json: { message: "Mock only" } });
    if (request.resourceType() === "document") {
        const response = await route.fetch();
        let html = await response.text();
        html = html.replace(/<meta name="radina-google-analytics"[^>]*>/g, "");
        const config = JSON.stringify({
            id: "G-7BZHBM3W8L",
            templates: ["rosalia-arch"],
        }).replaceAll('"', "&quot;");
        html = html.replace(
            "</head>",
            `<meta name="radina-google-analytics" content="${config}" /></head>`,
        );
        return route.fulfill({ response, body: html });
    }
    return route.continue();
});
context.on("page", (p) => p.on("pageerror", (e) => errors.push(e.message)));
const page = await context.newPage();
const events = () =>
    page.evaluate(() =>
        (window.dataLayer || [])
            .map((args) => Array.from(args))
            .filter((args) => args[0] === "event"),
    );
async function navigate(path) {
    await page.evaluate(
        (path) =>
            document
                .querySelector("#app")
                .__vue_app__.config.globalProperties.$router.push(path)
                .then(() => {}),
        path,
    );
    await page.waitForURL(`${base}${path}`);
}
try {
    await page.goto(`${base}/?to=Private%20Name&token=secret`, {
        waitUntil: "networkidle",
    });
    assert.equal(
        (await events()).filter((e) => e[1] === "page_view").length,
        1,
    );
    await navigate("/templates");
    await expect(page.locator(".template-card").first()).toBeVisible();
    await navigate("/templates/rosalia-arch");
    await expect
        .poll(
            async () =>
                (await events()).filter((e) => e[1] === "view_template").length,
        )
        .toBe(1);
    await navigate("/templates/rosalia-arch/preview");
    await expect
        .poll(
            async () =>
                (await events()).filter((e) => e[1] === "preview_template")
                    .length,
        )
        .toBe(1);
    await navigate("/order/rosalia-arch");
    await expect
        .poll(
            async () =>
                (await events()).filter((e) => e[1] === "begin_checkout")
                    .length,
        )
        .toBe(1);
    await page.getByLabel("Nama Pemesan").fill("Private Name");
    await page.getByLabel("Nomor WhatsApp").fill("08000000000");
    await page.getByLabel("Nama Pengantin Wanita").fill("PrivateBride");
    await page.getByLabel("Nama Pengantin Pria").fill("PrivateGroom");
    await page.getByRole("button", { name: "Lanjutkan", exact: true }).click();
    await page
        .getByRole("button", { name: "Buat Pesanan", exact: true })
        .click();
    await expect(page.getByRole("alert")).toContainText("Pesanan ditolak");
    assert.equal(
        (await events()).filter((e) => e[1] === "generate_lead").length,
        0,
    );
    rejectOrder = false;
    await page
        .getByRole("button", { name: "Buat Pesanan", exact: true })
        .click();
    await page.waitForURL("**/order/success/GA-MOCK-PRIVATE");
    const lead = (await events()).filter((e) => e[1] === "generate_lead");
    assert.equal(lead.length, 1);
    assert.equal(lead[0][2].value, 149000);
    assert.equal(lead[0][2].currency, "IDR");
    assert.equal(
        await page.evaluate(() => window["ga-disable-G-7BZHBM3W8L"]),
        true,
    );
    const count = (await events()).length;
    await navigate("/admin/login");
    await expect(page.getByLabel("Kata sandi", { exact: false })).toBeVisible();
    assert.equal((await events()).length, count);
    await navigate("/buket");
    await expect(page.locator("a.whatsapp-bubble")).toBeVisible();
    await page.evaluate(() =>
        document.addEventListener("click", (event) => event.preventDefault()),
    );
    await page.locator("a.whatsapp-bubble").click();
    assert.equal((await events()).at(-1)[1], "click_whatsapp");
    assert.equal((await events()).at(-1)[2].placement, "bubble");
    assert.equal(tagLoads, 1, "SPA loads the tag once");
    const payload = JSON.stringify(await events());
    for (const secret of [
        "Private Name",
        "PrivateBride",
        "PrivateGroom",
        "08000000000",
        "GA-MOCK-PRIVATE",
        "secret",
        "/admin/",
        "/order/success/",
    ])
        assert(!payload.includes(secret), secret);
    assert.equal(orderPosts, 2, "Only mocked orders were submitted");
    const privatePage = await context.newPage();
    await privatePage.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
    assert.equal(
        await privatePage.evaluate(() => (window.dataLayer || []).length),
        0,
    );
    await privatePage.goto(`${base}/templates/rosalia-arch/preview?mini=1`, {
        waitUntil: "networkidle",
    });
    assert.equal(
        await privatePage.evaluate(() => (window.dataLayer || []).length),
        0,
    );
    await privatePage.route("**/www.googletagmanager.com/**", (route) =>
        route.abort(),
    );
    await privatePage.goto(`${base}/order/rosalia-arch`, {
        waitUntil: "networkidle",
    });
    await expect(privatePage.getByLabel("Nama Pemesan")).toBeVisible();
    assert.deepEqual(errors, []);
    console.log(
        "PASS: SPA pageviews, template/preview/checkout/lead/WhatsApp events, rejected orders, private routes, mini previews and blocked tag; no real orders or Google hits.",
    );
} finally {
    await browser.close();
}

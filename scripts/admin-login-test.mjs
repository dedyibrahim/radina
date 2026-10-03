import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { solveLoginCaptcha } from "./support/login-captcha.mjs";

const base = process.env.TEST_URL;
assert(
    base && ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
    "Use an isolated local test server.",
);
assert(
    process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD,
    "Configure isolated administrator credentials.",
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
const errors = [],
    checks = [];
page.on("pageerror", (error) => errors.push(error.message));
await mkdir("test-results/admin-login", { recursive: true });

async function submit() {
    const response = page.waitForResponse(
        (r) =>
            r.url().endsWith("/api/admin/login") &&
            r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Masuk ke Workspace" }).click();
    return response;
}

try {
    await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
    await solveLoginCaptcha(page);
    await page.getByLabel("Email admin").fill(process.env.TEST_ADMIN_EMAIL);
    const password = page.getByLabel("Kata sandi", { exact: false });
    await password.fill(process.env.TEST_ADMIN_PASSWORD);
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Tampilkan password" }).click();
    await expect(password).toHaveAttribute("type", "text");
    await expect(password).toHaveValue(process.env.TEST_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sembunyikan password" }).click();
    await expect(password).toHaveAttribute("type", "password");
    checks.push("Password visibility toggle preserves the entered password.");

    for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `Overflow at ${width}px`,
        );
        await expect(page.getByLabel("Jawaban CAPTCHA")).toBeVisible();
        await page.screenshot({
            path: `test-results/admin-login/login-${width}.png`,
            fullPage: true,
        });
    }
    checks.push("Login layout fits 320, 390, 768, and 1440px.");

    const csrf = await context.request.post(`${base}/api/admin/login`, {
        headers: { Accept: "application/json" },
        data: {
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD,
            captcha: 0,
        },
    });
    assert.equal(csrf.status(), 419);
    checks.push(
        "A request without CSRF is rejected even with unmatched Sanctum domains.",
    );

    await page.getByLabel("Jawaban CAPTCHA").fill("99");
    assert.equal((await submit()).status(), 422);
    await expect(page.getByRole("alert")).toContainText("CAPTCHA");
    await expect(page.getByLabel("Jawaban CAPTCHA")).toHaveValue("");
    await solveLoginCaptcha(page);
    checks.push("Wrong CAPTCHA is rejected and a new challenge loads.");

    await password.fill("incorrect-password");
    assert.equal((await submit()).status(), 422);
    await expect(page.getByRole("alert")).toContainText(
        "Email atau kata sandi",
    );
    await expect(page.getByLabel("Jawaban CAPTCHA")).toHaveValue("");
    await solveLoginCaptcha(page);
    checks.push(
        "Wrong password consumes the challenge and reloads a new CAPTCHA.",
    );

    await password.fill(process.env.TEST_ADMIN_PASSWORD);
    assert.equal((await submit()).status(), 200);
    await page.waitForURL(`${base}/admin`);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(new URL(page.url()).pathname, "/admin");
    assert.equal(
        (await context.request.get(`${base}/api/admin/me`)).status(),
        200,
    );
    assert.equal(
        (await context.request.get(`${base}/api/admin/licenses`)).status(),
        200,
    );
    checks.push(
        "Successful login survives reload and authorizes the license dashboard.",
    );

    const logoutResponse = page.waitForResponse(r => r.url().endsWith('/api/admin/logout'));
    await page.getByRole('button', { name: 'Keluar', exact: true }).click();
    assert.equal((await logoutResponse).status(), 204);
    await page.waitForURL(`${base}/admin/login`);
    await page.waitForLoadState('networkidle');
    const meStatus = await page.evaluate(async () => (await fetch('/api/admin/me', { headers: { Accept: 'application/json' } })).status);
    assert.equal(meStatus, 401);
    checks.push("Logout invalidates access to administrator endpoints.");

    await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
    await page.getByLabel("Email admin").fill(process.env.TEST_ADMIN_EMAIL);
    await password.fill(process.env.TEST_ADMIN_PASSWORD);
    await solveLoginCaptcha(page);
    assert.equal((await submit()).status(), 200);
    await page.waitForURL(`${base}/admin`);
    checks.push(
        "Login works again after logout with renewed CSRF and CAPTCHA.",
    );
    assert.deepEqual(errors, []);
    console.log(`PASS ${checks.length} administrator login browser checks.`);
} catch (error) {
    await page
        .screenshot({
            path: "test-results/admin-login/failure.png",
            fullPage: true,
        })
        .catch(() => {});
    throw error;
} finally {
    await writeFile(
        "test-results/admin-login/report.json",
        JSON.stringify({ checks, errors }, null, 2),
    );
    await browser.close();
}

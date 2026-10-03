import { expect } from "@playwright/test";

export async function solveLoginCaptcha(page) {
    const question = page.getByTestId("captcha-question");
    await expect(question).toHaveText(/^\d+ \+ \d+ = \?$/);
    const numbers = (await question.textContent()).match(/\d+/g).map(Number);
    await page
        .getByLabel("Jawaban CAPTCHA")
        .fill(String(numbers[0] + numbers[1]));
}

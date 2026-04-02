import { test, expect } from "@playwright/test"

test.describe("Home page", () => {
  test("renders heading and button", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("h1")).toHaveText("Hello World")
    await expect(page.getByRole("button", { name: "Click me" })).toBeVisible()
  })

  test("clicking button shows greeting and increments count", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByRole("button", { name: "Click me" }).click()
    const countLocator = page.getByText(/Total clicks: \d+/)
    await expect(countLocator).toBeVisible()
    await expect(page.getByText(/Hello World!/)).toBeVisible()

    const firstText = await countLocator.textContent()
    const firstCount = parseInt(firstText!.match(/\d+/)![0])

    await page.getByRole("button", { name: "Click me" }).click()
    await expect(countLocator).toHaveText(`Total clicks: ${firstCount + 1}`)
  })
})

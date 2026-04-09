import { test, expect } from "@playwright/test";

const createTechnician = (id, name, city) => ({
  _id: id,
  user: { fullName: name, avatarUrl: "" },
  location: { city, state: "Maharashtra", country: "India" },
  services: [{ serviceName: "Plumbing", description: "Fixes pipes", price: 499 }],
  experienceYears: 5,
  avgRating: 4.5,
  averageRating: 4.5,
  totalReviews: 12,
});

const PAGE_1_DATA = [
  createTechnician("t-1", "Aarav Sharma", "Mumbai"),
  createTechnician("t-2", "Neha Patel", "Pune"),
];

const PAGE_2_DATA = [
  createTechnician("t-3", "Rohan Mehta", "Nagpur"),
  createTechnician("t-4", "Ishita Verma", "Nashik"),
];

const mockTechnicianPagination = async (page) => {
  await page.route("**/api/v1/technicians**", async (route) => {
    const url = new URL(route.request().url());
    const pageNo = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");

    const payload =
      pageNo === 1
        ? {
            success: true,
            status: "success",
            data: PAGE_1_DATA,
            pagination: { total: 4, page: 1, limit, totalPages: 2 },
          }
        : pageNo === 2
          ? {
              success: true,
              status: "success",
              data: PAGE_2_DATA,
              pagination: { total: 4, page: 2, limit, totalPages: 2 },
            }
          : {
              success: true,
              status: "success",
              data: [],
              pagination: { total: 4, page: pageNo, limit, totalPages: 2 },
            };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });
};

const mockAuthenticatedUser = async (page) => {
  await page.addInitScript(() => {
    localStorage.setItem("token", "e2e-token");
    localStorage.setItem("servicemate_token", "e2e-token");
    localStorage.setItem(
      "servicemate_user",
      JSON.stringify({ _id: "u-1", fullName: "E2E User", role: "user", email: "e2e@servicemate.test" }),
    );
  });

  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        user: { _id: "u-1", fullName: "E2E User", role: "user", email: "e2e@servicemate.test" },
      }),
    });
  });
};

test("pagination works on technicians page", async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockTechnicianPagination(page);
  await page.goto("/technicians");

  const cards = page.getByTestId("technician-card");
  await expect(cards.first()).toBeVisible();

  const firstPageItems = await cards.allTextContents();

  const nextButton = page.getByRole("button", { name: "Next" });
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  await expect.poll(async () => cards.allTextContents()).not.toEqual(firstPageItems);

  const secondPageItems = await cards.allTextContents();
  expect(secondPageItems.length).toBeGreaterThan(0);

  const previousButton = page.getByRole("button", { name: "Previous" });
  await expect(previousButton).toBeEnabled();
  await previousButton.click();

  await expect.poll(async () => cards.allTextContents()).toEqual(firstPageItems);
});

test("pagination boundary buttons are safe", async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockTechnicianPagination(page);
  await page.goto("/technicians");

  const cards = page.getByTestId("technician-card");
  await expect(cards.first()).toBeVisible();

  const previousButton = page.getByRole("button", { name: "Previous" });
  await expect(previousButton).toBeDisabled();

  const nextButton = page.getByRole("button", { name: "Next" });
  const nextWasEnabled = await nextButton.isEnabled();

  if (nextWasEnabled) {
    let guard = 0;
    while ((await nextButton.isEnabled()) && guard < 25) {
      await nextButton.click();
      await page.waitForTimeout(150);
      guard += 1;
    }
  }

  await expect(page.getByTestId("technician-card").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
});

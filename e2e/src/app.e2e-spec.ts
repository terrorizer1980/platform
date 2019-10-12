import { AppPage } from "./app.po";

describe("workspace-project App", () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it("should display welcome message", async () => {
    await page.navigateTo("/");
    const title = await page.getTitleText();
    expect(title).toEqual("Trust Platform");
  });

  it("should load cosmos details", async done => {
    await page.navigateTo("blockchain/cosmos");
    done();
  });

  it("should load tron details", async done => {
    await page.navigateTo("blockchain/tron");
    done();
  });

  it("should load cosmos stake screen", async done => {
    await page.navigateTo("blockchain/cosmos/stake");
    done();
  });

  it("should load tron stake screen", async done => {
    await page.navigateTo("blockchain/tron/stake");
    done();
  });
});

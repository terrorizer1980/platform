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

  it("should load cosmos validators", async () => {
    await page.navigateTo("blockchain/cosmos");
    const count = await page.getValidators();
    expect(count).toBeGreaterThanOrEqual(8);
  });

  it("should load tron validators", async () => {
    await page.navigateTo("blockchain/tron");
    const count = await page.getValidators();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  it("should load cosmos details screen", async done => {
    await page.navigateTo(
      "blockchain/cosmos/details/cosmosvaloper1qwl879nx9t6kef4supyazayf7vjhennyh568ys"
    );
    done();
  });

  it("should load tron details screen", async done => {
    await page.navigateTo(
      "blockchain/tron/details/TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH"
    );
    done();
  });

  it("should load cosmos stake screen", async done => {
    await page.navigateTo(
      "blockchain/cosmos/details/cosmosvaloper1qwl879nx9t6kef4supyazayf7vjhennyh568ys/stake"
    );
    done();
  });

  it("should load tron stake screen", async done => {
    await page.navigateTo(
      "blockchain/tron/details/TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH/stake"
    );
    done();
  });
});

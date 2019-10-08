import { browser, by, element } from "protractor";

export class AppPage {
  async navigateTo(path: string) {
    const result = browser.get(path);
    await browser.waitForAngular();
    return result;
  }

  async getTitleText() {
    return browser.getTitle();
  }

  async getValidators() {
    return element.all(by.css(".validator")).count();
  }
}

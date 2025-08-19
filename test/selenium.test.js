import { Builder } from "selenium-webdriver";
import { expect } from "chai";

describe("Prueba con Selenium", function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Debería abrir Google y verificar el título", async () => {
    await driver.get("https://www.google.com");
    const title = await driver.getTitle();
    expect(title).to.include("Google");
  });
});

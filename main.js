require('dotenv').config()
const chromium = require("chrome-aws-lambda");

async function fetchCookies() {
    try {
        const browser = await chromium.puppeteer.launch({
            headless: 'new',
            args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: null,
            executablePath: await chromium.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        })
        const page = await browser.newPage();
        await page.goto(
        "https://store.steampowered.com/agecheck/app/1938090/",
        { timeout: 180000 }
        );
        await page.select("#ageYear", "1980");
        await page.click("#view_product_page_btn");
        await page.waitForNavigation("https://store.steampowered.com/app/1938090/Call_of_Duty/",{ timeout: 180000 })
        const storedCookies = await page.cookies();
        console.log(storedCookies);
        await browser.close();
        return storedCookies, console.log("Succesfully refreshed cookies");
    } catch (error) {
        console.error(error);
    }
}

fetchCookies().then(() => {
  console.log("test complete");
});

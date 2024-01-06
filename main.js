require('dotenv').config();
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.listen(process.env.PORT || 3000, () => {
    console.log("app online")
})

async function fetchCookies() {
    try {
        const browser = await puppeteer.connect({ browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.TOKEN}` });
        const page = await browser.newPage();
        await page.goto(
        "https://store.steampowered.com/agecheck/app/1938090/",
        { timeout: 180000 }
        );
        await page.select("#ageYear", "1980");
        await page.click("#view_product_page_btn");
        await page.waitForNavigation("https://store.steampowered.com/app/1938090/Call_of_Duty/",{ timeout: 180000 })
        const storedCookies = await page.cookies();
        console.log({storedCookies});
        await browser.close();
        return storedCookies;
    } catch (error) {
        console.error(error);
    }
}

app.get("/cookies", async (req, res) => {
    const response = await fetchCookies();
    res.send({cookies: response});
})
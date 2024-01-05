const express = require("express");
const puppeteer = require("puppeteer");
const { MongoClient } = require("mongodb");
require('dotenv').config();

const app = express();
app.listen(process.env.PORT || 3000, async () => {
    console.log("app online");
})

app.get("/", (req, res) => {
    res.send("seems to be working fine.");
})

async function fetchCookies() {
  const database = new MongoClient(`mongodb+srv://admin:${process.env.PASS}@freecluster.7xu0m7g.mongodb.net/?retryWrites=true&w=majority`);
  (database.connect()).then(() => console.log("database connected"));

  try {
    const browser = await puppeteer.launch({
    headless: "new",
    args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
    ],
    executablePath:
        process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    timeout: 1200000,
    });
    const page = await browser.newPage();
    const domContentLoadedPromise = await new Promise((resolve) => {
        page.once('domcontentloaded', resolve);
    });
    await domContentLoadedPromise;
    await page.goto(
      "https://store.steampowered.com/agecheck/app/1938090/",
      { timeout: 180000 }
    );
    await domContentLoadedPromise;
    await page.select("#ageYear", "1980");
    await page.click("#view_product_page_btn");
    await page.waitForNavigation("https://store.steampowered.com/app/1938090/Call_of_Duty/",{ timeout: 180000 })
    await domContentLoadedPromise;
    const storedCookies = await page.cookies();
    console.log(storedCookies);
    await database.db("steam").collection("cookies").deleteMany({});
    await database.db("steam").collection("cookies").insertOne({_id: "cookies", cookies: storedCookies, timestamp: new Date()});
    await browser.close();
    return storedCookies, console.log("Succesfully refreshed cookies");
  } catch (error) {
    console.error(error);
  }
}

app.get("/cookies", async (req, res) => {
    const cookies = await fetchCookies();
    res.send({cookies: cookies});
})

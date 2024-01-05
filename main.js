const puppeteer = require("puppeteer");
const { MongoClient } = require("mongodb");
require('dotenv').config();


let storedCookies = [];
async function fetchCookies() {
  const database = new MongoClient(`mongodb+srv://admin:${process.env.PASS}@freecluster.7xu0m7g.mongodb.net/?retryWrites=true&w=majority`);
  await database.connect();

  const browser = await puppeteer.launch({
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
    timeout: 90000,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://store.steampowered.com/agecheck/app/1938090/",
    { timeout: 60000 }
  );
  await page.select("#ageYear", "1980");
  await page.click("#view_product_page_btn");
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 90000 });

  storedCookies = await page.cookies();
  console.log(storedCookies);
  await database.db("steam").collection("cookies").deleteMany({});
  await database.db("steam").collection("cookies").insertOne({_id: "cookies", cookies: storedCookies, timestamp: new Date()});
  browser.close();
}

setInterval(async () => {
  fetchCookies();
}, 360000);

(async () => {
  fetchCookies();
})();

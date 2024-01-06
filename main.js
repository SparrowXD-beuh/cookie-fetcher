const axios = require("axios");
const cheerio = require("cheerio");
const { database } = require("./modules/searchByAppId")
const headers = require("./public/headers.json");
require('dotenv').config()
// const puppeteer = require("puppeteer");

const chromium = require("chrome-aws-lambda");

// async function run() {
//   const response = await axios.get(
//     `https://store.steampowered.com/agecheck/app/2050650/`,
//     {
//       headers: {
//         headers,
//       },
//     }
//   );
//   const Headers = response.headers;
//   if (Headers && Headers["set-cookie"]) {
//     const cookiesArray = Headers["set-cookie"].map((cookieString) => {
//       const cookieParts = cookieString.split(";").map((part) => part.trim());
//       const cookie = {};

//       // Extract name and value
//       const [name, value] = cookieParts[0].split("=");
//       cookie.name = name;
//       cookie.value = value;

//       cookiePath = "/";
//       cookieParts.slice(1).forEach((part) => {
//         const [key, val] = part.split("=");

//         if (key.toLowerCase() === "expires") {
//           cookie.expires = (new Date(val)).getTime();
//         } else if (key.toLowerCase() === "path") {
//           cookie.path = val;
//         } else if (key.toLowerCase() === "domain") {
//           cookie.domain = val;
//         } else if (key.toLowerCase() === "secure") {
//           cookie.secure = true;
//         } else if (key.toLowerCase() === "httponly") {
//           cookie.httpOnly = true;
//         } else if (key.toLowerCase() === "samesite") {
//           cookie.sameSite = val;
//         }
//       });
//       return cookie;
//     });
//     cookiesArray.push({
//         name: 'wants_mature_content',
//         value: 1,
//         path: '/',
//         secure: true,
//         sameSite: 'None'
//     })
//     console.log(cookiesArray);
//   }
// }

fetchCookies().then(() => {
  console.log("test complete");
});

async function fetchCookies() {
    // const database = new MongoClient(`mongodb+srv://admin:${process.env.PASS}@freecluster.7xu0m7g.mongodb.net/?retryWrites=true&w=majority`);
    // (database.connect()).then(() => console.log("database connected"));

    try {
        // const browser = await puppeteer.launch({
        // headless: "new",
        // args: [
            // "--disable-setuid-sandbox",
            // "--no-sandbox",
            // "--single-process",
            // "--no-zygote",
        // ],
        // executablePath:
        //     process.env.NODE_ENV === "production"
        //     ? process.env.PUPPETEER_EXECUTABLE_PATH
        //     : puppeteer.executablePath(),
        // timeout: 1200000,
        // });
        const browser = await chromium.puppeteer.launch({
            headless: false,
            args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chromium.defaultViewport,
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
        // await database.db("steam").collection("cookies").deleteMany({});
        // await database.db("steam").collection("cookies").insertOne({_id: "cookies", cookies: storedCookies, timestamp: new Date()});
        await browser.close();
        return storedCookies, console.log("Succesfully refreshed cookies");
    } catch (error) {
        console.error(error);
    }
}

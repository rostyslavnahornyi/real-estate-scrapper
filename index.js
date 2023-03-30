import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import { Telegraf } from "telegraf";

const DOMAIN = "https://www.real-estate.lviv.ua";
const URL =
  "https://www.real-estate.lviv.ua/ru/%D0%B0%D1%80%D0%B5%D0%BD%D0%B4%D0%B0-%D0%BA%D0%B2%D0%B0%D1%80%D1%82%D0%B8%D1%80/%D0%BA%D0%BE%D0%BC%D0%BD%D0%B0%D1%82-1/%D1%86%D0%B5%D0%BD%D0%B0-0,10000/c-uah/%D0%B4%D0%BD%D0%B5%D0%B9-1/sort-date_insd";
const botToken = "6099185644:AAG9MvRPtxP8oHsw2doiiEQFNNTVcnwE9hI";

let userId;

const bot = new Telegraf(botToken);

const main = async () => {
  const dbOld = JSON.parse(fs.readFileSync("./apartaments.json"));

  const allUrls = [...dbOld.oldUrls, ...dbOld.newUrls];
  const db = { newUrls: [], oldUrls: allUrls };

  await axios.get(URL).then(({ data }, err) => {
    if (err) {
      console.log(err);
      return;
    }

    const page = cheerio.load(data);
    const apartaments = page("[data-id] a.photo-obj-search-page");
    const length = apartaments.length - 1;
    const newUrls = [];

    for (let i = 0; i <= length; i++) {
      const url = DOMAIN + apartaments[i].attribs["href"];

      newUrls.push(url);
    }

    newUrls.forEach((url) => {
      if (!db.oldUrls.includes(url)) {
        db.newUrls.push(url);
      }
    });
  });

  db.length = db.newUrls.length + db.oldUrls.length;

  if (db.newUrls.length !== 0) {
    bot.telegram.sendMessage(
      409287724,
      db.newUrls.join("\n \n") +
        `\n \n all: ${db.length}\n newUrls: ${db.newUrls.length}\n oldUrls: ${db.oldUrls.length}`
    );
  }

  fs.writeFileSync("./apartaments.json", JSON.stringify(db, null, 2));

  console.log("1111");
};

setInterval(main, 3000);

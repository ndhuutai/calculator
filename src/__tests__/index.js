console.log("yeah, this is the mvp!!");

const puppeteer = require("puppeteer");
const reactPinpoint = require('./react-pinpoint');


(async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const url = "http://localhost:3000/calculator"
  await reactPinpoint.recordTest(page, url, "#root")


  await page.click("#yeah9");
  await page.click("#yeah9");
  await page.click("#yeah9");

  const slowRenders = await reactPinpoint.reportTestResults(page)

  console.log("YEAH->", slowRenders);

  /* tracing using chrome dev tools
    await page.tracing.start({path: 'trace.json'});
    await page.goto('http://localhost:3000');
    await page.click('#yeah9')
    await page.click('#yeah9')
    await page.click('#yeah9')
    await page.click('#yeah9')
    await page.click('#yeah9')
    await page.tracing.stop();
    */
  //  await browser.close();

   // Returns response code base on how many slow renders
  //  process.exit(slowRenders.length);
})();


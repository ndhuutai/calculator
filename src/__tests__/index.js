console.log("yeah, this is the mvp!!");

const puppeteer = require("puppeteer");
const path = require("path");

const generatePage = async (browser, url) => {

  const page = await browser.newPage();

  // Set an empty object on devtools hook so react will record fibers
  // Must exist before react runs
  await page.evaluateOnNewDocument(
    () => (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {}),
  );

  // await page.goto("http://web:3000/calculator");
  await page.goto(url);

  // testing adding react-pinpoint via a script tag
  await page.addScriptTag({
    path: path.join(__dirname, "utils.js"),
  });

  return page
}


const listenToRoot = async (id) => {
  await page.evaluate(() => {
    const root = document.querySelector(id);
    mountToReactRoot(root);
  });
}



(async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  beforeEach() {
    const page = await generatePage(browser, "http://web:3000/calculator")
    await listenToRoot("#root")
  }





  await page.click("#yeah9");
  await page.click("#yeah9");
  await page.click("#yeah9");

  const slowRenders = await page.evaluate(async () => {
    console.log("changes->", changes);
    console.log("slow renders->", getAllSlowComponentRenders(0, changes));
    return getAllSlowComponentRenders(0, changes);
  });

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
   await browser.close();

   // Returns response code base on how many slow renders
   process.exit(slowRenders.length);
})();


console.log("yeah, this is the mvp!!");

const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Set an empty object on devtools hook so react will record fibers
  // Must exist before react runs
  await page.evaluateOnNewDocument(
    () => (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {}),
  );
  console.log("got here though");

  await page.goto("http://web:3000/calculator");

  console.log("we in boys");

  // testing adding react-pinpoint via a script tag
  await page.addScriptTag({
    path: path.join(__dirname, "utils.js"),
  });

  await page.evaluate(() => {
    const root = document.querySelector("#root");
    mountToReactRoot(root);
  });

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
    await browser.close();
    */
})();

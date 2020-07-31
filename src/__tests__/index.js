const puppeteer = require('puppeteer');
const reactPinpoint = require('react-pinpoint');


(async () => {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    await page.goto('http://localhost:3000/');

    const thing = await page.$eval("#root", thing => console.log(thing))
    console.log(thing)

    // await page.waitForSelector("#root")

    // const thing = await page.evaluate((thing) => console.log(thing))
    // console.log(thing)

    // const thing = await page.evaluate('document.getElementById("root")')
    // console.log(thing)

    // const container = await page.$("#root")
    // console.log(container)
    // const thing = await container.getProperty("_reactRootContainer")

    // console.log(thing)
    // container.evaluate(node => console.log(node))

    // reactPinpoint.mountToReactRoot(container)
    
    // await page.click('#yeah9')
    // await page.click('#yeah9')
    // await page.click('#yeah9')
    // await page.click('#yeah9')
    // await page.click('#yeah9')

    // console.log(await page.content());
    // await page.screenshot({path: 'screenshot.png'});
    
    await browser.close();
    
})()
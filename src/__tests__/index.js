const puppeteer = require('puppeteer');
const reactPinpoint = require('react-pinpoint');
const path = require('path');


(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/');

    // exposing react-pinpoint function to puppeteer browser context
    await page.exposeFunction('random', () => reactPinpoint.random());

    // calling the exposed function in puppeteer browser
    await page.evaluate(() => {
        console.log('random', random().then(result=>console.log(result)))
    })

    /* testing adding react-pinpoint via a script tag
    await page.addScriptTag({
        path: path.join(__dirname, '../../node_modules/react-pinpoint/src/index.js')
    })
    await page.evaluate(() => {
        const root = document.querySelector('#root');
        mountToReactRoot(root);
    });
    await page.click('#yeah9')
    await page.click('#yeah9')
    await page.click('#yeah9')
    await page.evaluate(() => {
        console.log('changes->', changes);
    })
    */

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
})()
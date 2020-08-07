const puppeteer = require('puppeteer');
const reactPinpoint = require('react-pinpoint');
const path = require('path');
require('./cycle.js');
console.log(JSON.decycle);
(async () => {
    const pathToExtension = '~/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.8.2_0';
    const browser = await puppeteer.launch({
        headless: false,
        args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
        ]
    });
    // const mattIsAFlag = true;
    // const targets = await browser.targets();
    // const backgroundPageTarget = targets.find(target => target.type() === 'background_page');
    // const backgroundPage = await backgroundPageTarget.page();
    // const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/');

    // // exposing react-pinpoint function to puppeteer browser context
    // await page.exposeFunction('random', () => reactPinpoint.random());

    // // calling the exposed function in puppeteer browser
    // await page.evaluate(() => {
    //     console.log('random', random().then(result=>console.log(result)))
    // })

    // testing adding react-pinpoint via a script tag
    await page.addScriptTag({
        path: path.join(__dirname, 'utils.js')
    })
    await page.addScriptTag({
        path: path.join(__dirname, 'cycle.js')
    })
    await page.evaluate(() => {
        const root = document.querySelector('#root');
        mountToReactRoot(root);
    });
    await page.click('#yeah9')
    await page.click('#yeah9')
    await page.click('#yeah9')
    const YEAH = await page.evaluate(async () => {
        console.log('changes->', changes);
        console.log('slow renders->', getAllSlowComponentRenders(0, changes))
        const taie = getAllSlowComponentRenders(0, changes)
        return await taie;
        // return 'mattie is 5'
    });

    console.log('YEAH->', YEAH);
    // console.log('YEAH->', YEAH)
    

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
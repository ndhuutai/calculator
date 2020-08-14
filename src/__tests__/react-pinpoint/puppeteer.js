


async function setup(browser) {

    // setup global state

    // Generate a new page to attach mock devtools hook
    const page = await browser.newPage();


    // TODO: Create global state
    // Maybe add it to page
    
    return page
}


async function recordTest(page, url, rootIdString) {


    // Mock ddevtools hook so react will record fibers
    // Must exist before react runs
    await page.evaluateOnNewDocument(
        () => {
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {}
            window.__REACT_PINPOINT__ = {}
        }
    );
    
    // Load url and inject code to page
    await page.goto(url);
    // await page.addScriptTag({
    //     path: path.join(__dirname, "utils.js"),
    // });
    
    
    // Generate test UUID and add to page
    
    // Create local state
    
    
    // Start recording changes
    await page.evaluate(() => {
        const root = document.querySelector(rootIdString);
        mountToReactRoot(root);
      });

    return page
}


async function reportTestResults(page, threshold) {
    // Return results of local state that exceeds threshold

    // Default threshold of 16 is used
    // Add any exceeded to global state
}


async function reportAllTestResults() {
    // Return global state
}
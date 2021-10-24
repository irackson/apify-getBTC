// @ts-nocheck
// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');

Apify.main(async () => {
    // Get input of the actor (here only for demonstration purposes).
    // If you'd like to have your input checked and have Apify display
    // a user interface for it, add INPUT_SCHEMA.json file to your actor.
    // For more information, see https://docs.apify.com/actors/development/input-schema
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    if (!input || !input.url)
        throw new Error('Input must be a JSON object with the "url" field!');

    console.log('Launching Puppeteer...');
    const browser = await Apify.launchPuppeteer();

    console.log(`Opening page ${input.url}...`);
    const page = await browser.newPage();
    await page.goto(input.url);

    const btcString = await page.evaluate(() => {
        const btcElement = document.querySelector(
            `span[data-title='${'BTC per Share'}']`
        );
        if (!btcElement) return NaN;
        return btcElement.innerText;
    });
    const btc = parseFloat(btcString.slice(0, -1));
    console.log(`BTC: ${btc}`);

    await page.goto('https://grayscale.com/products/grayscale-ethereum-trust/');

    const ethString = await page.evaluate(() => {
        const ethElement = document.querySelector(
            `span[data-title='${'ETH per Share'}']`
        );
        if (!ethElement) return NaN;
        return ethElement.innerText;
    });
    const eth = parseFloat(ethString.slice(0, -1));
    console.log(`ETH: ${eth}`);

    await Apify.pushData({ BTC: btc, ETH: eth });

    console.log('Closing Puppeteer...');
    await browser.close();
    console.log('Done.');
});

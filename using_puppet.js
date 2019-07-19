const puppeteer = require('puppeteer');
const fs = require('fs');
const v8 = require('v8');
const chartUrl='';
(async () => {
    var start_time = Date.now();

    puppeteer.defaultArgs();
    console.log('B-defaultArgs');
	//const browser = await puppeteer.connect({browserWSEndpoint: 'ws://0.0.0.0:9222/devtools/browser/99d1c318-2e92-43da-8910-59900aa34baf', ignoreHTTPSErrors: true});
    const browser = await puppeteer.launch(
            {
                headless: true,
                //args: ['--no-sandbox'],
                args: ['--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-setuid-sandbox',
                    '--enable-precise-memory-info',
                    '--enable-heap-profiling',
                    '--sampling-heap-profiler',
                    //'--js-flags="--max_old_space_size=8192"'
                    "--js-flags=\"--max-old-space-size=8192\"",
                    //"--max-old-space-size=16348"
                            // '--shm-size=4gb'
                    '--remote-debugging-port=9222',
                            //'-single-process'
                ],
                defaultViewport: {width: 2000, height: 900},
                timeout: 1800000, //10 Min 6000000
                // executablePath: '/data/sw/cinstall/opt/google/chrome/google-chrome'
                executablePath: '/bin/chromium-browser',
                dumpio: true,
                //devtools :true,
                //pipe :true
            });

    browser.on('disconnected', async () => {
        console.log('disconnected browser');
    });
    console.log('launch');
    //const browser = await puppeteer.launch({headless: false,executablePath: '/data/sw/chrome/opt/google/chrome'});
    const page = await browser.newPage();
    page.on('error', err => {
        console.log('error browser');
        console.log(err);
        console.log('end error browser');
    });
    page.on('pageerror', pageerr => {
        console.log('pageerror occurred: ', pageerr);
    })

    function handleClose(msg) {
        console.log(msg);
        page.close();
        browser.close();
        process.exit(1);
    }

    process.on("uncaughtException", () => {
        handleClose(`I crashed`);
    });

    /*process.on("unhandledRejection", () => {
     handleClose(`I was rejected`);
     });*/

    process.on('unhandledRejection', (reason, promise) => {
        console.log('Unhandled Rejection at:', reason.stack || reason)
        // Recommended: send the information to sentry.io
        // or whatever crash reporting service you use
    })

    //Grab Font URL Request
    //End Grab Font URL Request
    await page.goto(chartUrl, {waitUntil: 'domcontentloaded'});
    //await page.evaluateHandle('document.fonts.ready');
    await page.waitFor('svg', {
        timeout: 1800000
    });
    var fileName = 'test-30-B-JAN-sandbox-pup-example-font-web-' + new Date().getTime() + '.png';
    await page.screenshot({path: fileName});

    console.log(fileName);
    const perf = await page.metrics();
    //console.log(JSON.stringify(perf));
    console.log(JSON.stringify(perf, null, '\t'));
    console.log('MillSecTime_ToPrepareRandData');
    console.log(await page.evaluate(() => MillSecTime_ToPrepareRandData));
    console.log(await page.evaluate(() => [JSON.stringify(window.performance)]));
    // console.log(await page.evaluate(() => JSON.stringify(console.memory)));
    //console.log(await page.evaluate(() => JSON.stringify(window.performance.memory)));

    const perfm = await page.evaluate(_ => {
        return Object.assign({
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
        }, window.performance.memory);
    });
    console.log(perfm);
    /*const performanceTiming = JSON.parse(
     await page.evaluate(() => JSON.stringify(window.performance.timing))
     );
     console.log(performanceTiming);*/

    /*const perfr = await page.evaluateHandle(() => {
     
     return Object.assign({
     timing: window.performance.timing
     }, window.performance.timing);
     });
     console.log(perfr);*/

    //console.log(v8.getHeapStatistics());
    console.log(JSON.stringify(await page._client.send('Memory.getBrowserSamplingProfile')));
    await browser.close();
    var end_time = Date.now();
    console.log('Time-Diff', end_time - start_time);
})();
//Ref
//To capture Metric of perf
//https://github.com/GoogleChrome/puppeteer/issues/309

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        var start_time = Date.now();

        puppeteer.defaultArgs();
        console.log('defaultArgs');
        const browser = await puppeteer.launch(
                {
                    headless: true,
                    //args: ['--no-sandbox'],
                    // args: ['--no-sandbox','--disable-dev-shm-usage','--disable-setuid-sandbox'],
                    args: ['--no-sandbox',
                        '--force-first-run',
                        '--disable-dev-shm-usage',
                        '--disable-setuid-sandbox',
                        '--enable-precise-memory-info',
                        '--enable-heap-profiling',
                        '--sampling-heap-profiler',
                        //'--js-flags="--max_old_space_size=8192"'
                        "--js-flags=\"--max-old-space-size=16000\"",
                        //"--max-old-space-size=16348"
                        // '--shm-size=4gb'
                        '--remote-debugging-port=9222',
                                //'-single-process'
                    ],

                    defaultViewport: {width: 2000, height: 900},
                    timeout: 1800000, //10 Min 6000000
                    // executablePath: '/data/sw/cinstall/opt/google/chrome/google-chrome'
                   // executablePath: '/bin/chromium-browser'
                });
        console.log('launch');
        //const browser = await puppeteer.launch({headless: false,executablePath: '/data/sw/chrome/opt/google/chrome'});
        const page = await browser.newPage();
        const client = await page.target().createCDPSession();
        await client.send('Performance.enable');

        //Grab Font URL Request
        await page.setRequestInterception(true);
        console.log('setRequestInterception');
        page.on('request', request => {
            if (request.resourceType() === 'font') {
                //console.log(request);
                //console.log(request.respond());

            }
            request.continue();

        });

        page.on('response', response => {
            if (response.request().resourceType() === 'font') {
                // console.log(response.request());
                //console.log(response);
            }


        });
        await page.tracing.start({path: 'trace.json'});
        //End Grab Font URL Request

        //await page.goto('http://localhost:81/chart_test/bl.ocks.org.html');
        //await page.goto('https://bl.ocks.org/vasturiano/raw/ded69192b8269a78d2d97e24211e64e0/');
        await page.goto('http://virmzbappd001w.isotest.infousa.com:81/chart_test/bak/bl.ocks.org.html', {waitUntil: 'domcontentloaded'});
        //await page.evaluateHandle('document.fonts.ready');

        console.log('MillSecTime_ToPrepareRandData');
        console.log(await page.evaluate(() => MillSecTime_ToPrepareRandData,
                {
                    timeout: 1800000
                }));

        await page.waitFor('svg', {
            timeout: 1800000
        });
        var fileName = 'test-1-FEB-sandbox-pup-example-font-web-' + new Date().getTime() + '.png';

        await page.screenshot({path: fileName});
        console.log(fileName);
        const perf = await page.metrics();
        //console.log(JSON.stringify(perf));
        console.log(JSON.stringify(perf, null, '\t'));

        await page.tracing.stop();


        const performanceMetrics = await client.send('Performance.getMetrics');



        const perfm = await page.evaluate(_ => {
            return Object.assign({
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize
            }, window.performance.memory);
        });
        console.log(perfm);
        await browser.close();



        var end_time = Date.now();
        console.log('Time-Diff', end_time - start_time);


        const tracing = JSON.parse(fs.readFileSync('./trace.json', 'utf8'));
        const htmlTracing = tracing.traceEvents.filter(x => (
                    x.cat === 'devtools.timeline' &&
                    typeof x.args.data !== 'undefined' &&
                    typeof x.args.data.url !== 'undefined' &&
                    x.args.data.url === 'https://fonts.googleapis.com/css?family=Open+Sans'
                    ));

        console.log(htmlTracing);



        const navigationStart = getTimeFromPerformanceMetrics(
                performanceMetrics,
                'NavigationStart'
                );

        const fontTracing = await extractDataFromTracing(
                './trace.json',
                'family=Open+Sans'
                );
        console.log(fontTracing);
        console.log(navigationStart);
        // all results are in [ms]
        var fontTime = {
            fontStart: fontTracing.start - navigationStart,
            fontEnd: fontTracing.end - navigationStart,
        }
        console.log(fontTime);


    } catch (err) {
        console.log('[' + instance + '] OnError: caught!', err);
    }


})();
//Ref
//To capture Metric of perf
//https://github.com/GoogleChrome/puppeteer/issues/309




const extractDataFromTracing = (path, name) =>
    new Promise(resolve => {
        fs.readFile(path, (err, data) => {
            const tracing = JSON.parse(data);

            const resourceTracings = tracing.traceEvents.filter(
                    x =>
                x.cat === 'devtools.timeline' &&
                        typeof x.args.data !== 'undefined' &&
                        typeof x.args.data.url !== 'undefined' &&
                        x.args.data.url.endsWith(name)
            );
            const resourceTracingSendRequest = resourceTracings.find(
                    x => x.name === 'ResourceSendRequest'
            );
            const resourceId = resourceTracingSendRequest.args.data.requestId;
            const resourceTracingEnd = tracing.traceEvents.filter(
                    x =>
                x.cat === 'devtools.timeline' &&
                        typeof x.args.data !== 'undefined' &&
                        typeof x.args.data.requestId !== 'undefined' &&
                        x.args.data.requestId === resourceId
            );
            const resourceTracingStartTime = resourceTracingSendRequest.ts / 1000;
            const resourceTracingEndTime =
                    resourceTracingEnd.find(x => x.name === 'ResourceFinish').ts / 1000;

            //fs.unlink(path, () => {
            resolve({
                start: resourceTracingStartTime,
                end: resourceTracingEndTime,
            });
            // });
        });
    });
const getTimeFromPerformanceMetrics = (metrics, name) =>
    metrics.metrics.find(x => x.name === name).value * 1000;

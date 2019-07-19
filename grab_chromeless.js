
const {Chromeless} = require('chromeless')
var path = require('path');
async function run() {
    //1800 000 ms

    var start_time = Date.now();
    const chromeless = new Chromeless({launchChrome: true, debug: true, waitTimeout: 1800000,
        //remote: true,
        // cdp: {host: '10.80.130.183', port: 9222, secure: false, closeTab: true}
    })

    const screenshot = await chromeless.clearCache()
            .setViewport({width: 2000, height: 900})
            //.goto('https://www.google.com')
            .goto('https://bl.ocks.org/vasturiano/raw/ded69192b8269a78d2d97e24211e64e0/')
            //.type('chromeless', 'input[name="q"]')
            //.press(13)
            /*.evaluate(() => {
             
             return document.fonts.ready
             })*/
            .wait('svg', 1800000)
            .evaluate(() => {
                console.log(document.fonts.ready);
                return document.fonts.ready
            })
    .wait(1000)
    //.screenshot()
    .screenshot('#myPlot', { filePath: path.join(__dirname, 'local-test-time-series-26Feb-bak-3-'+new Date().getTime()+'.png') })
    //.screenshot('#myPlot', {filePath: path.join(__dirname, 'local-test-time-series-300LN_11GB-' + new Date().getTime() + '.png')})

    //Capture Performance Info
    const performance = await chromeless.evaluate(() => {
        return JSON.stringify(window.performance.timing, null, '\t')
    });
    console.log(performance);

    const performanceM = await chromeless.evaluate(() => {
        return Object.assign({
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            NGROUPS: NGROUPS,
            MAXLINES: MAXLINES,
            MAXSEGMENTS: MAXSEGMENTS,
            MAXCATEGORIES: MAXCATEGORIES,
        }, window.performance.memory);


    });
    console.log(performanceM);


    console.log(screenshot) // prints local file path or S3 url
    //console.log( path.join(__dirname, 'google-page-local-A.png'));

    await chromeless.end()
    var end_time = Date.now();
    console.log('Time-Diff', end_time - start_time);
}

run().catch(console.error.bind(console))



//Ref:
//Get Time
//https://github.com/prisma-archive/chromeless/issues/171

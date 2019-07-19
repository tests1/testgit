/*var webdriver = require('selenium-webdriver'),
 chrome    = require('selenium-webdriver/chrome')
 By        = webdriver.By,
 until     = webdriver.until,
 
 options   = new chrome.Options();
 options.addArguments('headless'); // note: without dashes
 options.addArguments('disable-gpu')
 
 var path = require('chromedriver').path;
 var service = new chrome.ServiceBuilder(path).build();
 chrome.setDefaultService(service);
 var driver = new webdriver.Builder()
 .forBrowser('chrome')
 .withCapabilities(webdriver.Capabilities.chrome()) 
 .setChromeOptions(options)                         // note this
 .build();
 
 driver.get('https://www.google.com');
 */
require('chromedriver');
const {writeFile} = require('fs');
const {promisify} = require('util');

const {Builder, By, Key, promise, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')
const chartUrl='';
promise.USE_PROMISE_MANAGER = false;

var options = new chrome.Options();
//Options.setChromeBinaryPath('/usr/lib64/chromium-browser/chromium-browser');
options.headless();
//options.addArguments('--headless');
options.addArguments('--disable-gpu');
options.addArguments('--window-size=1280,960');
options.addArguments('--js-flags="--max_old_space_size=8091"');
options.addArguments('--disable-gpu');
options.addArguments('--no-sandbox');
options.addArguments('--disable-impl-side-painting');
options.addArguments('--disable-gpu-sandbox');
options.addArguments('--disable-accelerated-2d-canvas');
options.addArguments('--disable-accelerated-jpeg-decoding');
options.addArguments('--disable-dev-shm-usage');

 
//const binary = new firefox.Binary('/data/sw/ff/firefox/firefox');
//new firefox.Options().setBinary(firefox.Channel.NIGHTLY);
//binary.addArguments("--headless");


const driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
//

async function main() {
    await driver.manage().setTimeouts({pageLoad: 1800000, script: 1800000});
    console.log(driver.manage().getTimeouts({pageLoad: 1800000, script: 1800000}));
    await  driver.manage().getTimeouts({pageLoad: 1800000, script: 1800000}).then((d)=> console.log(d));
    await driver.get(chartUrl);
    //await driver.findElement(By.id('home-q')).sendKeys('testing', Key.RETURN);
    //await driver.wait(until.titleIs('Search Results for "testing" | MDN'));
    
    //driver.findElement(By.tagName('form'));
    let div =       await driver.wait(until.elementLocated(By.tagName('svg')), 1800000);
    await driver.wait(async () => {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
    });
    const data = await driver.takeScreenshot();
    var fname='screenshot-sel-chrome-' + new Date().getTime() + '.png';
    await promisify(writeFile)(fname, data, 'base64');
    await driver.quit();
}

main();

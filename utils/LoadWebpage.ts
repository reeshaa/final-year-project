import puppeteer from 'puppeteer';
/**

 * 
 * @param url - URL of the webpage to load
 * @returns html - HTML content of the webpage
 */
export async function LoadWebpage(url: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    await browser.close();
    return html;
  }
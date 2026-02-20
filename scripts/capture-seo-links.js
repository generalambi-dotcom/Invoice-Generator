const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set viewport to desktop
    await page.setViewport({ width: 1280, height: 2600 });
    
    console.log("Navigating to AI Invoice Generator page...");
    await page.goto('http://localhost:3000/ai-invoice-generator-nigeria', { waitUntil: 'networkidle0' });
    
    // Screenshot Breadcrumbs
    console.log("Capturing Breadcrumbs...");
    const breadcrumbElement = await page.$('nav.bg-gray-50');
    if (breadcrumbElement) {
        await breadcrumbElement.screenshot({ path: path.join(process.cwd(), 'breadcrumbs-capture.png') });
    }
    
    // Screenshot Related Links Silo
    console.log("Capturing Related Links Section...");
    const relatedSection = await page.$('section.bg-slate-50:not(.pt-16)'); // Try to grab the bottom related section
    if (relatedSection) {
        await relatedSection.screenshot({ path: path.join(process.cwd(), 'related-links-capture.png') });
    }
    
    // Screenshot Homepage Changes
    console.log("Navigating to Homepage...");
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    
    const heroSection = await page.$('section.pt-16');
    if (heroSection) {
        await heroSection.screenshot({ path: path.join(process.cwd(), 'homepage-links-capture.png') });
    }

    await browser.close();
    console.log("Screenshots captured successfully.");
})();

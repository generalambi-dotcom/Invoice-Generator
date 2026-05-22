/**
 * IndexNow — instant URL submission to Bing (and Yandex)
 * Docs: https://www.indexnow.org/documentation
 *
 * Call submitToIndexNow(['https://www.invoicegenerator.ng/blog/my-slug'])
 * whenever a page is published or significantly updated.
 */

const INDEX_NOW_KEY = '322f90d2e30e46719b5e9156b2daf65f';
const BASE_URL = 'https://www.invoicegenerator.ng';
const KEY_LOCATION = `${BASE_URL}/${INDEX_NOW_KEY}.txt`;

/**
 * Submit one or more URLs to IndexNow (Bing + Yandex)
 * Safe to call fire-and-forget — logs errors but never throws.
 */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;

  // Ensure all URLs are absolute
  const absoluteUrls = urls.map(u => u.startsWith('http') ? u : `${BASE_URL}${u}`);

  const body = {
    host: 'www.invoicegenerator.ng',
    key: INDEX_NOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: absoluteUrls,
  };

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      console.log(`✅ IndexNow: submitted ${absoluteUrls.length} URL(s) to Bing`);
    } else {
      console.warn(`⚠️ IndexNow: Bing responded with ${res.status}`);
    }
  } catch (err) {
    // Never let IndexNow errors block the main flow
    console.error('⚠️ IndexNow submission failed (non-critical):', err);
  }
}

/**
 * Convenience wrapper for a single blog post slug
 */
export function submitBlogPost(slug: string): void {
  submitToIndexNow([`${BASE_URL}/blog/${slug}`]);
}

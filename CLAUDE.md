# InvoiceGenerator.ng — Project Context for Claude Code

## About
InvoiceGenerator.ng is a free online invoice generator built for Nigerian businesses, freelancers, and SMEs. It supports Naira (₦) currency, WhatsApp invoice delivery, Paystack payment integration, VAT (7.5%) compliance with FIRS requirements, and professional invoice templates.

**URL:** https://www.invoicegenerator.ng/
**Target Market:** Nigeria (primary), West Africa (secondary)
**Domain Advantage:** .ng TLD provides strong local SEO signal

## Key Pages
- `/` — Homepage (main product page)
- `/blog` — Blog/content hub
- `/guide` — Invoicing guides
- `/invoice-generator-nigeria` — Nigeria-focused landing page
- `/naira-invoice-generator` — Naira currency landing page
- `/freelance-invoice-template-ngn` — Freelancer template page

## Competitors
| Competitor | URL | Notes |
|-----------|-----|-------|
| Refrens | refrens.com/en-ng | Strong Nigeria SEO content, FIRS compliance focus |
| ProInvoice | proinvoice.co | Multiple Nigeria-targeted blog posts |
| Invoice.ng | invoice.ng | Direct .ng domain competitor |
| Afri Invoice | afrinvoice.com | Pan-African focus, agriculture features |
| Zoho Invoice | zoho.com/invoice | International, strong brand |
| Wave | waveapps.com | Free tier, popular globally |

## SEO Goals
1. Rank #1 for "invoice generator Nigeria" and related core keywords
2. Own the Nigerian invoicing compliance content space (FIRS, VAT, TIN)
3. Build programmatic SEO pages for profession + location combos
4. Become the cited source in AI search results for Nigerian invoicing
5. Generate 50+ high-quality blog posts covering all keyword clusters

## Content Guidelines
- Always mention Nigeria-specific context (FIRS, VAT 7.5%, Naira, Paystack, WhatsApp)
- Reference real regulations and requirements
- Use Nigerian English spelling conventions where appropriate
- Include practical examples with Naira amounts
- Target E-E-A-T signals: cite FIRS regulations, include dates, reference official sources
- Every blog post should link to at least 2 product pages
- Every landing page should link to at least 3 related blog posts

## Technical SEO Standards
- All pages must have unique meta titles (50-60 chars) and descriptions (150-160 chars)
- Use JSON-LD structured data on all pages
- Canonical tags on all pages to prevent duplication
- Alt text on all images
- Internal links: minimum 3 per page
- URL structure: lowercase, hyphens, descriptive

## Schema Markup Templates

### Homepage (SoftwareApplication)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "InvoiceGenerator.ng",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "NGN"
  },
  "description": "Free online invoice generator for Nigerian businesses with Naira support, WhatsApp delivery, and Paystack payments",
  "featureList": ["Naira invoicing", "WhatsApp delivery", "Paystack integration", "VAT 7.5% calculation", "FIRS compliance"]
}
```

### Blog Posts (Article)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[POST TITLE]",
  "datePublished": "[DATE]",
  "dateModified": "[DATE]",
  "author": {"@type": "Organization", "name": "InvoiceGenerator.ng"},
  "publisher": {"@type": "Organization", "name": "InvoiceGenerator.ng"}
}
```

### FAQ Sections (FAQPage)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[QUESTION]",
      "acceptedAnswer": {"@type": "Answer", "text": "[ANSWER]"}
    }
  ]
}
```

### Guide Pages (HowTo)
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "[GUIDE TITLE]",
  "step": [
    {"@type": "HowToStep", "name": "[STEP]", "text": "[DESCRIPTION]"}
  ]
}
```

## Workflow Commands

### Full Technical Audit
```bash
# Run with Puppeteer MCP connected
claude "Crawl invoicegenerator.ng and audit all pages for: duplicate meta tags, missing alt text, broken links, schema markup, Core Web Vitals, canonical tags, and sitemap coverage. Output a prioritized markdown report."
```

### Content Gap Analysis
```bash
# Run with SerpAPI or DataForSEO MCP connected
claude "Research the top 50 keywords related to 'invoice generator Nigeria' and compare against content on invoicegenerator.ng. Identify gaps and output a prioritized content creation list."
```

### Blog Post Creation
```bash
claude "Write a blog post targeting '[KEYWORD]' for invoicegenerator.ng. Follow the content guidelines in CLAUDE.md. Include FIRS/VAT context, practical Naira examples, and internal links to product pages. Output as markdown."
```

### Schema Generation
```bash
claude "Generate JSON-LD structured data for [PAGE URL] on invoicegenerator.ng using the templates in CLAUDE.md. Validate the output."
```

### Competitor Monitoring
```bash
# Run with SerpAPI MCP connected
claude "Check current Google rankings for invoicegenerator.ng across all target keywords. Compare against Refrens, ProInvoice, and Invoice.ng. Output a ranking comparison report."
```

## MCP Server Recommendations
For full SEO automation, connect these MCP servers:
- **Puppeteer** — Site crawling, rendering checks, screenshot comparisons
- **SerpAPI** or **DataForSEO** — Keyword rankings, SERP features, search volume
- **SE Ranking** — Competitor analysis, backlink monitoring
- **Google Search Console API** — Performance data, indexing status
- **Google Analytics (GA4)** — Traffic and conversion data

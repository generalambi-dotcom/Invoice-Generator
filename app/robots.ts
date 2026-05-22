import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule for all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/'],
      },
      // Explicitly welcome AI crawlers for indexing and citation
      // (these bots follow explicit rules — listing them ensures they crawl)
      { userAgent: 'GPTBot',            allow: '/' }, // OpenAI / ChatGPT
      { userAgent: 'ChatGPT-User',      allow: '/' }, // ChatGPT browsing
      { userAgent: 'OAI-SearchBot',     allow: '/' }, // OpenAI search
      { userAgent: 'anthropic-ai',      allow: '/' }, // Anthropic / Claude
      { userAgent: 'ClaudeBot',         allow: '/' }, // Claude web search
      { userAgent: 'Claude-Web',        allow: '/' }, // Claude web
      { userAgent: 'PerplexityBot',     allow: '/' }, // Perplexity AI
      { userAgent: 'Google-Extended',   allow: '/' }, // Gemini training
      { userAgent: 'Googlebot',         allow: '/' }, // Google AI Overviews
      { userAgent: 'Bingbot',           allow: '/' }, // Bing / Copilot
      { userAgent: 'meta-externalagent', allow: '/' }, // Meta AI / Llama
      { userAgent: 'Applebot',          allow: '/' }, // Apple AI features
      { userAgent: 'Applebot-Extended', allow: '/' }, // Apple AI training
      { userAgent: 'cohere-ai',         allow: '/' }, // Cohere AI
      { userAgent: 'AI2Bot',            allow: '/' }, // Allen Institute AI
      { userAgent: 'Diffbot',           allow: '/' }, // Diffbot knowledge graph
      { userAgent: 'YouBot',            allow: '/' }, // You.com AI search
    ],
    sitemap: 'https://www.invoicegenerator.ng/sitemap.xml',
  };
}


import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'seo-pages.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Helper to inject fields after the slug
const injectFields = (slug: string, category: string, links: { text: string, url: string }[]) => {
  const searchPattern = new RegExp(`slug:\\s*["']${slug}["'],`);
  const replacement = `slug: "${slug}",\n        category: "${category}",\n        relatedLinks: ${JSON.stringify(links, null, 12).replace(/^{/, '{\n').replace(/}$/, '        }')},`;
  content = content.replace(searchPattern, replacement);
};

// ==========================================
// 1. NIGERIA CORE PAGES -> Link to other sub-pages or Tools
// ==========================================
const coreLinks = [
  { text: "AI Invoice Generator", url: "/ai-invoice-generator-nigeria" },
  { text: "Freelance Invoice Generator", url: "/freelance-invoice-template-ngn" },
  { text: "WhatsApp Invoice Sender", url: "/send-invoice-via-whatsapp-nigeria" }
];

injectFields("invoice-generator-nigeria", "Nigeria Core", coreLinks);
injectFields("naira-invoice-generator", "Nigeria Core", coreLinks);
injectFields("free-invoice-generator-nigeria", "Nigeria Core", coreLinks);
injectFields("invoice-template-nigeria", "Nigeria Core", coreLinks);
injectFields("invoice-format-nigeria", "Nigeria Core", coreLinks);

// ==========================================
// 2. FREELANCER + INDUSTRY PAGES -> Link back to Core
// ==========================================
const industryLinks = [
  { text: "Invoice Generator Nigeria", url: "/invoice-generator-nigeria" },
  { text: "Naira Invoice Generator", url: "/naira-invoice-generator" },
  { text: "Freelance Invoice Template NGN", url: "/freelance-invoice-template-ngn" }
];

injectFields("invoice-generator-for-designers-nigeria", "Industry & Freelance", industryLinks);
injectFields("invoice-generator-for-developers-nigeria", "Industry & Freelance", industryLinks);
injectFields("invoice-generator-for-photographers-nigeria", "Industry & Freelance", industryLinks);
injectFields("invoice-generator-for-agencies-nigeria", "Industry & Freelance", industryLinks);
injectFields("invoice-generator-for-consultants-nigeria", "Industry & Freelance", industryLinks);

// ==========================================
// 3. AI + WHATSAPP FEATURE PAGES -> Link to Core & Premium
// ==========================================
const aiLinks = [
  { text: "Invoice Generator Nigeria", url: "/invoice-generator-nigeria" },
  { text: "WhatsApp Invoice Generator", url: "/whatsapp-invoice-generator" },
  { text: "Premium Invoice Generator Nigeria", url: "/premium-invoice-generator-nigeria" }
];

injectFields("ai-invoice-generator-nigeria", "AI & Features", aiLinks);
injectFields("whatsapp-invoice-generator", "AI & Features", aiLinks);
injectFields("send-invoice-via-whatsapp-nigeria", "AI & Features", aiLinks);
injectFields("smart-ai-invoice-creator", "AI & Features", aiLinks);
injectFields("premium-invoice-generator-nigeria", "AI & Features", aiLinks);

// ==========================================
// 4. TEMPLATE PAGES -> Feed traffic into main generators
// ==========================================
const templateLinks = [
  { text: "Free Invoice Template Nigeria", url: "/invoice-template-nigeria" },
  { text: "Invoice Format Nigeria", url: "/invoice-format-nigeria" },
  { text: "Invoice Generator Nigeria", url: "/invoice-generator-nigeria" }
];

injectFields("freelance-invoice-template-ngn", "Templates", templateLinks);
injectFields("simple-invoice-template-nigeria", "Templates", templateLinks);
injectFields("blank-invoice-template-ngn", "Templates", templateLinks);
injectFields("professional-invoice-template-nigeria", "Templates", templateLinks);
injectFields("invoice-sample-nigeria-pdf", "Templates", templateLinks);

// ==========================================
// 5. EXPANSION PAGES -> Feed into general or AI
// ==========================================
const expansionLinks = [
  { text: "Invoice Generator Nigeria", url: "/invoice-generator-nigeria" },
  { text: "Online Invoice Creator", url: "/create-invoice-online-ngn" },
  { text: "Smart AI Invoice Creator", url: "/smart-ai-invoice-creator" }
];

injectFields("invoice-generator-africa", "Expansion", expansionLinks);
injectFields("invoice-generator-for-small-business", "Expansion", expansionLinks);
injectFields("online-invoice-generator-free", "Expansion", expansionLinks);
injectFields("create-invoice-online-ngn", "Expansion", expansionLinks);
injectFields("best-invoice-generator-nigeria", "Expansion", expansionLinks);

fs.writeFileSync(filePath, content);
console.log("Successfully injected categories and relatedLinks into seo-pages.ts");

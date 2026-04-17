export interface InvoiceTemplateMeta {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  h2FeatureTitle: string;
  featureDescription: string;
  metaKeywords: string[];
  themeColor: string;
  previewData: any; // Used to hydrate the InvoicePaper preview
}

export const invoiceTemplates: InvoiceTemplateMeta[] = [
  // --- CORE INVOICES ---
  {
    id: "standard",
    slug: "standard-invoice-template",
    title: "Standard Invoice Template",
    category: "General Business",
    description: "A clean, professional standard invoice template suitable for any business transaction. Download for Word, Excel, or PDF, or create it instantly online.",
    h2FeatureTitle: "The perfect standard invoice for any job.",
    featureDescription: "This template includes everything you need to bill your clients effectively: clear line items, tax calculations, and payment terms.",
    metaKeywords: ["standard invoice", "basic invoice template", "free invoice", "pdf", "word"],
    themeColor: "emerald",
    previewData: {
      items: [
        { description: "General Services", quantity: 1, rate: 500, amount: 500 },
        { description: "Materials", quantity: 1, rate: 150, amount: 150 }
      ]
    }
  },
  {
    id: "proforma",
    slug: "proforma-invoice-template",
    title: "Proforma Invoice Template",
    category: "General Business",
    description: "Send a professional proforma invoice before shipping goods or starting a project. Perfect for international trade and upfront estimates.",
    h2FeatureTitle: "Clear expectations before the work begins.",
    featureDescription: "Use this proforma template to declare the value of goods for customs, or to give clients a concrete estimate that functions just like a real invoice.",
    metaKeywords: ["proforma invoice template", "pro forma bill", "customs invoice", "estimate template"],
    themeColor: "blue",
    previewData: {
      type: "estimate", // visually marks it as an estimate/proforma
      items: [
        { description: "Estimated Labor", quantity: 10, rate: 75, amount: 750 },
        { description: "Shipping & Handling", quantity: 1, rate: 200, amount: 200 }
      ]
    }
  },
  {
    id: "commercial",
    slug: "commercial-invoice-template",
    title: "Commercial Invoice Template",
    category: "General Business",
    description: "Fully compliant commercial invoice template designed specifically for international shipping and customs declarations.",
    h2FeatureTitle: "Sail through customs with ease.",
    featureDescription: "International trade requires strict documentation. This commercial invoice provides the exact layout needed to state country of origin, harmonized codes, and true value.",
    metaKeywords: ["commercial invoice template", "shipping invoice", "export bill", "word", "excel"],
    themeColor: "slate",
    previewData: {
      items: [
        { description: "Steel Widgets (HS: 732690)", quantity: 500, rate: 2.50, amount: 1250 },
        { description: "International Freight", quantity: 1, rate: 800, amount: 800 }
      ]
    }
  },
  {
    id: "tax",
    slug: "tax-invoice-template",
    title: "Tax Invoice Template",
    category: "General Business",
    description: "A specialized tax invoice template that includes dedicated columns and summaries for VAT, GST, or local sales taxes to remain compliant.",
    h2FeatureTitle: "Stay completely tax compliant.",
    featureDescription: "Whether you need to outline VAT or GST, this tax invoice clearly separates the baseline cost from the tax amount, ensuring your business stays on the right side of the law.",
    metaKeywords: ["tax invoice template", "vat invoice", "gst bill template", "pdf"],
    themeColor: "rose",
    previewData: {
      taxRate: 7.5,
      items: [
        { description: "Consulting Package", quantity: 1, rate: 1000, amount: 1000 }
      ]
    }
  },
  
  // --- FREELANCE & CREATIVE ---
  {
    id: "freelance",
    slug: "freelance-invoice-template",
    title: "Freelance Invoice Template",
    category: "Freelance & Creative",
    description: "A flexible and attractive invoice template for freelancers, independent contractors, and solo entrepreneurs.",
    h2FeatureTitle: "Get paid faster for your freelance work.",
    featureDescription: "When you're running a solo business, cash flow is everything. This template is designed to look professional while clearly highlighting your payment instructions.",
    metaKeywords: ["freelance invoice template", "independent contractor bill", "sole proprietor invoice"],
    themeColor: "indigo",
    previewData: {
      items: [
        { description: "Website Development - Week 1", quantity: 40, rate: 65, amount: 2600 }
      ]
    }
  },
  {
    id: "photography",
    slug: "photography-invoice-template",
    title: "Photography Invoice Template",
    category: "Freelance & Creative",
    description: "A beautifully styled invoice template for professional photographers, covering session fees, editing time, and print releases.",
    h2FeatureTitle: "A picture-perfect billing experience.",
    featureDescription: "Charge for your time behind the lens, post-processing edits, and digital delivery with a sleek invoice that matches your creative brand.",
    metaKeywords: ["photography invoice template", "photographer bill", "wedding photography invoice"],
    themeColor: "amber",
    previewData: {
      items: [
        { description: "Wedding Day Coverage (8 Hours)", quantity: 1, rate: 2500, amount: 2500 },
        { description: "Travel Expenses", quantity: 1, rate: 150, amount: 150 },
        { description: "High-Res Image Delivery", quantity: 1, rate: 0, amount: 0 }
      ]
    }
  },
  {
    id: "design",
    slug: "graphic-design-invoice-template",
    title: "Graphic Design Invoice Template",
    category: "Freelance & Creative",
    description: "Ideal for graphic designers and agencies. Clearly bill for logo design, brand kits, revisions, and more.",
    h2FeatureTitle: "An invoice as well-designed as your work.",
    featureDescription: "Don't send a clunky, ugly bill when you're selling design. This template gives your billing a modern, structured aesthetic that reinforces your value.",
    metaKeywords: ["graphic design invoice", "designer bill template", "agency invoice"],
    themeColor: "fuchsia",
    previewData: {
      items: [
        { description: "Logo Concept & Revision Package", quantity: 1, rate: 1200, amount: 1200 },
        { description: "Additional Revision Round", quantity: 2, rate: 150, amount: 300 }
      ]
    }
  },

  // --- TRADES & CONSTRUCTION ---
  {
    id: "construction",
    slug: "construction-invoice-template",
    title: "Construction Invoice Template",
    category: "Construction & Trades",
    description: "The ultimate construction invoice template for contractors and builders. Easily separate labor costs from materials.",
    h2FeatureTitle: "Built solid, just like your projects.",
    featureDescription: "In construction, transparency is key. Use this template to clearly break down labor hours, raw material costs, and equipment rentals to avoid client disputes.",
    metaKeywords: ["construction invoice template", "contractor bill", "builder invoice pdf"],
    themeColor: "orange",
    previewData: {
      items: [
        { description: "Drywall Installation Labor", quantity: 30, rate: 45, amount: 1350 },
        { description: "Building Materials (Wood, Screws, Paint)", quantity: 1, rate: 840.50, amount: 840.50 }
      ]
    }
  },
  {
    id: "plumbing",
    slug: "plumbing-invoice-template",
    title: "Plumbing Invoice Template",
    category: "Construction & Trades",
    description: "A tailored plumbing invoice template designed for call-out fees, emergency repairs, and pipe installations.",
    h2FeatureTitle: "Keep your cash flow flowing.",
    featureDescription: "Ensure you get paid immediately after the job is done. This plumber's template includes sections for emergency dispatch fees alongside standard labor and parts.",
    metaKeywords: ["plumbing invoice template", "plumber bill pdf", "repair invoice"],
    themeColor: "cyan",
    previewData: {
      items: [
        { description: "Emergency Call-Out Fee", quantity: 1, rate: 150, amount: 150 },
        { description: "PVC Pipes & Fittings", quantity: 1, rate: 85, amount: 85 },
        { description: "Labor Component", quantity: 2, rate: 90, amount: 180 }
      ]
    }
  },
  {
    id: "hvac",
    slug: "hvac-invoice-template",
    title: "HVAC Invoice Template",
    category: "Construction & Trades",
    description: "Perfect for heating, ventilation, and air conditioning professionals handling complex residential or commercial repairs.",
    h2FeatureTitle: "Cool fast invoices for HVAC pros.",
    featureDescription: "Whether doing a routine AC maintenance check or a full furnace installation, this HVAC-specific template keeps your charges clear and concise.",
    metaKeywords: ["hvac invoice template", "ac repair bill", "heating contractor invoice"],
    themeColor: "sky",
    previewData: {
      items: [
        { description: "AC Unit Diagnostic Check", quantity: 1, rate: 89, amount: 89 },
        { description: "Refrigerant Recharge (lbs)", quantity: 2.5, rate: 40, amount: 100 }
      ]
    }
  },
  {
    id: "landscaping",
    slug: "landscaping-invoice-template",
    title: "Landscaping Invoice Template",
    category: "Construction & Trades",
    description: "Designed for lawn care and landscape professionals. Great for recurring mowing contracts or one-off hardscaping jobs.",
    h2FeatureTitle: "Grow your landscaping business.",
    featureDescription: "Detail everything from weekly lawn mowing to massive retaining wall installations. Make your pricing crystal clear to homeowners and property managers.",
    metaKeywords: ["landscaping invoice template", "lawn care bill", "landscaper pdf"],
    themeColor: "lime",
    previewData: {
      items: [
        { description: "Spring Yard Cleanup", quantity: 1, rate: 250, amount: 250 },
        { description: "Mulch Supply & Installation", quantity: 4, rate: 65, amount: 260 }
      ]
    }
  },

  // --- AUTOMOTIVE & LOGISTICS ---
  {
    id: "auto-repair",
    slug: "auto-repair-invoice-template",
    title: "Auto Repair Invoice Template",
    category: "Auto & Logistics",
    description: "An auto repair invoice template optimized for mechanics to list vehicle details, parts, and labor clearly.",
    h2FeatureTitle: "Shift your billing into high gear.",
    featureDescription: "Customers hate surprise car bills. This template allows you to cleanly separate diagnostics, physical parts, and your hourly mechanic labor.",
    metaKeywords: ["auto repair invoice template", "mechanic bill", "garage invoice pdf"],
    themeColor: "red",
    previewData: {
      notes: "Vehicle: 2018 Toyota Camry | VIN: 4T1B...",
      items: [
        { description: "Brake Pad Replacement Parts", quantity: 1, rate: 120, amount: 120 },
        { description: "Labor - Braking System", quantity: 1.5, rate: 110, amount: 165 }
      ]
    }
  },
  {
    id: "logistics",
    slug: "freight-invoice-template",
    title: "Freight & Logistics Invoice Template",
    category: "Auto & Logistics",
    description: "A logistics invoice template for trucking companies, couriers, and freight forwarders. Track mileage and loads seamlessly.",
    h2FeatureTitle: "Deliver the goods, secure the bag.",
    featureDescription: "Logistics requires intense detail. Use this template to log weight, distance travelled, fuel surcharges, and the final destination.",
    metaKeywords: ["freight invoice template", "trucking bill", "logistics invoice", "courier pdf"],
    themeColor: "stone",
    previewData: {
      items: [
        { description: "LTL Freight Transport (NY to CHI)", quantity: 1, rate: 1850, amount: 1850 },
        { description: "Fuel Surcharge", quantity: 1, rate: 150, amount: 150 }
      ]
    }
  },

  // --- PROFESSIONAL SERVICES ---
  {
    id: "consulting",
    slug: "consulting-invoice-template",
    title: "Consulting Invoice Template",
    category: "Professional Services",
    description: "A premium, sophisticated consulting invoice tailored for business strategy, management, and IT consultants.",
    h2FeatureTitle: "Bill for your expertise with confidence.",
    featureDescription: "Your advice is incredibly valuable. This highly professional template makes billing for your strategic hours straightforward and enterprise-ready.",
    metaKeywords: ["consulting invoice template", "consultant bill", "strategy invoice word"],
    themeColor: "slate",
    previewData: {
      items: [
        { description: "Q3 Strategy Planning Workshop", quantity: 1, rate: 3500, amount: 3500 },
        { description: "Weekly Advisory Call (Hours)", quantity: 4, rate: 250, amount: 1000 }
      ]
    }
  },
  {
    id: "legal",
    slug: "legal-invoice-template",
    title: "Legal Invoice Template",
    category: "Professional Services",
    description: "An attorney-grade legal invoice template complete with hourly broken-out retainers, consultation fees, and court costs.",
    h2FeatureTitle: "The verdict on fast legal billing.",
    featureDescription: "Provide your clients with exact transparent documentation of billable hours, filing fees, and research time.",
    metaKeywords: ["legal invoice template", "lawyer bill", "attorney invoice pdf"],
    themeColor: "zinc",
    previewData: {
      items: [
        { description: "Initial Client Consultation", quantity: 1.5, rate: 400, amount: 600 },
        { description: "Filing Fee: Civil Court", quantity: 1, rate: 250, amount: 250 },
        { description: "Document Drafting & Redlining", quantity: 3.2, rate: 400, amount: 1280 }
      ]
    }
  },
  {
    id: "catering",
    slug: "catering-invoice-template",
    title: "Catering Invoice Template",
    category: "Professional Services",
    description: "Appetizing invoice template for caterers and private chefs. Outline event details, per-plate costs, and rentals.",
    h2FeatureTitle: "Serve up an incredible billing experience.",
    featureDescription: "Weddings, corporate functions, and private parties. This catering invoice accurately captures guest counts, menu choices, and setup fees.",
    metaKeywords: ["catering invoice template", "food service bill", "chef invoice pdf"],
    themeColor: "orange",
    previewData: {
      items: [
        { description: "Plated Dinner Service (Per Guest)", quantity: 150, rate: 65, amount: 9750 },
        { description: "Tableware & Linen Rentals", quantity: 1, rate: 1200, amount: 1200 },
        { description: "Gratuity & Service Charge", quantity: 1, rate: 1000, amount: 1000 }
      ]
    }
  }
];

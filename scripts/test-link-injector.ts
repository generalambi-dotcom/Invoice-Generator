import React from 'react';

const relatedLinks = [
  { text: "AI Invoice Generator", url: "/ai-invoice-generator-nigeria" },
  { text: "Naira Invoice Generator", url: "/naira-invoice-generator" },
  { text: "WhatsApp Invoice Sender", url: "/send-invoice-via-whatsapp-nigeria" }
];

const textBlock = "Our AI Invoice Generator is the best way to handle your Naira Invoice Generator needs, and then you can use the WhatsApp Invoice Sender to get paid.";

function injectInTextLinks(text: string, links: { text: string; url: string }[]) {
    if (!text) return text;

    // Create a regex pattern that matches any of the link texts (case-insensitive)
    const sortedLinks = [...links].sort((a, b) => b.text.length - a.text.length);
    const pattern = new RegExp(`(${sortedLinks.map(l => l.text).join('|')})`, 'gi');

    const parts = text.split(pattern);

    return parts.map((part, index) => {
        const foundLink = sortedLinks.find(l => l.text.toLowerCase() === part.toLowerCase());
        
        if (foundLink) {
            return `LINK_FOUND[${foundLink.url}](${part})`;
        }
        return part;
    }).join("");
}

console.log(injectInTextLinks(textBlock, relatedLinks));

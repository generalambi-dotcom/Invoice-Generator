/**
 * Utilities for public invoice generation
 * Allows customers to create invoices themselves via a public link
 */

import { prisma } from './db';

/**
 * Generate a unique public slug from user's name or email
 */
export function generatePublicSlug(name: string, email: string): string {
  // Convert name to slug: lowercase, replace spaces with hyphens, remove special chars
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); // Limit length

  // If no valid characters, use email prefix
  if (!baseSlug) {
    const emailPrefix = email.split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    return emailPrefix || `user-${Date.now()}`;
  }

  return baseSlug;
}

/**
 * Check if a public slug is available
 */
export async function isPublicSlugAvailable(slug: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({
    where: { publicSlug: slug },
  });
  return !existing;
}

/**
 * Generate a unique public slug with number suffix if needed
 */
export async function generateUniquePublicSlug(name: string, email: string): Promise<string> {
  let baseSlug = generatePublicSlug(name, email);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (!(await isPublicSlugAvailable(uniqueSlug))) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * Get user by public slug
 */
export async function getUserByPublicSlug(slug: string) {
  return await prisma.user.findUnique({
    where: { publicSlug: slug },
    select: {
      id: true,
      name: true,
      email: true,
      publicSlug: true,
      companyDefaults: true,
    },
  });
}


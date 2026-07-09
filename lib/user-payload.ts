/**
 * Builds the client-facing user object returned by the auth routes
 * (login / register / google / 2fa). Includes `createdAt` and `subscription`
 * so the client can evaluate plan entitlements + grandfathering immediately
 * after auth — mirrors the shape returned by /api/auth/me.
 */
export interface DbUserForPayload {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: Date;
  image?: string | null;
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  subscriptionStartDate?: Date | null;
  subscriptionEndDate?: Date | null;
  subscriptionPaymentMethod?: string | null;
}

export function buildClientUser(u: DbUserForPayload) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt.toISOString(),
    ...(u.image !== undefined ? { image: u.image } : {}),
    subscription: u.subscriptionPlan
      ? {
          plan: u.subscriptionPlan,
          status: u.subscriptionStatus ?? undefined,
          startDate: u.subscriptionStartDate?.toISOString(),
          endDate: u.subscriptionEndDate?.toISOString(),
          paymentMethod: u.subscriptionPaymentMethod ?? undefined,
        }
      : undefined,
  };
}

export async function checkSubscription(): Promise<boolean> {
  return true
}

export const SUBSCRIPTION_ERROR = "internal error : vercel resources exceeded"

export async function restrictActionsIfExpired(userRole: string) {
  return null
}

export async function restrictIfExpired() {
  return null
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get("session_token")?.value
    const { pathname } = request.nextUrl

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/buy", "/admin", "/topup"]

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !sessionToken) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect logged-in users away from guest-only pages
    const guestRoutes = ["/login", "/register", "/forgot-password"]
    const isGuestRoute = guestRoutes.includes(pathname)

    if (isGuestRoute && sessionToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/buy/:path*",
        "/admin/:path*",
        "/topup/:path*",
        "/login",
        "/register",
        "/forgot-password"
    ],
}

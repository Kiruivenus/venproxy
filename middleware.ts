import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get("session_token")?.value
    const { pathname } = request.nextUrl

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/buy", "/admin", "/topup"]
    const authRoutes = ["/login", "/register", "/forgot-password"]

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !sessionToken) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (isAuthRoute && sessionToken) {
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

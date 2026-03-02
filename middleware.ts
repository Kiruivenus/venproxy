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

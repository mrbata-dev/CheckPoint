import withAuth from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/dashboard')) {
      // if no token OR not admin, redirect to login
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, 
    },
  }
)

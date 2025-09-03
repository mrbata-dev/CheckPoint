import withAuth from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
];

// Handle CORS preflight requests
function handleOptions(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  const origin = request.headers.get('Origin');
  
  if (allowedOrigins.includes(origin || '')) {
    response.headers.set('Access-Control-Allow-Origin', origin || '');
  }
  
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

interface AuthToken {
  role?: string;
  // Add other properties as needed
}

import { NextRequestWithAuth } from "next-auth/middleware";

const middleware = withAuth(
  async function middleware(req: NextRequestWithAuth) {
    // Handle preflight requests first
    if (req.method === 'OPTIONS') {
      return handleOptions(req);
    }

    // Process CORS for regular requests
    const origin = req.headers.get('Origin');
    if (allowedOrigins.includes(origin || '')) {
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', origin || '');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // Apply authentication logic
    const token = req.nextauth?.token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/dashboard')) {
      if (!token || (token as AuthToken | null)?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  }
);

export default middleware;
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

export default async function middleware(req: NextRequest) {
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

  // Apply authentication middleware
  return withAuth(async (req, event) => {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    if (pathname.startsWith('/dashboard')) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
    
    return NextResponse.next();
  })(req);
}
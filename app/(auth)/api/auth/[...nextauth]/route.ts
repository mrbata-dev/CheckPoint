import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
// import { NextResponse } from "next/server";

const handler = NextAuth(authOptions);

// export async function GET() {
//     return NextResponse.json({
//         success: true
//     })
// }
export { handler as GET, handler as POST }; 

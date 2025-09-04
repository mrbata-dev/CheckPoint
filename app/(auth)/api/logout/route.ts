import { NextResponse } from "next/server";

export async function POST() {
  // Clear access & refresh token cookies
  const response = NextResponse.json({ message: "Logged out successfully" });

  response.cookies.set({
    name: "accessToken",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // expire immediately
  });

  response.cookies.set({
    name: "refreshToken",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

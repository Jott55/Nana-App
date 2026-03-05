import { NextRequest, NextResponse } from "next/server";
import { verifyTokenAccess } from "./lib/auth";
import { auth } from "./lib/exports";

export function proxy(request: NextRequest) {

    const token = request.cookies.get('accessToken')?.value;
    
    const protectedPaths = ['/profile'];
    const isProtectedPath = protectedPaths.some(path => 
        request.nextUrl.pathname.startsWith(path)
    );

    const authPaths = ['/login', '/register'];
    const isAuthPath = authPaths.some(path => 
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const user = auth.verifyTokenAccess(token);
        
        if (!user) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('accessToken');
            response.cookies.delete('refreshToken');
            return response;
        }
    }

    return NextResponse.next();
}
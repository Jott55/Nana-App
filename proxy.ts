import { NextRequest, NextResponse } from "next/server";
import { verifyTokenAccess, verifyTokenRefresh } from "./lib/auth";
import { auth } from "./lib/exports";
import { cookies } from "next/headers";

export async function proxy(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // valid access == enter
    if (accessToken) {
        const verifiedAccessToken  = await auth.verifyTokenAccess(accessToken);
       
        if (verifiedAccessToken) {
            return NextResponse.next();
        }
    }

    // no valid access token but valid refresh
    if (refreshToken) {
        const verifiedRefreshToken = await auth.verifyTokenRefresh(refreshToken);

        if (verifiedRefreshToken) {
            const tokens = await auth.generateAuthTokens({
                id: verifiedRefreshToken.id,
                name: verifiedRefreshToken.name,
            });
            
            const response = NextResponse.next();
            
            await auth.setAuthCookies(tokens, response.cookies)

            return response;
        }

        const responseLogin = NextResponse.redirect(new URL('/login', request.url))

        await auth.clearAuthCookies(responseLogin.cookies);
        
        return responseLogin;
    }

    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: "/profile"
}
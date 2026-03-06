import { NextRequest, NextResponse } from "next/server";
import { verifyTokenAccess, verifyTokenRefresh } from "./lib/auth";
import { auth } from "./lib/exports";
import { cookies } from "next/headers";

export async function proxy(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    const guardPaths = ['/profile'];
    const authPaths = ['/register', '/login'];

    const isProtectedPath = guardPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    const isAuthPath = authPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    // valid access == enter
    if (accessToken) {
        const verifiedAccessToken = await auth.verifyTokenAccess(accessToken);
        if (verifiedAccessToken) {

            if (isProtectedPath) {
                return NextResponse.next();
            }

            // no login page for authenticated users
            if (isAuthPath) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
    }

    // no valid access token but valid refresh
    if (refreshToken) {
        const verifiedRefreshToken = await auth.verifyTokenRefresh(refreshToken);

        if (verifiedRefreshToken) {
            const tokens = await auth.createUserTokens({
                id: verifiedRefreshToken.id,
                name: verifiedRefreshToken.name,
            });

            const response = isAuthPath ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
            
            await auth.setAuthCookies(tokens, response.cookies)

            return response;
        }

        const responseLogin = NextResponse.redirect(new URL('/login', request.url))

        await auth.clearAuthCookies(responseLogin.cookies);

        return responseLogin;
    }

    if (isAuthPath) {
        return NextResponse.next();
    }


    // fail safe
    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: ["/profile", '/login', '/register']
}
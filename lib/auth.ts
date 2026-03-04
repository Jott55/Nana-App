import jwt, { JwtPayload } from 'jsonwebtoken';
import ms from 'ms';

import { cookies } from "next/headers";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_TIMEOUT = '15m';
const REFRESH_TOKEN_TIMEOUT = '7d';

export async function isValidToken(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken');
    if (!token) {
        return false;
    }
    
    const payload = verifyTokenAccess(token.value);
    
    if (!payload) {
        return false;
    }

    return true;
}

export function verifyTokenAccess(token: string): JwtPayload | null {
    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        return payload as JwtPayload;
    } catch (err) {
        return null;
    }
}

export function verifyTokenRefresh(token: string): JwtPayload | null {
    try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
        return payload as JwtPayload;
    } catch (err) {
        return null;
    }
}

export function generateTokenAccess(payload: JwtPayload): string {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_TIMEOUT,
    });
}

export function generateTokenRefresh(payload: JwtPayload): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_TIMEOUT, 
    });
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();

    cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ms(ACCESS_TOKEN_TIMEOUT) / 1000,
        path: '/',
    });

    cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ms(REFRESH_TOKEN_TIMEOUT) / 1000
    })
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();

    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
}
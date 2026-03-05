import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import ms from 'ms';

import { cookies } from "next/headers";
import { types } from './exports';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const access_key = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
const refresh_key = new TextEncoder().encode(REFRESH_TOKEN_SECRET);

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

export async function verifyTokenAccess(token: string): Promise<JWTPayload | null> {
    try {
        const result = await jwtVerify(token, access_key);
        return result.payload as JWTPayload
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function verifyTokenRefresh(token: string): Promise<JWTPayload | null> {
    try {
        const result = await jwtVerify(token, refresh_key);
        return result.payload as JWTPayload;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function generateTokenAccess(payload: types.UserJwtPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_TIMEOUT)
        .sign(access_key);
}

export async function generateTokenRefresh(payload: types.UserJwtPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_TIMEOUT)
        .sign(refresh_key);
}

export async function setAuthCookies(tokens: types.UserTokens): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ms(ACCESS_TOKEN_TIMEOUT) / 1000,
        path: '/',
    });

    cookieStore.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ms(REFRESH_TOKEN_TIMEOUT) / 1000
    })
}

export async function clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
}

export async function createUserTokens(payload: types.UserJwtPayload): Promise<types.UserTokens> {
    const accessToken = await generateTokenAccess(payload);
    const refreshToken = await generateTokenRefresh(payload);
    return {accessToken, refreshToken};
}
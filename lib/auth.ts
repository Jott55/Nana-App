import { JWTPayload, SignJWT, errors, jwtVerify } from 'jose';
import ms from 'ms';
import bcrypt from 'bcrypt';

import { cookies } from "next/headers";
import { db, types } from './exports';
import { RequestCookie, RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const access_key = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
const refresh_key = new TextEncoder().encode(REFRESH_TOKEN_SECRET);

const ACCESS_TOKEN_TIMEOUT = '5m';
const REFRESH_TOKEN_TIMEOUT = '7d';

export async function verifyTokenAccess(token: string): Promise<types.UserJwtPayload | null> {
    try {
        const result = await jwtVerify(token, access_key);
        return result.payload as types.UserJwtPayload
    } catch (err) {
        if (err instanceof errors.JWTExpired) {
            return null;
        } else if (err instanceof errors.JWTInvalid) {
            console.error(`Invalid token ${err}`);
        } else if (err instanceof errors.JWSSignatureVerificationFailed) {
            console.error(`Unwanted signature identitfied in token: ${token}`);
        }
        console.error(err);
        return null;
    }
}

export async function verifyTokenRefresh(token: string): Promise<types.UserJwtPayload | null> {
    try {
        const result = await jwtVerify(token, refresh_key);
        const payload = result.payload as types.UserJwtPayload;
        const tokens = await db.findValidTokensByUserId(payload.id);
        return tokens?.some(tk => tk.token === token) ? payload : null;
    } catch (err) {
        console.error(err);
    }
    return null;
}

async function generateTokenAccess(payload: types.UserJwtPayload): Promise<string> {
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

export async function createUserTokens(payload: types.UserJwtPayload): Promise<types.UserTokens>  {
    const tokens =  {
        accessToken: await generateTokenAccess(payload),
        refreshToken: await generateTokenRefresh(payload),
    };
    await db.createToken(payload.id, tokens.refreshToken, new Date(Date.now()+ ms(REFRESH_TOKEN_TIMEOUT)).toISOString());
    return tokens;
}

export async function setAuthCookies(tokens: types.UserTokens, responseCookies?: ResponseCookies ): Promise<void> {
    const cookieStore =  responseCookies ?? await cookies()

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
        maxAge: ms(REFRESH_TOKEN_TIMEOUT) / 1000,
        path: '/'
    })
}

export async function clearAuthCookies(responseCookies?: ResponseCookies): Promise<void> {
    const cookieStore = responseCookies? responseCookies : await cookies();

    const refresh_cookie = cookieStore.get('refreshToken');
    if (refresh_cookie) {
        const refresh = await verifyTokenRefresh(refresh_cookie.value);
        if (refresh) {
            await db.deleteTokenById(refresh.id);
        }
    }
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
}


export async function verifyUser(user: types.UserInsert): Promise<types.UserSafe | null> {
    const existingUser = await db.findUserByName(user.name);
    console.log(`existing user ${existingUser}`)

    if (!existingUser || !existingUser.password) {
        return null;
    }

    const isVerified = await bcrypt.compare(user.password, existingUser.password);
    if (!isVerified) {
        return null;
    }

    return db.sanitizeUser(existingUser);
}

export async function logUser(user: types.UserInsert): Promise<types.UserTokens | null> {
    
    const safe_user = await verifyUser(user);

    if (!safe_user) {
        console.log('safe_user error')
        return null;
    }
   
    const tokens = await createUserTokens({ id: safe_user.user_id, name: safe_user.name });

    return tokens;
}

export async function registerUser(user: types.UserInsert): Promise<types.UserTokens | null> {
        console.log('creating database')
        const safe_user = await db.createUser(user);
    
        if (!safe_user) {
            console.log('no result');
            return null;
        }
        
        console.log('result: ', safe_user);

        const tokens = await createUserTokens({ id: safe_user.user_id, name: safe_user.name });        
        return tokens;
}
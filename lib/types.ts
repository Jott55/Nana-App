export interface UserJwtPayload {
    id: string,
    name: string,
    iat?: number,
    exp?: number
    [key: string]: unknown
}

export interface UserTokens {
    accessToken: string,
    refreshToken: string
}

export interface User {
    id: string,
    name: string,
    password?: string
    created_at: string
}

export interface UserInsert {
    name: string,
    password: string
}

export type UserSafe = Omit<User, 'password' | 'created_at'>
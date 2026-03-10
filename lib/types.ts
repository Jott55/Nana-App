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

export interface UserUnsafe {
    user_id: string,
    name: string,
    password?: string
    created_at: string
}

export interface UserInsert {
    name: string,
    password: string
}

export interface ResponseJson {
    success: boolean
    msg?: string
}

export interface SecureToken {
    token_id: string,
    token: string
    expires: string
}

export type UserSafe = Omit<UserUnsafe, 'password' | 'created_at'>

export interface TestTableExists {
    exists: boolean
}
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
    id: string,
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

export type UserSafe = Omit<UserUnsafe, 'password' | 'created_at'>
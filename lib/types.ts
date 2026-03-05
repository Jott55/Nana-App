export interface UserJwtPayload {
    name: string,
    password: string
    iat?: number,
    exp?: number
    [key: string]: unknown
}

export interface UserTokens {
    accessToken: string,
    refreshToken: string
}
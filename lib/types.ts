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
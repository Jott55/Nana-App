import { auth, types } from "@/lib/exports";
import { describe, expect, it } from "vitest";

describe.sequential("authentication test", () => {

    const data = {
        tokens: <types.UserTokens> {},
        payload: <types.UserJwtPayload>  {
            id: '1',
            name: 'reisen',
        }
    }

    it("should have refresh token, auth token valid on env", () => {
        expect(process.env.REFRESH_TOKEN_SECRET).toBeDefined();
        expect(process.env.ACCESS_TOKEN_SECRET).toBeDefined();
    })
    
    it("should create tokens", async () => {
        const tokens = await auth.createUserTokens(data.payload);
        expect(tokens.accessToken).toBeTypeOf('string')
        expect(tokens.refreshToken).toBeTypeOf('string')
        data.tokens = tokens;
    })
    
    it("should verify access token", async () => {
        const tk = await auth.verifyTokenAccess(data.tokens.accessToken);
        expect(tk).toBeDefined();
        if (!tk) return;
        expect(tk.id).toBe(data.payload.id);
        expect(tk.name).toBe(data.payload.name);
        expect(tk.exp).toBeDefined();
        expect(tk.iat).toBeDefined();
    })

    it("should verify refresh token", async () => {
        const tk = await auth.verifyTokenRefresh(data.tokens.refreshToken);
        expect(tk).toBeDefined();
        if (!tk) return;
        expect(tk.id).toBe(data.payload.id);
        expect(tk.name).toBe(data.payload.name);
        expect(tk.exp).toBeDefined();
        expect(tk.iat).toBeDefined();
    })
})
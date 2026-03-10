import { beforeAll, describe, expect, it, test } from 'vitest'
import { auth, db, types } from '@/lib/exports'
import ms from 'ms'




describe('database settings', () => {
    it('setup should be correct', () => {
        expect(process.env.NODE_ENV).toBe('test')
        expect(process.env.POSTGRES_TEST).toBeTypeOf('string')
    })

    it('should create all tables', async () => {
        await db.createTables();
        expect(await db.testTablesExist()).toBe(true);
    });

    it("should delete all tables", async () => {
        await db.deleteTables();
        expect(await db.testTablesExist()).toBe(false);
    })
})

describe.sequential('user table', () => {
    const data = {
        user1: <types.UserUnsafe> {
            user_id: '',
            name: 'reisen',
            password: 'ran',
            created_at: '',
        },

        user2: <types.UserUnsafe> {
            user_id: '',
            name: 'tewi',
            password: 'chen',
            created_at: ''
        } 
    }

    beforeAll(async () => {
        await db.deleteTables();
        await db.createTables();
    })

    it("should create an user and return it", async () => {

        const user = await db.createUser(data.user1 as types.UserInsert);
        expect(user).toBeDefined();

        if (!user) return;

        expect(user.user_id).toBeDefined();

        data.user1.user_id = user.user_id;

        expect(user.name).toBe(data.user1.name);
    })

    it("should found user by name", async () => {
        const user = await db.findUserByName(data.user1.name);
        
        expect(user).toBeDefined();
        if (!user) return;

        expect(user.name).toBe(data.user1.name);
        expect(user.user_id).toBe(data.user1.user_id);
        expect(user.created_at).toBeDefined();
        expect(user.password).toBeDefined();
    })

    it("should found user by id", async () => {
        const user = await db.findUserById(data.user1.user_id);

        expect(user).toBeDefined();
        if (!user) return;

        expect(user.name).toBe(data.user1.name);
        expect(user.user_id).toBe(data.user1.user_id);
        expect(user.created_at).toBeDefined();
        expect(user.password).toBeDefined();
    })

    it("should not have user with same name", async () => {
        const user = await db.createUser(data.user1 as types.UserInsert);
        expect(user).toBeNull();
    })

    it("should check if users is sanitized", async () => {
        const user = await db.createUser(data.user2 as types.UserInsert) as types.UserUnsafe;
        expect(user).toBeDefined();
        if (!user) return;

        checkIfUserisSanitized(user, data.user2);
    })

    it("should delete an user", async () => {
        await db.deleteUserById(data.user1.user_id);
    })
})

describe.sequential('token table', () => {
    const data = { 
        user: <types.UserUnsafe> {
            name: 'reisen',
            password: 'ran',
        },

        refresh: <string> "",
        validTokens: <types.SecureToken[]> []
    }

    beforeAll( async () => {
        await db.deleteTables();
        await db.createTables();
        const user = await db.createUser(data.user as types.UserInsert);
        if (!user) return;
        data.user.user_id = user.user_id;
    })
    
    it('should create a token', async () => {
        const payload: types.UserJwtPayload = {id: '1', name: '2'}; 
        const refresh = await auth.generateTokenRefresh(payload);
        data.refresh = refresh;

        const res1 = await db.createToken(data.user.user_id, refresh, new Date(Date.now()+ms('7d')).toISOString());
        const res2 = await db.createToken(data.user.user_id, refresh, new Date(Date.now()-ms('1d')).toISOString());
        expect(res1).toBe(true);
        expect(res2).toBe(true);
    })

    it('should find valid tokens', async () => {
        const tokens = await db.findValidTokensByUserId(data.user.user_id);
        expect(tokens).toBeDefined();
        expect(tokens?.length).toBe(1);
        
        const [token] = tokens!;
        
        expect(token.token).toBe(data.refresh);
        expect(token.token_id).toBeDefined();
        expect(new Date(token.expires).getTime()).toBeGreaterThan(Date.now());
        
        data.validTokens = tokens!;
    })

    it('should delete a token by id', async () => {
        await db.deleteTokenById(data.validTokens[0].token_id);
        const tokens = await db.findValidTokensByUserId(data.user.user_id);
        expect(tokens).toBeNull();
    })
})

function checkIfUserisSanitized(safe_user: types.UserUnsafe, unsafe_user: types.UserUnsafe) {
    expect(safe_user.name, unsafe_user.name);
    expect(safe_user.password).toBeUndefined();
    expect(safe_user.user_id, unsafe_user.user_id);
    expect(safe_user.created_at).toBeUndefined();
}
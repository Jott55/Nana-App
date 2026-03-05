import postgres from "postgres";
import { types } from "./exports";
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10;

const sql = postgres(process.env.POSTGRES_URL!,
    {
        ssl: process.env.NODE_ENV === 'production' ? 'require' : false
    });

export async function createUser(user: types.UserInsert): Promise<types.UserSafe | null> {

    const userExists = await findUserByName(user.name);
    if (userExists) {
        return null;
    }

    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

    try {
        const result = await sql<types.UserUnsafe[]>`
            INSERT INTO users 
                (name, password)
            VALUES (
                ${user.name}, ${hashedPassword} 
            )
        `;
        const userUnsafe = await findUserByName(user.name);
        return  userUnsafe ? sanitizeUser(userUnsafe) : null;
    } catch (error) {
        console.error(error);
    }

    return null;
}

export async function verifyUser(user: types.UserInsert): Promise<types.UserSafe | null> {
    const existingUser = await findUserByName(user.name);

    if (!existingUser || !existingUser.password) {
        return null;
    }

    const isVerified = await bcrypt.compare(user.password, existingUser.password);
    if (!isVerified) {
        return null;
    }

    return sanitizeUser(existingUser);
}

export async function findUserByName(name: string) {
    try {
        const result = await sql<types.UserUnsafe[]>`
            SELECT 
                user_id, name, password, created_at
            FROM users
            WHERE name=${name}
        `;
        return result.length === 1 ? result[0] : null;
    } catch (error) {
        console.error(error);
    }

    return null;
}

export async function findUserById(id: number) {
    try {
        const result = await sql<types.UserUnsafe[]>`
            SELECT
                user_id, name, password, created_at
            FROM users
            WHERE user_id=${id}
        `;
        return result.length === 1 ? result[0] : null;
    } catch (error) {
        console.error(error);
    }

    return null;
}


export async function deleteUserById(id: string) {
    try {
        await sql`
            DELETE FROM users WHERE user_id=${id}
        `;

    } catch (error) {
        console.error(error);
    }

    return null;
}

export async function updateUser(user: types.UserUnsafe) {
    if (!user.password) {
        return null;
    }

    try {
        await sql`
            UPDATE users SET 
                name = ${user.name}, 
                password = ${user.password}
            WHERE user_id=${user.id}
        `;
    } catch (error) {
        console.error(error);
    }

    return null;
}

export async function createTables() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                user_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name varchar(64) NOT NULL,
                password varchar(64) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `;
    } catch (error) {
        console.error(error);
    }
}


export async function deleteTables() {
    try {
        await sql`
            DROP TABLE IF EXISTS users
        `;
    } catch (error) {
        console.error(error);
    }
}

export function sanitizeUser(user: types.UserUnsafe): types.UserSafe {
    const {password, created_at, ...userSafe} = user;
    return userSafe;
}
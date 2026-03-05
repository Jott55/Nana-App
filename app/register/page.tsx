import { auth, db, types } from "@/lib/exports";
import { redirect } from "next/navigation";
import z from "zod";

export async function handleForm(formData: FormData) {
    // register page
    'use server'
    const schema = z.object({
        name: z.string(),
        password: z.string(),
    });

    const form = schema.safeParse({
        name: formData.get("name"),
        password: formData.get("password"),
    });

    if (!form.success) {
        console.log('form not able to parse');
        return;
    }

    const user: types.UserInsert = form.data;

    console.log('creating database')
    const result = await db.createUser(user);

    if (!result) {
        console.log('no result');
        return;
    }
    console.log('result: ', result);
    const tokens = await auth.createUserTokens({id: result.id, name: result.name});

    console.log('setting auth cookies');
    await auth.setAuthCookies(tokens);
    redirect('/profile')
}


export default async function Register() {
    return (
        <div className="flex mx-auto w-md h-full items-center">
            <div className="flex flex-col">
                <h1>Register</h1>
                <form action={handleForm} className="flex flex-col">
                    <label htmlFor="register-name">Name</label>
                    <input className="border" id="register-name" type="text" name="name" />
                    <label htmlFor="register-password">Password</label>
                    <input className="border" id="register-password" type="password" name="password" />
                    <button className="border mt-4" type="submit">Send</button>
                </form>
            </div>
        </div>
    )
}
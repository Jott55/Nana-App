import { auth, db, types } from "@/lib/exports";
import { redirect } from "next/navigation";
import z, { string } from "zod"

export async function handleForm(formData: FormData) {
    'use server'
    // login page
    const schema = z.object({
        name: z.string(),
        password: z.string(),
    });

    const form = schema.safeParse({
        name: formData.get("name"),
        password: formData.get("password"),
    });

    if (!form.success) {
        console.log('form error')
        return;
    }

    const user = await db.verifyUser(form.data);
    
    if (!user) {
        console.log('user error')
        return;
    }

    const tokens = await auth.createUserTokens({id: user.id, name: user.name});
    
    await auth.setAuthCookies(tokens);
    
    redirect('/profile')
}

export default async function Login() {
    // form -> generateToken -> store it


    return (
        <div className="flex mx-auto w-md h-full items-center">
            <div className="flex flex-col">
                <h1>Login</h1>
                <form action={handleForm} className="flex flex-col">
                    <label htmlFor="login-name">Name</label>
                    <input className="border" id="login-name" type="text" name="name" />
                    <label htmlFor="login-password">Password</label>
                    <input className="border" id="login-password" type="password" name="password" />
                    <button className="border mt-4" type="submit">Send</button>
                </form>
                <div className="mt-4">
                    <h2>No account?</h2>
                    <p>Register <a href="/register">here</a></p>
                </div>
            </div>
        </div>
    )
}
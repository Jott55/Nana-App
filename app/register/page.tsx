import { auth, db } from "@/lib/exports";
import { redirect } from "next/navigation";
import z from "zod";

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

    await auth.createUserTokens({id: user.id, name: user.name});
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
import Button from "@/components/Button";
import FormInput from "@/components/Input";
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

    const tokens = await auth.registerUser(user) 
    if (!tokens) {
        return;
    }

    await auth.setAuthCookies(tokens);
    redirect('/profile')
}


export default async function Register() {
    return (
        <div className="flex mx-auto w-md h-full mt-16">
            <div className="flex flex-col">
                <h1>Register</h1>
                <form action={handleForm} className="flex flex-col">
                    <FormInput id="register-name" title="Name" />
                    <FormInput type="password" id="register-password" title="Password" />
                    <Button>Send</Button>
                </form>
                <div className="mt-4">
                    <h2>Needs login?</h2>
                    <p>Login <a href="/login" className="underline!">here</a></p>

                    <p className="pt-4">return <a href="/" className="text-blue-200 hover:underline!">home</a></p>
                </div>
            </div>
        </div>
    )
}
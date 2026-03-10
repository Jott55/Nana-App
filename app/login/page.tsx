import Button from "@/components/Button";
import FormInput from "@/components/Input";
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

    const tokens = await auth.logUser(form.data);
    if (!tokens) {
        return;
    }

    await auth.setAuthCookies(tokens);

    redirect('/profile');
}

export default async function Login() {
    // form -> generateToken -> store it


    return (
        <div className="flex mx-auto w-md h-full mt-16">
            <div className="flex flex-col">
                <h1>Login</h1>
                <form action={handleForm} className="flex flex-col">
                    <FormInput title="Name" id="login-id" />
                    <FormInput type="password" title="Password" id="login-password" />
                    <Button color="blue">Send</Button>
                </form>
                <div className="mt-4">
                    <h2>No account?</h2>
                    <p>Register <a className="underline!" href="/register">here</a></p>
                    <p className="pt-4">return <a href="/" className="text-blue-200  hover:underline!">home</a></p>
                </div>
            </div>
        </div>
    )
}
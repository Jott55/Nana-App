export default async function Register() {
    return (
        <div className="flex mx-auto w-md h-full items-center">
            <div className="flex flex-col">
                <h1>Register</h1>
                <form action="" className="flex flex-col">
                    <label htmlFor="register-name">Name</label>
                    <input className="border" id="register-name" type="text" />
                    <label htmlFor="register-password">Password</label>
                    <input className="border" id="register-password" type="password" />
                </form>
            </div>
        </div>
    )
}
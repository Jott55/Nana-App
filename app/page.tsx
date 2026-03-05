'use server'

import { auth } from "@/lib/exports";

export async function handleLogout() {
  'use server'
  await auth.clearAuthCookies();
}

export default async function Home() {
  return (
    <div className="">
      <p>Hello world, this is the default page</p>
      <p>Go to <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
      <p>Go to <a href="http://localhost:3000/register">http://localhost:3000/register</a></p>
      <p>Go to <a href="http://localhost:3000/profile">http://localhost:3000/profile</a></p>
      <button onClick={handleLogout} className="rounded-2xl border p-4 hover:bg-gray-100 active:bg-gray-200">Logout</button>
    </div>
  );
}

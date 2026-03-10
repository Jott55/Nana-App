'use server'

import { LinkButton } from "@/components/LinkButton";
import { auth } from "@/lib/exports";

export async function handleLogout() {
  'use server'
  await auth.clearAuthCookies();
}

export default async function Home() {
  return (
    <div className="flex flex-col gap-y-4  ">
      <p>Hello world, this is the default page</p>
      <div className="flex gap-x-4 items-center justify-between ">
        <div className="flex gap-x-4 items-center">
          <LinkButton href="/login">Login</LinkButton>
          <LinkButton href="/register">Register</LinkButton>
          <LinkButton href="/profile">Profile</LinkButton>
          <LinkButton href="/admin">Admin</LinkButton>
        </div>
        <button onClick={handleLogout} className="rounded-2xl border p-4 shadow-[0px_2px_2px] bg-gray-700  hover:bg-gray-600 active:bg-gray-500">Logout</button>
      </div>
    </div>
  );
}

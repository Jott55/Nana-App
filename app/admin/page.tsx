import { db } from "@/lib/exports";

export async function handleCreateTable() {
    'use server'
    await db.createTables();
} 

export async function handleDeleteTable() {
    'use server'
    await db.deleteTables();
} 

export default async function Admin() {
    return (
        <div className="flex items-center mx-auto w-md">
            <div className="flex flex-col shadow-2xl">
                <button onClick={handleCreateTable} className="border rounded-2xl hover:bg-gray-200 active:bg-gray-400 w-1/2">Create tables</button>
                <button onClick={handleDeleteTable} className="border rounded-2xl hover:bg-gray-200 active:bg-gray-400 w-1/2">Delete tables</button>
            </div>
        </div>
    )
}
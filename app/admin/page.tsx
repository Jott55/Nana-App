import Button from "@/components/Button";
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
            <div className="flex flex-col shadow-2xl gap-4">
                <Button color="green" onClick={handleCreateTable}>Create tables</Button>
                <Button color="red" onClick={handleDeleteTable}>Delete tables</Button>
            </div>
        </div>
    )
}
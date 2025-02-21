"use client"

import CreateDropLink from "@/app/components/create-drop-link";
import Link from "next/link";

export default function CreateDropLinkPage() {
    return (
        <div className="container mx-auto p-4">
            <Link href="/" className="text-blue-500 underline mb-4 inline-block">Return to Home</Link>
            <CreateDropLink />
        </div>
    );
}
"use client"
import { useContractInteraction } from "@/hooks/useContractInteraction";

export default function Home() {
  const { isLoggedIn, currentAccountId } = useContractInteraction();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {currentAccountId}</h1>
      <p>You are logged in to the admin dashboard.</p>
    </div>
  )
}


"use client"

import { useAuth } from "@/app/lib/auth"

export default function Home() {
  const { session, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {session?.user?.name}</h1>
      <p>You are logged in to the admin dashboard.</p>
    </div>
  )
}


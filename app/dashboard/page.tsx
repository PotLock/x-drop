import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import AdminDashboard from "./admin-dashboard"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return <AdminDashboard />
}


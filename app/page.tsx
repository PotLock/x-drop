"use client"
import { useContractInteraction } from "@/hooks/useContractInteraction";
import Link from "next/link";
import Balance from "@/app/components/Balance";
import Deposit from "@/app/components/Deposit";
import Withdraw from "@/app/components/Withdraw";

export default function Home() {
  const { isLoggedIn, currentAccountId } = useContractInteraction();
  const balance = 1.2345; // Replace with actual balance fetching logic
  const depositAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // Replace with actual deposit address

  const handleWithdraw = (amount: number) => {
    console.log(`Withdraw ${amount} BTC`); // Replace with actual withdraw logic
  };

  return (
    <div className="container mx-auto p-6">
      {isLoggedIn ? (
        <>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">Welcome, {currentAccountId}</h1>
            <p className="text-lg mb-4">You are logged in to the admin dashboard.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Balance balance={balance} />
              <Deposit address={depositAddress} />
              <Withdraw onWithdraw={handleWithdraw} />
            </div>
          </div>
          <div className="text-center">
            <Link href="/create-drop-link">
              <button className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300">
                Create Drop Link
              </button>
            </Link>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-lg">Please log in to access the admin dashboard.</p>
        </div>
      )}
    </div>
  );
}


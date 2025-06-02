"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center bg-white px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        SkillLoop — Learn, Teach & Earn on Web3
      </h1>
      <p className="text-lg md:text-xl max-w-xl mb-8 text-gray-700">
        Connect with skilled learners and mentors. Earn tokens and badges as you
        grow your knowledge on-chain.
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        <ConnectButton />

        <button
          onClick={() => router.push("/dashboard")}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Explore Platform
        </button>
      </div>
    </main>
  );
}

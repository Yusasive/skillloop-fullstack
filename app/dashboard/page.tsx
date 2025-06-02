// app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  fetchTokenBalance,
  fetchUserProfile,
  fetchUserSessions,
} from "@/lib/api";
import SkillTags from "@/components/SkillTags";
import SessionCards from "@/components/SessionCards";

export default function DashboardPage() {
  const { address } = useAccount();
  const [balance, setBalance] = useState("0");
  const [skills, setSkills] = useState<string[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!address) return;

    const loadData = async () => {
      const bal = await fetchTokenBalance(address);
      const profile = await fetchUserProfile(address);
      const sess = await fetchUserSessions(address);

      setBalance(bal);
      setSkills(profile.skills || []);
      setSessions(sess);
    };

    loadData();
  }, [address]);

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Token Balance */}
      <div className="bg-white shadow p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-2">SkillToken Balance</h2>
        <p className="text-2xl text-blue-600">{balance} SKL</p>
      </div>

      {/* Skill Tags */}
      <div className="bg-white shadow p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-2">Your Skills</h2>
        <SkillTags tags={skills} />
      </div>

      {/* Sessions */}
      <div className="bg-white shadow p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-2">Your Sessions</h2>
        <SessionCards sessions={sessions} />
      </div>
    </main>
  );
}

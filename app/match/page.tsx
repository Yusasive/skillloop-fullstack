"use client";

import { useState } from "react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

interface Profile {
  address: string;
  name: string;
  bio: string;
  skills: string[];
}

export default function MatchPage() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async () => {
    if (selectedSkills.length === 0) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/match", { skills: selectedSkills });
      setMatches(res.data.matches);
    } catch (err) {
      alert("Error fetching matches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Find Matches</h1>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Skills
        </label>
        <CreatableSelect
          isMulti
          onChange={(options) => setSelectedSkills(options.map((o) => o.value))}
        />

        <button
          onClick={fetchMatches}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Matching..." : "Find Matches"}
        </button>
      </div>

      {matches.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {matches.map((user) => (
            <div key={user.address} className="border rounded p-4 shadow">
              <h2 className="text-lg font-semibold">
                {user.name || user.address.slice(0, 10)}
              </h2>
              <p className="text-sm text-gray-600">{user.bio}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

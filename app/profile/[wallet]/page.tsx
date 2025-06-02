"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { useAccount } from "wagmi";
import axios from "axios";

interface Profile {
  name: string;
  bio: string;
  skills: string[];
}

export default function ProfilePage() {
  const { wallet } = useParams();
  const { address } = useAccount();
  const [profile, setProfile] = useState<Profile>({
    name: "",
    bio: "",
    skills: [],
  });
  const [saving, setSaving] = useState(false);

  const isOwner = address?.toLowerCase() === wallet.toString().toLowerCase();

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get(`/api/profile?address=${wallet}`);
      setProfile(res.data.profile || { name: "", bio: "", skills: [] });
    };

    fetchProfile();
  }, [wallet]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post("/api/profile", {
        address,
        ...profile,
      });
      alert("Profile saved!");
    } catch (err) {
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Name</span>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="mt-1 block w-full p-2 border rounded"
          disabled={!isOwner}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Bio</span>
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="mt-1 block w-full p-2 border rounded"
          rows={3}
          disabled={!isOwner}
        />
      </label>

      <div>
        <span className="text-sm font-medium text-gray-700 block mb-1">
          Skills
        </span>
        <CreatableSelect
          isMulti
          isDisabled={!isOwner}
          value={profile.skills.map((skill) => ({
            value: skill,
            label: skill,
          }))}
          onChange={(selected) =>
            setProfile({
              ...profile,
              skills: selected.map((s) => s.value),
            })
          }
        />
      </div>

      {isOwner && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      )}
    </main>
  );
}

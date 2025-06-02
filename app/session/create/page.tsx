"use client";

import { useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function CreateSessionPage() {
  const { address } = useAccount();
  const router = useRouter();

  const [form, setForm] = useState({
    topic: "",
    description: "",
    datetime: "",
    peerAddress: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/session", {
        ...form,
        initiator: address,
      });
      router.push(`/session/${res.data.sessionId}`);
    } catch (err) {
      setError("Failed to create session. Check inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create a Learning Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="topic"
          placeholder="Topic"
          value={form.topic}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="datetime"
          type="datetime-local"
          value={form.datetime}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="peerAddress"
          placeholder="Peer Wallet Address"
          value={form.peerAddress}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Token Amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Session"}
        </button>
      </form>
    </main>
  );
}

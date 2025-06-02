"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useAccount } from "wagmi";

interface Session {
  _id: string;
  topic: string;
  learner: string;
  teacher: string;
  confirmed: boolean;
}

export default function SessionDetailPage() {
  const { id } = useParams();
  const { address } = useAccount();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/session/${id}`);
        setSession(res.data);
      } catch (err) {
        console.error("Failed to fetch session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const confirmSession = async () => {
    setConfirming(true);
    try {
      const res = await axios.post(`/api/session/${id}`, { address });
      alert("Session confirmed and badge minted!");
      setSession((prev) => prev && { ...prev, confirmed: true });
    } catch (err) {
      alert("Failed to confirm session");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <p className="p-6">Loading session...</p>;
  if (!session) return <p className="p-6">Session not found</p>;

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Session Details</h1>
      <div className="border p-4 rounded shadow space-y-2">
        <p>
          <strong>Topic:</strong> {session.topic}
        </p>
        <p>
          <strong>Teacher:</strong> {session.teacher}
        </p>
        <p>
          <strong>Learner:</strong> {session.learner}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {session.confirmed ? "✅ Confirmed" : "⏳ Pending"}
        </p>
      </div>

      {!session.confirmed &&
        address?.toLowerCase() === session.learner.toLowerCase() && (
          <button
            onClick={confirmSession}
            disabled={confirming}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {confirming ? "Confirming..." : "Confirm Session"}
          </button>
        )}
    </main>
  );
}
r
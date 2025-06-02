"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import axios from "axios";

interface Certificate {
  tokenId: string;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
}

export default function CertificatesPage() {
  const { address } = useAccount();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    const fetchCertificates = async () => {
      try {
        const res = await axios.get(`/api/certificate/${address}`);
        setCerts(res.data);
      } catch (err) {
        console.error("Error loading certs");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [address]);

  if (!address) return <p className="p-6">Please connect your wallet</p>;
  if (loading) return <p className="p-6">Loading certificates...</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Your Certificates</h1>
      {certs.length === 0 ? (
        <p>No certificates earned yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((cert) => (
            <div
              key={cert.tokenId}
              className="border rounded shadow p-4 space-y-2"
            >
              <img
                src={cert.metadata.image}
                alt={cert.metadata.name}
                className="w-full h-48 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{cert.metadata.name}</h3>
                <p className="text-sm text-gray-600">
                  {cert.metadata.description}
                </p>
                <p className="text-xs text-gray-400">
                  Token ID: #{cert.tokenId}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

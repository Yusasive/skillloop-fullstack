"use client";

import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import axios from "axios";
import { useEffect, useState } from "react";

export default function SiweLogin() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [authenticated, setAuthenticated] = useState(false);

  const signIn = async () => {
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in to SkillLoop",
      uri: window.location.origin,
      version: "1",
      chainId: 1,
    });

    const signature = await signMessageAsync({
      message: message.prepareMessage(),
    });

    await axios.post("/api/auth/siwe", {
      message: message.toMessage(),
      signature,
    });

    setAuthenticated(true);
  };

  const checkAuth = async () => {
    const res = await axios.get("/api/auth/siwe");
    setAuthenticated(res.data.authenticated);
  };

  useEffect(() => {
    if (address) checkAuth();
  }, [address]);

  return (
    <div>
      {!authenticated ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={signIn}
        >
          Sign In with Ethereum
        </button>
      ) : (
        <p>✅ Logged in as {address}</p>
      )}
    </div>
  );
}

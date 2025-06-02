// context/WalletProvider.tsx
"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains([sepolia], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: "SkillLoop",
  projectId: "YOUR_PROJECT_ID", // from walletconnect
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiConfig config={wagmiConfig}>
    <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
  </WagmiConfig>
);

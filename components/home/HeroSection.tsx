"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import Image from "next/image";

const HeroSection = () => {
  const { connectWallet, isConnected, isConnecting, account } = useWeb3();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isConnected) {
      router.push("/explore");
    } else {
      connectWallet();
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 py-20">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-chart-1/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-chart-2/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-border bg-background/50 px-3 py-1 text-sm">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-chart-1" />
              <span>Web3 Learning Revolution</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Learn anything.
              <br />
              <span className="text-chart-1">Earn certificates.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-prose">
              SkillLoop connects you with peers for meaningful learning
              sessions. Schedule sessions, commit with tokens, and earn on-chain
              NFT certificates.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-chart-1 hover:bg-chart-1/90 text-white"
                onClick={handleGetStarted}
                disabled={isConnecting}
              >
                {isConnecting
                  ? "Connecting..."
                  : isConnected
                    ? "Get Started"
                    : "Connect Wallet"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">Learn More</a>
              </Button>
            </div>

            {isConnected && account && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                {
                  icon: <Users className="h-5 w-5 text-chart-1" />,
                  label: "Connect with peers",
                  value: "500+ Users",
                },
                {
                  icon: <Shield className="h-5 w-5 text-chart-2" />,
                  label: "Secure escrow",
                  value: "100% Safe",
                },
                {
                  icon: <Award className="h-5 w-5 text-chart-4" />,
                  label: "Earn NFTs",
                  value: "Proof-of-learning",
                },
              ].map((stat, index) => (
                <div key={index} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 text-card-foreground">
                    {stat.icon}
                    <div>
                      <p className="text-sm font-medium">{stat.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative rounded-2xl border bg-card shadow-xl overflow-hidden aspect-[4/3] w-full max-w-md">
              <Image
                src="https://images.pexels.com/photos/5935791/pexels-photo-5935791.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="People learning together"
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="text-white space-y-2">
                  <h3 className="font-bold text-xl">Peer-to-peer learning</h3>
                  <p className="text-sm opacity-90">
                    Learn directly from experts in your field
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -right-12 -top-12 rounded-xl border bg-card p-4 shadow-lg hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-chart-1 flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Blockchain Certificate</p>
                  <p className="text-xs text-muted-foreground">
                    Web Development
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -left-12 -bottom-8 rounded-xl border bg-card p-4 shadow-lg hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-chart-2 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Secure Escrow</p>
                  <p className="text-xs text-muted-foreground">
                    0.1 ETH locked
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

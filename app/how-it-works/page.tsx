"use client"

import { motion } from "framer-motion";
import { 
  Wallet, 
  UserCircle, 
  Calendar, 
  ShieldCheck, 
  CheckCircle, 
  Award 
} from "lucide-react";

const steps = [
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Connect Wallet",
    description: "Start by connecting your Web3 wallet to access the platform securely."
  },
  {
    icon: <UserCircle className="h-6 w-6" />,
    title: "Create Profile",
    description: "Set up your profile with skills you want to teach or learn."
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Schedule Session",
    description: "Find a tutor or student and schedule a learning session."
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Lock Tokens",
    description: "Commit to the session by locking tokens in the smart contract."
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: "Complete Session",
    description: "Attend your session and confirm completion to release tokens."
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Earn Certificate",
    description: "Receive an NFT certificate as proof of your completed session."
  }
];

export default function HowItWorksPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">How SkillLoop Works</h1>
          <p className="text-muted-foreground">
            Learn how to get started with our decentralized learning platform
          </p>
        </div>
        
        <div className="grid gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex gap-6 items-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="bg-card rounded-lg p-8 border">
          <h2 className="text-2xl font-bold mb-4">Why Choose SkillLoop?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                Smart contracts ensure safe token transactions between parties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Verified Learning</h3>
              <p className="text-sm text-muted-foreground">
                Earn NFT certificates as proof of your completed sessions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Direct Connection</h3>
              <p className="text-sm text-muted-foreground">
                Connect directly with tutors and learners, no middlemen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client"

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Calendar, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle, 
  UserCircle 
} from 'lucide-react';

const steps = [
  {
    id: "connect",
    title: "Connect Wallet",
    icon: <Wallet className="h-5 w-5" />,
    description: "Connect your Ethereum wallet to access SkillLoop's features securely.",
    details: [
      "Supports MetaMask, WalletConnect, and Coinbase Wallet",
      "Your wallet acts as your identity on the platform",
      "No email or password required - Web3 native authentication",
      "Your private keys always remain in your control"
    ],
    image: "https://images.pexels.com/photos/6781340/pexels-photo-6781340.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: "profile",
    title: "Create Profile",
    icon: <UserCircle className="h-5 w-5" />,
    description: "Build your skill profile by adding the skills you can teach and want to learn.",
    details: [
      "Set your hourly rate for tutoring services",
      "Add profile photo and bio to increase visibility",
      "Tag skills with experience level (beginner, intermediate, expert)",
      "Connect your social profiles for additional verification"
    ],
    image: "https://images.pexels.com/photos/3194518/pexels-photo-3194518.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: "schedule",
    title: "Schedule Session",
    icon: <Calendar className="h-5 w-5" />,
    description: "Find a tutor or student and schedule a learning session at a mutually convenient time.",
    details: [
      "Browse tutors by skill, availability, and rating",
      "Send session requests with specific learning goals",
      "Set duration and format (video, text, voice)",
      "Choose from suggested time slots or propose your own"
    ],
    image: "https://images.pexels.com/photos/7256897/pexels-photo-7256897.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: "escrow",
    title: "Lock Tokens",
    icon: <ShieldCheck className="h-5 w-5" />,
    description: "Commit to the session by locking tokens in the smart contract escrow.",
    details: [
      "Tokens are securely held in a smart contract",
      "Both parties must lock tokens as commitment",
      "Automatically released upon session completion",
      "Refunded if session is canceled with sufficient notice"
    ],
    image: "https://images.pexels.com/photos/6771900/pexels-photo-6771900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: "complete",
    title: "Complete Session",
    icon: <CheckCircle className="h-5 w-5" />,
    description: "Attend your session and confirm completion to release tokens from escrow.",
    details: [
      "Join via your preferred meeting platform",
      "Follow your pre-defined learning objectives",
      "Both participants must confirm completion",
      "Leave feedback for your learning partner"
    ],
    image: "https://images.pexels.com/photos/7092613/pexels-photo-7092613.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: "certificate",
    title: "Earn Certificate",
    icon: <GraduationCap className="h-5 w-5" />,
    description: "Receive an NFT certificate as proof of your completed learning session.",
    details: [
      "Unique NFT minted for each completed session",
      "Contains metadata about skills learned and duration",
      "Viewable in any NFT marketplace or wallet",
      "Build a verifiable on-chain learning history"
    ],
    image: "https://images.pexels.com/photos/7015034/pexels-photo-7015034.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  }
];

const HowItWorksSection = () => {
  const [activeTab, setActiveTab] = useState("connect");
  
  return (
    <section id="how-it-works\" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 sm:text-4xl">How SkillLoop Works</h2>
          <p className="text-muted-foreground">
            Follow these simple steps to start learning, teaching, and earning on-chain certificates.
          </p>
        </motion.div>
        
        <div className="mt-8 grid md:grid-cols-5 gap-8">
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="w-full md:w-auto flex md:flex-col h-auto gap-1 bg-transparent">
                {steps.map((step) => (
                  <TabsTrigger 
                    key={step.id} 
                    value={step.id}
                    className="w-full flex items-center justify-start gap-2 data-[state=active]:bg-card"
                  >
                    <div className="p-1.5 rounded-full bg-primary/10">
                      {step.icon}
                    </div>
                    <span className="hidden md:inline">{step.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>
          
          <motion.div 
            className="md:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`${activeTab === step.id ? 'block' : 'hidden'} rounded-xl border bg-card overflow-hidden`}
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={step.image} 
                    alt={step.title} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    {step.icon}
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">Key Points:</h4>
                    <ul className="space-y-1">
                      {step.details.map((detail, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-chart-1 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
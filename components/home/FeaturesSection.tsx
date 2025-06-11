"use client"

import { motion } from 'framer-motion';
import { 
  Wallet, 
  Users, 
  CalendarClock, 
  Shield, 
  Medal, 
  Search, 
  MessageSquare, 
  Sparkles 
} from 'lucide-react';

const features = [
  {
    icon: <Wallet className="h-6 w-6 text-chart-1" />,
    title: "Wallet Connection",
    description: "Connect your crypto wallet to access the platform and manage your tokens securely."
  },
  {
    icon: <Users className="h-6 w-6 text-chart-2" />,
    title: "Skill Profiles",
    description: "Create and customize your profile with skills you can teach or want to learn."
  },
  {
    icon: <CalendarClock className="h-6 w-6 text-chart-3" />,
    title: "Session Scheduling",
    description: "Book one-on-one learning sessions with tutors based on mutual availability."
  },
  {
    icon: <Shield className="h-6 w-6 text-chart-4" />,
    title: "Token Escrow",
    description: "Lock tokens as commitment to ensure both parties attend scheduled sessions."
  },
  {
    icon: <Medal className="h-6 w-6 text-chart-5" />,
    title: "NFT Certificates",
    description: "Earn unique NFT badges as proof of completed learning sessions and acquired skills."
  },
  {
    icon: <Search className="h-6 w-6 text-chart-1" />,
    title: "Tutor Discovery",
    description: "Find the perfect tutor based on skills, ratings, and availability."
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-chart-2" />,
    title: "Feedback System",
    description: "Rate and review tutors to help others find quality learning experiences."
  },
  {
    icon: <Sparkles className="h-6 w-6 text-chart-3" />,
    title: "Progress Tracking",
    description: "Monitor your learning journey with a visual dashboard of completed sessions."
  }
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  return (
    <motion.div 
      className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="mb-4 rounded-full bg-primary/10 p-2.5 w-fit">
        {feature.icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
      <p className="text-sm text-muted-foreground">{feature.description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <motion.h2 
            className="text-3xl font-bold mb-4 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Features that <span className="text-chart-1">empower</span> your learning
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            SkillLoop combines Web3 technology with peer-to-peer learning to create 
            a secure, transparent, and rewarding educational experience.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
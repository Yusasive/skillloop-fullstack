"use client"

import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";

const CTASection = () => {
  const { connectWallet, isConnected, isConnecting } = useWeb3();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isConnected) {
      router.push('/explore');
    } else {
      connectWallet();
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-chart-1/90 to-chart-2/90" />
            <img
              src="https://images.pexels.com/photos/7103164/pexels-photo-7103164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="People learning together"
              className="h-full w-full object-cover opacity-40"
            />
          </div>
          
          <div className="relative py-16 px-8 md:py-24 md:px-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-6 text-white" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to start your learning journey?
            </h2>
            
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Join SkillLoop today to connect with peers, share knowledge,
              and build your on-chain learning credentials.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-chart-1 hover:bg-white/90"
                onClick={handleGetStarted}
                disabled={isConnecting}
              >
                {isConnected ? "Start Learning" : isConnecting ? "Connecting..." : "Connect Wallet"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <a href="/become-tutor">Become a Tutor</a>
              </Button>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2 text-chart-1">500+</h3>
            <p className="text-muted-foreground">Active Users</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2 text-chart-2">1,200+</h3>
            <p className="text-muted-foreground">Learning Sessions</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2 text-chart-3">800+</h3>
            <p className="text-muted-foreground">NFT Certificates</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
"use client"

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "Emma Rodriguez",
    role: "Web3 Developer",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    content: "SkillLoop transformed my learning journey. I picked up Solidity programming through weekly sessions with an expert, and my on-chain certificates helped me land my dream job in Web3!",
    rating: 5
  },
  {
    id: 2,
    name: "James Chen",
    role: "Blockchain Enthusiast",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    content: "As someone teaching DeFi concepts, I love how the platform handles payments securely through escrow. It's given me a way to monetize my knowledge while helping others enter the space.",
    rating: 5
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Smart Contract Auditor",
    avatar: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    content: "I've collected over 15 NFT certificates from my learning sessions. They've become an invaluable part of my professional portfolio, proving my skills far better than traditional resumes.",
    rating: 4
  }
];

const TestimonialCard = ({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) => {
  return (
    <motion.div 
      className="flex flex-col h-full rounded-xl border bg-card p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{testimonial.name}</h3>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
            />
          ))}
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm flex-1">{testimonial.content}</p>
      
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div className="flex -space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-chart-1 border-2 border-background" />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Verified on-chain</span>
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 sm:text-4xl">What Our Users Say</h2>
          <p className="text-muted-foreground">
            Join thousands of users who are already teaching, learning, and earning 
            on-chain recognition for their skills.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
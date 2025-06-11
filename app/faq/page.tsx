"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is SkillLoop?",
    answer: "SkillLoop is a decentralized peer-to-peer learning platform that connects learners with tutors. It uses blockchain technology to facilitate secure payments and issue verifiable certificates for completed learning sessions."
  },
  {
    question: "How do I get started?",
    answer: "To get started, connect your Web3 wallet (like MetaMask), create your profile, and start browsing available tutors or list your own teaching skills."
  },
  {
    question: "How does payment work?",
    answer: "Payments are handled through smart contracts. When you book a session, tokens are held in escrow and automatically released to the tutor upon successful completion of the session."
  },
  {
    question: "What are NFT certificates?",
    answer: "After completing a learning session, you receive an NFT certificate that serves as on-chain proof of your achievement. These certificates are unique, verifiable, and can be displayed in your Web3 wallet or NFT marketplace."
  },
  {
    question: "Can I become a tutor?",
    answer: "Yes! If you have expertise in any skill, you can become a tutor. Complete your profile, list your teaching skills, set your rates, and start connecting with learners."
  },
  {
    question: "What happens if a session is canceled?",
    answer: "If a session is canceled before it starts, the tokens are automatically refunded to the learner. Our smart contracts handle this process securely."
  },
  {
    question: "How are tutors verified?",
    answer: "Tutors build reputation through successful sessions and reviews. Each completed session and NFT certificate adds to their verifiable on-chain history."
  },
  {
    question: "What types of skills can I learn?",
    answer: "SkillLoop supports learning across various domains, with a focus on Web3, blockchain, and technical skills. However, tutors can offer expertise in any subject area."
  }
];

export default function FAQPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Find answers to common questions about SkillLoop
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="text-center pt-8">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <a 
            href="mailto:support@skillloop.xyz"
            className="text-primary hover:underline"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
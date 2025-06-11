"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, CheckCircle, ArrowRight } from "lucide-react";

export default function BecomeTutorPage() {
  const router = useRouter();
  const { isConnected, account } = useWeb3();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    experience: "",
    expertise: "",
    portfolio: "",
    motivation: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to apply as a tutor.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.experience || !formData.expertise) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // In a real application, this would submit to an API endpoint
      // For now, we'll simulate the process and redirect to profile

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      toast({
        title: "Application submitted!",
        description:
          "Your tutor application has been received. You can now add teaching skills to your profile.",
      });

      // Redirect to profile page where they can add skills
      router.push("/profile");
    } catch (error) {
      console.error("Error submitting tutor application:", error);
      toast({
        title: "Submission failed",
        description:
          "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Become a Tutor</h1>
            <p className="text-muted-foreground">
              Share your knowledge and earn tokens by teaching others on
              SkillLoop.
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>
                  Make sure you meet these requirements before applying
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    "Connect your Web3 wallet",
                    "Complete your profile information",
                    "Add at least one teaching skill",
                    "Set competitive hourly rates (5-20 SKL)",
                  ].map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tutor Application</CardTitle>
                <CardDescription>
                  Tell us about your teaching experience and expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Teaching Experience *
                    </label>
                    <Textarea
                      placeholder="Describe your teaching experience, methodology, and approach to helping students learn..."
                      rows={4}
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Expertise Areas *
                    </label>
                    <Input
                      placeholder="e.g., Solidity, Web3 Development, DeFi, Smart Contracts"
                      value={formData.expertise}
                      onChange={(e) =>
                        handleInputChange("expertise", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Portfolio/Links
                    </label>
                    <Input
                      placeholder="Links to your work, GitHub, LinkedIn, personal website, etc."
                      value={formData.portfolio}
                      onChange={(e) =>
                        handleInputChange("portfolio", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Why do you want to teach?
                    </label>
                    <Textarea
                      placeholder="Share your motivation for teaching and how you plan to help students succeed..."
                      rows={3}
                      value={formData.motivation}
                      onChange={(e) =>
                        handleInputChange("motivation", e.target.value)
                      }
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Next Steps
                    </h4>
                    <p className="text-sm text-blue-700">
                      After submitting this application, you'll be redirected to
                      your profile where you can:
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Add specific skills you want to teach</li>
                      <li>• Set your hourly rates for each skill</li>
                      <li>• Complete your bio and upload a profile picture</li>
                      <li>• Start receiving session requests from students</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!isConnected || loading}
                  >
                    {!isConnected ? (
                      "Connect Wallet to Apply"
                    ) : loading ? (
                      "Submitting Application..."
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earning Potential</CardTitle>
                <CardDescription>
                  See how much you could earn as a SkillLoop tutor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      5-20 SKL
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Per Hour
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">100%</div>
                    <div className="text-sm text-muted-foreground">
                      You Keep
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      Instant
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Payments
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Payments are automatically released upon session completion
                  through smart contracts
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

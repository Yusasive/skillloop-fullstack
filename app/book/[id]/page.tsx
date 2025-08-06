"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/app/types";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, ArrowLeft, Coins } from "lucide-react";

interface BookSessionPageProps {
  params: { id: string };
}

export default function BookSessionPage({ params }: BookSessionPageProps) {
  const router = useRouter();
  const { account, isConnected, tokenBalance, refreshTokenBalance } = useWeb3();
  const { toast } = useToast();
  const [tutor, setTutor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Form state
  const [selectedSkill, setSelectedSkill] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");
  const [tokenAmount, setTokenAmount] = useState(0);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setTutor(data.user);

          // Set default skill if tutor has skills
          if (data.user.skills && data.user.skills.length > 0) {
            setSelectedSkill(data.user.skills[0].name);
            // Set default rate if available
            const skill = data.user.skills[0];
            if (skill.hourlyRate) {
              const calculatedAmount =
                (skill.hourlyRate * parseInt(duration)) / 60;
              setTokenAmount(calculatedAmount);
            }
          }
        } else {
          toast({
            title: "Tutor not found",
            description: "The tutor you're looking for doesn't exist.",
            variant: "destructive",
          });
          router.push("/tutors");
        }
      } catch (error) {
        console.error("Error fetching tutor:", error);
        toast({
          title: "Error",
          description: "Failed to load tutor information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [params.id, router, toast, duration]);

  const handleSkillChange = (skillName: string) => {
    setSelectedSkill(skillName);

    // Update token amount based on skill's hourly rate
    const skill = tutor?.skills.find((s) => s.name === skillName);
    if (skill?.hourlyRate) {
      const calculatedAmount = (skill.hourlyRate * parseInt(duration)) / 60;
      setTokenAmount(calculatedAmount);
    }
  };

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration);

    // Recalculate token amount
    const skill = tutor?.skills.find((s) => s.name === selectedSkill);
    if (skill?.hourlyRate) {
      const calculatedAmount = (skill.hourlyRate * parseInt(newDuration)) / 60;
      setTokenAmount(calculatedAmount);
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to book a session.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSkill || !sessionDate || !sessionTime || !description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has sufficient balance
    if (tokenBalance < tokenAmount) {
      toast({
        title: "Insufficient balance",
        description: `You need ${tokenAmount.toFixed(1)} SKL tokens but only have ${tokenBalance.toFixed(1)} SKL.`,
        variant: "destructive",
      });
      return;
    }

    setBooking(true);

    try {
      // Combine date and time
      const startDateTime = new Date(`${sessionDate}T${sessionTime}`);
      const endDateTime = new Date(
        startDateTime.getTime() + parseInt(duration) * 60000
      );

      // Create session
      const sessionData = {
        tutorAddress: tutor?.address,
        learnerAddress: account,
        skillName: selectedSkill,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: parseInt(duration),
        tokenAmount,
        description,
      };

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (res.ok) {
        const data = await res.json();

        // Refresh token balance after booking
        await refreshTokenBalance();

        toast({
          title: "Session booked successfully!",
          description: `${tokenAmount.toFixed(1)} SKL tokens have been deducted and held in escrow.`,
        });

        router.push("/sessions");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to book session");
      }
    } catch (error: any) {
      console.error("Error booking session:", error);
      toast({
        title: "Booking failed",
        description:
          error.message || "Failed to book the session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tutor information...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Tutor Not Found</CardTitle>
            <CardDescription>
              The tutor you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/tutors")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tutors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Tutor Information */}
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={tutor.avatar || ""}
                    alt={tutor.username || "Tutor"}
                  />
                  <AvatarFallback className="text-lg">
                    {tutor.username
                      ? tutor.username.charAt(0).toUpperCase()
                      : "T"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {tutor.username || "Unnamed Tutor"}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{tutor.rating.toFixed(1)}</span>
                    <span className="mx-1">•</span>
                    <span>{tutor.sessionsCompleted} sessions</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tutor.bio && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-sm text-muted-foreground">{tutor.bio}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Teaching Skills</h4>
                <div className="space-y-2">
                  {tutor.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <span className="font-medium">{skill.name}</span>
                        <p className="text-xs text-muted-foreground capitalize">
                          {skill.level}
                        </p>
                      </div>
                      {skill.hourlyRate && (
                        <Badge variant="outline">
                          {skill.hourlyRate} SKL/hr
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Book a Learning Session</CardTitle>
              <CardDescription>
                Schedule a one-on-one learning session with {tutor.username}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookSession} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Skill to Learn
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={selectedSkill}
                      onChange={(e) => handleSkillChange(e.target.value)}
                      required
                    >
                      <option value="">Select a skill</option>
                      {tutor.skills.map((skill, index) => (
                        <option key={index} value={skill.name}>
                          {skill.name}{" "}
                          {skill.hourlyRate && `(${skill.hourlyRate} SKL/hr)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Duration (minutes)
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      required
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Goals</label>
                  <Textarea
                    placeholder="Describe what you want to learn in this session..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Session Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Skill:</span>{" "}
                      {selectedSkill || "Not selected"}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {sessionDate
                        ? new Date(sessionDate).toLocaleDateString()
                        : "Not selected"}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{" "}
                      {sessionTime || "Not selected"}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span> {duration}{" "}
                      minutes
                    </p>
                    <p>
                      <span className="font-medium">Cost:</span>{" "}
                      {tokenAmount.toFixed(1)} SKL tokens
                    </p>
                    <p>
                      <span className="font-medium">Your Balance:</span>{" "}
                      {tokenBalance.toFixed(1)} SKL tokens
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !isConnected || booking || tokenBalance < tokenAmount
                  }
                >
                  {!isConnected
                    ? "Connect Wallet to Book"
                    : tokenBalance < tokenAmount
                      ? "Insufficient SKL Balance"
                      : booking
                        ? "Booking Session..."
                        : `Book Session (${tokenAmount.toFixed(1)} SKL)`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

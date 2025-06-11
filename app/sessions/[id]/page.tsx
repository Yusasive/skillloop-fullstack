"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session, User, SessionProgress, Milestone } from "@/app/types";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Coins,
  User as UserIcon,
  ExternalLink,
  Award,
  AlertTriangle,
  Play,
  Pause,
  Target,
  BookOpen,
  Video,
  Users,
  Star,
  ArrowLeft,
} from "lucide-react";

interface SessionDetailPageProps {
  params: { id: string };
}

export default function SessionDetailPage({ params }: SessionDetailPageProps) {
  const router = useRouter();
  const { account, user } = useWeb3();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Progress tracking state
  const [sessionNotes, setSessionNotes] = useState("");
  const [learnerEngagement, setLearnerEngagement] = useState(5);
  const [finalNotes, setFinalNotes] = useState("");
  const [milestoneNotes, setMilestoneNotes] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const res = await fetch(`/api/sessions/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);

          // Fetch user details
          const userAddresses = [
            data.session.tutorAddress,
            data.session.learnerAddress,
          ].filter(Boolean);
          
          const userPromises = userAddresses.map(async (address) => {
            try {
              const userRes = await fetch(`/api/users/${address}`);
              if (userRes.ok) {
                const userData = await userRes.json();
                return { address, user: userData.user };
              }
            } catch (error) {
              console.error(`Error fetching user ${address}:`, error);
            }
            return null;
          });

          const userResults = await Promise.all(userPromises);
          const usersMap: { [key: string]: User } = {};
          userResults.forEach((result) => {
            if (result) {
              usersMap[result.address] = result.user;
            }
          });
          setUsers(usersMap);

          // Set initial notes if they exist
          if (data.session.sessionNotes) {
            setSessionNotes(data.session.sessionNotes);
          }
        } else {
          toast({
            title: "Session not found",
            description: "The session you're looking for doesn't exist.",
            variant: "destructive",
          });
          router.push("/sessions");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast({
          title: "Error",
          description: "Failed to load session details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSessionDetails();
    }
  }, [params.id, router, toast]);

  const isTutor = session?.tutorAddress === account;
  const isLearner = session?.learnerAddress === account;
  const otherParticipant = isTutor
    ? users[session?.learnerAddress || ""]
    : users[session?.tutorAddress || ""];

  const handleProgressAction = async (action: string, additionalData?: any) => {
    if (!session) return;

    setActionLoading(action);

    try {
      const res = await fetch(`/api/sessions/${session.id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          userAddress: account,
          sessionNotes,
          learnerEngagement,
          ...additionalData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);

        toast({
          title: "Success!",
          description: data.message,
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error(`Error with ${action}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action.replace("_", " ")}.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMilestoneUpdate = async (
    milestoneId: string,
    completed: boolean
  ) => {
    await handleProgressAction("update_milestone", {
      milestoneUpdate: {
        milestoneId,
        completed,
        notes: milestoneNotes[milestoneId] || "",
      },
    });
  };

  const handleCompleteSession = async () => {
    if (!session?.progressTracking?.canComplete) {
      toast({
        title: "Cannot complete session",
        description:
          "Session progress must be at least 70% to mark as complete.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading("complete");

    try {
      const res = await fetch(`/api/sessions/${session.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completedBy: account,
          finalNotes,
          learnerEngagement,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);

        toast({
          title: "Session completed!",
          description: data.message,
        });

        router.push("/sessions");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error("Error completing session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete session.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "in-progress":
        return "bg-blue-500/10 text-blue-500";
      case "confirmed":
        return "bg-blue-500/10 text-blue-500";
      case "requested":
        return "bg-yellow-500/10 text-yellow-500";
      case "rejected":
        return "bg-red-500/10 text-red-500";
      case "canceled":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-yellow-500/10 text-yellow-500";
    }
  };

  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/sessions")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{session.skillName} Session</h1>
            <p className="text-muted-foreground">
              {isTutor ? "Teaching" : "Learning"} with{" "}
              {otherParticipant?.username || "Unknown User"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Session Overview */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Session Details
                <Badge className={getStatusColor(session.status)}>
                  {session.status.charAt(0).toUpperCase() +
                    session.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(session.startTime)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(session.startTime)} -{" "}
                  {formatTime(session.endTime)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span>{session.tokenAmount} SKL</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {isTutor ? "Student" : "Tutor"}:{" "}
                  {otherParticipant?.username || "Unknown"}
                </span>
              </div>

              {session.meetingLink && (
                <div className="pt-4">
                  <Button className="w-full" asChild>
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Join Meeting
                    </a>
                  </Button>
                </div>
              )}

              {/* Progress Overview */}
              {session.progressTracking && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Progress Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{session.progressTracking.overallProgress}%</span>
                    </div>
                    <Progress
                      value={session.progressTracking.overallProgress}
                      className="h-2"
                    />

                    <div className="flex justify-between text-sm">
                      <span>Time Spent</span>
                      <span>{session.progressTracking.timeSpent} min</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Attendance</span>
                      <span
                        className={
                          session.progressTracking.attendanceVerified
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {session.progressTracking.attendanceVerified
                          ? "Verified"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="progress">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="objectives">Objectives</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Session Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {session.status === "confirmed" && isTutor && (
                      <div className="mb-6">
                        <Button
                          onClick={() => handleProgressAction("start_session")}
                          disabled={actionLoading === "start_session"}
                          className="w-full"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {actionLoading === "start_session"
                            ? "Starting..."
                            : "Start Session"}
                        </Button>
                      </div>
                    )}

                    {session.progressTracking?.milestones ? (
                      <div className="space-y-4">
                        {session.progressTracking.milestones.map(
                          (milestone: Milestone, index: number) => (
                            <div
                              key={milestone.id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                      milestone.completed
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-200 text-gray-600"
                                    }`}
                                  >
                                    {milestone.completed ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      index + 1
                                    )}
                                  </div>
                                  <h4 className="font-medium">
                                    {milestone.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {milestone.targetTime} min
                                  </span>
                                  {isTutor &&
                                    session.status === "in-progress" && (
                                      <Button
                                        size="sm"
                                        variant={
                                          milestone.completed
                                            ? "outline"
                                            : "default"
                                        }
                                        onClick={() =>
                                          handleMilestoneUpdate(
                                            milestone.id,
                                            !milestone.completed
                                          )
                                        }
                                        disabled={
                                          actionLoading === "update_milestone"
                                        }
                                      >
                                        {milestone.completed
                                          ? "Undo"
                                          : "Complete"}
                                      </Button>
                                    )}
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mb-2">
                                {milestone.description}
                              </p>

                              {milestone.completed && milestone.completedAt && (
                                <p className="text-xs text-green-600">
                                  Completed at{" "}
                                  {new Date(
                                    milestone.completedAt
                                  ).toLocaleTimeString()}
                                </p>
                              )}

                              {isTutor && session.status === "in-progress" && (
                                <div className="mt-2">
                                  <Input
                                    placeholder="Add notes for this milestone..."
                                    value={milestoneNotes[milestone.id] || ""}
                                    onChange={(e) =>
                                      setMilestoneNotes((prev) => ({
                                        ...prev,
                                        [milestone.id]: e.target.value,
                                      }))
                                    }
                                    className="text-xs"
                                  />
                                </div>
                              )}

                              {milestone.notes && (
                                <div className="mt-2 p-2 bg-muted rounded text-xs">
                                  <strong>Notes:</strong> {milestone.notes}
                                </div>
                              )}
                            </div>
                          )
                        )}

                        {session.status === "in-progress" && isTutor && (
                          <div className="flex gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleProgressAction("end_session")
                              }
                              disabled={actionLoading === "end_session"}
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              {actionLoading === "end_session"
                                ? "Ending..."
                                : "End Session"}
                            </Button>

                            {session.progressTracking.canComplete && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Complete
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Complete Session</DialogTitle>
                                    <DialogDescription>
                                      Mark this session as completed. Progress:{" "}
                                      {session.progressTracking.overallProgress}
                                      %
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">
                                        Learner Engagement (1-5)
                                      </label>
                                      <div className="flex items-center gap-2">
                                        {Array.from({ length: 5 }).map(
                                          (_, i) => (
                                            <button
                                              key={i}
                                              type="button"
                                              onClick={() =>
                                                setLearnerEngagement(i + 1)
                                              }
                                              className="focus:outline-none"
                                            >
                                              <Star
                                                className={`h-5 w-5 ${i < learnerEngagement ? "text-yellow-500 fill-yellow-500" : "text-muted hover:text-yellow-400"}`}
                                              />
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">
                                        Final Notes
                                      </label>
                                      <Textarea
                                        placeholder="Summary of what was accomplished and next steps..."
                                        value={finalNotes}
                                        onChange={(e) =>
                                          setFinalNotes(e.target.value)
                                        }
                                        rows={4}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={handleCompleteSession}
                                      disabled={actionLoading === "complete"}
                                    >
                                      {actionLoading === "complete"
                                        ? "Completing..."
                                        : "Complete Session"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {session.status === "confirmed"
                          ? "Session hasn't started yet. Tutor can start the session to begin progress tracking."
                          : "Progress tracking will be available once the session starts."}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="objectives" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Learning Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {session.learningObjectives &&
                    session.learningObjectives.length > 0 ? (
                      <div className="space-y-3">
                        {session.learningObjectives.map((objective, index) => {
                          const isAchieved =
                            session.progressTracking?.objectivesAchieved?.includes(
                              objective
                            );

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 border rounded-lg"
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  isAchieved
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {isAchieved ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <span
                                className={
                                  isAchieved
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }
                              >
                                {objective}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Learning objectives will be set when the session starts.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isTutor ? (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Add notes about the session progress, student performance, areas to focus on..."
                          value={sessionNotes}
                          onChange={(e) => setSessionNotes(e.target.value)}
                          rows={6}
                        />
                        <Button
                          onClick={() =>
                            handleProgressAction("add_session_notes")
                          }
                          disabled={actionLoading === "add_session_notes"}
                        >
                          {actionLoading === "add_session_notes"
                            ? "Saving..."
                            : "Save Notes"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {session.sessionNotes ? (
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Tutor's Notes:</h4>
                            <p className="text-sm whitespace-pre-wrap">
                              {session.sessionNotes}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No session notes available yet.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
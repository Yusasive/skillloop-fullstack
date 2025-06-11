"use client";

import { useState, useEffect } from "react";
import { Session, User, Review } from "@/app/types";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Star,
} from "lucide-react";
import Link from "next/link";

export default function SessionsPage() {
  const { account, refreshTokenBalance, user } = useWeb3();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [reviews, setReviews] = useState<{ [key: string]: Review[] }>({});

  // Approval/Rejection state
  const [meetingLink, setMeetingLink] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewingSession, setReviewingSession] = useState<Session | null>(
    null
  );

  useEffect(() => {
    const fetchSessions = async () => {
      if (!account) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/sessions?userId=${account}`);
        if (res.ok) {
          const data = await res.json();
          const sessionsList = data.sessions || [];
          setSessions(sessionsList);

          // Fetch user details for each session
          const userAddresses = new Set<string>();
          sessionsList.forEach((session: Session) => {
            if (session.tutorAddress) userAddresses.add(session.tutorAddress);
            if (session.learnerAddress)
              userAddresses.add(session.learnerAddress);
          });

          // Fetch user details
          const userPromises = Array.from(userAddresses).map(
            async (address) => {
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
            }
          );

          const userResults = await Promise.all(userPromises);
          const usersMap: { [key: string]: User } = {};
          userResults.forEach((result) => {
            if (result) {
              usersMap[result.address] = result.user;
            }
          });
          setUsers(usersMap);

          // Fetch reviews for completed sessions
          const reviewPromises = sessionsList
            .filter((session: Session) => session.status === "completed")
            .map(async (session: Session) => {
              try {
                const reviewRes = await fetch(
                  `/api/sessions/${session.id}/review`
                );
                if (reviewRes.ok) {
                  const reviewData = await reviewRes.json();
                  return { sessionId: session.id, reviews: reviewData.reviews };
                }
              } catch (error) {
                console.error(
                  `Error fetching reviews for session ${session.id}:`,
                  error
                );
              }
              return null;
            });

          const reviewResults = await Promise.all(reviewPromises);
          const reviewsMap: { [key: string]: Review[] } = {};
          reviewResults.forEach((result) => {
            if (result) {
              reviewsMap[result.sessionId] = result.reviews;
            }
          });
          setReviews(reviewsMap);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load sessions.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [account, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500";
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

  const getOtherParticipant = (session: Session) => {
    const isLearner = session.learnerAddress === account;
    const otherAddress = isLearner
      ? session.tutorAddress
      : session.learnerAddress;
    const otherUser = otherAddress ? users[otherAddress] : null;
    const role = isLearner ? "Tutor" : "Student";

    return {
      address: otherAddress,
      user: otherUser,
      role: role,
    };
  };

  const isTutor = (session: Session) => {
    return session.tutorAddress === account;
  };

  const handleApproveSession = async (sessionId: string) => {
    setActionLoading(sessionId);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approvedBy: account,
          meetingLink: meetingLink || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Update sessions list
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  status: "confirmed",
                  meetingLink: meetingLink || undefined,
                }
              : session
          )
        );

        setMeetingLink("");
        setSelectedSession(null);

        toast({
          title: "Session approved!",
          description: data.message,
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error("Error approving session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve session.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSession = async (sessionId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejecting the session.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(sessionId);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rejectedBy: account,
          reason: rejectionReason,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Update sessions list
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? { ...session, status: "rejected", rejectionReason }
              : session
          )
        );

        // Refresh token balance
        await refreshTokenBalance();

        setRejectionReason("");
        setSelectedSession(null);

        toast({
          title: "Session rejected",
          description: data.message,
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error("Error rejecting session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject session.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!cancellationReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for canceling the session.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(sessionId);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          canceledBy: account,
          reason: cancellationReason,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Update sessions list
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? { ...session, status: "canceled", cancellationReason }
              : session
          )
        );

        // Refresh token balance
        await refreshTokenBalance();

        setCancellationReason("");
        setSelectedSession(null);

        toast({
          title: "Session canceled",
          description: data.message,
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error("Error canceling session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel session.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitReview = async (sessionId: string) => {
    if (!reviewComment.trim()) {
      toast({
        title: "Review required",
        description: "Please provide a comment for your review.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(`review-${sessionId}`);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerAddress: account,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Update reviews
        setReviews((prev) => ({
          ...prev,
          [sessionId]: [...(prev[sessionId] || []), data.review],
        }));

        // Reset form
        setReviewRating(5);
        setReviewComment("");
        setReviewingSession(null);

        toast({
          title: "Review submitted!",
          description: data.message,
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const hasUserReviewed = (sessionId: string) => {
    const sessionReviews = reviews[sessionId] || [];
    return sessionReviews.some((review) => {
      const reviewerUser = Object.values(users).find(
        (u) => u.id === review.reviewerId
      );
      return reviewerUser?.address === account;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">My Sessions</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage your learning sessions and track your progress.
            </p>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="canceled">Canceled/Rejected</TabsTrigger>
            </TabsList>

            {["pending", "upcoming", "completed", "canceled"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6">
                <div className="grid gap-6">
                  {sessions
                    .filter((session) => {
                      if (tab === "pending") {
                        return session.status === "requested";
                      } else if (tab === "upcoming") {
                        return (
                          session.status === "confirmed" ||
                          session.status === "in-progress"
                        );
                      } else if (tab === "completed") {
                        return session.status === "completed";
                      } else if (tab === "canceled") {
                        return (
                          session.status === "canceled" ||
                          session.status === "rejected"
                        );
                      }
                      return false;
                    })
                    .map((session) => {
                      const otherParticipant = getOtherParticipant(session);
                      const isSessionTutor = isTutor(session);
                      const sessionReviews = reviews[session.id] || [];
                      const userHasReviewed = hasUserReviewed(session.id);

                      return (
                        <Card
                          key={session.id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl">
                                {session.skillName}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getStatusColor(session.status)}
                                >
                                  {session.status.charAt(0).toUpperCase() +
                                    session.status.slice(1)}
                                </Badge>
                                {isSessionTutor && (
                                  <Badge variant="outline">Tutor</Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(session.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {formatTime(session.startTime)} -{" "}
                                    {formatTime(session.endTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Coins className="h-4 w-4 text-muted-foreground" />
                                  <span>{session.tokenAmount} SKL</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {otherParticipant.role}:
                                </span>
                                <span>
                                  {otherParticipant.user?.username ||
                                    (otherParticipant.address
                                      ? `${otherParticipant.address.slice(0, 6)}...${otherParticipant.address.slice(-4)}`
                                      : "Unknown")}
                                </span>
                              </div>

                              <div className="text-sm text-muted-foreground">
                                {session.description}
                              </div>

                              {session.rejectionReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-sm font-medium text-red-800">
                                    Rejection Reason:
                                  </p>
                                  <p className="text-sm text-red-700">
                                    {session.rejectionReason}
                                  </p>
                                </div>
                              )}

                              {session.cancellationReason && (
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                  <p className="text-sm font-medium text-orange-800">
                                    Cancellation Reason:
                                  </p>
                                  <p className="text-sm text-orange-700">
                                    {session.cancellationReason}
                                  </p>
                                </div>
                              )}

                              {session.meetingLink && (
                                <div className="flex items-center gap-2 text-sm">
                                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                  <a
                                    href={session.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Join Meeting
                                  </a>
                                </div>
                              )}

                              {/* Reviews Section for Completed Sessions */}
                              {session.status === "completed" &&
                                sessionReviews.length > 0 && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">
                                      Reviews:
                                    </h4>
                                    <div className="space-y-3">
                                      {sessionReviews.map((review) => {
                                        const reviewerUser = Object.values(
                                          users
                                        ).find(
                                          (u) => u.id === review.reviewerId
                                        );
                                        const targetUser = Object.values(
                                          users
                                        ).find((u) => u.id === review.targetId);

                                        return (
                                          <div
                                            key={review.id}
                                            className="p-3 bg-muted/50 rounded-lg"
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-sm font-medium">
                                                {reviewerUser?.username ||
                                                  "Anonymous"}{" "}
                                                →{" "}
                                                {targetUser?.username ||
                                                  "Anonymous"}
                                              </span>
                                              <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map(
                                                  (_, i) => (
                                                    <Star
                                                      key={i}
                                                      className={`h-3 w-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                                                    />
                                                  )
                                                )}
                                              </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                              {review.comment}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <span className="font-medium">Duration:</span>{" "}
                                  {session.duration} minutes
                                </div>
                                <div className="flex gap-2">
                                  {/* Pending approval actions for tutors */}
                                  {session.status === "requested" &&
                                    isSessionTutor && (
                                      <>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              size="sm"
                                              onClick={() =>
                                                setSelectedSession(session)
                                              }
                                            >
                                              Approve
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>
                                                Approve Session
                                              </DialogTitle>
                                              <DialogDescription>
                                                Approve this {session.skillName}{" "}
                                                session with{" "}
                                                {otherParticipant.user
                                                  ?.username || "the student"}
                                                .
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                  Meeting Link (Optional)
                                                </label>
                                                <Input
                                                  placeholder="https://meet.google.com/..."
                                                  value={meetingLink}
                                                  onChange={(e) =>
                                                    setMeetingLink(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button
                                                onClick={() =>
                                                  handleApproveSession(
                                                    session.id
                                                  )
                                                }
                                                disabled={
                                                  actionLoading === session.id
                                                }
                                              >
                                                {actionLoading === session.id
                                                  ? "Approving..."
                                                  : "Approve Session"}
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                setSelectedSession(session)
                                              }
                                            >
                                              Reject
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>
                                                Reject Session
                                              </DialogTitle>
                                              <DialogDescription>
                                                Please provide a reason for
                                                rejecting this session. The
                                                student will be refunded.
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                  Reason for rejection
                                                </label>
                                                <Textarea
                                                  placeholder="Please explain why you cannot take this session..."
                                                  value={rejectionReason}
                                                  onChange={(e) =>
                                                    setRejectionReason(
                                                      e.target.value
                                                    )
                                                  }
                                                  rows={3}
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button
                                                variant="destructive"
                                                onClick={() =>
                                                  handleRejectSession(
                                                    session.id
                                                  )
                                                }
                                                disabled={
                                                  actionLoading ===
                                                    session.id ||
                                                  !rejectionReason.trim()
                                                }
                                              >
                                                {actionLoading === session.id
                                                  ? "Rejecting..."
                                                  : "Reject Session"}
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </>
                                    )}

                                  {/* Confirmed session actions */}
                                  {(session.status === "confirmed" ||
                                    session.status === "in-progress") && (
                                    <>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              setSelectedSession(session)
                                            }
                                          >
                                            Cancel
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>
                                              Cancel Session
                                            </DialogTitle>
                                            <DialogDescription>
                                              Please provide a reason for
                                              canceling this session. The
                                              learner will be refunded.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">
                                                Reason for cancellation
                                              </label>
                                              <Textarea
                                                placeholder="Please explain why you need to cancel this session..."
                                                value={cancellationReason}
                                                onChange={(e) =>
                                                  setCancellationReason(
                                                    e.target.value
                                                  )
                                                }
                                                rows={3}
                                              />
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button
                                              variant="destructive"
                                              onClick={() =>
                                                handleCancelSession(session.id)
                                              }
                                              disabled={
                                                actionLoading === session.id ||
                                                !cancellationReason.trim()
                                              }
                                            >
                                              {actionLoading === session.id
                                                ? "Canceling..."
                                                : "Cancel Session"}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>

                                      <Button size="sm" asChild>
                                        <Link href={`/sessions/${session.id}`}>
                                          View Details
                                        </Link>
                                      </Button>
                                    </>
                                  )}

                                  {/* Completed session actions */}
                                  {session.status === "completed" && (
                                    <div className="flex gap-2">
                                      <Button size="sm" asChild>
                                        <Link href={`/certificates`}>
                                          <Award className="mr-2 h-4 w-4" />
                                          View Certificates
                                        </Link>
                                      </Button>

                                      {/* Review button */}
                                      {!userHasReviewed && (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                setReviewingSession(session)
                                              }
                                            >
                                              <Star className="mr-2 h-4 w-4" />
                                              Leave Review
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>
                                                Rate Your Experience
                                              </DialogTitle>
                                              <DialogDescription>
                                                Share your feedback about this
                                                session with{" "}
                                                {otherParticipant.user
                                                  ?.username ||
                                                  "your learning partner"}
                                                .
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                  Rating
                                                </label>
                                                <div className="flex items-center gap-2">
                                                  {Array.from({
                                                    length: 5,
                                                  }).map((_, i) => (
                                                    <button
                                                      key={i}
                                                      type="button"
                                                      onClick={() =>
                                                        setReviewRating(i + 1)
                                                      }
                                                      className="focus:outline-none"
                                                    >
                                                      <Star
                                                        className={`h-6 w-6 ${i < reviewRating ? "text-yellow-500 fill-yellow-500" : "text-muted hover:text-yellow-400"}`}
                                                      />
                                                    </button>
                                                  ))}
                                                  <span className="ml-2 text-sm text-muted-foreground">
                                                    {reviewRating} star
                                                    {reviewRating !== 1
                                                      ? "s"
                                                      : ""}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                  Comment
                                                </label>
                                                <Textarea
                                                  placeholder="Share your experience and feedback..."
                                                  value={reviewComment}
                                                  onChange={(e) =>
                                                    setReviewComment(
                                                      e.target.value
                                                    )
                                                  }
                                                  rows={4}
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button
                                                onClick={() =>
                                                  handleSubmitReview(session.id)
                                                }
                                                disabled={
                                                  actionLoading ===
                                                    `review-${session.id}` ||
                                                  !reviewComment.trim()
                                                }
                                              >
                                                {actionLoading ===
                                                `review-${session.id}`
                                                  ? "Submitting..."
                                                  : "Submit Review"}
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                  {sessions.filter((s) => {
                    if (tab === "pending") return s.status === "requested";
                    if (tab === "upcoming")
                      return (
                        s.status === "confirmed" || s.status === "in-progress"
                      );
                    if (tab === "completed") return s.status === "completed";
                    if (tab === "canceled")
                      return s.status === "canceled" || s.status === "rejected";
                    return false;
                  }).length === 0 && (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                      <div className="mb-4">
                        {tab === "pending" ? (
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                        ) : tab === "upcoming" ? (
                          <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                        ) : tab === "completed" ? (
                          <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                        ) : (
                          <XCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        No {tab} sessions found
                      </p>
                      {tab === "upcoming" && (
                        <Button className="mt-4" asChild>
                          <Link href="/tutors">Find a Tutor</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { LearningRequest, Bid, User } from "@/app/types";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Coins,
  User as UserIcon,
  Plus,
  MessageSquare,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function LearningRequestsPage() {
  const {
    account,
    user,
    refreshTokenBalance,
    isLoading,
    isConnected,
    connectWallet,
  } = useWeb3();
  const { toast } = useToast();
  const [learningRequests, setLearningRequests] = useState<LearningRequest[]>(
    []
  );
  const [myRequests, setMyRequests] = useState<LearningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  // Form state for creating new learning request
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDuration, setPreferredDuration] = useState("60");
  const [maxBudget, setMaxBudget] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("Flexible");

  // Bidding state
  const [selectedRequest, setSelectedRequest] =
    useState<LearningRequest | null>(null);
  const [proposedRate, setProposedRate] = useState("");
  const [proposedDuration, setProposedDuration] = useState("60");
  const [bidMessage, setBidMessage] = useState("");
  const [availableSlots, setAvailableSlots] = useState("");

  // Acceptance state
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Wait for Web3 context to finish loading
      if (isLoading) return;

      try {
        let allRequestsData: any = { learningRequests: [] };
        let myRequestsData: any = { learningRequests: [] };

        // Fetch all open learning requests (public data)
        const allRequestsRes = await fetch(
          "/api/learning-requests?status=open"
        );
        if (allRequestsRes.ok) {
          allRequestsData = await allRequestsRes.json();
          setLearningRequests(allRequestsData.learningRequests || []);
        }

        // Only fetch user-specific data if connected and user exists
        if (isConnected && account && user) {
          // Fetch user's own learning requests
          const myRequestsRes = await fetch(
            `/api/learning-requests?userId=${user.id}`
          );
          if (myRequestsRes.ok) {
            myRequestsData = await myRequestsRes.json();
            setMyRequests(myRequestsData.learningRequests || []);
          }
        }

        // Fetch user details for all requests
        const allRequests = [
          ...(allRequestsData.learningRequests || []),
          ...(myRequestsData.learningRequests || []),
        ];
        const userIds = new Set<string>();

        allRequests.forEach((request: LearningRequest) => {
          userIds.add(request.userId);
          request.bids.forEach((bid: Bid) => {
            if (bid.tutorAddress) userIds.add(bid.tutorAddress);
          });
        });

        // Fetch user details
        const userPromises = Array.from(userIds).map(async (userId) => {
          try {
            const userRes = await fetch(`/api/users/${userId}`);
            if (userRes.ok) {
              const userData = await userRes.json();
              return { id: userId, user: userData.user };
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
          return null;
        });

        const userResults = await Promise.all(userPromises);
        const usersMap: { [key: string]: User } = {};
        userResults.forEach((result) => {
          if (result) {
            usersMap[result.id] = result.user;
          }
        });
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching learning requests:", error);
        toast({
          title: "Error",
          description: "Failed to load learning requests.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [account, user, toast, isLoading, isConnected]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication state properly
    if (!isConnected || !account || !user) {
      toast({
        title: "Authentication required",
        description: "Please connect your wallet to create a learning request.",
        variant: "destructive",
      });
      return;
    }

    if (!skillName || !description || !maxBudget) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading("create");

    try {
      const res = await fetch("/api/learning-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: account,
          skillName,
          description,
          preferredDuration: parseInt(preferredDuration),
          maxBudget: parseFloat(maxBudget),
          preferredSchedule,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMyRequests((prev) => [data.learningRequest, ...prev]);

        // Reset form
        setSkillName("");
        setDescription("");
        setPreferredDuration("60");
        setMaxBudget("");
        setPreferredSchedule("Flexible");

        toast({
          title: "Learning request created!",
          description: "Tutors can now submit bids for your request.",
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error("Error creating learning request:", error);
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create learning request.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitBid = async (requestId: string) => {
    if (!account || !user) {
      toast({
        title: "Authentication required",
        description: "Please connect your wallet to submit a bid.",
        variant: "destructive",
      });
      return;
    }

    if (!proposedRate || !bidMessage) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(requestId);

    try {
      const res = await fetch(`/api/learning-requests/${requestId}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorAddress: account,
          proposedRate: parseFloat(proposedRate),
          proposedDuration: parseInt(proposedDuration),
          message: bidMessage,
          availableSlots: availableSlots
            .split("\n")
            .filter((slot) => slot.trim()),
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Update learning requests list
        setLearningRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? { ...request, bids: [...request.bids, data.bid] }
              : request
          )
        );

        // Reset form
        setProposedRate("");
        setProposedDuration("60");
        setBidMessage("");
        setAvailableSlots("");
        setSelectedRequest(null);

        toast({
          title: "Bid submitted!",
          description: data.message,
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error("Error submitting bid:", error);
      toast({
        title: "Bid failed",
        description: error.message || "Failed to submit bid.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBidAction = async (
    requestId: string,
    bidId: string,
    action: "accept" | "reject"
  ) => {
    if (!account || !user) {
      toast({
        title: "Authentication required",
        description: "Please connect your wallet to manage bids.",
        variant: "destructive",
      });
      return;
    }

    if (action === "accept" && (!sessionDate || !sessionTime)) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for the session.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(bidId);

    try {
      const res = await fetch(
        `/api/learning-requests/${requestId}/bids/${bidId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            userAddress: account,
            sessionDate,
            sessionTime,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();

        // Update my requests list
        setMyRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  status: action === "accept" ? "in_progress" : request.status,
                  bids: request.bids.map((bid) =>
                    bid.id === bidId
                      ? {
                          ...bid,
                          status: action === "accept" ? "accepted" : "rejected",
                        }
                      : bid
                  ),
                }
              : request
          )
        );

        if (action === "accept") {
          await refreshTokenBalance();
        }

        // Reset form
        setSessionDate("");
        setSessionTime("");

        toast({
          title: action === "accept" ? "Bid accepted!" : "Bid rejected",
          description: data.message,
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error(`Error ${action}ing bid:`, error);
      toast({
        title: `${action === "accept" ? "Acceptance" : "Rejection"} failed`,
        description: error.message || `Failed to ${action} bid.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/10 text-green-500";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500";
      case "closed":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-yellow-500/10 text-yellow-500";
    }
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/10 text-green-500";
      case "rejected":
        return "bg-red-500/10 text-red-500";
      case "withdrawn":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-yellow-500/10 text-yellow-500";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading learning requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Learning Marketplace</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Post learning requests and receive bids from qualified tutors, or
              browse open requests to submit your own bids.
            </p>
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Requests</TabsTrigger>
              <TabsTrigger value="my-requests">My Requests</TabsTrigger>
              <TabsTrigger value="create">Create Request</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-6">
              <div className="grid gap-6">
                {learningRequests
                  .filter((request) => request.userId !== user?.id) // Don't show own requests
                  .map((request) => {
                    const requestUser = users[request.userId];
                    const userHasBid = request.bids.some(
                      (bid) => bid.tutorAddress === account
                    );

                    return (
                      <Card
                        key={request.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">
                              {request.skillName}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status.charAt(0).toUpperCase() +
                                  request.status.slice(1)}
                              </Badge>
                              <Badge variant="outline">
                                {request.bids.length} bid
                                {request.bids.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {requestUser?.username || "Anonymous Student"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{request.preferredDuration} minutes</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Coins className="h-4 w-4 text-muted-foreground" />
                                <span>Max: {request.maxBudget} SKL</span>
                              </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              {request.description}
                            </div>

                            <div className="text-sm">
                              <span className="font-medium">
                                Preferred Schedule:
                              </span>{" "}
                              {request.preferredSchedule}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                Posted{" "}
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </div>

                              {!userHasBid &&
                                request.status === "open" &&
                                isConnected && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          setSelectedRequest(request)
                                        }
                                      >
                                        Submit Bid
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Submit Bid for {request.skillName}
                                        </DialogTitle>
                                        <DialogDescription>
                                          Propose your rate and approach for
                                          teaching this skill.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                              Hourly Rate (SKL)
                                            </label>
                                            <Input
                                              type="number"
                                              min="5"
                                              max="20"
                                              step="0.5"
                                              placeholder="10"
                                              value={proposedRate}
                                              onChange={(e) =>
                                                setProposedRate(e.target.value)
                                              }
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                              Duration (minutes)
                                            </label>
                                            <Input
                                              type="number"
                                              min="30"
                                              max="180"
                                              step="30"
                                              value={proposedDuration}
                                              onChange={(e) =>
                                                setProposedDuration(
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <label className="text-sm font-medium">
                                            Your Pitch
                                          </label>
                                          <Textarea
                                            placeholder="Explain your approach and why you're the right tutor for this request..."
                                            value={bidMessage}
                                            onChange={(e) =>
                                              setBidMessage(e.target.value)
                                            }
                                            rows={4}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <label className="text-sm font-medium">
                                            Available Time Slots (Optional)
                                          </label>
                                          <Textarea
                                            placeholder="List your available times, one per line..."
                                            value={availableSlots}
                                            onChange={(e) =>
                                              setAvailableSlots(e.target.value)
                                            }
                                            rows={3}
                                          />
                                        </div>

                                        {proposedRate && proposedDuration && (
                                          <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-sm font-medium">
                                              Total Cost:{" "}
                                              {(
                                                (parseFloat(proposedRate) *
                                                  parseInt(proposedDuration)) /
                                                60
                                              ).toFixed(1)}{" "}
                                              SKL
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          onClick={() =>
                                            handleSubmitBid(request.id)
                                          }
                                          disabled={
                                            actionLoading === request.id
                                          }
                                        >
                                          {actionLoading === request.id
                                            ? "Submitting..."
                                            : "Submit Bid"}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}

                              {!isConnected && (
                                <Button size="sm" onClick={connectWallet}>
                                  Connect to Bid
                                </Button>
                              )}

                              {userHasBid && (
                                <Badge variant="outline">Bid Submitted</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                {learningRequests.filter(
                  (request) => request.userId !== user?.id
                ).length === 0 && (
                  <div className="text-center py-12 border rounded-lg border-dashed">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No learning requests available at the moment
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-requests" className="mt-6">
              {!isConnected ? (
                <div className="text-center py-12 border rounded-lg border-dashed">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to view your learning requests
                  </p>
                  <Button onClick={connectWallet}>Connect Wallet</Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {myRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">
                            {request.skillName}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </Badge>
                            <Badge variant="outline">
                              {request.bids.length} bid
                              {request.bids.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{request.preferredDuration} minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Coins className="h-4 w-4 text-muted-foreground" />
                              <span>Max: {request.maxBudget} SKL</span>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {request.description}
                          </div>

                          {request.bids.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium">Received Bids:</h4>
                              {request.bids.map((bid) => {
                                const bidder = users[bid.tutorAddress];

                                return (
                                  <div
                                    key={bid.id}
                                    className="border rounded-lg p-4"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage
                                            src={bidder?.avatar || ""}
                                            alt={bidder?.username || "Tutor"}
                                          />
                                          <AvatarFallback>
                                            {bidder?.username
                                              ? bidder.username
                                                  .charAt(0)
                                                  .toUpperCase()
                                              : "T"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">
                                            {bidder?.username ||
                                              "Anonymous Tutor"}
                                          </p>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                            <span>
                                              {bidder?.rating.toFixed(1) ||
                                                "0.0"}
                                            </span>
                                            <span>•</span>
                                            <span>
                                              {bidder?.sessionsCompleted || 0}{" "}
                                              sessions
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <Badge
                                          className={getBidStatusColor(
                                            bid.status
                                          )}
                                        >
                                          {bid.status.charAt(0).toUpperCase() +
                                            bid.status.slice(1)}
                                        </Badge>
                                        <p className="text-sm font-medium mt-1">
                                          {bid.totalCost.toFixed(1)} SKL
                                        </p>
                                      </div>
                                    </div>

                                    <p className="text-sm mb-3">
                                      {bid.message}
                                    </p>

                                    <div className="text-xs text-muted-foreground mb-3">
                                      Rate: {bid.proposedRate} SKL/hr •
                                      Duration: {bid.proposedDuration} min
                                    </div>

                                    {bid.status === "pending" &&
                                      request.status === "open" && (
                                        <div className="flex gap-2">
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button size="sm">
                                                Accept Bid
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>
                                                  Accept Bid & Schedule Session
                                                </DialogTitle>
                                                <DialogDescription>
                                                  Choose a date and time for
                                                  your session with{" "}
                                                  {bidder?.username ||
                                                    "this tutor"}
                                                  .
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                    <label className="text-sm font-medium">
                                                      Date
                                                    </label>
                                                    <Input
                                                      type="date"
                                                      value={sessionDate}
                                                      onChange={(e) =>
                                                        setSessionDate(
                                                          e.target.value
                                                        )
                                                      }
                                                      min={
                                                        new Date()
                                                          .toISOString()
                                                          .split("T")[0]
                                                      }
                                                    />
                                                  </div>
                                                  <div className="space-y-2">
                                                    <label className="text-sm font-medium">
                                                      Time
                                                    </label>
                                                    <Input
                                                      type="time"
                                                      value={sessionTime}
                                                      onChange={(e) =>
                                                        setSessionTime(
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>

                                                <div className="p-3 bg-muted rounded-lg">
                                                  <p className="text-sm font-medium">
                                                    Session Summary:
                                                  </p>
                                                  <p className="text-sm">
                                                    Cost:{" "}
                                                    {bid.totalCost.toFixed(1)}{" "}
                                                    SKL tokens
                                                  </p>
                                                  <p className="text-sm">
                                                    Duration:{" "}
                                                    {bid.proposedDuration}{" "}
                                                    minutes
                                                  </p>
                                                </div>
                                              </div>
                                              <DialogFooter>
                                                <Button
                                                  onClick={() =>
                                                    handleBidAction(
                                                      request.id,
                                                      bid.id,
                                                      "accept"
                                                    )
                                                  }
                                                  disabled={
                                                    actionLoading === bid.id
                                                  }
                                                >
                                                  {actionLoading === bid.id
                                                    ? "Accepting..."
                                                    : "Accept & Schedule"}
                                                </Button>
                                              </DialogFooter>
                                            </DialogContent>
                                          </Dialog>

                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleBidAction(
                                                request.id,
                                                bid.id,
                                                "reject"
                                              )
                                            }
                                            disabled={actionLoading === bid.id}
                                          >
                                            {actionLoading === bid.id
                                              ? "Rejecting..."
                                              : "Reject"}
                                          </Button>
                                        </div>
                                      )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {request.status === "in_progress" && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm font-medium text-blue-800">
                                Session Scheduled!
                              </p>
                              <p className="text-sm text-blue-700">
                                Your session has been scheduled. Check your
                                sessions page for details.
                              </p>
                              <Button size="sm" className="mt-2" asChild>
                                <Link href="/sessions">View Sessions</Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {myRequests.length === 0 && (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        You haven't created any learning requests yet
                      </p>
                      <Button asChild>
                        <Link href="#create">Create Your First Request</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              {!isConnected ? (
                <div className="text-center py-12 border rounded-lg border-dashed max-w-2xl mx-auto">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to create a learning request
                  </p>
                  <Button onClick={connectWallet}>Connect Wallet</Button>
                </div>
              ) : (
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Create Learning Request</CardTitle>
                    <CardDescription>
                      Post a request for a skill you want to learn and receive
                      bids from qualified tutors.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateRequest} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Skill Name
                        </label>
                        <Input
                          placeholder="e.g., Solidity Development, React Hooks, DeFi Protocols"
                          value={skillName}
                          onChange={(e) => setSkillName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <Textarea
                          placeholder="Describe what you want to learn, your current level, and specific goals..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Preferred Duration (minutes)
                          </label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={preferredDuration}
                            onChange={(e) =>
                              setPreferredDuration(e.target.value)
                            }
                          >
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Maximum Budget (SKL)
                          </label>
                          <Input
                            type="number"
                            min="5"
                            max="50"
                            step="0.5"
                            placeholder="20"
                            value={maxBudget}
                            onChange={(e) => setMaxBudget(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Preferred Schedule
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={preferredSchedule}
                          onChange={(e) => setPreferredSchedule(e.target.value)}
                        >
                          <option value="Flexible">Flexible</option>
                          <option value="Weekdays">Weekdays</option>
                          <option value="Weekends">Weekends</option>
                          <option value="Evenings">Evenings</option>
                          <option value="Mornings">Mornings</option>
                        </select>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={actionLoading === "create"}
                      >
                        {actionLoading === "create"
                          ? "Creating..."
                          : "Create Learning Request"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

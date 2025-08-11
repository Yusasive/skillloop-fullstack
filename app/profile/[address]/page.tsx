"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Session, Review } from "@/app/types";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Award,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Coins,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ProfileViewPageProps {
  params: Promise<{ address: string }>;
}

export default function ProfileViewPage({ params: paramsProp }: ProfileViewPageProps) {
  const params = use(paramsProp);
  const router = useRouter();
  const { account } = useWeb3();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const isOwnProfile = account?.toLowerCase() === params.address.toLowerCase();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const userRes = await fetch(`/api/users/${params.address}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);

          // Fetch user's sessions (for statistics)
          const sessionsRes = await fetch(
            `/api/sessions?userId=${params.address}&limit=20`
          );
          if (sessionsRes.ok) {
            const sessionsData = await sessionsRes.json();
            setSessions(sessionsData.sessions || []);
          }

          // Fetch reviews about this user
          if (userData.user) {
            const reviewsRes = await fetch(
              `/api/reviews?targetId=${userData.user.id}&limit=10`
            );
            if (reviewsRes.ok) {
              const reviewsData = await reviewsRes.json();
              setReviews(reviewsData.reviews || []);
            }
          }
        } else if (userRes.status === 404) {
          toast({
            title: "User not found",
            description: "The profile you're looking for doesn't exist.",
            variant: "destructive",
          });
          router.push("/explore");
          return;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [params.address, router, toast]);

  const getCompletedSessions = () => {
    return sessions.filter((session) => session.status === "completed");
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const getRecentSessions = () => {
    return sessions
      .filter((session) => session.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12 px-4 max-w-7xl">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Profile Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The profile you&apos;re looking for doesn&apos;t exist or has
                been removed.
              </p>
              <Button onClick={() => router.push("/explore")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explore
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {isOwnProfile && (
              <Button asChild>
                <Link href="/profile">Edit Profile</Link>
              </Button>
            )}
          </div>

          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage
                      src={user.avatar || ""}
                      alt={user.username || "User"}
                    />
                    <AvatarFallback className="text-2xl">
                      {user.username
                        ? user.username.charAt(0).toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-2">
                      {user.username || "Unnamed User"}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                      {params.address.slice(0, 6)}...{params.address.slice(-4)}
                    </p>

                    {user.bio && (
                      <p className="text-muted-foreground max-w-md">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {user.skills?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Skills
                      </div>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {getCompletedSessions().length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sessions
                      </div>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                        <Star className="h-5 w-5 fill-current" />
                        {getAverageRating()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rating
                      </div>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {reviews.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Reviews
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwnProfile && (
                    <div className="flex gap-3">
                      {user.skills && user.skills.length > 0 && (
                        <Button asChild>
                          <Link href={`/book/${params.address}`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Session
                          </Link>
                        </Button>
                      )}

                      <Button variant="outline" asChild>
                        <Link href="/learning-requests">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Learning Request
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Teaching Skills */}
                {user.skills && user.skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Teaching Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.skills.slice(0, 3).map((skill, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{skill.name}</h4>
                              {skill.hourlyRate && (
                                <Badge variant="outline">
                                  {skill.hourlyRate} SKL/hr
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {skill.description}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {skill.level.charAt(0).toUpperCase() +
                                skill.level.slice(1)}
                            </Badge>
                          </div>
                        ))}

                        {user.skills.length > 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("skills")}
                            className="w-full"
                          >
                            View All {user.skills.length} Skills
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Learning Interests */}
                {user.learning && user.learning.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Learning Interests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {user.learning.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getRecentSessions().length > 0 ? (
                      <div className="space-y-3">
                        {getRecentSessions().map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">
                                {session.skillName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(session.createdAt)} •{" "}
                                {session.duration} minutes
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {session.tokenAmount} SKL
                              </Badge>
                              <Badge className="bg-green-500/10 text-green-500">
                                Completed
                              </Badge>
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("activity")}
                          className="w-full"
                        >
                          View All Activity
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No completed sessions yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Teaching Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.skills && user.skills.length > 0 ? (
                      <div className="space-y-4">
                        {user.skills.map((skill, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{skill.name}</h4>
                              {skill.hourlyRate && (
                                <Badge variant="outline">
                                  {skill.hourlyRate} SKL/hr
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {skill.description}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {skill.level.charAt(0).toUpperCase() +
                                skill.level.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No teaching skills listed
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Learning Interests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Interests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.learning && user.learning.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.learning.map((skill, index) => (
                          <Badge key={index} variant="outline" className="mb-2">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No learning interests listed
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Reviews & Ratings</span>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{getAverageRating()}</span>
                      <span className="text-muted-foreground">
                        ({reviews.length} reviews)
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">
                                {review.rating}/5
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No reviews yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session History</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length > 0 ? (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{session.skillName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(session.createdAt)} •{" "}
                              {session.duration} minutes
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {session.tokenAmount} SKL
                            </Badge>
                            <Badge
                              className={
                                session.status === "completed"
                                  ? "bg-green-500/10 text-green-500"
                                  : session.status === "confirmed"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : session.status === "canceled"
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-yellow-500/10 text-yellow-500"
                              }
                            >
                              {session.status.charAt(0).toUpperCase() +
                                session.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No session history available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

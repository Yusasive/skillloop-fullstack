"use client";

import { useState, useEffect } from "react";
import { User } from "@/app/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Clock, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.skills.some((skill) =>
        skill.name.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl">
        <div className="space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-4xl font-bold">Explore Skills & Tutors</h1>
            <p className="text-muted-foreground max-w-2xl">
              Connect with skilled tutors and learn from their expertise. Browse
              through various skills and find the perfect match for your
              learning journey.
            </p>

            <div className="w-full max-w-xl flex gap-4">
              <Input
                placeholder="Search by skill or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading tutors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={user.avatar || ""}
                        alt={user.username || "User"}
                      />
                      <AvatarFallback>
                        {user.username
                          ? user.username.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {user.username || "Unnamed User"}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{user.rating.toFixed(1)}</span>
                        <span className="mx-1">•</span>
                        <Clock className="h-4 w-4" />
                        <span>{user.sessionsCompleted} sessions</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {user.bio}
                      </p>
                    )}

                    <div className="space-y-4">
                      {user.skills.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Teaching Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill.name}
                                {skill.hourlyRate &&
                                  ` • ${skill.hourlyRate} SKL/hr`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {user.learning.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Learning</h4>
                          <div className="flex flex-wrap gap-2">
                            {user.learning.map((skill, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {user.skills.length > 0 && (
                          <Button size="sm" className="flex-1" asChild>
                            <Link href={`/book/${user.address}`}>
                              Book Session
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/profile/${user.address}`}>
                            View Profile
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredUsers.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 border rounded-lg border-dashed">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No users found matching your criteria
                  </p>
                  <Button onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

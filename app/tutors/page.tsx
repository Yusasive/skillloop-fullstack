"use client";

import { useState, useEffect } from "react";
import { User } from "@/app/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TutorsPage() {
  const [tutors, setTutors] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        // Filter users who have skills (tutors)
        const tutorsWithSkills = data.users.filter(
          (user: User) => user.skills && user.skills.length > 0
        );
        setTutors(tutorsWithSkills);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  const allSkills = Array.from(
    new Set(tutors.flatMap((tutor) => tutor.skills.map((skill) => skill.name)))
  ).sort();

  const filteredTutors = tutors.filter((tutor) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      tutor.username?.toLowerCase().includes(searchLower) ||
      tutor.bio?.toLowerCase().includes(searchLower);

    const matchesSkill =
      !selectedSkill ||
      tutor.skills.some((skill) => skill.name === selectedSkill);

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="container py-8 md:py-12">
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-4xl font-bold">Find Your Perfect Tutor</h1>
          <p className="text-muted-foreground max-w-2xl">
            Connect with experienced tutors who can help you master new skills.
            Book a session and start your learning journey today.
          </p>

          <div className="w-full max-w-3xl space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                className="flex h-10 w-64 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                <option value="">All Skills</option>
                {allSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tutors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <Card
                key={tutor.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={tutor.avatar || ""}
                      alt={tutor.username || "Tutor"}
                    />
                    <AvatarFallback>
                      {tutor.username
                        ? tutor.username.charAt(0).toUpperCase()
                        : "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {tutor.username || "Unnamed Tutor"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{tutor.rating.toFixed(1)}</span>
                      <span className="mx-1">•</span>
                      <Calendar className="h-4 w-4" />
                      <span>{tutor.sessionsCompleted} sessions</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {tutor.bio && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {tutor.bio}
                    </p>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Teaching</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutor.skills.map((skill, index) => (
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

                    <Button className="w-full" asChild>
                      <Link href={`/book/${tutor.address}`}>
                        Book Session
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTutors.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 border rounded-lg border-dashed">
                <p className="text-muted-foreground mb-4">
                  No tutors found matching your criteria
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSkill("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

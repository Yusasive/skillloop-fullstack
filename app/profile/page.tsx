"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { User, Skill } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Edit,
  Plus,
  Trash,
  CheckCircle,
  XCircle,
  Coins,
} from "lucide-react";

const ProfilePage = () => {
  const {
    account,
    isConnected,
    user: contextUser,
    checkUserProfile,
    tokenBalance,
    refreshTokenBalance,
  } = useWeb3();
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(contextUser);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState<
    "beginner" | "intermediate" | "expert"
  >("intermediate");
  const [skillDescription, setSkillDescription] = useState("");
  const [skillHourlyRate, setSkillHourlyRate] = useState("");
  const [learningSkill, setLearningSkill] = useState("");

  useEffect(() => {
    if (!isConnected && !account) {
      router.push("/");
      return;
    }

    const initializeProfile = async () => {
      try {
        setLoading(true);

        // Use context user if available, otherwise fetch
        if (contextUser) {
          setUser(contextUser);
          setUsername(contextUser.username || "");
          setBio(contextUser.bio || "");
          setAvatar(contextUser.avatar || "");

          // Auto-open editing for new users (no username)
          if (!contextUser.username) {
            setEditing(true);
          }
        } else if (account) {
          // Fallback: fetch user data directly
          const res = await fetch(`/api/users/${account}`);

          if (res.status === 404) {
            // This should be handled by the context now, but keep as fallback
            await createUser();
            setEditing(true);
          } else if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setUsername(data.user.username || "");
            setBio(data.user.bio || "");
            setAvatar(data.user.avatar || "");

            if (!data.user.username) {
              setEditing(true);
            }
          }
        }

        // Refresh token balance
        await refreshTokenBalance();
      } catch (error) {
        console.error("Error initializing profile:", error);
        if (toast) {
          toast({
            title: "Error",
            description: "Failed to load your profile. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, [account, isConnected, contextUser, router, toast, refreshTokenBalance]);

  const createUser = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: account,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        if (toast) {
          toast({
            title: "Welcome to SkillLoop!",
            description:
              "Your profile has been created. Please complete your details.",
          });
        }
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      if (toast) {
        toast({
          title: "Error",
          description: "Failed to create your profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const updateProfile = async () => {
    if (!account) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/users/${account}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          bio,
          avatar,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditing(false);

        // Update context user
        if (checkUserProfile) {
          await checkUserProfile();
        }

        if (toast) {
          toast({
            title: "Profile Updated",
            description:
              "Your profile information has been updated successfully.",
          });
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (toast) {
        toast({
          title: "Error",
          description:
            error.message || "Failed to update your profile. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    if (!account) return;

    if (!skillName || !skillDescription) {
      if (toast) {
        toast({
          title: "Missing Information",
          description: "Please provide a skill name and description.",
          variant: "destructive",
        });
      }
      return;
    }

    // Validate hourly rate
    const hourlyRate = parseFloat(skillHourlyRate);
    if (
      skillHourlyRate &&
      (isNaN(hourlyRate) || hourlyRate < 5 || hourlyRate > 20)
    ) {
      if (toast) {
        toast({
          title: "Invalid Rate",
          description: "Hourly rate must be between 5-20 SKL tokens.",
          variant: "destructive",
        });
      }
      return;
    }

    setSaving(true);

    try {
      const newSkill: Skill = {
        name: skillName,
        level: skillLevel,
        description: skillDescription,
        hourlyRate: skillHourlyRate ? hourlyRate : undefined,
      };

      const updatedSkills = [...(user?.skills || []), newSkill];

      const res = await fetch(`/api/users/${account}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: updatedSkills,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        // Reset form
        setSkillName("");
        setSkillLevel("intermediate");
        setSkillDescription("");
        setSkillHourlyRate("");

        if (toast) {
          toast({
            title: "Skill Added",
            description: `${newSkill.name} has been added to your profile.`,
          });
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add skill");
      }
    } catch (error: any) {
      console.error("Error adding skill:", error);
      if (toast) {
        toast({
          title: "Error",
          description:
            error.message || "Failed to add the skill. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const removeSkill = async (index: number) => {
    if (!account) return;

    setSaving(true);

    try {
      const updatedSkills = [...(user?.skills || [])];
      const removedSkill = updatedSkills[index];
      updatedSkills.splice(index, 1);

      const res = await fetch(`/api/users/${account}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: updatedSkills,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        if (toast) {
          toast({
            title: "Skill Removed",
            description: `${removedSkill.name} has been removed from your profile.`,
          });
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to remove skill");
      }
    } catch (error: any) {
      console.error("Error removing skill:", error);
      if (toast) {
        toast({
          title: "Error",
          description:
            error.message || "Failed to remove the skill. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const addLearningSkill = async () => {
    if (!account) return;

    if (!learningSkill) {
      if (toast) {
        toast({
          title: "Missing Information",
          description: "Please provide a skill you want to learn.",
          variant: "destructive",
        });
      }
      return;
    }

    setSaving(true);

    try {
      const updatedLearning = [...(user?.learning || []), learningSkill];

      const res = await fetch(`/api/users/${account}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          learning: updatedLearning,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        // Reset form
        setLearningSkill("");

        if (toast) {
          toast({
            title: "Learning Skill Added",
            description: `${learningSkill} has been added to your learning list.`,
          });
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add learning skill");
      }
    } catch (error: any) {
      console.error("Error adding learning skill:", error);
      if (toast) {
        toast({
          title: "Error",
          description:
            error.message ||
            "Failed to add the learning skill. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const removeLearningSkill = async (index: number) => {
    if (!account) return;

    setSaving(true);

    try {
      const updatedLearning = [...(user?.learning || [])];
      const removedSkill = updatedLearning[index];
      updatedLearning.splice(index, 1);

      const res = await fetch(`/api/users/${account}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          learning: updatedLearning,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        if (toast) {
          toast({
            title: "Learning Skill Removed",
            description: `${removedSkill} has been removed from your learning list.`,
          });
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to remove learning skill");
      }
    } catch (error: any) {
      console.error("Error removing learning skill:", error);
      if (toast) {
        toast({
          title: "Error",
          description:
            error.message ||
            "Failed to remove the learning skill. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
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
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-5 w-5" />
                <CardTitle>Profile Not Found</CardTitle>
              </div>
              <CardDescription>
                There was a problem loading your profile. Please try connecting
                your wallet again.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => router.push("/")}>Return Home</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Profile
                {!editing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src={user.avatar || ""}
                      alt={user.username || "User"}
                    />
                    <AvatarFallback className="text-lg">
                      {user.username
                        ? user.username.charAt(0).toUpperCase()
                        : account?.slice(2, 4)}
                    </AvatarFallback>
                  </Avatar>

                  {editing ? (
                    <div className="space-y-4 w-full">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="avatar">
                          Avatar URL
                        </label>
                        <Input
                          id="avatar"
                          placeholder="https://example.com/avatar.jpg"
                          value={avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium"
                          htmlFor="username"
                        >
                          Username
                        </label>
                        <Input
                          id="username"
                          placeholder="Your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="bio">
                          Bio
                        </label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold">
                        {user.username || "Unnamed User"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {account}
                      </p>

                      {user.bio && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          {user.bio}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Token Balance Display */}
                <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <Coins className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {tokenBalance.toFixed(1)} SKL
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Token Balance
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-center px-4 py-2 flex-1 border-r">
                    <div className="text-2xl font-bold">
                      {user.skills?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Skills</div>
                  </div>
                  <div className="text-center px-4 py-2 flex-1 border-r">
                    <div className="text-2xl font-bold">
                      {user.sessionsCompleted || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Sessions
                    </div>
                  </div>
                  <div className="text-center px-4 py-2 flex-1">
                    <div className="text-2xl font-bold">{user.rating || 0}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                </div>
              </div>
            </CardContent>

            {editing && (
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={updateProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            )}
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="teaching">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teaching">Teaching</TabsTrigger>
                <TabsTrigger value="learning">Learning</TabsTrigger>
              </TabsList>

              <TabsContent value="teaching" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills You Can Teach</CardTitle>
                    <CardDescription>
                      Add skills you're willing to teach others (5-20 SKL per
                      hour)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {user.skills && user.skills.length > 0 ? (
                        <div className="grid gap-4">
                          {user.skills.map((skill, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4 relative"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{skill.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    Experience:{" "}
                                    {skill.level.charAt(0).toUpperCase() +
                                      skill.level.slice(1)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSkill(index)}
                                  className="h-8 w-8 p-0 absolute top-2 right-2"
                                  disabled={saving}
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              <p className="text-sm mb-2">
                                {skill.description}
                              </p>
                              {skill.hourlyRate && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary/10"
                                >
                                  {skill.hourlyRate} SKL/hour
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border rounded-lg border-dashed">
                          <p className="text-muted-foreground">
                            You haven't added any teaching skills yet.
                          </p>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Add New Skill</h4>
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label
                                className="text-sm font-medium"
                                htmlFor="skillName"
                              >
                                Skill Name
                              </label>
                              <Input
                                id="skillName"
                                placeholder="e.g. Solidity Development"
                                value={skillName}
                                onChange={(e) => setSkillName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                className="text-sm font-medium"
                                htmlFor="skillLevel"
                              >
                                Experience Level
                              </label>
                              <select
                                id="skillLevel"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={skillLevel}
                                onChange={(e) =>
                                  setSkillLevel(
                                    e.target.value as
                                      | "beginner"
                                      | "intermediate"
                                      | "expert"
                                  )
                                }
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">
                                  Intermediate
                                </option>
                                <option value="expert">Expert</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              htmlFor="skillDescription"
                            >
                              Description
                            </label>
                            <Textarea
                              id="skillDescription"
                              placeholder="Describe your experience with this skill"
                              value={skillDescription}
                              onChange={(e) =>
                                setSkillDescription(e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              htmlFor="skillHourlyRate"
                            >
                              Hourly Rate (5-20 SKL tokens)
                            </label>
                            <Input
                              id="skillHourlyRate"
                              type="number"
                              min="5"
                              max="20"
                              step="0.5"
                              placeholder="10"
                              value={skillHourlyRate}
                              onChange={(e) =>
                                setSkillHourlyRate(e.target.value)
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Set your hourly rate between 5-20 SKL tokens
                            </p>
                          </div>

                          <Button
                            onClick={addSkill}
                            className="w-full"
                            disabled={saving}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {saving ? "Adding..." : "Add Skill"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="learning" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills You Want to Learn</CardTitle>
                    <CardDescription>
                      Add skills you're interested in learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {user.learning && user.learning.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.learning.map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-primary/10 text-sm rounded-lg px-3 py-2"
                            >
                              {skill}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLearningSkill(index)}
                                className="h-5 w-5 p-0 ml-1"
                                disabled={saving}
                              >
                                <XCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border rounded-lg border-dashed">
                          <p className="text-muted-foreground">
                            You haven't added any learning interests yet.
                          </p>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">
                          Add Learning Interest
                        </h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. Smart Contract Development"
                            value={learningSkill}
                            onChange={(e) => setLearningSkill(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={addLearningSkill} disabled={saving}>
                            <Plus className="h-4 w-4 mr-2" />
                            {saving ? "Adding..." : "Add"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

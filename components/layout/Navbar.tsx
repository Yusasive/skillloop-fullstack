"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import {
  Bookmark,
  Calendar,
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  Search,
  Coins,
  Bell,
  BellRing,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notification } from "@/app/types";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const {
    account,
    connectWallet,
    disconnectWallet,
    isConnecting,
    isConnected,
    tokenBalance,
    refreshTokenBalance,
    user,
  } = useWeb3();
  const { toast } = useToast();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);

        const unread = data.notifications.filter(
          (n: Notification) => !n.read
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (res.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);

    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "session_request":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "session_approved":
        return <Calendar className="h-4 w-4 text-green-500" />;
      case "session_rejected":
        return <X className="h-4 w-4 text-red-500" />;
      case "session_completed":
        return <GraduationCap className="h-4 w-4 text-green-500" />;
      case "session_canceled":
        return <X className="h-4 w-4 text-orange-500" />;
      case "certificate_issued":
        return <Bookmark className="h-4 w-4 text-purple-500" />;
      case "new_bid":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "bid_accepted":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "bid_rejected":
        return <MessageSquare className="h-4 w-4 text-red-500" />;
      case "learning_request_created":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format notification time
  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return notificationDate.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "session_request":
      case "session_approved":
      case "session_rejected":
      case "session_completed":
      case "session_canceled":
        window.location.href = "/sessions";
        break;
      case "certificate_issued":
        window.location.href = "/certificates";
        break;
      case "new_bid":
      case "bid_accepted":
      case "bid_rejected":
      case "learning_request_created":
        window.location.href = "/learning-requests";
        break;
    }

    setNotificationOpen(false);
  };

  // Refresh token balance when connected
  useEffect(() => {
    if (isConnected && account) {
      refreshTokenBalance();
      fetchNotifications(); // Also works here now
    }
  }, [isConnected, account, refreshTokenBalance, fetchNotifications]);

  // Fetch notifications when user is available
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchNotifications]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SkillLoop</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Explore
          </Link>
          <Link
            href="/tutors"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Find Tutors
          </Link>
          <Link
            href="/learning-requests"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Learning Marketplace
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="hidden md:flex items-center gap-2">
              {/* Token Balance Display */}
              <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {tokenBalance.toFixed(1)} SKL
                </span>
              </div>

              {/* Notifications */}
              <Popover
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    {unreadCount > 0 ? (
                      <BellRing className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="h-80">
                    {notifications.length > 0 ? (
                      <div className="p-2">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                              !notification.read ? "bg-primary/5" : ""
                            }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No notifications yet
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" asChild>
                <Link href="/search">
                  <Search className="h-5 w-5" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{formatAddress(account!)}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/sessions"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>My Sessions</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/learning-requests"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Learning Requests</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/certificates"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Certificates</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={disconnectWallet}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              className="hidden md:inline-flex"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}

          <ModeToggle />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden container py-4 border-t px-4 md:px-6 max-w-7xl mx-auto">
          <nav className="flex flex-col space-y-4">
            {isConnected && (
              <>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {tokenBalance.toFixed(1)} SKL
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formatAddress(account!)}</Badge>
                    {unreadCount > 0 && (
                      <div className="flex items-center gap-1">
                        <BellRing className="h-4 w-4 text-primary" />
                        <Badge variant="destructive" className="text-xs">
                          {unreadCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Notifications */}
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Recent Notifications
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs h-6"
                      >
                        Mark all read
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {notifications
                        .filter((n) => !n.read)
                        .slice(0, 3)
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-start gap-2 p-2 bg-background rounded cursor-pointer"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Link
              href="/explore"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/tutors"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Tutors
            </Link>
            <Link
              href="/learning-requests"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Learning Marketplace
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Search
            </Link>

            {isConnected ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/sessions"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Sessions
                </Link>
                <Link
                  href="/learning-requests"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Learning Requests
                </Link>
                <Link
                  href="/certificates"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Certificates
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    disconnectWallet();
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  connectWallet();
                  setIsMenuOpen(false);
                }}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts";
import { chatService } from "@/services";
import { ChatThreadEnhanced } from "@/services/chatService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Clock,
  User,
  Building,
  Briefcase,
  Search,
  Plus,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThreadEnhanced[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchInbox();
    fetchUnreadCount();
  }, []);

  const fetchInbox = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getThreads();
      setThreads(response.results);
    } catch (error) {
      console.error("Error fetching inbox:", error);
      toast({
        title: "Error",
        description: "Failed to load inbox",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await chatService.getUnreadCount();
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const getParticipantInfo = (thread: ChatThreadEnhanced) => {
    const isUserClient = user?.role === "client";
    const participant = isUserClient ? thread.freelancer : thread.client;
    const participantUser = participant.user;

    return {
      name:
        `${participantUser.first_name} ${participantUser.last_name}`.trim() ||
        participantUser.username,
      role: isUserClient ? "freelancer" : "client",
      details: isUserClient
        ? thread.freelancer.title
        : thread.client.company_name,
      profilePicture: undefined, // Add this when profile pictures are implemented
    };
  };

  // Filter threads based on search term
  const filteredThreads = threads.filter((thread) => {
    if (!searchTerm) return true;
    const participantInfo = getParticipantInfo(thread);
    const searchLower = searchTerm.toLowerCase();

    return (
      participantInfo.name.toLowerCase().includes(searchLower) ||
      (participantInfo.details &&
        participantInfo.details.toLowerCase().includes(searchLower)) ||
      (thread.job?.title &&
        thread.job.title.toLowerCase().includes(searchLower)) ||
      (thread.last_message?.message &&
        thread.last_message.message.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 mr-3" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Your conversations with{" "}
            {user?.role === "client" ? "freelancers" : "clients"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={fetchInbox}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Conversations
                </p>
                <p className="text-2xl font-bold">{threads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Unread Messages
                </p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Chats
                </p>
                <p className="text-2xl font-bold">
                  {threads.filter((thread) => thread.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredThreads.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {threads.length === 0
                  ? "No conversations yet"
                  : "No matching conversations"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {threads.length === 0 ? (
                  <>
                    Start a conversation with{" "}
                    {user?.role === "client"
                      ? "freelancers by posting a job or browsing profiles"
                      : "clients by applying to jobs"}
                    .
                  </>
                ) : (
                  "Try adjusting your search terms."
                )}
              </p>
              {threads.length === 0 && (
                <Button asChild>
                  <Link
                    to={
                      user?.role === "client"
                        ? "/dashboard/create-job"
                        : "/jobs"
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {user?.role === "client" ? "Post a Job" : "Browse Jobs"}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredThreads.map((thread) => {
                const participantInfo = getParticipantInfo(thread);

                return (
                  <Link key={thread.id} to={`/dashboard/inbox/${thread.id}`}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-l-transparent hover:border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={participantInfo.profilePicture}
                              alt={participantInfo.name}
                            />
                            <AvatarFallback>
                              {getUserInitials(participantInfo.name)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Conversation Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-semibold truncate">
                                  {participantInfo.name}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {participantInfo.role}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                {thread.unread_count > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs rounded-full px-2"
                                  >
                                    {thread.unread_count}
                                  </Badge>
                                )}
                                {thread.last_message && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(thread.last_message.sent_at)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Company/Job Info */}
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                              {participantInfo.details && (
                                <div className="flex items-center space-x-1">
                                  <Building className="h-3 w-3" />
                                  <span className="truncate">
                                    {participantInfo.details}
                                  </span>
                                </div>
                              )}
                              {thread.job && (
                                <div className="flex items-center space-x-1">
                                  <Briefcase className="h-3 w-3" />
                                  <span className="truncate max-w-40">
                                    {thread.job.title}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Last Message */}
                            {thread.last_message ? (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">
                                  {thread.last_message.sender.username}:
                                </span>{" "}
                                {truncateMessage(thread.last_message.message)}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground italic">
                                No messages yet
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inbox;

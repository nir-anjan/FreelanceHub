import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { dashboardService } from "@/services";
import { ChatMessage, ChatMessagesResponse } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  User,
  Building,
  Briefcase,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ChatWindow: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatData, setChatData] = useState<ChatMessagesResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadId) {
      fetchMessages();
    }
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getChatMessages(Number(threadId));
      if (response.success) {
        setChatData(response.data);
        setMessages(response.data.messages);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
      navigate("/dashboard/inbox");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await dashboardService.sendMessage(Number(threadId), {
        message: newMessage.trim(),
      });

      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
        setNewMessage("");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [date: string]: ChatMessage[] } = {};

    messages.forEach((message) => {
      const date = formatDate(message.sent_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!chatData) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Conversation not found</h3>
        <Button onClick={() => navigate("/dashboard/inbox")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
      </div>
    );
  }

  const otherUser =
    user?.role === "client"
      ? chatData.thread.freelancer
      : chatData.thread.client;
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/inbox")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getUserInitials(otherUser.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">{otherUser.name}</h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {user?.role === "client" ? "Freelancer" : "Client"}
              </Badge>
              {user?.role === "freelancer" && otherUser.company_name && (
                <div className="flex items-center space-x-1">
                  <Building className="h-3 w-3" />
                  <span>{otherUser.company_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Context */}
      {chatData.thread.job && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-sm">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Project:</span>
              <span>{chatData.thread.job.title}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="h-96 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <MessageSquare className="h-5 w-5 mr-2" />
            Conversation
          </CardTitle>
        </CardHeader>
        <Separator />

        {/* Messages Container */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messageGroups.map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="text-center py-2">
                  <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {date}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.is_own_message ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.is_own_message
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="text-sm">{message.message}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.is_own_message
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(message.sent_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1"
            />
            <Button type="submit" disabled={isSending || !newMessage.trim()}>
              {isSending ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChatWindow;

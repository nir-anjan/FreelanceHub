import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { chatService } from "@/services";
import {
  chatSocketClient,
  ChatMessage,
  ConnectionStatus,
} from "@/services/chatSocketIO";
import {
  ChatMessageEnhanced,
  ChatThreadEnhanced,
} from "@/services/chatService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  DollarSign,
  FileText,
  CheckCheck,
  Check,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  User,
  Building,
  Briefcase,
  Clock,
  ArrowDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ChatWindow: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // State management
  const [thread, setThread] = useState<ChatThreadEnhanced | null>(null);
  const [messages, setMessages] = useState<ChatMessageEnhanced[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Dispute and payment dialogs
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [disputeSubject, setDisputeSubject] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connection status
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [isRetrying, setIsRetrying] = useState(false);

  // Parse thread ID
  const threadIdNum = threadId ? parseInt(threadId, 10) : null;

  // Socket.IO event handlers
  const handleConnectionChange = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
    setIsConnected(status === "connected");

    if (status === "connected") {
      toast({
        title: "Connected",
        description: "Real-time chat connected",
        duration: 2000,
      });
    } else if (status === "disconnected") {
      toast({
        title: "Disconnected",
        description: "Lost connection to chat server",
        variant: "destructive",
        duration: 2000,
      });
    }
  }, []);

  const handleSocketError = useCallback((error: { message: string }) => {
    console.error("Socket.IO error:", error);
    toast({
      title: "Connection Error",
      description: error.message,
      variant: "destructive",
    });
  }, []);

  const handleIncomingMessage = useCallback(
    (message: ChatMessage) => {
      // Convert Socket.IO message format to ChatMessageEnhanced
      const enhancedMessage: ChatMessageEnhanced = {
        id: message.id,
        thread: message.thread_id || threadIdNum || 0,
        sender: message.sender,
        sender_type:
          message.sender.id === user?.id
            ? user.role === "client"
              ? "client"
              : "freelancer"
            : user?.role === "client"
            ? "freelancer"
            : "client",
        message: message.content,
        message_type: message.message_type,
        sent_at: message.timestamp,
        is_read: message.is_read,
        metadata: null,
      };

      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, enhancedMessage].sort(
          (a, b) =>
            new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
        );
      });

      // Auto-scroll if user is near bottom
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          messagesContainerRef.current;
        if (scrollHeight - scrollTop - clientHeight < 100) {
          setTimeout(scrollToBottom, 100);
        }
      }
    },
    [threadIdNum]
  );

  const handleMessagesRead = useCallback(
    (data: { user: string; thread_id: number; count: number }) => {
      if (data.user !== user?.username) {
        // Mark recent messages as read
        setMessages((prev) => prev.map((msg) => ({ ...msg, is_read: true })));
      }
    },
    [user?.username]
  );

  const handleTypingStart = useCallback(
    (data: { user: string; thread_id: number }) => {
      if (data.user !== user?.username && data.thread_id === threadIdNum) {
        setTypingUsers((prev) => new Set([...prev, data.user]));
      }
    },
    [user?.username, threadIdNum]
  );

  const handleTypingStop = useCallback(
    (data: { user: string; thread_id: number }) => {
      if (data.user !== user?.username && data.thread_id === threadIdNum) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.user);
          return newSet;
        });
      }
    },
    [user?.username, threadIdNum]
  );

  const handleThreadJoined = useCallback(
    (data: { thread_id: number; messages: ChatMessage[] }) => {
      console.log("Thread joined with messages:", data.messages.length);
      // Messages are already loaded via REST API, so we don't need to replace them
    },
    []
  );

  // Retry connection handler
  const handleRetryConnection = useCallback(async () => {
    if (!token || isRetrying) return;

    setIsRetrying(true);
    try {
      await chatSocketClient.retryConnection();
      if (threadIdNum) {
        chatSocketClient.joinThread(threadIdNum);
      }
      toast({
        title: "Reconnected",
        description: "Successfully reconnected to chat server",
        duration: 2000,
      });
    } catch (error) {
      console.error("Retry connection failed:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to reconnect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  }, [token, threadIdNum, isRetrying]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!threadIdNum || !token || !user) return;

    // Set up event handlers
    chatSocketClient.setEventHandlers({
      onConnectionChange: handleConnectionChange,
      onError: handleSocketError,
      onMessage: handleIncomingMessage,
      onMessagesRead: handleMessagesRead,
      onTypingStart: handleTypingStart,
      onTypingStop: handleTypingStop,
      onThreadJoined: handleThreadJoined,
    });

    // Connect to Socket.IO server
    chatSocketClient
      .connect(token)
      .then(() => {
        // Join the specific thread
        chatSocketClient.joinThread(threadIdNum);
      })
      .catch((error) => {
        console.error("Failed to connect Socket.IO:", error);
      });

    return () => {
      // Leave thread and disconnect
      if (chatSocketClient.isConnected()) {
        chatSocketClient.leaveThread(threadIdNum);
      }
      chatSocketClient.disconnect();
    };
  }, [
    threadIdNum,
    token,
    user,
    handleConnectionChange,
    handleSocketError,
    handleIncomingMessage,
    handleMessagesRead,
    handleTypingStart,
    handleTypingStop,
    handleThreadJoined,
  ]);

  // Load initial data
  useEffect(() => {
    if (threadIdNum) {
      loadChatData();
    }
  }, [threadIdNum]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll to show/hide scroll button
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatData = async () => {
    if (!threadIdNum) return;

    try {
      setIsLoading(true);

      // Load thread details and messages concurrently
      const [threadData, messagesData] = await Promise.all([
        chatService.getThread(threadIdNum),
        chatService.getMessages(threadIdNum),
      ]);

      setThread(threadData);
      setMessages(messagesData.results);

      // Mark messages as read
      const unreadMessages = messagesData.results
        .filter((msg) => !msg.is_read && msg.sender.id !== user?.id)
        .map((msg) => msg.id);

      if (unreadMessages.length > 0) {
        await chatService.markMessagesRead(threadIdNum, unreadMessages);
        // Also send via Socket.IO
        chatSocketClient.markAsRead(threadIdNum);
      }
    } catch (error) {
      console.error("Error loading chat data:", error);
      toast({
        title: "Error",
        description: "Failed to load chat data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Message handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !threadIdNum) return;

    const messageToSend = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      // Send via Socket.IO for real-time delivery
      if (chatSocketClient.isConnected()) {
        chatSocketClient.sendMessage(threadIdNum, messageToSend);
      } else {
        // Fallback to REST API if Socket.IO is not connected
        await chatService.sendMessage(threadIdNum, { message: messageToSend });
        // Reload messages to ensure consistency
        await loadChatData();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      setNewMessage(messageToSend); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    } else if (threadIdNum) {
      // Send typing indicator
      chatSocketClient.startTyping(threadIdNum);
    }
  };

  // Dispute handling
  const handleCreateDispute = async () => {
    if (!threadIdNum || !disputeSubject.trim() || !disputeDescription.trim())
      return;

    try {
      await chatService.createDispute(threadIdNum, {
        subject: disputeSubject.trim(),
        description: disputeDescription.trim(),
      });

      setShowDisputeDialog(false);
      setDisputeSubject("");
      setDisputeDescription("");

      toast({
        title: "Dispute Created",
        description: "Your dispute has been submitted for review",
      });
    } catch (error) {
      console.error("Error creating dispute:", error);
      toast({
        title: "Error",
        description: "Failed to create dispute",
        variant: "destructive",
      });
    }
  };

  // Payment handling
  const handleInitiatePayment = async () => {
    if (!threadIdNum || !paymentAmount.trim()) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await chatService.initiatePayment(threadIdNum, {
        amount,
        description: paymentDescription.trim() || undefined,
      });

      setShowPaymentDialog(false);
      setPaymentAmount("");
      setPaymentDescription("");

      toast({
        title: "Payment Initiated",
        description: `Payment of $${amount} has been initiated`,
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  // Utility functions
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
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
      return date.toLocaleDateString("en-US", {
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

  const getMessageTypeStyle = (messageType: string) => {
    switch (messageType) {
      case "system":
        return "bg-yellow-100 border-yellow-200 text-yellow-800";
      case "payment_completed":
        return "bg-green-100 border-green-200 text-green-800";
      case "dispute_created":
        return "bg-red-100 border-red-200 text-red-800";
      case "job_update":
        return "bg-blue-100 border-blue-200 text-blue-800";
      default:
        return "";
    }
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case "payment_completed":
        return <DollarSign className="h-4 w-4" />;
      case "dispute_created":
        return <AlertTriangle className="h-4 w-4" />;
      case "job_update":
        return <FileText className="h-4 w-4" />;
      case "system":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const isOwnMessage = (message: ChatMessageEnhanced) => {
    return message.sender.id === user?.id;
  };

  const getParticipantInfo = () => {
    if (!thread) return null;

    const isUserClient = user?.role === "client";
    const otherParticipant = isUserClient ? thread.freelancer : thread.client;

    return {
      name:
        `${otherParticipant.user.first_name} ${otherParticipant.user.last_name}`.trim() ||
        otherParticipant.user.username,
      role: isUserClient ? "freelancer" : "client",
      details: isUserClient
        ? thread.freelancer.title
        : thread.client.company_name,
    };
  };

  const groupMessagesByDate = (messages: ChatMessageEnhanced[]) => {
    const groups: { [date: string]: ChatMessageEnhanced[] } = {};

    messages.forEach((message) => {
      const date = formatDate(message.sent_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups);
  };

  // Loading state
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

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Chat thread not found</p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/inbox")}
            className="mt-4"
          >
            Back to Inbox
          </Button>
        </div>
      </div>
    );
  }

  const participantInfo = getParticipantInfo();
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              <AvatarFallback>
                {participantInfo ? getUserInitials(participantInfo.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">
                {participantInfo?.name || "Unknown User"}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {participantInfo?.role === "freelancer"
                    ? "Freelancer"
                    : "Client"}
                </Badge>
                {participantInfo?.details && (
                  <div className="flex items-center space-x-1">
                    <Building className="h-3 w-3" />
                    <span>{participantInfo.details}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {connectionStatus === "connected" ? (
            <div className="flex items-center space-x-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-xs">Connected</span>
            </div>
          ) : connectionStatus === "connecting" ||
            connectionStatus === "reconnecting" ||
            isRetrying ? (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Wifi className="h-4 w-4" />
              <span className="text-xs">
                {isRetrying ? "Retrying..." : "Connecting..."}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs">Disconnected</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryConnection}
                disabled={isRetrying}
                className="h-6 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status Alert */}
      {connectionStatus !== "connected" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {connectionStatus === "connecting" ||
                  connectionStatus === "reconnecting" ||
                  isRetrying
                    ? "Connecting to real-time chat..."
                    : "Connection lost. Messages will be sent when reconnected."}
                </span>
              </div>
              {connectionStatus === "disconnected" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  {isRetrying ? "Retrying..." : "Retry Connection"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Context */}
      {thread?.job && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-sm">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Project:</span>
              <span>{thread.job.title}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Conversation
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Dialog
                open={showDisputeDialog}
                onOpenChange={setShowDisputeDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Dispute
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Dispute</DialogTitle>
                    <DialogDescription>
                      Create a dispute for this project. An admin will review
                      your case.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dispute-subject">Subject</Label>
                      <Input
                        id="dispute-subject"
                        value={disputeSubject}
                        onChange={(e) => setDisputeSubject(e.target.value)}
                        placeholder="Brief description of the issue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dispute-description">Description</Label>
                      <Textarea
                        id="dispute-description"
                        value={disputeDescription}
                        onChange={(e) => setDisputeDescription(e.target.value)}
                        placeholder="Provide detailed information about the dispute"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDisputeDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateDispute}
                      disabled={
                        !disputeSubject.trim() || !disputeDescription.trim()
                      }
                    >
                      Create Dispute
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={showPaymentDialog}
                onOpenChange={setShowPaymentDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Initiate Payment</DialogTitle>
                    <DialogDescription>
                      Send a payment for this project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="payment-amount">Amount ($)</Label>
                      <Input
                        id="payment-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment-description">
                        Description (Optional)
                      </Label>
                      <Input
                        id="payment-description"
                        value={paymentDescription}
                        onChange={(e) => setPaymentDescription(e.target.value)}
                        placeholder="Payment description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInitiatePayment}
                      disabled={!paymentAmount.trim()}
                    >
                      Send Payment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <Separator />

        {/* Messages Container */}
        <CardContent
          className="flex-1 overflow-y-auto p-4 space-y-4"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
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
                        isOwnMessage(message) ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.message_type !== "text"
                            ? `border ${getMessageTypeStyle(
                                message.message_type
                              )}`
                            : isOwnMessage(message)
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {/* Message type icon for system messages */}
                        {message.message_type !== "text" && (
                          <div className="flex items-center space-x-2 mb-1">
                            {getMessageTypeIcon(message.message_type)}
                            <span className="text-xs font-medium uppercase">
                              {message.message_type.replace("_", " ")}
                            </span>
                          </div>
                        )}

                        <div className="text-sm">{message.message}</div>

                        <div className="flex items-center justify-between mt-1">
                          <div
                            className={`text-xs ${
                              message.message_type !== "text"
                                ? "text-current/70"
                                : isOwnMessage(message)
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatTime(message.sent_at)}
                            {message.edited_at && " (edited)"}
                          </div>

                          {/* Read receipt for own messages */}
                          {isOwnMessage(message) && (
                            <div className="ml-2">
                              {message.is_read ? (
                                <CheckCheck className="h-3 w-3 text-blue-500" />
                              ) : (
                                <Check className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Typing Indicators */}
          {typingUsers.size > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Array.from(typingUsers).join(", ")}{" "}
                    {typingUsers.size === 1 ? "is" : "are"} typing...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <div className="absolute bottom-20 right-6">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToBottom}
              className="rounded-full h-10 w-10 p-0 shadow-lg"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={isSending || !isConnected}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isSending || !newMessage.trim() || !isConnected}
            >
              {isSending ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {!isConnected && (
            <p className="text-xs text-red-600 mt-1">
              Connection lost. Messages will be sent when reconnected.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatWindow;

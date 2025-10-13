import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  id: number;
  content: string;
  sender: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  timestamp: string;
  message_type: string;
  is_read: boolean;
  thread_id?: number;
}

export interface ChatUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "reconnecting";

export interface ChatEventHandlers {
  onConnectionChange?: (status: ConnectionStatus) => void;
  onMessage?: (message: ChatMessage) => void;
  onThreadJoined?: (data: {
    thread_id: number;
    messages: ChatMessage[];
  }) => void;
  onTypingStart?: (data: { user: string; thread_id: number }) => void;
  onTypingStop?: (data: { user: string; thread_id: number }) => void;
  onUserJoined?: (data: { user: string; thread_id: number }) => void;
  onUserLeft?: (data: { user: string; thread_id: number }) => void;
  onMessagesRead?: (data: {
    user: string;
    thread_id: number;
    count: number;
  }) => void;
  onError?: (error: { message: string }) => void;
}

class ChatSocketIOClient {
  private socket: Socket | null = null;
  private baseUrl: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionStatus: ConnectionStatus = "disconnected";
  private handlers: ChatEventHandlers = {};
  private currentThreadId: number | null = null;
  private typingTimer: NodeJS.Timeout | null = null;

  constructor(baseUrl: string = "http://localhost:8006") {
    this.baseUrl = baseUrl;
  }

  public connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.token = token;
      this.setConnectionStatus("connecting");

      console.log("Connecting to Socket.IO server at:", this.baseUrl);

      // Create socket connection with authentication
      this.socket = io(this.baseUrl, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
      });

      // Connection established
      this.socket.on("connect", () => {
        console.log("Socket.IO connected:", this.socket?.id);
        this.reconnectAttempts = 0;
        this.setConnectionStatus("connected");
        resolve();
      });

      // Connection confirmed by server
      this.socket.on(
        "connection_confirmed",
        (data: { status: string; user: ChatUser }) => {
          console.log("Connection confirmed:", data);
          this.setConnectionStatus("connected");
        }
      );

      // Connection error
      this.socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
        this.setConnectionStatus("disconnected");
        if (this.reconnectAttempts === 0) {
          reject(new Error(`Connection failed: ${error.message}`));
        }
      });

      // Disconnection
      this.socket.on("disconnect", (reason) => {
        console.log("Socket.IO disconnected:", reason);
        this.setConnectionStatus("disconnected");
      });

      // Reconnection attempt
      this.socket.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}`);
        this.reconnectAttempts = attemptNumber;
        this.setConnectionStatus("reconnecting");
      });

      // Successful reconnection
      this.socket.on("reconnect", (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`);
        this.reconnectAttempts = 0;
        this.setConnectionStatus("connected");

        // Rejoin current thread if any
        if (this.currentThreadId) {
          this.joinThread(this.currentThreadId);
        }
      });

      // Failed to reconnect
      this.socket.on("reconnect_failed", () => {
        console.error("Failed to reconnect after maximum attempts");
        this.setConnectionStatus("disconnected");
      });

      // Set up message handlers
      this.setupMessageHandlers();
    });
  }

  private setupMessageHandlers(): void {
    if (!this.socket) return;

    // New message received
    this.socket.on("new_message", (message: ChatMessage) => {
      console.log("New message received:", message);
      this.handlers.onMessage?.(message);
    });

    // Thread joined successfully
    this.socket.on(
      "thread_joined",
      (data: { thread_id: number; messages: ChatMessage[] }) => {
        console.log("Thread joined:", data);
        this.currentThreadId = data.thread_id;
        this.handlers.onThreadJoined?.(data);
      }
    );

    // Typing indicators
    this.socket.on(
      "typing_start",
      (data: { user: string; thread_id: number }) => {
        this.handlers.onTypingStart?.(data);
      }
    );

    this.socket.on(
      "typing_stop",
      (data: { user: string; thread_id: number }) => {
        this.handlers.onTypingStop?.(data);
      }
    );

    // User presence
    this.socket.on(
      "user_joined",
      (data: { user: string; thread_id: number }) => {
        this.handlers.onUserJoined?.(data);
      }
    );

    this.socket.on("user_left", (data: { user: string; thread_id: number }) => {
      this.handlers.onUserLeft?.(data);
    });

    // Read receipts
    this.socket.on(
      "messages_read",
      (data: { user: string; thread_id: number; count: number }) => {
        this.handlers.onMessagesRead?.(data);
      }
    );

    // Error handling
    this.socket.on("error", (error: { message: string }) => {
      console.error("Socket.IO error:", error);
      this.handlers.onError?.(error);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting Socket.IO client");
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentThreadId = null;
    this.setConnectionStatus("disconnected");
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public setEventHandlers(handlers: ChatEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  public joinThread(threadId: number): void {
    if (!this.socket?.connected) {
      console.warn("Cannot join thread: Socket not connected");
      return;
    }

    console.log(`Joining thread ${threadId}`);
    this.socket.emit("join_thread", { thread_id: threadId });
  }

  public leaveThread(threadId: number): void {
    if (!this.socket?.connected) {
      console.warn("Cannot leave thread: Socket not connected");
      return;
    }

    console.log(`Leaving thread ${threadId}`);
    this.socket.emit("leave_thread", { thread_id: threadId });

    if (this.currentThreadId === threadId) {
      this.currentThreadId = null;
    }
  }

  public sendMessage(
    threadId: number,
    content: string,
    type: string = "text"
  ): void {
    if (!this.socket?.connected) {
      console.warn("Cannot send message: Socket not connected");
      this.handlers.onError?.({ message: "Not connected to server" });
      return;
    }

    if (!content.trim()) {
      console.warn("Cannot send empty message");
      return;
    }

    console.log(`Sending message to thread ${threadId}:`, content);
    this.socket.emit("send_message", {
      thread_id: threadId,
      content: content.trim(),
      type: type,
    });
  }

  public startTyping(threadId: number): void {
    if (!this.socket?.connected) return;

    // Clear existing timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    // Send typing start event
    this.socket.emit("typing_start", { thread_id: threadId });

    // Auto-stop typing after 3 seconds
    this.typingTimer = setTimeout(() => {
      this.stopTyping(threadId);
    }, 3000);
  }

  public stopTyping(threadId: number): void {
    if (!this.socket?.connected) return;

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }

    this.socket.emit("typing_stop", { thread_id: threadId });
  }

  public markAsRead(threadId: number): void {
    if (!this.socket?.connected) return;

    console.log(`Marking messages as read in thread ${threadId}`);
    this.socket.emit("mark_as_read", { thread_id: threadId });
  }

  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      console.log(`Connection status changed to: ${status}`);
      this.handlers.onConnectionChange?.(status);
    }
  }

  // Utility method to reconnect with new token
  public reconnectWithToken(token: string): Promise<void> {
    this.disconnect();
    return this.connect(token);
  }

  // Manual retry connection method
  public retryConnection(): Promise<void> {
    if (!this.token) {
      return Promise.reject(new Error("No token available for retry"));
    }

    console.log("Retrying Socket.IO connection...");
    this.disconnect();
    return this.connect(this.token);
  }

  // Get current user info from token (client-side decode for display purposes)
  public getCurrentUser(): ChatUser | null {
    if (!this.token) return null;

    try {
      // Simple JWT decode (client-side, for display only)
      const payload = JSON.parse(atob(this.token.split(".")[1]));
      return {
        id: payload.user_id,
        username: payload.username || "",
        first_name: payload.first_name || "",
        last_name: payload.last_name || "",
      };
    } catch (error) {
      console.warn("Could not decode token:", error);
      return null;
    }
  }
}

// Export singleton instance
export const chatSocketClient = new ChatSocketIOClient();
export default ChatSocketIOClient;

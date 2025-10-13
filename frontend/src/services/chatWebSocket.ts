export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface ChatWebSocketMessage extends WebSocketMessage {
  type: "chat_message";
  message: string;
  message_type?:
    | "text"
    | "system"
    | "payment_completed"
    | "dispute_created"
    | "job_update";
  metadata?: any;
}

export interface MarkReadMessage extends WebSocketMessage {
  type: "mark_messages_read";
  message_ids: number[];
}

export interface TypingIndicatorMessage extends WebSocketMessage {
  type: "typing_indicator";
  is_typing: boolean;
}

export interface IncomingMessage extends WebSocketMessage {
  type:
    | "chat_message"
    | "messages_read"
    | "typing_indicator"
    | "error"
    | "connection_established";
  data?: any;
  message?: string;
  message_ids?: number[];
  reader?: string;
  user?: string;
  is_typing?: boolean;
  thread_id?: number;
}

export interface ChatWebSocketEvents {
  onConnect?: () => void;
  onMessage?: (message: any) => void;
  onMessagesRead?: (messageIds: number[], reader: string) => void;
  onTypingIndicator?: (user: string, isTyping: boolean) => void;
  onError?: (error: string) => void;
  onDisconnect?: () => void;
}

export class ChatWebSocketClient {
  private ws: WebSocket | null = null;
  private threadId: number;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private isManualClose = false;
  private typingTimer: NodeJS.Timeout | null = null;

  // Event handlers
  public onConnect?: () => void;
  public onMessage?: (message: any) => void;
  public onMessagesRead?: (messageIds: number[], reader: string) => void;
  public onTypingIndicator?: (user: string, isTyping: boolean) => void;
  public onError?: (error: string) => void;
  public onDisconnect?: () => void;

  constructor(threadId: number, token: string, events?: ChatWebSocketEvents) {
    this.threadId = threadId;
    this.token = token;

    if (events) {
      this.onConnect = events.onConnect;
      this.onMessage = events.onMessage;
      this.onMessagesRead = events.onMessagesRead;
      this.onTypingIndicator = events.onTypingIndicator;
      this.onError = events.onError;
      this.onDisconnect = events.onDisconnect;
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected()) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.isManualClose = false;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      const port =
        process.env.NODE_ENV === "development" ? "8000" : window.location.port;
      const wsUrl = `${protocol}//${host}:${port}/ws/chat/${this.threadId}/?token=${this.token}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log(
            `Connected to chat WebSocket for thread ${this.threadId}`
          );
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data: IncomingMessage = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
            this.onError?.("Failed to parse message");
          }
        };

        this.ws.onclose = (event) => {
          console.log(
            `WebSocket connection closed for thread ${this.threadId}:`,
            event.code,
            event.reason
          );
          this.isConnecting = false;
          this.ws = null;
          this.onDisconnect?.();

          if (
            !this.isManualClose &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error(`WebSocket error for thread ${this.threadId}:`, error);
          this.isConnecting = false;
          this.onError?.("WebSocket connection error");
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(data: IncomingMessage) {
    switch (data.type) {
      case "connection_established":
        console.log("WebSocket connection established:", data.message);
        break;

      case "chat_message":
        if (data.data) {
          this.onMessage?.(data.data);
        }
        break;

      case "messages_read":
        if (data.message_ids && data.reader) {
          this.onMessagesRead?.(data.message_ids, data.reader);
        }
        break;

      case "typing_indicator":
        if (data.user !== undefined && data.is_typing !== undefined) {
          this.onTypingIndicator?.(data.user, data.is_typing);
        }
        break;

      case "error":
        console.error("WebSocket error message:", data.message);
        this.onError?.(data.message || "Unknown error");
        break;

      default:
        console.warn("Unknown WebSocket message type:", data.type);
    }
  }

  private scheduleReconnect() {
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${
        this.reconnectAttempts + 1
      }/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  }

  disconnect() {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  sendMessage(
    message: string,
    messageType:
      | "text"
      | "system"
      | "payment_completed"
      | "dispute_created"
      | "job_update" = "text",
    metadata?: any
  ): boolean {
    if (!this.isConnected()) {
      console.warn("Cannot send message: WebSocket not connected");
      return false;
    }

    const payload: ChatWebSocketMessage = {
      type: "chat_message",
      message,
      message_type: messageType,
      metadata,
    };

    try {
      this.ws!.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      this.onError?.("Failed to send message");
      return false;
    }
  }

  markMessagesRead(messageIds: number[]): boolean {
    if (!this.isConnected() || messageIds.length === 0) {
      return false;
    }

    const payload: MarkReadMessage = {
      type: "mark_messages_read",
      message_ids: messageIds,
    };

    try {
      this.ws!.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      return false;
    }
  }

  sendTypingIndicator(isTyping: boolean): boolean {
    if (!this.isConnected()) {
      return false;
    }

    const payload: TypingIndicatorMessage = {
      type: "typing_indicator",
      is_typing: isTyping,
    };

    try {
      this.ws!.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error("Error sending typing indicator:", error);
      return false;
    }
  }

  sendTypingStart(): void {
    if (this.sendTypingIndicator(true)) {
      // Clear any existing timer
      if (this.typingTimer) {
        clearTimeout(this.typingTimer);
      }

      // Set timer to send typing stop after 3 seconds
      this.typingTimer = setTimeout(() => {
        this.sendTypingIndicator(false);
        this.typingTimer = null;
      }, 3000);
    }
  }

  sendTypingStop(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
    this.sendTypingIndicator(false);
  }
}

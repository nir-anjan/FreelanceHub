// Re-export all services for easy importing
export { default as httpClient } from "./httpClient";
export { default as authService } from "./authService";
export { dashboardService } from "./dashboardService";
export { chatService } from "./chatService";
export { ChatWebSocketClient } from "./chatWebSocket";
export {
  chatSocketClient,
  default as ChatSocketIOClient,
} from "./chatSocketIO";

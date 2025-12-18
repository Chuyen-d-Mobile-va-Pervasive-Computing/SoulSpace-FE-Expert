import * as SecureStore from "expo-secure-store";

export type Handlers = {
  onMessage?: (payload: any) => void;
  onPresence?: (data: { event: "presence.join" | "presence.leave"; payload: any }) => void;
  onTyping?: (payload: { is_typing: boolean }) => void;
  onRead?: (payload: { message_id: string }) => void;
  onPong?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
};

class ChatSocket {
  private socket: WebSocket | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private chatId: string | null = null;
  private handlers: Handlers | null = null;

  /* ===================== CONNECT ===================== */
  async connect(chatId: string, handlers: Handlers): Promise<void> {
    // Prevent duplicate connection
    if (this.socket && this.chatId === chatId) {
      return;
    }

    // Cleanup old connection
    this.disconnect();

    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      throw new Error("ChatSocket: Missing token");
    }

    const base = process.env.EXPO_PUBLIC_API_PATH || "";
    const WS_URL = `${base.replace(/^http/, "ws")}/api/v1/chat/ws/${chatId}?token=${token}`;

    this.chatId = chatId;
    this.handlers = handlers;

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(WS_URL);
        this.socket = ws;

        ws.onopen = () => {
          console.log("🟢 WS connected:", chatId);

          // Keep alive (backend expects ping)
          this.pingInterval = setInterval(() => {
            this.sendPing();
          }, 25000);

          resolve();
        };

        ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        ws.onerror = (err) => {
          console.error("🔴 WS error:", err);
          this.handlers?.onError?.(err);
        };

        ws.onclose = () => {
          console.log("⚪ WS closed:", chatId);
          this.cleanup();
          this.handlers?.onClose?.();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /* ===================== MESSAGE ROUTER ===================== */
  private handleMessage(raw: string) {
    try {
      const data = JSON.parse(raw);
      const event = data.event;
      const payload = data.payload;

      switch (event) {
        case "message.new":
          this.handlers?.onMessage?.(payload);
          break;

        case "presence.join":
        case "presence.leave":
          this.handlers?.onPresence?.({ event, payload });
          break;

        case "typing.start":
        case "typing.stop":
          this.handlers?.onTyping?.(payload);
          break;

        case "message.read":
          this.handlers?.onRead?.(payload);
          break;

        case "pong":
          this.handlers?.onPong?.();
          break;

        default:
          console.warn("⚠️ Unknown WS event:", event);
      }
    } catch (e) {
      console.error("❌ WS parse error:", e);
    }
  }

  /* ===================== SEND HELPERS ===================== */
  private send(event: string, payload?: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    this.socket.send(
      JSON.stringify({
        event,
        payload,
      })
    );
  }

  sendMessage(content: string) {
    if (!content.trim()) return;

    this.send("message.send", {
      message_type: "text",
      content,
    });
  }

  sendTyping(isTyping: boolean) {
    this.send(isTyping ? "typing.start" : "typing.stop", {
      is_typing: isTyping,
    });
  }

  sendRead(messageId: string) {
    if (!messageId) return;

    this.send("message.read", {
      message_id: messageId,
    });
  }

  sendPing() {
    this.send("ping");
  }

  /* ===================== DISCONNECT ===================== */
  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
    this.cleanup();
    this.socket = null;
    this.chatId = null;
    this.handlers = null;
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const chatSocket = new ChatSocket();

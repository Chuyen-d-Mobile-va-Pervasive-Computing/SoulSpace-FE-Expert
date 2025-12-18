import * as SecureStore from "expo-secure-store";

let socket: WebSocket | null = null;

export async function connectChatSocket(
  chatId: string,
  onMessage: (data: any) => void,
  onPresence?: (data: any) => void
) {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Missing token");

  const WS_URL = `${(process.env.EXPO_PUBLIC_API_PATH || "").replace(
    "http",
    "ws"
  )}/api/v1/chat/ws/${chatId}?token=${token}`;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("🟢 WS connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.event === "message.new") {
        onMessage(data.payload);
      }

      if (
        data.event === "presence.join" ||
        data.event === "presence.leave"
      ) {
        onPresence?.(data);
      }
    } catch (e) {
      console.error("WS parse error", e);
    }
  };

  socket.onclose = () => {
    console.log("🔴 WS disconnected");
  };

  socket.onerror = (e) => {
    console.error("WS error", e);
  };
}

export function sendMessageWS(content: string) {
  if (!socket) return;

  socket.send(
    JSON.stringify({
      event: "message.send",
      payload: {
        message_type: "text",
        content,
      },
    })
  );
}

export function sendTyping(isTyping: boolean) {
  if (!socket) return;

  socket.send(
    JSON.stringify({
      event: isTyping ? "typing.start" : "typing.stop",
      payload: { is_typing: isTyping },
    })
  );
}

export function sendRead(messageId: string) {
  if (!socket) return;

  socket.send(
    JSON.stringify({
      event: "message.read",
      payload: { message_id: messageId },
    })
  );
}

export function sendPing() {
  if (!socket) return;
  socket.send(JSON.stringify({ event: "ping" }));
}

export function disconnectChatSocket() {
  socket?.close();
  socket = null;
}

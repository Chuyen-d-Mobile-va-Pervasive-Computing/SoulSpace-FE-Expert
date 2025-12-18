import { getChatMessages } from "@/lib/api";
import { chatSocket } from "@/lib/chatSocket";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { SendHorizonal } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Msg = {
  id: string;
  text: string;
  sender_role: "user" | "expert";
  is_read?: boolean;
  created_at?: string;
};

export default function ChatDetail() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    avatar: string;
    online: string;
    scroll?: string;
  }>();

  const chatId = params.id!;
  const partnerName = params.name;
  const partnerAvatar = params.avatar;
  const isOnline = params.online === "true";

  const scrollRef = useRef<ScrollView | null>(null);
  const typingTimeout = useRef<any>(null);
  const partnerTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // State
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [partnerOnline, setPartnerOnline] = useState(isOnline);
  const [partnerTyping, setPartnerTyping] = useState(false);

  /* =====================
     CONNECTION & HANDLERS
     ===================== */
  useFocusEffect(
    useCallback(() => {
      let alive = true;

      const initChat = async () => {
        try {
          // 1️⃣ Load REST API History first
          const res = await getChatMessages(chatId);
          if (!alive) return;

          const history: Msg[] = (res.messages || []).map((m: any) => ({
            id: m.id,
            text: m.content,
            sender_role: m.sender_role,
            is_read: m.is_read,
            created_at: m.created_at,
          }));

          setMessages(history);

          // Scroll to bottom after load
          setTimeout(
            () => scrollRef.current?.scrollToEnd({ animated: false }),
            100
          );

          // 2️⃣ Connect WebSocket
          await chatSocket.connect(chatId, {
            onMessage: (payload: any) => {
              if (!alive) return;

              // Logic giống HTML:
              // Nếu tin nhắn là do 'expert' (chính mình) gửi thì BỎ QUA
              // (vì mình đã add vào list lúc bấm nút Send rồi)
              if (payload.sender_role === "expert") {
                return;
              }

              // Nếu là user gửi -> thêm vào list
              setMessages((prev) => [
                ...prev,
                {
                  id: payload.id,
                  text: payload.content,
                  sender_role: payload.sender_role,
                },
              ]);

              // Gửi đã xem
              chatSocket.sendRead(payload.id);

              // Scroll
              setTimeout(
                () => scrollRef.current?.scrollToEnd({ animated: true }),
                100
              );
            },

            onTyping: (payload: any) => {
              if (!alive) return;
              // Set typing state and auto-clear after 3s of inactivity
              setPartnerTyping(payload.is_typing);
              if (partnerTypingTimeout.current) {
                clearTimeout(partnerTypingTimeout.current);
                partnerTypingTimeout.current = null;
              }
              if (payload.is_typing) {
                partnerTypingTimeout.current = setTimeout(() => {
                  setPartnerTyping(false);
                  partnerTypingTimeout.current = null;
                }, 3000);
              }
            },

            onPresence: (payload: any) => {
              // Cập nhật online status nếu cần
              // Payload ví dụ: { event: 'presence.join', payload: { role: 'user', ... } }
              if (payload.event === "presence.join") setPartnerOnline(true);
              if (payload.event === "presence.leave") setPartnerOnline(false);
            },
          });

          // After connecting, send read receipt for any unread messages from partner
          try {
            history.forEach((m) => {
              if (m.sender_role !== "expert" && !m.is_read) {
                chatSocket.sendRead(m.id);
              }
            });
          } catch (e) {}

          // Start polling REST every 5s to merge any missed messages
          refreshInterval.current = setInterval(async () => {
            try {
              const r = await getChatMessages(chatId);
              if (!alive) return;
              const fetched: Msg[] = (r.messages || []).map((m: any) => ({
                id: m.id,
                text: m.content,
                sender_role: m.sender_role,
                is_read: m.is_read,
                created_at: m.created_at,
              }));

              setMessages((prev) => {
                const next = [...prev];
                const existingIds = new Set(next.map((p) => p.id));

                const toAppend: Msg[] = [];

                fetched.forEach((f) => {
                  if (existingIds.has(f.id)) return;

                  // If we have a locally-created temp message that matches this content,
                  // replace the temp with the server message to avoid duplicates.
                  const tempIdx = next.findIndex(
                    (p) =>
                      p.id?.toString().startsWith("temp-") &&
                      p.sender_role === "expert" &&
                      p.text === f.text
                  );

                  if (tempIdx !== -1) {
                    next[tempIdx] = f;
                    existingIds.add(f.id);
                  } else {
                    toAppend.push(f);
                  }
                });

                if (toAppend.length === 0) return next;

                // send read receipt for any incoming messages from partner
                toAppend.forEach((m) => {
                  if (m.sender_role !== "expert") {
                    try {
                      chatSocket.sendRead(m.id);
                    } catch (e) {}
                  }
                });

                setTimeout(
                  () => scrollRef.current?.scrollToEnd({ animated: true }),
                  50
                );
                return [...next, ...toAppend];
              });
            } catch (err) {
              console.error("Polling messages error:", err);
            }
          }, 5000);
        } catch (error) {
          console.error("Chat init error:", error);
        }
      };

      initChat();

      return () => {
        alive = false;
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        chatSocket.sendTyping(false);
        chatSocket.disconnect();
        if (partnerTypingTimeout.current) {
          clearTimeout(partnerTypingTimeout.current);
          partnerTypingTimeout.current = null;
        }
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
          refreshInterval.current = null;
        }
      };
    }, [chatId])
  );

  /* =====================
     SEND MESSAGE
     ===================== */
  const send = () => {
    const text = input.trim();
    if (!text) return;

    // 1️⃣ Optimistic UI: Hiện ngay lập tức bên mình
    const tempMsg: Msg = {
      id: `temp-${Date.now()}`,
      text,
      sender_role: "expert",
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInput("");

    // 2️⃣ Gửi qua Socket
    chatSocket.sendMessage(text);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  /* =====================
     TYPING INDICATOR
     ===================== */
  const onChange = (t: string) => {
    setInput(t);

    chatSocket.sendTyping(true);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      chatSocket.sendTyping(false);
    }, 1500);
  };

  // Scroll to bottom when opened from chat list (params.scroll === "1")
  useEffect(() => {
    if (params.scroll === "1" && messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages, params.scroll]);

  // Ensure we scroll to the last message when the keyboard opens
  useEffect(() => {
    const onShow = () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    };

    const subs: { remove: () => void }[] = [];
    try {
      subs.push(Keyboard.addListener("keyboardWillShow", onShow));
    } catch (e) {}
    try {
      subs.push(Keyboard.addListener("keyboardDidShow", onShow));
    } catch (e) {}

    return () => {
      subs.forEach((s) => s.remove());
    };
  }, []);

  /* =====================
     UI RENDER
     ===================== */
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#FAF9FF]"
      behavior={"padding"}
      enabled={true}
    >
      <SafeAreaView className="flex-1">
        {/* HEADER */}
        <View className="flex-row items-center px-4 pb-3 pt-2 bg-white border-b border-gray-100 shadow-sm">
          <Image
            source={{ uri: partnerAvatar || "https://via.placeholder.com/100" }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="text-[16px] font-[Poppins-SemiBold] text-black">
              {partnerName}
            </Text>
            <Text className="text-[12px] text-gray-500 font-[Poppins-Regular]">
              {partnerTyping
                ? "Typing..."
                : partnerOnline
                  ? "Online"
                  : "Offline"}
            </Text>
          </View>
        </View>

        {/* MESSAGES */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 10 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {messages.map((m, index) => {
            const isMe = m.sender_role === "expert";
            return (
              <View
                key={`${m.id ?? "msg"}-${index}`}
                className={`my-1 max-w-[75%] ${
                  isMe ? "self-end" : "self-start"
                }`}
              >
                <View
                  className={`px-4 py-3 rounded-2xl ${
                    isMe
                      ? "bg-[#7F56D9] rounded-br-none"
                      : "bg-white border border-gray-100 rounded-bl-none shadow-sm"
                  }`}
                >
                  <Text
                    className={`text-[15px] font-[Poppins-Regular] ${
                      isMe ? "text-white" : "text-black"
                    }`}
                  >
                    {m.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* INPUT AREA */}
        <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-100">
          <TextInput
            value={input}
            onChangeText={onChange}
            placeholder="Type your message..."
            placeholderTextColor="#9ca3af"
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3 text-[15px] font-[Poppins-Regular] text-black"
            onSubmitEditing={send}
            onFocus={() =>
              setTimeout(
                () => scrollRef.current?.scrollToEnd({ animated: true }),
                100
              )
            }
            returnKeyType="send"
          />
          <TouchableOpacity
            className="bg-[#7F56D9] rounded-full p-3 shadow-sm"
            onPress={send}
            disabled={!input.trim()}
            style={{ opacity: input.trim() ? 1 : 0.7 }}
          >
            <SendHorizonal size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

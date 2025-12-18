import { getChatMessages } from "@/lib/api";
import {
  connectChatSocket,
  disconnectChatSocket,
  sendMessageWS,
} from "@/lib/chatSocket";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SendHorizonal } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
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
};

export default function ChatDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    avatar: string;
    online: string;
  }>();

  const chatId = params.id;
  const partnerName = params.name;
  const partnerAvatar = params.avatar;
  const isOnline = params.online === "true";

  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  // Load history + connect WS
  useEffect(() => {
    async function init() {
      const res = await getChatMessages(chatId);
      setMessages(
        res.messages.map((m: any) => ({
          id: m.id,
          text: m.content,
          sender_role: m.sender_role,
        }))
      );

      await connectChatSocket(chatId, (payload) => {
        setMessages((prev) => [
          ...prev,
          {
            id: payload.id,
            text: payload.content,
            sender_role: payload.sender_role,
          },
        ]);
      });
    }

    init();

    return () => {
      disconnectChatSocket();
    };
  }, [chatId]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    // optimistic UI (expert)
    setMessages((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        text,
        sender_role: "expert",
      },
    ]);

    sendMessageWS(text);
    setInput("");

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <SafeAreaView className="flex-1 bg-white">
        {/* HEADER */}
        <View className="flex-row items-center px-4 pb-3 border-b border-gray-200">
          <Image
            source={{ uri: partnerAvatar }}
            className="w-12 h-12 rounded-full mr-3 mt-2"
          />

          <View className="mt-2">
            <Text className="text-[16px] font-[Poppins-SemiBold]">
              {partnerName}
            </Text>
            <Text className="text-[13px] text-gray-500 font-[Poppins-Regular]">
              {isOnline ? "online" : "offline"}
            </Text>
          </View>
        </View>

        {/* MESSAGES */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-2"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((m, idx) => {
            const isMe = m.sender_role === "expert";
            const key = `${m.id ?? "msg"}-${idx}`;
            return (
              <View
                key={key}
                className={`my-2 max-w-[75%] font-[Poppins-Regular] ${
                  isMe
                    ? "self-end font-[Poppins-Regular]"
                    : "self-start font-[Poppins-Regular]"
                }`}
              >
                <View
                  className={`px-4 py-3 rounded-2xl font-[Poppins-Regular] ${
                    isMe ? "bg-[#7F56D9]" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`text-[14px] font-[Poppins-Regular] ${
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

        {/* INPUT */}
        <View className="flex-row items-center px-4 py-3 border-t border-gray-200">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-3 font-[Poppins-Regular] text-[15px]"
            onSubmitEditing={send}
          />

          <TouchableOpacity
            className="bg-[#7F56D9] rounded-full p-3"
            onPress={send}
          >
            <SendHorizonal size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

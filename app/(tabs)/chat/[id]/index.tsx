import { useLocalSearchParams, useRouter } from "expo-router";
import { SendHorizonal } from "lucide-react-native";
import React, { useRef, useState } from "react";
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

export default function ChatDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const scrollRef = useRef<ScrollView>(null);

  const expert = {
    name: "Nguyen Van A",
    avatar: "https://i.pravatar.cc/100?img=12",
    status: "offline",
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Vocabulary Assistant. How can I help you with words today?",
      from: "bot",
    },
    {
      id: 2,
      text: `Add "Revolutionary to Technology collection`,
      from: "user",
    },
    {
      id: 3,
      text: `Added "innovate" to your Technology collection!`,
      from: "bot",
    },
    { id: 4, text: `Introducing the app's features`, from: "user" },
    { id: 5, text: "Our vocabulary learning app", from: "bot" },
  ]);

  const [input, setInput] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: input,
      from: "user",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Scroll xuống cuối sau khi gửi
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Got it! I'm processing your request.",
          from: "bot",
        },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }, 800);
  };

  return (
    <KeyboardAvoidingView enabled={true} className="flex-1" behavior="padding">
      <SafeAreaView className="flex-1 bg-white">
        {/* HEADER */}
        <View className="flex-row items-center px-4 pb-3 border-b border-gray-200">
          <Image
            source={{ uri: expert.avatar }}
            className="w-12 h-12 rounded-full mr-3"
          />

          <View>
            <Text className="text-[16px] font-[Poppins-SemiBold] mt-2">
              {expert.name}
            </Text>
            <Text className="text-gray-500 text-[13px] font-[Poppins-Regular]">
              {expert.status}
            </Text>
          </View>
        </View>

        {/* CHAT LIST */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-2"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            // auto scroll khi thêm tin nhắn
            scrollRef.current?.scrollToEnd({ animated: true });
          }}
          onLayout={() => {
            // auto scroll khi keyboard xuất hiện
            setTimeout(() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            }, 50);
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.from === "user";
            return (
              <View
                key={msg.id}
                className={`my-2 max-w-[75%] ${
                  isUser ? "self-end" : "self-start"
                }`}
              >
                <View
                  className={`px-4 py-3 rounded-2xl ${
                    isUser ? "bg-[#7F56D9]" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`text-[14px] font-[Poppins-Regular] ${
                      isUser ? "text-white" : "text-black"
                    }`}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* INPUT AREA — luôn lên theo bàn phím */}
        <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message ..."
            className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-[14px] font-[Poppins-Regular] mr-3"
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />

          <TouchableOpacity
            className="bg-[#7F56D9] rounded-full p-3"
            onPress={sendMessage}
          >
            <SendHorizonal size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

import { Slot, router, useSegments } from "expo-router";
import { ArrowLeft, Bell, Settings } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

export default function ChatLayout() {
  const segments = useSegments();

  // Nếu có segment thứ 3 => đang trong /appointment/[id]
  const isDetailPage = segments[2] !== undefined;

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* HEADER */}
      <View className="w-full py-4 px-4 mt-9 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            if (isDetailPage) {
              router.push("/(tabs)/chat");
            } else {
              router.push("/(tabs)/home");
            }
          }}
          className="p-1"
        >
          <ArrowLeft width={32} height={32} color="#000" />
        </TouchableOpacity>

        <Text className="text-2xl text-black font-[Poppins-Bold]">Chat</Text>

        <View className="flex-row items-center gap-4">
          <Bell strokeWidth={1.5} />
          <TouchableOpacity onPress={() => router.push("/setting")}>
            <Settings strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      <Slot />
    </View>
  );
}

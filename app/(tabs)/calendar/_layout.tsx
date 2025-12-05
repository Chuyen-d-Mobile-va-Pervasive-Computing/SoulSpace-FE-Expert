import { Slot, router } from "expo-router";
import { ArrowLeft, Bell, Settings } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

export default function CalendarLayout() {
  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* HEADER */}
      <View className="w-full py-4 px-4 mt-9 flex-row items-center justify-between">
        {/* Left: Back Button */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          className="p-1 rounded-lg"
        >
          <ArrowLeft width={32} height={32} color="#000000" />
        </TouchableOpacity>

        {/* Center: Title */}
        <Text className="text-2xl text-black font-[Poppins-Bold]">
          Calendar
        </Text>

        {/* Right: Icons */}
        <View className="flex-row items-center gap-4">
          <Bell strokeWidth={1.5} />
          <TouchableOpacity onPress={() => router.push("/setting")}>
            <Settings strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CHILD SCREEN CONTENT */}
      <Slot />
    </View>
  );
}

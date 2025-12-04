import Decor from "@/assets/images/decor.svg";
import Logo from "@/assets/images/logo.svg";
import { useRouter } from "expo-router";
import { Bell, Settings } from "lucide-react-native";
import { useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import PendingRequests from "./components/PendingRequests";
import StatsGroup from "./components/StatsGroup";
import UpcomingRequests from "./components/UpcomingRequest";

export default function HomeScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* Heading */}
      <View className="w-full flex-row items-center justify-between py-4 px-4 border-b border-gray-200 bg-[#FAF9FF] mt-8">
        <View className="flex-row items-center">
          <Logo width={80} height={30} />
          <Text className="font-[Poppins-Bold] text-2xl text-[#7F56D9] ml-2">
            SOULSPACE
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <Bell strokeWidth={1.5} />
          <TouchableOpacity onPress={() => router.push("/setting")}>
            <Settings strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      <View className="flex-1 bg-[#FAF9FF]">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ flexGrow: 1 }}
          className="p-4"
        >
          {/* Greeting Card */}
          <View className="flex-row justify-between items-center bg-[#7F56D9] rounded-2xl">
            {/* Left side*/}
            <View className="flex-1 pl-4 pt-4 pb-4">
              <Text className="text-white font-[Poppins-Bold] text-2xl">
                Hello, Dr. Asriel
              </Text>
              <Text className="text-white mt-2 font-[Poppins-Regular] text-sm">
                Hope you are enjoying your day. If not then we are here for you
                as always.
              </Text>
            </View>

            {/* Right side */}
            <Decor width={100} height={170} />
          </View>

          <View className="flex-row justify-between items-center">
            <StatsGroup />
          </View>

          <View className="mt-8 rounded-[10px] bg-[#FF6B6B] p-4">
            <Text className="text-white font-[Poppins-Regular] text-[14px]">
              Please complete payment information and work schedule.
            </Text>
          </View>

          <PendingRequests />
          <UpcomingRequests />
        </ScrollView>
      </View>
    </View>
  );
}

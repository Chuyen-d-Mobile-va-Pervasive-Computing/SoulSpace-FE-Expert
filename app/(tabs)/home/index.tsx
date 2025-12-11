import Decor from "@/assets/images/decor.svg";
import Logo from "@/assets/images/logo.svg";
import { getExpertDashboard } from "@/lib/api";
import { useRouter } from "expo-router";
import { Bell, Settings } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PendingRequests from "./components/PendingRequests";
import StatsGroup from "./components/StatsGroup";
import UpcomingRequests from "./components/UpcomingRequest";

export default function HomeScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getExpertDashboard();
        setData(res);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7F56D9" />
      </View>
    );
  }

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
            <View className="flex-1 pl-4 pt-4 pb-4">
              <Text className="text-white font-[Poppins-Bold] text-2xl">
                Hello, {data?.expert?.full_name || "Expert"}
              </Text>
              <Text className="text-white mt-2 font-[Poppins-Regular] text-sm">
                Hope you are enjoying your day.
              </Text>
            </View>

            <Decor width={100} height={170} />
          </View>

          <StatsGroup stats={data?.summary} />

          <View className="mt-8 rounded-[10px] bg-[#FF6B6B] p-4">
            <Text className="text-white font-[Poppins-Regular] text-[14px]">
              Please complete payment information and work schedule.
            </Text>
          </View>

          {/* PASS DATA TO CHILDREN */}
          <PendingRequests data={data?.pending_preview} />
          <UpcomingRequests data={data?.upcoming_preview} />
        </ScrollView>
      </View>
    </View>
  );
}

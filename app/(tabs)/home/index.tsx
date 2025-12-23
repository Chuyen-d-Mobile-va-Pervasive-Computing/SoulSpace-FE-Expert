import Decor from "@/assets/images/decor.svg";
import Logo from "@/assets/images/logo.svg";
import { getExpertDashboard, getMyExpertProfile } from "@/lib/api";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  const [profile, setProfile] = useState<any>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getExpertDashboard();
      setData(res);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    // load expert profile for header avatar
    let mounted = true;
    const loadProfile = async () => {
      try {
        const res = await getMyExpertProfile();
        if (mounted) setProfile(res);
      } catch (err) {
        // ignore
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [loadDashboard]);

  // Reload dashboard whenever this screen gains focus (e.g., navigating from other tabs)
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

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
          <TouchableOpacity onPress={() => router.push("/setting")}>
            {profile &&
            (profile.avatar_url || profile.avatarUrl || profile.avatar) ? (
              <Image
                source={{
                  uri:
                    profile.avatar_url || profile.avatarUrl || profile.avatar,
                }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <Settings strokeWidth={1.5} />
            )}
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
          <View className="mb-10">
            <PendingRequests data={data?.pending_preview} />
            <UpcomingRequests data={data?.upcoming_preview} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

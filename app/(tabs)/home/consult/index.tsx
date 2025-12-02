import Minigame from "@/assets/images/minigame.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import * as Icons from "lucide-react-native";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type BadgeIcon = {
  badge_id: string;
  name: string;
  icon: string;
};

const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

function BadgeIcon({ name, locked }: { name: string; locked?: boolean }) {
  const IconComponent = (Icons as any)[name] || Icons.Award;
  return (
    <IconComponent
      width={36}
      height={36}
      color={locked ? "#9C9C9C" : "#3A6FE6"}
    />
  );
}

export default function MinigameScreen() {
  const [badges, setBadges] = useState<{ earned: any[]; locked: any[] } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) throw new Error("No access token found");
        const payload: any = jwtDecode(token);
        const userId = payload.sub;
        await AsyncStorage.setItem("user_id", userId);
        const res = await fetch(
          `${API_BASE}/api/v1/badges/user/${userId}/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setBadges({ earned: data.earned_badges, locked: data.locked_badges });
        } else {
          console.warn("Failed to fetch badges", data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-200 mt-8">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
            <ArrowLeft width={36} height={36} />
          </TouchableOpacity>
          <Text
            className="ml-3 text-2xl text-[#7F56D9]"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Consult
          </Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-4 pt-2"
      >
        <View className="w-full p-2 overflow-hidden">
          <View className="flex-1 rounded-2xl bg-[#FFFFFF] border border-[#EEEEEE] p-2 justify-center items-center overflow-hidden">
            <View className="py-2 gap-2 items-center w-full">
              <Minigame width={100} height={100} />
              <Text className="text-lg font-[Poppins-Bold] text-center">
                Build your mental habits
              </Text>
              <Text className="text-base font-[Poppins-Regular] text-center">
                Overcome challenges to earn badges and improve your mental
                health
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

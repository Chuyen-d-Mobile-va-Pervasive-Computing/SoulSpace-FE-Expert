import { getMyExpertProfile } from "@/lib/api";
import { Slot, router, useSegments } from "expo-router";
import { ArrowLeft, Settings } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function ForumLayout() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
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
  }, []);
  const segments = useSegments();

  const isDetailPage = segments[2] !== undefined;

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* HEADER */}
      <View className="w-full py-4 px-4 mt-9 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            if (isDetailPage) {
              router.push("/(tabs)/forum");
            } else {
              router.push("/(tabs)/home");
            }
          }}
          className="p-1"
        >
          <ArrowLeft width={32} height={32} color="#000" />
        </TouchableOpacity>

        <Text className="text-2xl text-black font-[Poppins-Bold]">Forum</Text>

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

      <Slot />
    </View>
  );
}

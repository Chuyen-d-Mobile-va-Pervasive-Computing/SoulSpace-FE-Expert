import { router } from "expo-router";
import { Calendar, Clock } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function UpcomingRequests({ data }: { data: any[] }) {
  const list = data || [];

  return (
    <View className="mt-8">
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className="text-lg font-[Poppins-Bold] text-black">Upcoming</Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(tabs)/appointment",
              params: { tab: "upcoming" },
            })
          }
        >
          <Text className="text-[#7F56D9] font-[Poppins-Medium]">
            View More
          </Text>
        </TouchableOpacity>
      </View>

      {list.length === 0 && (
        <Text className="text-gray-500 font-[Poppins-Italic] px-1">
          You have no upcoming meetings yet.
        </Text>
      )}

      {list.map((item, index) => {
        const date = item.appointment_date || item.date || "";
        const time = item.start_time || item.time || "";
        const avatar = item.user?.avatar_url || item.avatar || null;
        const name = item.user?.full_name || item.client_name || "Client";
        const id = item.appointment_id || item.id || index;

        return (
          <View
            key={`${date}-${time}-${index}`}
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#EAEAEA]"
            style={{ borderLeftWidth: 5, borderLeftColor: "#34C759" }}
          >
            <Text className="text-[14px] font-[Poppins-SemiBold] text-[#878787] mb-2">
              Appointment Details
            </Text>

            <View className="flex-row items-center">
              <Calendar size={18} color="#000" />
              <Text className="ml-2 font-[Poppins-Medium]">{date}</Text>

              <Clock size={18} color="#000" style={{ marginLeft: 20 }} />
              <Text className="ml-2 font-[Poppins-Medium]">{time}</Text>
            </View>

            <View className="w-full h-[1px] bg-gray-200 my-4" />

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full mr-4 bg-gray-300" />
                )}

                <Text className="text-base font-[Poppins-SemiBold]">
                  {name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/appointment/[id]",
                    params: { id },
                  })
                }
              >
                <Text className="text-[#7F56D9] font-[Poppins-Medium]">
                  View
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

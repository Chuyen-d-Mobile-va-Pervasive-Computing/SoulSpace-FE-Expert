import { router } from "expo-router";
import { Calendar, Clock } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function PendingRequests({ data }: { data: any[] }) {
  return (
    <View className="mt-8">
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className="text-lg font-[Poppins-Bold] text-black">
          Pending Requests
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(tabs)/appointment",
              params: { tab: "pending" },
            })
          }
        >
          <Text className="text-[#7F56D9] font-[Poppins-Medium]">
            View More
          </Text>
        </TouchableOpacity>
      </View>

      {(!data || data.length === 0) && (
        <Text className="text-gray-500 font-[Poppins-Italic] px-1">
          There are no pending meetings yet.
        </Text>
      )}

      {data?.map((item) => (
        <View
          key={item.id}
          className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#EAEAEA]"
          style={{ borderLeftWidth: 5, borderLeftColor: "#7F56D9" }}
        >
          <Text className="text-[14px] font-[Poppins-SemiBold] text-[#878787] mb-2">
            Appointment Details
          </Text>

          <View className="flex-row items-center">
            <Calendar size={18} color="#000" />
            <Text className="ml-2 font-[Poppins-Medium]">{item.date}</Text>

            <Clock size={18} color="#000" style={{ marginLeft: 20 }} />
            <Text className="ml-2 font-[Poppins-Medium]">{item.time}</Text>
          </View>

          <View className="w-full h-[1px] bg-gray-200 my-4" />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Image
                source={{ uri: item.avatar }}
                className="w-12 h-12 rounded-full mr-4"
              />
              <Text className="text-base font-[Poppins-SemiBold]">
                {item.client_name}
              </Text>
            </View>

            <TouchableOpacity>
              <Text className="text-[#7F56D9] font-[Poppins-Medium]">
                Accept
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

import { router } from "expo-router";
import { Calendar, Clock } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function UpcomingRequests() {
  // Mock data
  const upcoming = [
    {
      id: 1,
      date: "Fri, 18 Oct",
      time: "01:00 PM",
      doctor: "Dr. Benedict Leo",
      clinic: "Sunrise Clinic - 44/1B QTR",
      image: "https://i.pravatar.cc/60?img=15",
      color: "#34C759",
    },
    {
      id: 2,
      date: "Tue, 21 Oct",
      time: "03:45 PM",
      doctor: "Dr. Micheal Thomas",
      clinic: "New Hope Medical - 91/8 ZDS",
      image: "https://i.pravatar.cc/60?img=32",
      color: "#34C759",
    },
  ];

  return (
    <View className="mt-8">
      {/* TITLE */}
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className="text-lg font-[Poppins-Bold] text-black">
          Pending Requests
        </Text>

        <TouchableOpacity onPress={() => router.push("/(tabs)/appointment")}>
          <Text className="text-[#7F56D9] font-[Poppins-Medium]">
            View More
          </Text>
        </TouchableOpacity>
      </View>

      {upcoming.map((item) => (
        <View
          key={item.id}
          className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#EAEAEA]"
          style={{
            borderLeftWidth: 5,
            borderLeftColor: item.color,
          }}
        >
          {/* DATE + TIME */}
          <View className="mb-2">
            <Text className="text-[14px] font-[Poppins-SemiBold] text-[#878787]">
              Appointment Details
            </Text>
          </View>
          <View className="flex-row items-center">
            <Calendar size={18} color="#000" />
            <Text className="ml-2 font-[Poppins-Medium]">{item.date}</Text>

            <Clock size={18} color="#000" style={{ marginLeft: 20 }} />
            <Text className="ml-2 font-[Poppins-Medium]">{item.time}</Text>
          </View>

          {/* LINE */}
          <View className="w-full h-[1px] bg-gray-200 my-4" />

          {/* DOCTOR + ACCEPT BUTTON INLINE */}
          <View className="flex-row items-center justify-between">
            {/* Left side: Avatar + Name */}
            <View className="flex-row items-center">
              <Image
                source={{ uri: item.image }}
                className="w-12 h-12 rounded-full mr-4"
              />
              <View>
                <Text className="text-base font-[Poppins-SemiBold]">
                  {item.doctor}
                </Text>
              </View>
            </View>

            {/* Right side: Accept */}
            <TouchableOpacity onPress={() => console.log("Accepted", item.id)}>
              <Text className="text-[#7F56D9] font-[Poppins-Medium]">Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

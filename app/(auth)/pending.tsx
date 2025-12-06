import Success from "@/assets/images/success.svg";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SuccessScreen() {
  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* HEADER */}
      <View className="w-full py-4 px-4 mt-9 relative justify-center items-center">
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="absolute left-4 p-1 rounded-lg"
        >
          <ArrowLeft width={32} height={32} />
        </TouchableOpacity>
        <Text className="text-2xl text-black font-[Poppins-Bold]">Success</Text>
      </View>

      {/* WHITE BOX */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-8 w-full items-center shadow-lg">
          <Success width={150} height={150} />

          <Text className="text-2xl font-[Poppins-Bold] mt-6">
            Registration Successful
          </Text>

          <Text className="text-center text-[#878787] mt-3 font-[Poppins-Regular] text-[16px]">
            Your application has been received. You will receive a confirmation
            message soon.
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="bg-[#7F56D9] py-4 rounded-xl w-full mt-8"
          >
            <Text className="text-center text-white text-xl font-[Poppins-SemiBold]">
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { ToggleLeft, ToggleRight } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ReminderItemProps {
  title: string;
  time: string;
  initialOn?: boolean; // mặc định bật/tắt
}

export default function ReminderItem({ title, time, initialOn = false }: ReminderItemProps) {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Light": require("@/assets/fonts/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("@/assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-Black": require("@/assets/fonts/Poppins-Black.ttf"),
    "Poppins-Thin": require("@/assets/fonts/Poppins-Thin.ttf"),
    "Poppins-ExtraLight": require("@/assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Italic": require("@/assets/fonts/Poppins-Italic.ttf"),
  });
            
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
            
  if (!fontsLoaded) return null;
  const [isOn, setIsOn] = useState(initialOn);

  return (
    <View className="w-full h-[90px] bg-white/30 border border-white rounded-lg p-2 justify-center">
      <View className="flex-row items-center w-full justify-between">
        {/* Nội dung bên trái */}
        <View className="ml-2 gap-2">
          <Text className="text-lg font-[Poppins-Bold] text-white">{title}</Text>
          <Text className="text-base text-white font-[Poppins-Regular]">{time}</Text>
        </View>

        {/* Nút toggle bên phải */}
        <TouchableOpacity onPress={() => setIsOn(!isOn)}>
          {isOn ? (
            <ToggleLeft size={36} color="#BBBBBB" />
          ) : (
            <ToggleRight size={36} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
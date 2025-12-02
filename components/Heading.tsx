import { useFonts } from "expo-font";
import { useRouter } from "expo-router"; // ✅ Dùng expo-router
import * as SplashScreen from "expo-splash-screen";
import { ArrowLeft } from "lucide-react-native";
import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type HeadingProps = {
  title: string;
};

const Heading: React.FC<HeadingProps> = ({ title }) => {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Light": require("@/assets/fonts/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("@/assets/fonts/Poppins-ExtraBold.ttf"),
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

  return (
    <View
      onLayout={onLayoutRootView}
      className="w-full flex-row items-center justify-between py-4 px-4 border-b border-gray-200 bg-[#FAF9FF] mt-8"
    >
      <View className="flex-row items-center">
        {/* Nút quay lại → quay về trang trước trong stack */}
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft width={40} height={30} />
        </TouchableOpacity>

        <Text className="font-[Poppins-Bold] text-2xl text-[#7F56D9] ml-4">
          {title}
        </Text>
      </View>

      {/* <View className="flex-row items-center gap-4">
        <Bell strokeWidth={1.5} />
        <Settings strokeWidth={1.5} />
      </View> */}
    </View>
  );
};

export default Heading;

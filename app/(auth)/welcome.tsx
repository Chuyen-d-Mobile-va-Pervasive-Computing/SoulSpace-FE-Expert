import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";

// Import SVG/Images
import Cshape from "@/assets/images/c.svg";
import Circle from "@/assets/images/circle.svg";
import Illustrator from "@/assets/images/illustrator.svg";
import Light from "@/assets/images/light.svg";
import Logo from "@/assets/images/logo.svg";
import Page from "@/assets/images/page.svg";
import Statics from "@/assets/images/statics.svg";
import Ushape from "@/assets/images/u.svg";
import Wave from "@/assets/images/wave.svg";

SplashScreen.preventAutoHideAsync();

export default function Introduce() {
  const router = useRouter();

  // Load fonts
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View
      className="flex-1 bg-[#FAF9FF] px-6 pt-12"
      onLayout={onLayoutRootView}
    >
      {/* Logo */}
      <View className="items-center mt-12 mb-4">
        <Logo width={80} height={80} />
      </View>

      {/* Text */}
      <View className="items-center">
        <Text className="text-2xl font-[Poppins-Bold] text-[#7F56D9]">
          Welcome to SoulSpace
        </Text>
        <Text className="text-base text-center mt-2 font-[Poppins-Regular] text-black">
          Your mindful mental health AI companion{"\n"}
          for everyone, anywhere 🌿
        </Text>
      </View>

      {/* Main Illustration */}
      <View
        className="flex-1 items-center justify-center relative"
        style={{ height: 300 }}
      >
        <View
          className="absolute"
          style={{
            width: 280,
            height: 280,
            borderRadius: 500,
            backgroundColor: "white",
            top: "15%",
            left: "5%",
          }}
        />
        <Illustrator width={220} height={220} />

        {/* Small floating icons */}
        <View className="absolute" style={{ top: "20%", left: "10%" }}>
          <Statics width={60} height={60} />
        </View>
        <View className="absolute" style={{ top: "30%", right: "10%" }}>
          <Light width={60} height={60} />
        </View>
        <View className="absolute" style={{ bottom: "20%", right: "15%" }}>
          <Page width={60} height={60} />
        </View>

        {/* Decorative shapes */}
        <View className="absolute" style={{ top: "20%", right: "20%" }}>
          <Wave width={50} height={50} />
        </View>
        <View className="absolute" style={{ top: "35%", left: "5%" }}>
          <Circle width={20} height={20} />
        </View>
        <View className="absolute" style={{ bottom: "20%", left: "10%" }}>
          <Ushape width={50} height={50} />
        </View>
        <View className="absolute" style={{ bottom: "13%", left: "50%" }}>
          <Cshape width={20} height={20} />
        </View>
      </View>

      {/* Get Started Button */}
      <View className="w-full self-stretch px-2.5 flex-col justify-center items-center gap-2.5">
        <TouchableOpacity
          onPress={() => router.push("/(auth)/introduce")}
          className="py-5 mb-4 bg-[#7F56D9] rounded-full shadow-lg"
        >
          <Text className="text-white text-center font-[Poppins-Bold] text-lg px-10">
            Get Started →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign in */}
      <Text className="text-center font-[Poppins-Regular] text-gray-500 mb-32">
        Already have an account?{" "}
        <Text
          className="text-[#7F56D9] font-[Poppins-Bold]"
          onPress={() => router.push("/(auth)/login")}
        >
          Sign In
        </Text>
      </Text>
    </View>
  );
}

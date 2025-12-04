"use client";

import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert("Notice", "Please enter email and password");
      return;
    }

    console.log("Login with:", { email, password });
    router.replace("/(tabs)/home");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FAF9FF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <SafeAreaView className="flex-1 bg-white" onLayout={onLayoutRootView}>
          {/* Header */}
          <View className="bg-[#B5A2E9] rounded-b-[70%] pb-[20%] -mx-40 pl-40 pr-40 pt-20">
            {/* Back */}
            <View className="px-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-12 h-12 bg-white rounded-[10px] items-center justify-center"
              >
                <ChevronLeft size={30} color="#000000" />
              </TouchableOpacity>
            </View>

            <View className="w-full">
              {/* Title */}
              <View className="px-6 mt-24">
                <Text className="text-black text-3xl font-[Poppins-Bold]">
                  Welcome back! Glad
                </Text>
                <Text className="text-black text-3xl font-[Poppins-Bold] leading-[50px]">
                  to see you, Again!
                </Text>
              </View>

              {/* Email */}
              <View className="px-6 mt-20">
                <Text className="text-white mb-1 font-[Poppins-Medium]">
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#ccc"
                  className="w-full h-16 bg-white rounded-xl px-4 mb-4 font-[Poppins-Regular]"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                {/* Password */}
                <Text className="text-white mb-1 font-[Poppins-Medium]">
                  Password
                </Text>
                <View className="w-full h-16 bg-white rounded-xl px-4 flex-row items-center">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#ccc"
                    secureTextEntry={!showPassword}
                    className="flex-1 font-[Poppins-Regular]"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <Eye size={22} color="#B5A2E9" />
                    ) : (
                      <EyeOff size={22} color="#B5A2E9" />
                    )}
                  </Pressable>
                </View>

                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-pw")}
                  className="self-end mt-2"
                >
                  <Text className="text-white font-[Poppins-Italic]">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-1 px-6 pt-10">
            <TouchableOpacity
              onPress={handleSignIn}
              className="h-16 rounded-xl items-center justify-center bg-[#7F56D9]"
            >
              <Text className="text-white font-[Poppins-Bold] text-base">
                Login
              </Text>
            </TouchableOpacity>

            {/* Register */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-black font-[Poppins-Regular]">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text className="text-[#7F56D9] font-[Poppins-Medium]">
                  Register Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

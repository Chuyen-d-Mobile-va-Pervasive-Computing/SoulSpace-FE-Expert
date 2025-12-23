"use client";

import CustomAlert from "@/components/CustomAlert";
import { loginUser } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter email and password");
      return;
    }

    try {
      const res = await loginUser({ email, password });

      console.log("LOGIN SUCCESS:", res);

      // Lưu token + user info vào storage
      await AsyncStorage.setItem("token", res.access_token);
      await AsyncStorage.setItem("username", res.username);
      await AsyncStorage.setItem("role", res.role);
      await AsyncStorage.setItem("expert_status", res.expert_status);
      await AsyncStorage.setItem(
        "profile_completed",
        JSON.stringify(res.profile_completed)
      );

      if (res.profile_id) {
        await AsyncStorage.setItem("profile_id", res.profile_id);
      }

      setSuccessMessage("Login successful!");

      setTimeout(() => {
        if (!res.profile_completed) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(tabs)/home");
        }
      }, 800);
    } catch (err: any) {
      console.log("LOGIN ERROR:", err);
      setErrorMessage(err.message || "Invalid credentials");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ALERT FLOATING */}
      <CustomAlert
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#FAF9FF" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <SafeAreaView className="flex-1 bg-white" onLayout={onLayoutRootView}>
            {/* Header */}
            <View className="bg-[#B5A2E9] rounded-b-[70%] pb-[20%] -mx-40 pl-40 pr-40 pt-20">
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
    </View>
  );
}

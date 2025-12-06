"use client";
import CustomAlert from "@/components/CustomAlert";
import { registerExpert } from "@/lib/api";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Light": require("@/assets/fonts/Poppins-Light.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      const res = await registerExpert({
        email,
        password,
        confirm_password: password,
      });
      setErrorMessage(null);

      // Không log password
      console.log("Registered:", res);

      router.replace({
        pathname: "/(auth)/information",
        params: { user_id: res.user_id },
      });
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomAlert
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
      <KeyboardAvoidingView
        enabled={true}
        className="flex-1"
        behavior="padding"
      >
        <KeyboardAwareScrollView
          style={{ flex: 1, backgroundColor: "#FAF9FF" }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          extraScrollHeight={50}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
        >
          <View className="flex-1 bg-[#FAF9FF] pt-12">
            {/* Back */}
            <View className="mt-8 ml-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-12 h-12 bg-white rounded-[10px] items-center justify-center"
              >
                <ChevronLeft size={30} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View className="px-6 mt-24">
              <Text className="text-black text-3xl font-[Poppins-Bold]">
                Welcome! Create
              </Text>
              <Text className="text-black text-3xl font-[Poppins-Bold] leading-[50px]">
                your account
              </Text>
            </View>

            <View className="px-6 mt-12">
              {/* Email */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1 font-[Poppins-Regular]">
                  Email Address
                </Text>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="w-full h-16 bg-transparent rounded-[10px] px-4 border border-[#DADADA] font-[Poppins-Regular]"
                />
              </View>

              {/* Password */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1 font-[Poppins-Regular]">
                  Password
                </Text>
                <View className="w-full h-16 bg-transparent px-4 flex-row items-center border border-[#DADADA] rounded-[10px]">
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#ccc"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
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
              </View>

              {/* Confirm Password */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1 font-[Poppins-Regular]">
                  Confirm Password
                </Text>
                <View className="w-full h-16 bg-transparent px-4 flex-row items-center border border-[#DADADA] rounded-[10px]">
                  <TextInput
                    placeholder="Confirm your password"
                    placeholderTextColor="#ccc"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    className="flex-1 font-[Poppins-Regular]"
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <Eye size={22} color="#B5A2E9" />
                    ) : (
                      <EyeOff size={22} color="#B5A2E9" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                className="w-full h-16 rounded-lg items-center justify-center mb-4 bg-[#7F56D9]"
              >
                <Text className="text-white font-[Poppins-Bold] text-base">
                  Register
                </Text>
              </TouchableOpacity>

              {/* Or Login */}
              <View className="flex-row justify-center">
                <Text className="text-black font-[Poppins-Regular]">Or </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                >
                  <Text className="text-[#7F56D9] font-[Poppins-Medium]">
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

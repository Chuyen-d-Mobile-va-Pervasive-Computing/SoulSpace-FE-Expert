"use client";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ChevronLeft, MapPin, Upload } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function InformationScreen() {
  const router = useRouter();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [years, setYears] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [cert, setCert] = useState<string | null>(null);

  // pick avatar
  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // pick certificate
  const pickCertificate = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setCert(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#FAF9FF" }}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 bg-white rounded-xl items-center justify-center"
        >
          <ChevronLeft size={28} />
        </TouchableOpacity>
        <Text className="text-2xl font-[Poppins-Bold] ml-3">
          Complete profile
        </Text>
      </View>

      {/* Avatar */}
      <View className="items-center mt-10">
        <TouchableOpacity onPress={pickAvatar}>
          <Image
            source={
              avatar ? { uri: avatar } : require("@/assets/images/ava.png")
            }
            className="w-32 h-32 rounded-full border-4 border-[#E8E1FF]"
          />
          <Text className="text-center mt-2 text-[#7F56D9] font-[Poppins-Medium]">
            Change avatar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View className="px-5 mt-10">
        <Text className="text-gray-600 font-[Poppins-Medium] mb-1">Bio</Text>
        <TextInput
          value={bio}
          textAlignVertical="top"
          onChangeText={(t) => t.length <= 200 && setBio(t)}
          placeholder="Write something about yourself..."
          multiline
          style={{ height: 120 }}
          className="w-full bg-white rounded-xl p-4 border border-[#DADADA] font-[Poppins-Regular]"
        />
        <Text className="text-right text-gray-400 text-xs mt-1 font-[Poppins-Regular]">
          {bio.length}/200
        </Text>
      </View>

      {/* Phone + DOB */}
      <View className="flex-row px-5 mt-6 justify-between">
        <View className="w-[48%]">
          <Text className="text-gray-600 mb-1 font-[Poppins-Medium]">
            Phone
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="090xxxxxxx"
            keyboardType="phone-pad"
            className="w-full h-14 bg-white rounded-xl px-4 border border-[#DADADA] font-[Poppins-Regular]"
          />
        </View>

        <View className="w-[48%]">
          <Text className="text-gray-600 mb-1 font-[Poppins-Medium]">
            Date of Birth
          </Text>
          <TextInput
            value={dob}
            onChangeText={setDob}
            placeholder="DD/MM/YYYY"
            className="w-full h-14 bg-white rounded-xl px-4 border border-[#DADADA] font-[Poppins-Regular]"
          />
        </View>
      </View>

      {/* Years of experience */}
      <View className="px-5 mt-6">
        <Text className="text-gray-600 mb-1 font-[Poppins-Medium]">
          Years of Experience
        </Text>
        <TextInput
          value={years}
          onChangeText={setYears}
          placeholder="Eg. 5"
          keyboardType="numeric"
          className="w-full h-14 bg-white rounded-xl px-4 border border-[#DADADA] font-[Poppins-Regular]"
        />
      </View>

      {/* Email */}
      <View className="px-5 mt-6">
        <Text className="text-gray-600 mb-1 font-[Poppins-Medium]">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          className="w-full h-14 bg-white rounded-xl px-4 border border-[#DADADA] font-[Poppins-Regular]"
        />
      </View>

      {/* Clinic name */}
      <View className="px-5 mt-6">
        <Text className="text-gray-600 mb-1 font-[Poppins-Medium]">
          Clinic Name
        </Text>
        <TextInput
          value={clinicName}
          onChangeText={setClinicName}
          placeholder="Clinic ABC"
          className="w-full h-14 bg-white rounded-xl px-4 border border-[#DADADA] font-[Poppins-Regular]"
        />
      </View>

      {/* Clinic address */}
      <View className="px-5 mt-6">
        <Text className="text-gray-600 mb-1 font-[Poppins-Medium]">
          Clinic Address
        </Text>

        <View className="flex-row items-center bg-white rounded-xl border border-[#DADADA] px-4">
          <MapPin size={20} color="#7F56D9" />
          <TextInput
            value={clinicAddress}
            onChangeText={setClinicAddress}
            placeholder="123, Nguyen Trai, District 1"
            className="flex-1 h-14 ml-2 font-[Poppins-Regular]"
          />
        </View>
      </View>

      {/* Upload Certificate */}
      <View className="px-5 mt-8">
        <Text className="text-gray-600 mb-2 font-[Poppins-Medium]">
          Certificate
        </Text>

        <TouchableOpacity
          onPress={pickCertificate}
          className="w-full h-40 border-2 border-dashed border-[#C7B7FA] rounded-xl bg-[#F8F5FF] items-center justify-center"
        >
          <Upload size={32} color="#7F56D9" />
          <Text className="text-[#7F56D9] font-[Poppins-Medium] mt-2">
            {cert ? "Change file" : "Upload Certificate"}
          </Text>
        </TouchableOpacity>

        {cert && (
          <Text className="text-gray-500 text-sm mt-2 font-[Poppins-Regular]">
            File selected ✓
          </Text>
        )}
      </View>

      {/* Confirm Button */}
      <View className="px-5 mt-10 mb-10">
        <TouchableOpacity
          className="w-full h-16 bg-[#7F56D9] rounded-xl items-center justify-center shadow-md"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-white font-[Poppins-Bold] text-base">
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

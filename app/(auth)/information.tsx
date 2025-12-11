"use client";
import CustomAlert from "@/components/CustomAlert";
import {
  completeExpertProfile,
  uploadExpertAvatar,
  uploadExpertCertificate,
} from "@/lib/api";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, DollarSign, MapPin, Upload } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function InformationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const user_id = params.user_id ? String(params.user_id) : null;

  // form state
  const [avatar, setAvatar] = useState<string | null>(null); // storing URI
  const [bio, setBio] = useState("");
  const [years, setYears] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [name, setName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [cert, setCert] = useState<string | null>(null); // storing URI
  const [consultationPrice, setConsultationPrice] = useState("");

  // alert + loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // pick avatar
  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri); // use URI
    }
  };

  // pick certificate
  const pickCertificate = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setCert(result.assets[0].uri); // use URI
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user_id) {
      setErrorMessage("Missing user_id. Please register again.");
      return;
    }

    if (
      !phone ||
      !dob ||
      !years ||
      !clinicName ||
      !clinicAddress ||
      !cert ||
      !name ||
      !consultationPrice
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (Number.isNaN(Number(years))) {
      setErrorMessage("Years of experience must be a number.");
      return;
    }

    try {
      setLoading(true);

      // --- 1. UPLOAD AVATAR IF ANY ---
      let avatarUrl: string | undefined = undefined;

      if (avatar) {
        const uploadRes = await uploadExpertAvatar(avatar);
        avatarUrl = uploadRes.url || uploadRes.secure_url;
      }

      // --- 2. UPLOAD CERTIFICATE ---
      let certificateUrl: string = "";

      if (cert) {
        const uploadCertRes = await uploadExpertCertificate(cert);
        certificateUrl = uploadCertRes.url || uploadCertRes.secure_url;
      }

      // --- 3. SUBMIT PROFILE ---
      await completeExpertProfile({
        user_id,
        full_name: name,
        phone,
        date_of_birth: dob,
        years_of_experience: Number(years),
        clinic_name: clinicName,
        clinic_address: clinicAddress,
        bio,
        avatar_url: avatarUrl,
        certificate_url: certificateUrl,
        consultation_price: Number(consultationPrice),
      });

      setSuccessMessage(
        "Profile submitted successfully! Pending admin review."
      );

      setTimeout(() => {
        router.push("/(auth)/pending");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Submit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ALERT FLOATING */}
      <CustomAlert
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

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

        {/* Years */}
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

        {/* Full Name */}
        <View className="px-5 mt-6">
          <Text className="text-gray-600 mb-1 font-[Poppins-Medium]">
            Full Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            className="w-full h-14 bg-white rounded-xl px-4 border border-[#DADADA] font-[Poppins-Regular]"
          />
        </View>

        <View className="px-5 mt-6 flex-row">
          {/* Clinic name */}
          <View className="flex-1 mr-2">
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

          {/* Consultation Price */}
          <View className="flex-1 ml-2">
            <Text className="text-gray-600 mb-1 font-[Poppins-Medium]">
              Consultation Price
            </Text>
            <View className="flex-row items-center bg-white rounded-xl border border-[#DADADA] px-4 h-14">
              <DollarSign size={20} color="#7F56D9" />
              <TextInput
                value={consultationPrice}
                onChangeText={setConsultationPrice}
                placeholder="50"
                className="flex-1 ml-2 font-[Poppins-Regular]"
              />
            </View>
          </View>
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
              placeholder="123 Nguyen Trai, District 1"
              className="flex-1 h-14 ml-2 font-[Poppins-Regular]"
            />
          </View>
        </View>

        {/* Certificate */}
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

        {/* Submit */}
        <View className="px-5 mt-10 mb-10">
          <TouchableOpacity
            disabled={loading}
            onPress={handleSubmit}
            className={`w-full h-16 rounded-xl items-center justify-center shadow-md ${
              loading ? "bg-[#A192E0]" : "bg-[#7F56D9]"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-[Poppins-Bold] text-base">
                Confirm
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

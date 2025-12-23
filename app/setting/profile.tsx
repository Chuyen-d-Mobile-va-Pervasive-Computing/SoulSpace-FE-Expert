import Heading from "@/components/Heading";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CustomAlert from "@/components/CustomAlert";
import {
  getMyExpertProfile,
  updateExpertProfile,
  uploadExpertAvatar,
  uploadExpertCertificate,
} from "@/lib/api";

export default function Profile() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [date_of_birth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [clinic_name, setClinicName] = useState("");
  const [clinic_address, setClinicAddress] = useState("");
  const [years_of_experience, setYearsOfExperience] = useState("");
  const [avatar_url, setAvatarUrl] = useState("");
  const [certificate_url, setCertificateUrl] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const res = await getMyExpertProfile();

      setFullName(res.full_name || "");
      setPhone(res.phone || "");
      setDateOfBirth(res.date_of_birth || "");
      setBio(res.bio || "");
      setClinicName(res.clinic_name || "");
      setClinicAddress(res.clinic_address || "");
      setYearsOfExperience(String(res.years_of_experience || ""));
      setAvatarUrl(res.avatar_url ? `${res.avatar_url}?t=${Date.now()}` : "");
      setCertificateUrl(
        res.certificate_url ? `${res.certificate_url}?t=${Date.now()}` : ""
      );
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to load profile.");
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const localUri = result.assets[0].uri;

    // Preview ngay
    setAvatarUrl(localUri);

    try {
      const uploadRes = await uploadExpertAvatar(localUri);
      const cleanUrl = uploadRes.url;

      if (!cleanUrl) throw new Error("Upload avatar failed");

      setAvatarUrl(`${cleanUrl}?t=${Date.now()}`);

      await updateExpertProfile({
        avatar_url: cleanUrl,
      });
    } catch (e: any) {
      setErrorMessage(e.message || "Upload avatar failed.");
    }
  };

  const pickCertificate = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const localUri = result.assets[0].uri;

    // Preview ngay
    setCertificateUrl(localUri);

    try {
      const uploadRes = await uploadExpertCertificate(localUri);
      const cleanUrl = uploadRes.url;

      if (!cleanUrl) throw new Error("Upload certificate failed");

      setCertificateUrl(`${cleanUrl}?t=${Date.now()}`);

      await updateExpertProfile({
        certificate_url: cleanUrl,
      });
    } catch (e: any) {
      setErrorMessage(e.message || "Upload certificate failed.");
    }
  };

  const handleSave = async () => {
    if (!full_name || !phone) {
      setErrorMessage("Please fill required fields.");
      return;
    }

    try {
      setLoading(true);

      await updateExpertProfile({
        full_name,
        phone,
        date_of_birth,
        bio,
        avatar_url: avatar_url ? avatar_url.split("?")[0] : "",
        clinic_name,
        clinic_address,
        years_of_experience: Number(years_of_experience),
        certificate_url: certificate_url ? certificate_url.split("?")[0] : "",
      });

      // ✅ SUCCESS → popup native
      setShowSuccess(true);
    } catch (e: any) {
      setErrorMessage(e.message || "Update profile failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      <Heading title="My Profile" />

      <CustomAlert
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      <KeyboardAvoidingView enabled={true} behavior="padding">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          {/* AVATAR */}
          <View className="items-center mb-8">
            <Image
              source={avatar_url ? { uri: avatar_url } : undefined}
              className="w-28 h-28 rounded-full bg-[#EEEEEE]"
            />

            <TouchableOpacity onPress={pickAvatar} className="mt-3">
              <Text className="text-[#7F56D9] font-[Poppins-Italic] text-[14px]">
                Change avatar
              </Text>
            </TouchableOpacity>
          </View>

          {/* SECTION */}
          <Text className="text-lg font-[Poppins-SemiBold] mb-4 text-[#374151]">
            Personal Information
          </Text>

          <Input
            label="Full name"
            value={full_name}
            onChangeText={setFullName}
          />
          <Input label="Phone" value={phone} onChangeText={setPhone} />
          <Input
            label="Date of birth"
            value={date_of_birth}
            onChangeText={setDateOfBirth}
          />
          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
            height="h-36"
          />
          <Input
            label="Clinic name"
            value={clinic_name}
            onChangeText={setClinicName}
          />
          <Input
            label="Clinic address"
            value={clinic_address}
            onChangeText={setClinicAddress}
          />
          <Input
            label="Years of experience"
            value={years_of_experience}
            onChangeText={setYearsOfExperience}
            keyboardType="numeric"
          />

          {/* CERTIFICATE */}
          <View className="items-center mb-8">
            <Image
              source={certificate_url ? { uri: certificate_url } : undefined}
              className="w-full h-80 bg-[#EEEEEE]"
              resizeMode="contain"
            />

            <TouchableOpacity onPress={pickCertificate} className="mt-3">
              <Text className="text-[#7F56D9] font-[Poppins-Italic] text-[14px]">
                Change certificate
              </Text>
            </TouchableOpacity>
          </View>

          {/* SAVE */}
          <TouchableOpacity
            disabled={loading}
            onPress={handleSave}
            className={`h-14 rounded-xl items-center justify-center mt-2 mb-28 ${
              loading ? "opacity-40 bg-[#7F56D9]" : "bg-[#7F56D9]"
            }`}
          >
            <Text className="text-white font-[Poppins-Bold] text-base">
              {loading ? "Saving..." : "SAVE"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      {showSuccess && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white w-4/5 rounded-2xl px-6 py-8 items-center">
            <Text className="text-lg font-[Poppins-Bold] text-[#374151] mb-3">
              Success
            </Text>

            <Text className="text-center font-[Poppins-Regular] text-[#6B7280] mb-6">
              Profile updated successfully!
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.replace("/setting");
              }}
              className="w-full h-12 rounded-xl bg-[#7F56D9] items-center justify-center"
            >
              <Text className="text-white font-[Poppins-Bold] text-base">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function Input({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
  height = "h-16",
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboardType?: any;
  height?: string;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-[14px] font-[Poppins-SemiBold] text-[#374151]">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
        className={`${height} rounded-xl border border-[#EEEEEE] bg-white px-4 font-[Poppins-Regular]`}
      />
    </View>
  );
}

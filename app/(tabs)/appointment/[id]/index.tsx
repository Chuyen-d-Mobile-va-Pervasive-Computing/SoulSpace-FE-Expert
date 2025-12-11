import { getExpertAppointmentDetail } from "@/lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Clock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AppointmentDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const reasonOptions = [
    "Not feeling well",
    "I have another appointment",
    "Doctor unavailable",
    "Scheduled by mistake",
  ];

  // LOAD DETAIL
  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      const res = await getExpertAppointmentDetail(String(id));
      setDetail(res);
    } catch (err) {
      console.log("ERROR LOADING DETAIL:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" color="#7F56D9" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAF9FF]">
        <Text className="text-gray-600 font-[Poppins-Regular]">
          Appointment not found.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF9FF] px-4 pb-10">
      {/* USER CARD */}
      <View className="bg-white rounded-[10px] p-4 mt-6 shadow">
        <Image
          source={{
            uri: detail.user?.avatar_url || "https://via.placeholder.com/200",
          }}
          className="w-full h-56 rounded-[10px] bg-gray-200"
          resizeMode="cover"
        />

        <View className="flex-row justify-between items-center mt-4">
          <Text className="text-[18px] font-[Poppins-SemiBold] text-black">
            {detail.user?.full_name}
          </Text>

          <Text className="text-[18px] text-gray-600 font-[Poppins-Regular]">
            {detail.user?.phone}
          </Text>
        </View>
      </View>

      {/* Appointment Details */}
      <View>
        <Text className="text-[18px] font-[Poppins-SemiBold] mt-8 px-2">
          Appointment Details
        </Text>

        <View className="flex-row gap-4 items-center mt-4 ml-1">
          <Calendar color="#71717A" size={20} />
          <Text className="text-[#71717A] font-[Poppins-Regular] text-[14px]">
            {detail.appointment_date}
          </Text>
        </View>

        <View className="flex-row gap-4 items-center mt-4 ml-1">
          <Clock color="#71717A" size={20} />
          <Text className="text-[#71717A] font-[Poppins-Regular] text-[14px]">
            {detail.start_time} - {detail.end_time}
          </Text>
        </View>
      </View>

      {/* Clinic */}
      <View className="mt-8">
        <Text className="text-[18px] font-[Poppins-SemiBold] text-[#333333]">
          Clinic Information
        </Text>
        <Text className="text-[14px] font-[Poppins-Regular] text-[#878787] mt-2">
          {detail.clinic?.address || "No clinic information provided."}
        </Text>
      </View>

      {/* Separator */}
      <View className="h-[1px] bg-[#E5E5E5] my-3" />

      {/* Pricing */}
      <View className="flex-row justify-between items-center">
        <Text className="text-[18px] font-[Poppins-SemiBold]">Pricing</Text>
        <Text className="text-[18px] font-[Poppins-Bold] text-[#007BFF]">
          ${detail.pricing?.amount || "0.00"}
        </Text>
      </View>

      {/* CANCEL BUTTON */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="bg-red-500 p-4 rounded-xl mt-4"
      >
        <Text className="text-center text-white text-lg font-[Poppins-SemiBold]">
          Cancel Appointment
        </Text>
      </TouchableOpacity>

      {/* CANCEL MODAL */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-4">
          <View className="w-full bg-white p-6 rounded-xl">
            <Text className="text-xl font-[Poppins-SemiBold] mb-4">
              Reason for cancellation
            </Text>

            <TextInput
              placeholder="Enter reason..."
              value={reason}
              onChangeText={setReason}
              className="border border-gray-300 rounded-lg p-3 mb-4 text-[16px] font-[Poppins-Regular]"
            />

            <View>
              {reasonOptions.map((opt, index) => (
                <Pressable
                  key={index}
                  onPress={() => setReason(opt)}
                  className="p-3 rounded-lg mb-2 bg-gray-100"
                >
                  <Text className="text-[15px] font-[Poppins-Regular]">
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                console.log("Canceled with reason:", reason);
                setShowModal(false);
              }}
              className="bg-red-500 p-4 rounded-xl mt-4"
            >
              <Text className="text-center text-white text-lg font-[Poppins-SemiBold]">
                Confirm Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="mt-3"
            >
              <Text className="text-center text-gray-500 font-[Poppins-Regular]">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

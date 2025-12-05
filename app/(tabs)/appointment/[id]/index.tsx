import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Clock } from "lucide-react-native";
import React, { useState } from "react";
import {
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

  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const reasonOptions = [
    "Not feeling well",
    "I have another appointment",
    "Doctor unavailable",
    "Scheduled by mistake",
  ];

  return (
    <View className="flex-1 bg-[#FAF9FF] px-4 pb-10">
      {/* DOCTOR CARD */}
      <View className="bg-white rounded-[10px] p-4 mt-6 shadow">
        <Image
          source={{ uri: "https://i.pravatar.cc/200?img=10" }}
          className="w-full h-56 rounded-[10px]"
          resizeMode="cover"
        />

        <View className="flex-row justify-between items-center mt-4">
          <Text className="text-[18px] font-[Poppins-SemiBold] text-black">
            Dr. John Smith
          </Text>

          <Text className="text-[18px] text-gray-600 font-[Poppins-Regular]">
            +1 234 567 890
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
            Wed, 14 Oct
          </Text>
        </View>

        <View className="flex-row gap-4 items-center mt-4 ml-1">
          <Clock color="#71717A" size={20} />
          <Text className="text-[#71717A] font-[Poppins-Regular] text-[14px]">
            12:30 PM
          </Text>
        </View>
      </View>

      {/* ADDRESS */}
      <View className="mt-8">
        <Text className="text-[18px] font-[Poppins-SemiBold] text-[#333333]">
          Clinic Address
        </Text>
        <Text className="text-[14px] font-[Poppins-Regular] text-[#878787] mt-2">
          Healthy Life Wellness Clinic - 456, Sunshine Avenue, Raja Park, Tilak
          Nagar - Jaipur, Rajasthan, 302004
        </Text>
      </View>

      {/* Separator */}
      <View className="h-[1px] bg-[#E5E5E5] my-3" />

      {/* Total */}
      <View className="flex-row justify-between items-center">
        <Text className="text-[18px] font-[Poppins-SemiBold]">
          Total payable
        </Text>
        <Text className="text-[18px] font-[Poppins-Bold] text-[#007BFF]">
          $120.00
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

      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-4">
          <View className="w-full bg-white p-6 rounded-xl">
            <Text className="text-xl font-[Poppins-SemiBold] mb-4">
              Reason for cancellation
            </Text>

            {/* INPUT */}
            <TextInput
              placeholder="Enter reason..."
              value={reason}
              onChangeText={setReason}
              className="border border-gray-300 rounded-lg p-3 mb-4 text-[16px] font-[Poppins-Regular]"
            />

            {/* REASON OPTIONS */}
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

            {/* CANCEL BUTTON */}
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

            {/* CLOSE */}
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

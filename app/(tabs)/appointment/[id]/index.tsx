import {
  acceptExpertAppointment,
  cancelExpertAppointment,
  declineExpertAppointment,
  getExpertAppointmentDetail,
} from "@/lib/api";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Clock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const [loadingAction, setLoadingAction] = useState(false);

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
      setLoading(true);
      const res = await getExpertAppointmentDetail(String(id));
      setDetail(res);
    } catch (err) {
      console.log("ERROR LOADING DETAIL:", err);
    } finally {
      setLoading(false);
    }
  };

  // ACCEPT APPOINTMENT
  const handleAccept = async () => {
    try {
      setLoadingAction(true);
      await acceptExpertAppointment(String(id));
      Alert.alert("Success", "Appointment accepted!");
      loadDetail();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Accept failed");
    } finally {
      setLoadingAction(false);
    }
  };

  // DECLINE APPOINTMENT
  const handleDecline = async () => {
    if (!reason) {
      Alert.alert("Missing reason", "Please enter or select a reason.");
      return;
    }

    try {
      setLoadingAction(true);
      // For pending appointments, decline should use DELETE
      await cancelExpertAppointment(String(id), reason);
      Alert.alert("Success", "Appointment declined (deleted).");
      setShowModal(false);
      loadDetail();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Decline failed");
    } finally {
      setLoadingAction(false);
    }
  };

  // CANCEL APPOINTMENT
  const handleCancel = async () => {
    if (!reason) {
      Alert.alert("Missing reason", "Please enter or select a reason.");
      return;
    }

    try {
      setLoadingAction(true);
      // For already-approved/upcoming appointments, cancel should use POST (decline action)
      await declineExpertAppointment(String(id), reason);
      Alert.alert(
        "Cancelled",
        "Appointment has been cancelled (marked declined)."
      );
      setShowModal(false);
      loadDetail();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Cancel failed");
    } finally {
      setLoadingAction(false);
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

  const status = detail.status; // pending | upcoming | past | cancelled

  const totalAmount = (() => {
    const p = detail.pricing;
    if (!p) return 0;
    if (p.total_amount !== undefined && p.total_amount !== null)
      return p.total_amount;
    const price = Number(p.price) || 0;
    const vat = Number(p.vat) || 0;
    const after = Number(p.after_hours_fee) || 0;
    const discount = Number(p.discount) || 0;
    return price + vat + after - discount;
  })();
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
          ${totalAmount.toFixed(2)}
        </Text>
      </View>

      {/* ACTION BUTTONS */}
      {status === "pending" && (
        <View className="mt-6 flex-row gap-3">
          {/* DECLINE */}
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="flex-1 bg-red-500 p-4 rounded-xl"
          >
            <Text className="text-center text-white text-lg font-[Poppins-SemiBold]">
              Decline
            </Text>
          </TouchableOpacity>

          {/* ACCEPT */}
          <TouchableOpacity
            disabled={loadingAction}
            onPress={handleAccept}
            className="flex-1 bg-green-500 p-4 rounded-xl"
          >
            <Text className="text-center text-white text-lg font-[Poppins-SemiBold]">
              {loadingAction ? "Processing..." : "Accept"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* UPCOMING → SHOW CANCEL */}
      {status === "upcoming" && (
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-red-500 p-4 rounded-xl mt-6"
        >
          <Text className="text-center text-white text-lg font-[Poppins-SemiBold]">
            Cancel Appointment
          </Text>
        </TouchableOpacity>
      )}

      {/* PAST / CANCELLED → NO BUTTONS */}
      {(status === "past" || status === "cancelled") && (
        <Text className="text-center text-gray-500 mt-6 font-[Poppins-Italic]">
          This appointment is no longer active.
        </Text>
      )}

      {/* MODAL FOR DECLINE / CANCEL */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-4">
          <View className="w-full bg-white p-6 rounded-xl">
            <Text className="text-xl font-[Poppins-SemiBold] mb-4">
              Reason for {status === "pending" ? "declining" : "cancelling"}
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

            {/* CONFIRM */}
            <TouchableOpacity
              onPress={status === "pending" ? handleDecline : handleCancel}
              className="bg-red-500 p-4 rounded-xl mt-4"
            >
              <Text className="text-center text-white text-lg font-[Poppins-SemiBold]">
                {status === "pending" ? "Confirm Decline" : "Confirm Cancel"}
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

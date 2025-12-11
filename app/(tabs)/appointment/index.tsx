import { getExpertAppointments } from "@/lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Clock, MoreVertical } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";

export default function AppointmentScreen() {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const pagerRef = useRef<React.ElementRef<typeof PagerView> | null>(null);

  // Data từ API
  const [pending, setPending] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);

  const colors = ["#7F56D9", "#34C759", "#FF4D4F"];
  const tabs = ["Pending", "Upcoming", "Past"];

  const params = useLocalSearchParams();
  const tabParam = params.tab as string | undefined;

  // Load tab init từ URL params
  useEffect(() => {
    if (!tabParam) return;

    const idx =
      tabParam === "pending"
        ? 0
        : tabParam === "upcoming"
          ? 1
          : tabParam === "past"
            ? 2
            : 0;

    setPage(idx);
    setTimeout(() => pagerRef.current?.setPage(idx), 50);
  }, [tabParam]);

  // Load data từ API
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const resPending = await getExpertAppointments("pending");
      const resUpcoming = await getExpertAppointments("upcoming");
      const resPast = await getExpertAppointments("past");

      setPending(resPending.data || []);
      setUpcoming(resUpcoming.data || []);
      setPast(resPast.data || []);
    } catch (err) {
      console.log("LOAD APPOINTMENTS ERROR:", err);
    }
  };

  const lists = [pending, upcoming, past];

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* SLIDE TABS */}
      <View className="flex-row px-4 mt-3 mb-2 justify-between">
        {tabs.map((t, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setPage(index);
              pagerRef.current?.setPage(index);
            }}
            className="flex-1 items-center"
          >
            <Text
              className={`text-base font-[Poppins-SemiBold] ${
                page === index ? "text-black" : "text-gray-400"
              }`}
            >
              {t}
            </Text>

            {page === index && (
              <View className="w-10 h-[3px] bg-black rounded-full mt-1" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* SWIPE VIEW */}
      <PagerView
        ref={pagerRef}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          borderLeftWidth: 4,
          borderLeftColor: colors[page],
        }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {lists.map((data, idx) => (
          <View key={idx} className="px-4 pb-10">
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* TAB UPCOMING → Timeline view */}
              {idx === 1 && (
                <View className="mt-4">
                  {data.length === 0 && (
                    <Text className="text-gray-500 mt-4 text-center font-[Poppins-Italic]">
                      No upcoming appointments.
                    </Text>
                  )}

                  {data.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#EAEAEA]"
                      style={{
                        borderLeftWidth: 4,
                        borderLeftColor: colors[idx],
                      }}
                    >
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-500 font-[Poppins-Medium]">
                          Appointment Details
                        </Text>
                        <MoreVertical size={20} color="#6B6B6B" />
                      </View>

                      <View className="flex-row items-center mt-3">
                        <Calendar size={20} color="#000" />
                        <Text className="ml-2 text-base font-[Poppins-Medium]">
                          {item.date}
                        </Text>

                        <Clock
                          size={20}
                          color="#000"
                          style={{ marginLeft: 20 }}
                        />
                        <Text className="ml-2 text-base font-[Poppins-Medium]">
                          {item.start_time}
                        </Text>
                      </View>

                      <View className="w-full h-[1px] bg-gray-200 my-4" />

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Image
                            source={{ uri: item.user.avatar_url || "" }}
                            className="w-14 h-14 rounded-full mr-4 bg-gray-200"
                          />
                          <Text className="text-lg font-[Poppins-SemiBold]">
                            {item.user.full_name}
                          </Text>
                        </View>

                        <TouchableOpacity>
                          <Text className="text-[#7F56D9] text-base font-[Poppins-SemiBold]">
                            Chat
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* PENDING + PAST */}
              {idx !== 1 &&
                (data.length === 0 ? (
                  <Text className="text-gray-500 mt-4 text-center font-[Poppins-Italic]">
                    No appointments here.
                  </Text>
                ) : (
                  data.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/appointment/[id]",
                          params: { id: item.appointment_id },
                        })
                      }
                      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#EAEAEA]"
                      style={{
                        borderLeftWidth: 4,
                        borderLeftColor: colors[idx],
                      }}
                    >
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-500 font-[Poppins-Medium]">
                          Appointment Details
                        </Text>
                        <MoreVertical size={20} color="#6B6B6B" />
                      </View>

                      <View className="flex-row items-center mt-3">
                        <Calendar size={20} color="#000" />
                        <Text className="ml-2 text-base font-[Poppins-Medium]">
                          {item.date}
                        </Text>

                        <Clock
                          size={20}
                          color="#000"
                          style={{ marginLeft: 20 }}
                        />
                        <Text className="ml-2 text-base font-[Poppins-Medium]">
                          {item.start_time}
                        </Text>
                      </View>

                      <View className="w-full h-[1px] bg-gray-200 my-4" />

                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: item.user.avatar_url || "" }}
                          className="w-14 h-14 rounded-full mr-4 bg-gray-200"
                        />
                        <View>
                          <Text className="text-lg font-[Poppins-SemiBold]">
                            {item.user.full_name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ))}
            </ScrollView>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

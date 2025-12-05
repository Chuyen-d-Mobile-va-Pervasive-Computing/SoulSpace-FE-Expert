import { Calendar, Clock, MoreVertical } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";

export default function AppointmentScreen() {
  const [page, setPage] = useState(0);

  const pending = [
    {
      id: 1,
      date: "Wed, 14 Oct",
      time: "12:30 PM",
      doctor: "Nguyen Van A",
      clinic: "Healthy Life Wellness Clinic",
      image: "https://i.pravatar.cc/40?img=26",
    },
    {
      id: 2,
      date: "Wed, 14 Oct",
      time: "4:00 PM",
      doctor: "Nguyen Thi B",
      clinic: "Healthy Life Wellness Clinic",
      image: "https://i.pravatar.cc/40?img=27",
    },
  ];

  const upcoming = [
    {
      id: 3,
      date: "Fri, 18 Oct",
      time: "1:00 PM",
      doctor: "Dr. Manoj Kumar",
      clinic: "Central Hospital - 88/4 VRT",
      image: "https://i.pravatar.cc/40?img=27",
    },
  ];

  const past = [
    {
      id: 2,
      date: "Mon, 02 Sep",
      time: "09:00 AM",
      doctor: "Dr. Amit Verma",
      clinic: "City Healthcare Center - 12/4 UPT",
      image: "https://i.pravatar.cc/40?img=26",
    },
  ];

  const tabs = ["Pending", "Upcoming", "Past"];
  const lists = [pending, upcoming, past];
  const pagerRef = useRef<React.ElementRef<typeof PagerView> | null>(null);
  const colors = ["#7F56D9", "#34C759", "#FF4D4F"];

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
            <ScrollView>
              {/* ====================== UPCOMING TIMELINE ====================== */}
              {idx === 1 && (
                <View className="mt-4">
                  {/* WRAPPER MUST BE RELATIVE FOR ABSOLUTE CHILDREN */}
                  <View style={{ flexDirection: "row", position: "relative" }}>
                    {/* LEFT TIME COLUMN */}
                    <View style={{ width: 60 }}>
                      {["08:00", "10:00", "12:00", "14:00", "16:00"].map(
                        (t, index) => (
                          <Text
                            key={t}
                            style={{
                              position: "absolute",
                              top: index * 120, // bigger spacing for visibility
                            }}
                            className="text-[#8F9BB3] text-sm font-[Poppins-Regular]"
                          >
                            {t}
                          </Text>
                        )
                      )}
                    </View>

                    {/* RIGHT TIMELINE CARDS */}
                    <View
                      style={{
                        flex: 1,
                        minHeight: 600,
                        position: "relative",
                        overflow: "visible",
                      }}
                    >
                      {data.map((item) => {
                        // ---------------------
                        //   FIXED TIME PARSER
                        // ---------------------
                        let time = item.time.replace(".", ":"); // support "13:00 PM", "1.00 PM", etc

                        const [hPart, rest] = time.split(":");
                        const [mPart, period] = rest.split(" ");

                        let hour = parseInt(hPart);
                        const minute = parseInt(mPart);

                        // Force 12h format if input was 24h
                        if (hour > 12 && period === "PM") hour -= 12;

                        // Convert 12h → 24h
                        let hour24 = hour;
                        if (period === "PM" && hour !== 12) hour24 = hour + 12;
                        if (period === "AM" && hour === 12) hour24 = 0;

                        const decimalTime = hour24 + minute / 60;

                        // TIMELINE START AT 08:00
                        const offset = (decimalTime - 8) * 60;

                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={{
                              position: "absolute",
                              top: offset,
                              left: 0,
                              right: 0,
                              zIndex: 10, // <-- FIX QUAN TRỌNG NHẤT
                              elevation: 10, // <-- Android cần elevation
                              borderLeftWidth: 4,
                              borderLeftColor: "#34C759",
                            }}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-[#EAEAEA]"
                          >
                            {/* HEADER */}
                            <View className="flex-row justify-between items-center">
                              <Text className="text-gray-500 font-[Poppins-Medium]">
                                Appointment Details
                              </Text>
                              <MoreVertical size={20} color="#6B6B6B" />
                            </View>

                            {/* DATE & TIME */}
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
                                {item.time}
                              </Text>
                            </View>

                            <View className="w-full h-[1px] bg-gray-200 my-4" />

                            {/* DOCTOR */}
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center">
                                <Image
                                  source={{ uri: item.image }}
                                  className="w-14 h-14 rounded-full mr-4"
                                />
                                <Text className="text-lg font-[Poppins-SemiBold]">
                                  {item.doctor}
                                </Text>
                              </View>

                              <TouchableOpacity>
                                <Text className="text-[#7F56D9] text-base font-[Poppins-SemiBold]">
                                  Chat
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

              {/* ====================== ORIGINAL FOR OTHER TABS ====================== */}
              {idx !== 1 &&
                data.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: colors[page],
                    }}
                    className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#EAEAEA]"
                  >
                    {/* HEADER ROW */}
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
                        {item.time}
                      </Text>
                    </View>

                    <View className="w-full h-[1px] bg-gray-200 my-4" />

                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: item.image }}
                        className="w-14 h-14 rounded-full mr-4"
                      />
                      <View>
                        <Text className="text-lg font-[Poppins-SemiBold]">
                          {item.doctor}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

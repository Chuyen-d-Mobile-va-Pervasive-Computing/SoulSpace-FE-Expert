import AppointmentCard from "@/components/AppointmentCard";
import { getExpertAppointments } from "@/lib/api";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";

export default function AppointmentScreen() {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const pagerRef = useRef<React.ElementRef<typeof PagerView> | null>(null);

  // ===== DATA =====
  const [pending, setPending] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);

  const lists = [pending, upcoming, past];
  const tabs = ["Pending", "Upcoming", "Past"];
  const colors = ["#7F56D9", "#34C759", "#FF4D4F"];

  // ===== PARAM TAB =====
  const params = useLocalSearchParams();
  const tabParam = params.tab as string | undefined;

  useEffect(() => {
    if (!tabParam) return;
    const idx = tabParam === "pending" ? 0 : tabParam === "upcoming" ? 1 : 2;
    setPage(idx);
    setTimeout(() => pagerRef.current?.setPage(idx), 50);
  }, [tabParam]);

  // ===== LOAD API =====
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const resPending = await getExpertAppointments("pending");
      const resUpcoming = await getExpertAppointments("upcoming");
      const resPast = await getExpertAppointments("past");

      setPending(resPending.data || []);
      setUpcoming(resUpcoming.data || []);
      setPast(resPast.data || []);
    } catch (e) {
      console.log("LOAD APPOINTMENTS ERROR:", e);
    }
  }, []);

  // Reload appointments whenever this screen gains focus (e.g., navigating from Home)
  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [loadAppointments])
  );

  // ===== HELPERS =====
  const parseTimeToMinutes = (t: string) => {
    const [h, m] = String(t || "0:0").split(":");
    return Number(h) * 60 + Number(m);
  };

  const groupByDate = (arr: any[]) =>
    arr.reduce((acc: Record<string, any[]>, cur) => {
      if (!acc[cur.date]) acc[cur.date] = [];
      acc[cur.date].push(cur);
      return acc;
    }, {});

  const upcomingGrouped = groupByDate(upcoming);

  // ===== TIMELINE CONFIG =====
  const HOURS = 24;
  const TOTAL_MINUTES = 24 * 60;
  const CONTAINER_HEIGHT = 2800;

  // ===== Selected date navigation for Upcoming tab =====
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const changeSelectedDate = useCallback((delta: number) => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  const formatDisplayDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* ===== TABS ===== */}
      <View className="flex-row px-4 mt-3 mb-2">
        {tabs.map((t, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setPage(i);
              pagerRef.current?.setPage(i);
            }}
            className="flex-1 items-center"
          >
            <Text
              className={`text-base font-[Poppins-SemiBold] ${
                page === i ? "text-black" : "text-gray-400"
              }`}
            >
              {t}
            </Text>
            {page === i && (
              <View className="w-10 h-[3px] bg-black rounded-full mt-1" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== PAGER ===== */}
      <PagerView
        ref={pagerRef}
        style={{
          flex: 1,
          borderLeftWidth: 4,
          borderLeftColor: colors[page],
        }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {lists.map((data, idx) => (
          <View key={idx} className="px-4 pb-10">
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* ===== UPCOMING (TIMELINE) ===== */}
              {idx === 1 && (
                <View className="mt-4">
                  {/* Date navigation header */}
                  <View className="flex-row items-center justify-between px-2 mb-3">
                    <TouchableOpacity onPress={() => changeSelectedDate(-1)}>
                      <ChevronLeft />
                    </TouchableOpacity>

                    <Text className="font-[Poppins-SemiBold]">
                      {formatDisplayDate(selectedDate)}
                    </Text>

                    <TouchableOpacity onPress={() => changeSelectedDate(1)}>
                      <ChevronRight />
                    </TouchableOpacity>
                  </View>

                  {/* Render timeline for selectedDate only */}
                  {(() => {
                    const items = upcoming
                      .filter(
                        (it) =>
                          it.appointment_date === selectedDate ||
                          it.date === selectedDate
                      )
                      .sort(
                        (a, b) =>
                          parseTimeToMinutes(a.start_time) -
                          parseTimeToMinutes(b.start_time)
                      );

                    if (items.length === 0) {
                      return (
                        <Text className="text-center text-gray-500 mt-4 font-[Poppins-Italic]">
                          No upcoming appointments for{" "}
                          {formatDisplayDate(selectedDate)}.
                        </Text>
                      );
                    }

                    return (
                      <View className="mb-8">
                        <View className="flex-row">
                          {/* ===== HOURS COLUMN ===== */}
                          <View style={{ width: 60 }}>
                            {Array.from({ length: HOURS }).map((_, h) => (
                              <Text
                                key={h}
                                style={{
                                  height: CONTAINER_HEIGHT / HOURS,
                                  textAlign: "right",
                                  paddingRight: 8,
                                  color: "#6B7280",
                                }}
                              >
                                {String(h).padStart(2, "0")}:00
                              </Text>
                            ))}
                          </View>

                          {/* ===== TIMELINE ===== */}
                          <View
                            style={{
                              flex: 1,
                              height: CONTAINER_HEIGHT,
                              position: "relative",
                            }}
                          >
                            {/* vertical line */}
                            <View
                              style={{
                                position: "absolute",
                                left: 12,
                                top: 0,
                                bottom: 0,
                                width: 2,
                                backgroundColor: colors[idx],
                              }}
                            />

                            {items.map((item: any) => {
                              const startMin = parseTimeToMinutes(
                                item.start_time
                              );
                              const endMin = parseTimeToMinutes(
                                item.end_time || item.start_time
                              );

                              const durationMin = Math.max(
                                endMin - startMin,
                                30
                              );

                              const top =
                                (startMin / TOTAL_MINUTES) * CONTAINER_HEIGHT;

                              const minHeight =
                                (durationMin / TOTAL_MINUTES) *
                                CONTAINER_HEIGHT;

                              return (
                                <AppointmentCard
                                  key={item.appointment_id}
                                  item={item}
                                  color={colors[idx]}
                                  onPress={() =>
                                    router.push({
                                      pathname: "/(tabs)/appointment/[id]",
                                      params: { id: item.appointment_id },
                                    })
                                  }
                                  containerStyle={{
                                    position: "absolute",
                                    left: 24,
                                    right: 8,
                                    top,
                                    minHeight,
                                  }}
                                />
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    );
                  })()}
                </View>
              )}

              {/* ===== PENDING & PAST ===== */}
              {idx !== 1 &&
                (data.length === 0 ? (
                  <Text className="text-center text-gray-500 mt-4 font-[Poppins-Italic]">
                    No appointments here.
                  </Text>
                ) : (
                  data.map((item, i) => (
                    <AppointmentCard
                      key={item.appointment_id ?? i}
                      item={item}
                      color={colors[idx]}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/appointment/[id]",
                          params: { id: item.appointment_id },
                        })
                      }
                    />
                  ))
                ))}
            </ScrollView>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

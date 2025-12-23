import {
  createExpertSchedule,
  deleteExpertSchedule,
  getExpertSchedules,
} from "@/lib/api";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CalendarScreen() {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // STATE
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0–11
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`
  );

  const [schedules, setSchedules] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // POPUP STATES
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");

  // GET NUMBER OF DAYS IN MONTH
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // FIRST DAY OF WEEK (0 = Sunday → adjust to Monday-first)
  const jsFirstDay = new Date(currentYear, currentMonth, 1).getDay();
  const firstDay = jsFirstDay === 0 ? 6 : jsFirstDay - 1;

  // FORMAT DATE
  const formatDate = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "en-US",
    { month: "long" }
  );

  const selectedIsPast = selectedDate < todayISO;

  // LOAD SCHEDULES ON MONTH CHANGE
  useEffect(() => {
    loadSchedules();
  }, [currentMonth, currentYear]);

  const loadSchedules = async () => {
    try {
      setLoading(true);

      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}`;

      const res = await getExpertSchedules(monthStr);

      const map: Record<string, any[]> = {};

      const list = res.data || [];

      list.forEach((item: any) => {
        if (!map[item.date]) map[item.date] = [];
        map[item.date].push(item);
      });

      setSchedules(map);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ADD NEW SLOT
  const handleAddSchedule = async () => {
    if (!date || !timeStart || !timeEnd) return;

    try {
      await createExpertSchedule({
        date,
        start_time: timeStart,
        end_time: timeEnd,
      });

      setShowModal(false);
      setDate("");
      setTimeStart("");
      setTimeEnd("");

      loadSchedules();
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE SLOT
  const handleDeleteSlot = async (id: string) => {
    try {
      await deleteExpertSchedule(id);
      loadSchedules();
    } catch (err) {
      console.log(err);
    }
  };

  // MOVE MONTH
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  return (
    <View className="flex-1 bg-[#FAF9FF] px-4 pt-4 relative">
      {/* HEADER MONTH SWITCHER */}
      <View className="flex-row justify-between items-center mb-3">
        <TouchableOpacity
          onPress={previousMonth}
          className="bg-white rounded-xl p-1 border border-[#CED3DE]"
        >
          <ChevronLeft size={28} color="#000" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-xl font-[Poppins-Bold] text-black">
            {monthName}
          </Text>
          <Text className="text-[#8F9BB3] font-[Poppins-Regular]">
            {currentYear}
          </Text>
        </View>

        <TouchableOpacity
          onPress={nextMonth}
          className="bg-white rounded-xl p-1 border border-[#CED3DE]"
        >
          <ChevronRight size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* WEEK LABELS */}
      <View className="flex-row justify-between px-2 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <Text
            key={d}
            className="text-[#8F9BB3] w-[14%] text-center font-[Poppins-Regular]"
          >
            {d}
          </Text>
        ))}
      </View>

      {/* LOADING INDICATOR */}
      {loading && (
        <ActivityIndicator size="large" color="#7F56D9" className="mt-4" />
      )}

      {/* CALENDAR GRID */}
      <View className="flex-row flex-wrap mt-2">
        {/* Empty slots */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <View key={i} className="w-[14%] h-14" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const fullDate = formatDate(day);
          const isPast = fullDate < todayISO;
          const isSelected = fullDate === selectedDate && !isPast;
          const hasSlots = schedules[fullDate]?.length > 0;

          return (
            <TouchableOpacity
              key={day}
              className="w-[14%] h-14 items-center justify-center"
              onPress={() => {
                if (!isPast) setSelectedDate(fullDate);
              }}
              disabled={isPast}
            >
              <View
                className={`w-10 h-10 items-center justify-center ${
                  isSelected
                    ? "bg-[#7F56D9] rounded-xl"
                    : isPast
                      ? "bg-transparent rounded-lg"
                      : "bg-transparent rounded-lg"
                }`}
              >
                <Text
                  className={
                    isSelected
                      ? "text-white font-[Poppins-Regular]"
                      : isPast
                        ? "text-gray-400 font-[Poppins-Regular]"
                        : "text-black font-[Poppins-Regular]"
                  }
                >
                  {day}
                </Text>
              </View>

              {/* DOTS */}
              <View className="h-3 flex-row gap-1 mt-1 justify-center items-center">
                {hasSlots &&
                  schedules[fullDate].map((slot) => (
                    <View
                      key={
                        slot.schedule_id ??
                        slot.id ??
                        `${slot.start_time}-${slot.end_time}`
                      }
                      className={`w-2 h-2 rounded-full ${isPast ? "bg-gray-400" : "bg-[#7F56D9]"}`}
                    />
                  ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="w-full h-[2px] bg-gray-300 my-4 opacity-50" />

      {/* TIME SLOTS */}
      <View>
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-[Poppins-SemiBold]">Time slots</Text>
          <Text className="text-[#7F56D9] font-[Poppins-Regular]">
            {selectedDate}
          </Text>
        </View>

        <View className="flex-row flex-wrap mt-3 gap-3">
          {schedules[selectedDate]?.length ? (
            schedules[selectedDate].map((slot) => (
              <View
                key={slot.schedule_id ?? slot.id}
                className="border border-purple-400 px-4 py-2 rounded-full flex-row items-center gap-3"
              >
                <Text className="font-[Poppins-Regular]">
                  {slot.start_time} - {slot.end_time}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setDeleteId(slot.schedule_id);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <X size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 mt-2 font-[Poppins-Regular]">
              No slots for this day.
            </Text>
          )}
        </View>
      </View>

      {/* FLOATING ADD BUTTON */}
      <TouchableOpacity
        onPress={() => {
          if (selectedIsPast) return;
          setDate(selectedDate);
          setShowModal(true);
        }}
        disabled={selectedIsPast}
        className={`absolute bottom-24 right-6 bg-[#7F56D9] w-16 h-16 rounded-full items-center justify-center shadow-lg ${selectedIsPast ? "opacity-40" : ""}`}
      >
        <Plus size={36} color="#fff" />
      </TouchableOpacity>

      {/* ADD SLOT MODAL */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full p-5 bg-white rounded-2xl">
            <Text className="text-xl font-[Poppins-Bold] text-center mb-4">
              Add a slot
            </Text>

            {/* Date */}
            <View className="mb-4">
              <Text className="mb-1 font-[Poppins-Regular]">Date</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="2025-01-05"
                value={date}
                onChangeText={setDate}
              />
            </View>

            {/* Start time */}
            <View className="mb-4">
              <Text className="mb-1 font-[Poppins-Regular]">Start time</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="09:00"
                value={timeStart}
                onChangeText={setTimeStart}
              />
            </View>

            {/* End time */}
            <View className="mb-4">
              <Text className="mb-1 font-[Poppins-Regular]">End time</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="10:00"
                value={timeEnd}
                onChangeText={setTimeEnd}
              />
            </View>

            {/* BUTTONS */}
            <View className="flex-row justify-between mt-2">
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="flex-1 mr-2 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="font-[Poppins-Bold]">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddSchedule}
                className="flex-1 ml-2 bg-purple-500 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-[Poppins-Bold]">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {showDeleteConfirm && (
        <Modal transparent animationType="fade" visible={showDeleteConfirm}>
          <View className="flex-1 bg-black/40 justify-center items-center px-6">
            <View className="w-full bg-white rounded-2xl p-6">
              <Text className="text-xl font-[Poppins-Bold] text-center mb-4">
                Delete this slot?
              </Text>

              <Text className="text-center mb-6 text-gray-600 font-[Poppins-Regular]">
                Are you sure you want to delete this time slot?
              </Text>

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="flex-1 mr-2 bg-gray-200 py-3 rounded-lg items-center"
                  onPress={() => setShowDeleteConfirm(false)}
                >
                  <Text className="font-[Poppins-Bold]">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 ml-2 bg-red-500 py-3 rounded-lg items-center"
                  onPress={async () => {
                    if (deleteId) await handleDeleteSlot(deleteId);
                    setShowDeleteConfirm(false);
                    setDeleteId(null);
                  }}
                >
                  <Text className="text-white font-[Poppins-Bold]">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

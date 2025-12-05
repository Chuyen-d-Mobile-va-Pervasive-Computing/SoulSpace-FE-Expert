import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

// MOCK APPOINTMENTS
const mockAppointments: Record<string, string[]> = {
  "2025-12-02": ["9:00 - 11:00", "13:00 - 14:00"],
  "2025-12-05": ["10:00 - 12:00"],
  "2025-12-11": ["8:00 - 9:00"],
  "2025-12-17": ["9:00 - 11:00", "15:00 - 17:00"],
};

export default function CalendarScreen() {
  const today = new Date();

  // REACTIVE STATES
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0–11
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`
  );

  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");

  // GET NUMBER OF DAYS IN MONTH
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // FIRST DAY OF WEEK (0 = Sunday)
  const jsFirstDay = new Date(currentYear, currentMonth, 1).getDay();
  const firstDay = jsFirstDay === 0 ? 6 : jsFirstDay - 1;

  // MOVE MONTH LEFT
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  // MOVE MONTH RIGHT
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const formatDate = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "en-US",
    { month: "long" }
  );

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

      {/* CALENDAR GRID */}
      <View className="flex-row flex-wrap">
        {/* Empty slots before the first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <View key={i} className="w-[14%] h-14" />
        ))}

        {/* Each day of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const fullDate = formatDate(day);
          const isSelected = fullDate === selectedDate;
          const haveAppointments = !!mockAppointments[fullDate];

          return (
            <TouchableOpacity
              key={day}
              className="w-[14%] h-14 items-center justify-center"
              onPress={() => setSelectedDate(fullDate)}
            >
              <View
                className={`w-10 h-10 items-center justify-center ${
                  isSelected
                    ? "bg-[#7F56D9] rounded-xl"
                    : "bg-transparent rounded-lg"
                }`}
              >
                <Text
                  className={
                    isSelected
                      ? "text-white font-[Poppins-Regular]"
                      : "text-black font-[Poppins-Regular]"
                  }
                >
                  {day}
                </Text>
              </View>

              {/* DOT AREA (always same height) */}
              <View className="h-3 flex-row gap-1 mt-1 justify-center items-center">
                {mockAppointments[fullDate]?.map((_, idx) => (
                  <View
                    key={idx}
                    className="w-2 h-2 bg-[#7F56D9] rounded-full"
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
          {mockAppointments[selectedDate]?.length ? (
            mockAppointments[selectedDate].map((slot, i) => (
              <View
                key={i}
                className="border border-purple-400 px-4 py-2 rounded-full flex-row items-center gap-3"
              >
                <Text className="font-[Poppins-Regular]">{slot}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 mt-2 font-[Poppins-Regular]">
              No slots for this day.
            </Text>
          )}
        </View>
      </View>

      {/* FLOATING + BUTTON */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="absolute bottom-24 right-6 bg-[#7F56D9] w-16 h-16 rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={36} color="#fff" />
      </TouchableOpacity>

      {/* POPUP ADD SLOT */}
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
              <Text className="mb-1 font-[Poppins-Regular]">Time start</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="09:00"
                value={timeStart}
                onChangeText={setTimeStart}
              />
            </View>

            {/* End time */}
            <View className="mb-4">
              <Text className="mb-1 font-[Poppins-Regular]">Time end</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="11:00"
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
                onPress={() => setShowModal(false)}
                className="flex-1 ml-2 bg-purple-500 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-[Poppins-Bold]">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

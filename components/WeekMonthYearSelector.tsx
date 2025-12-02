import { Picker } from "@react-native-picker/picker";
import { CalendarDays, ChevronDown } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  mode: "week" | "month" | "year";
  onChange: (range: { start: Date; end: Date }) => void;
};

export default function WeekMonthYearSelector({ mode, onChange }: Props) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const months = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  // Hàm sinh N tuần gần nhất
  const generateLastNWeeks = (n: number = 12) => {
    const weeks: { label: string; start: Date; end: Date }[] = [];
    const today = new Date();

    // Lấy Chủ nhật gần nhất (kết thúc tuần hiện tại)
    const end = new Date(today);
    end.setDate(end.getDate() - end.getDay());

    for (let i = 0; i < n; i++) {
      const start = new Date(end);
      const weekEnd = new Date(end);
      weekEnd.setDate(start.getDate() + 6);

      weeks.unshift({
        label: `${start.getDate()}/${start.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
        start,
        end: weekEnd,
      });

      // lùi lại 1 tuần
      end.setDate(end.getDate() - 7);
    }

    return weeks;
  };

  const weeks = useMemo(() => generateLastNWeeks(12), []);

  // khi chọn tuần
  const handleSelectWeek = (index: number) => {
    setSelectedWeekIndex(index);
    const { start, end } = weeks[index];
    onChange({ start, end });
  };

  // khi chọn tháng
  const handleSelectMonth = (month: number) => {
    setSelectedMonth(month);
    const start = new Date(selectedYear, month, 1);
    const end = new Date(selectedYear, month + 1, 0);
    onChange({ start, end });
  };

  // khi chọn năm
  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    onChange({ start, end });
  };

  const visibleLabel =
    mode === "week"
      ? weeks[selectedWeekIndex]?.label ?? ""
      : mode === "month"
      ? months[selectedMonth]
      : String(selectedYear);

  const containerWidth = mode === "year" ? 140 : mode === "week" ? 200 : 190;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.outerContainer, { width: containerWidth }]}>
        <CalendarDays size={18} color="#7F56D9" style={{ marginRight: 0, marginLeft: 4 }} />

        <View style={styles.centerDisplay}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.centerLabel}
          >
            {visibleLabel}
          </Text>
          <ChevronDown size={16} color="#7F56D9" style={{ marginLeft: 8 }} />
        </View>

        {mode === "week" && (
          <Picker
            selectedValue={selectedWeekIndex}
            onValueChange={handleSelectWeek}
            mode="dropdown"
            dropdownIconColor="transparent"
            style={styles.invisiblePicker}
          >
            {weeks.map((w, i) => (
              <Picker.Item key={i} label={w.label} value={i} style={styles.pickerItem} />
            ))}
          </Picker>
        )}

        {mode === "month" && (
          <Picker
            selectedValue={selectedMonth}
            onValueChange={handleSelectMonth}
            mode="dropdown"
            dropdownIconColor="transparent"
            style={styles.invisiblePicker}
          >
            {months.map((m, i) => (
              <Picker.Item key={i} label={m} value={i} style={styles.pickerItem} />
            ))}
          </Picker>
        )}

        {mode === "year" && (
          <Picker
            selectedValue={selectedYear}
            onValueChange={handleSelectYear}
            mode="dropdown"
            dropdownIconColor="transparent"
            style={styles.invisiblePicker}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <Picker.Item key={year} label={String(year)} value={year} style={styles.pickerItem} />;
            })}
          </Picker>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  outerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    elevation: 3,
  },
  centerDisplay: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    color: "#7F56D9",
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
    maxWidth: "75%",
  },
  invisiblePicker: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0,
  },
  pickerItem: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
});
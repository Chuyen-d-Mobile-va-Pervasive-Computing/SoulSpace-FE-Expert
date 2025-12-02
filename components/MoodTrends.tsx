import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// thêm map cảm xúc cho trục Y
const emotions = ["Angry", "Worried", "Neutral", "Happy", "Excited"];

const mockData = {
  week: {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [{ data: [2, 3, 2, 5, 3, 2, 1] }], // dữ liệu 1–5
  },
  month: {
    labels: ["W1", "W2", "W3", "W4"],
    datasets: [{ data: [3, 2, 4, 3] }],
  },
  year: {
    labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
    datasets: [{ data: [2, 4, 3, 5, 4, 3] }],
  },
};

export default function MoodTrends() {
  const [filter, setFilter] = useState<"week" | "month" | "year">("week");

  const data = mockData[filter];

  return (
    <View className="bg-white rounded-2xl p-4 shadow mt-10">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-[Poppins-Bold] text-lg text-black">
          Your mood trends
        </Text>
        <View className="flex-row bg-purple-100 rounded-full overflow-hidden">
          {(["week", "month", "year"] as const).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              className={`px-3 py-1 ${
                filter === item ? "bg-purple-500" : "bg-purple-100"
              }`}
            >
              <Text
                className={`text-sm ${
                  filter === item ? "text-white" : "text-purple-500"
                }`}
              >
                {item === "week" ? "Week" : item === "month" ? "Month" : "Year"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart bọc bằng Pressable */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/analytic",
            params: { tab: filter },
          })
        }
      >
        <LineChart
          data={data}
          width={screenWidth - 40}
          height={220}
          fromZero
          yAxisInterval={1}
          formatYLabel={(value) =>
            emotions[Math.round(Number(value)) - 1] ?? ""
          }
          chartConfig={{
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            decimalPlaces: 0,
            color: () => "#7F56D9", // line luôn tím đặc
            strokeWidth: 1.5,
            labelColor: () => "#9E9E9E",
            fillShadowGradient: "#7F56D9", // bắt đầu bằng tím
            fillShadowGradientFrom: "#7F56D9", // trên: tím
            fillShadowGradientTo: "#FFFFFF", // dưới: trắng
            fillShadowGradientOpacity: 0.3, // đậm ở trên
            propsForBackgroundLines: {
              stroke: "#EDEDED",
            },
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#7F56D9",
              fill: "#FFFFFF", // dot trắng
            },
          }}
          bezier
          style={{
            borderRadius: 16,
          }}
        />
      </Pressable>
    </View>
  );
}

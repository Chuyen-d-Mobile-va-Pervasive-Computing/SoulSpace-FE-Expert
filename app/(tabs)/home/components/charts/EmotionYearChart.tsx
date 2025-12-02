import React, { useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// Y axis mapping
const emotions = ["Angry", "Worried", "Neutral", "Happy", "Excited"];

const EmotionYearChart = () => {
  const [selected, setSelected] = useState<{
    month: string;
    value: number;
  } | null>(null);

  // Trục X: tháng
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // Trục Y: số từ 1–5 (map sang emotion)
  const data = [2, 3, 4, 5, 3, 2, 1, 4, 5, 3, 2, 4];

  return (
    <View className="bg-white rounded-2xl p-4 shadow mt-6">
      <Text className="font-[Poppins-Bold] text-lg text-black mb-3">
        Yearly Emotion Stats
      </Text>

      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={screenWidth - 40}
        height={250}
        fromZero
        yAxisInterval={1}
        formatYLabel={(value) => emotions[Math.round(Number(value)) - 1] ?? ""}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#FFFFFF",
          backgroundGradientTo: "#FFFFFF",
          decimalPlaces: 0,
          color: () => "#7F56D9",
          strokeWidth: 1.5,
          labelColor: () => "#9E9E9E",
          propsForLabels: {
            fontFamily: "Poppins-Regular",
            fontSize: 10,
          },
          fillShadowGradientFrom: "#7F56D9",
          fillShadowGradientTo: "#FFFFFF",
          fillShadowGradientFromOpacity: 0.3,
          fillShadowGradientToOpacity: 0,
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: "#7F56D9",
            fill: "#FFFFFF",
          },
          propsForBackgroundLines: {
            stroke: "#EDEDED",
          },
        }}
        bezier
        style={{ borderRadius: 16 }}
        decorator={() =>
          selected ? (
            <View
              style={{
                position: "absolute",
                top: 20,
                left:
                  labels.indexOf(selected.month) *
                    ((screenWidth - 40) / labels.length) -
                  20,
                backgroundColor: "#7F56D9",
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontFamily: "Poppins-SemiBold",
                }}
              >
                {selected.month}: {emotions[selected.value - 1]}
              </Text>
            </View>
          ) : null
        }
        onDataPointClick={(point) => {
          setSelected({
            month: labels[point.index],
            value: data[point.index],
          });
        }}
      />
    </View>
  );
};

export default EmotionYearChart;

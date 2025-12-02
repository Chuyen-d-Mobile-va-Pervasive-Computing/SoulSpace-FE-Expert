import React, { useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// trục Y là cảm xúc
const emotions = ["Angry", "Worried", "Neutral", "Happy", "Excited"];

const EmotionLineChart = () => {
  const [selected, setSelected] = useState<{
    day: string;
    value: number;
  } | null>(null);

  // trục X là ngày trong tuần
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const data = [2, 3, 2, 5, 3, 4, 1]; // giá trị 1–5 map sang emotions

  return (
    <View className="bg-white rounded-2xl p-4 shadow mt-6">
      <Text className="font-[Poppins-Bold] text-lg text-black mb-3">
        Weekly Emotion Stats
      </Text>

      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={screenWidth - 40}
        height={220}
        fromZero
        yAxisInterval={1}
        formatYLabel={(value) => emotions[Math.round(Number(value)) - 1] ?? ""}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#FFFFFF",
          backgroundGradientTo: "#FFFFFF",
          decimalPlaces: 0,
          color: () => "#7F56D9", // line tím
          strokeWidth: 1.5,
          labelColor: () => "#9E9E9E",
          propsForLabels: {
            fontFamily: "Poppins-Regular",
            fontSize: 10,
          },
          fillShadowGradientFrom: "#7F56D9", // trên tím
          fillShadowGradientTo: "#FFFFFF", // dưới trắng
          fillShadowGradientFromOpacity: 0.3,
          fillShadowGradientToOpacity: 0,
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: "#7F56D9",
            fill: "#FFFFFF", // dot trắng
          },
          propsForBackgroundLines: {
            stroke: "#EDEDED",
          },
        }}
        bezier
        style={{
          borderRadius: 16,
        }}
        decorator={() =>
          selected ? (
            <View
              style={{
                position: "absolute",
                top: 20,
                left:
                  labels.indexOf(selected.day) *
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
                {selected.day}: {emotions[selected.value - 1]}
              </Text>
            </View>
          ) : null
        }
        onDataPointClick={(point) => {
          setSelected({
            day: labels[point.index],
            value: data[point.index],
          });
        }}
      />
    </View>
  );
};

export default EmotionLineChart;

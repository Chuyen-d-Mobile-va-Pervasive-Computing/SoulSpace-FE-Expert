// components/CircularTimeSelector.js
import { useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Line } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedThumb = Animated.createAnimatedComponent(Circle);

const SIZE = 280;
const STROKE_WIDTH = 30;
const CENTER = SIZE / 2;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER_CIRCLE_RADIUS = 35;
const INNER_RADIUS = RADIUS - 40;
const OUTER_CIRC = 2 * Math.PI * RADIUS;
const INNER_CIRC = 2 * Math.PI * INNER_RADIUS;

function hourToAngle(hour) {
  const h = hour % 12;
  return (h / 12) * 360;
}
function angleToHour(angle, inner = false) {
  let val = Math.round((angle / 360) * 12) % 12;
  if (!inner) {
    return val === 0 ? 12 : val;
  } else {
    return val === 0 ? 0 : val + 12;
  }
}
function minuteToAngle(minute) {
  return (minute / 60) * 360;
}
function angleToMinute(angle) {
  return Math.round((angle / 360) * 60) % 60;
}

export default function CircularTimeSelector({ time, setTime }) {
  const [mode, setMode] = useState("hour");
  const [isInner, setIsInner] = useState(time.getHours() >= 12);

  const rotationHour = useSharedValue(hourToAngle(time.getHours()));
  const rotationMinute = useSharedValue(minuteToAngle(time.getMinutes()));
  const modeSV = useSharedValue(mode === "hour" ? 0 : 1);
  const isInnerSV = useSharedValue(isInner ? 1 : 0);

  useEffect(() => {
    rotationHour.value = withTiming(
      hourToAngle(time.getHours(), time.getMinutes()),
      { duration: 220 }
    );
    rotationMinute.value = withTiming(minuteToAngle(time.getMinutes()), {
      duration: 220,
    });
    modeSV.value = mode === "hour" ? 0 : 1;
    isInnerSV.value = time.getHours() >= 12 ? 1 : 0;
    setIsInner(time.getHours() >= 12);
  }, [time, mode]);

  const updateState = (newAngle, radiusFromCenter) => {
    const newTime = new Date(time.getTime());
    if (mode === "hour") {
      const isInnerCircle = radiusFromCenter < RADIUS - 25;
      setIsInner(isInnerCircle);
      const hourVal = angleToHour(newAngle, isInnerCircle);
      newTime.setHours(hourVal);
    } else {
      newTime.setMinutes(angleToMinute(newAngle));
    }
    setTime(newTime);
  };

  const panGesture = Gesture.Pan().onUpdate((event) => {
    const x = event.x - CENTER;
    const y = event.y - CENTER;
    let newAngle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (newAngle < 0) newAngle += 360;
    const dist = Math.sqrt(x * x + y * y);

    if (mode === "hour") {
      rotationHour.value = newAngle;
      isInnerSV.value = dist < RADIUS - 25 ? 1 : 0;
      runOnJS(updateState)(newAngle, dist);
    } else {
      rotationMinute.value = newAngle;
      runOnJS(updateState)(newAngle, dist);
    }
  });

  const outerProgressProps = useAnimatedProps(() => {
    const isMinute = modeSV.value === 1;
    const hourInner = isInnerSV.value === 1;
    if (isMinute) {
      const offset = OUTER_CIRC - (rotationMinute.value / 360) * OUTER_CIRC;
      return { strokeDashoffset: offset };
    } else {
      if (hourInner) {
        return { strokeDashoffset: OUTER_CIRC };
      } else {
        const offset = OUTER_CIRC - (rotationHour.value / 360) * OUTER_CIRC;
        return { strokeDashoffset: offset };
      }
    }
  });

  const innerProgressProps = useAnimatedProps(() => {
    const isHour = modeSV.value === 0;
    const hourInner = isInnerSV.value === 1;
    if (isHour && hourInner) {
      const offset = INNER_CIRC - (rotationHour.value / 360) * INNER_CIRC;
      return { strokeDashoffset: offset };
    } else {
      return { strokeDashoffset: INNER_CIRC };
    }
  });

  const thumbProps = useAnimatedProps(() => {
    const activeModeIsHour = modeSV.value === 0;
    const angle = activeModeIsHour ? rotationHour.value : rotationMinute.value;
    const r = activeModeIsHour
      ? isInnerSV.value === 1
        ? INNER_RADIUS
        : RADIUS
      : RADIUS;
    const angleRad = (angle - 90) * (Math.PI / 180);
    return {
      cx: CENTER + r * Math.cos(angleRad),
      cy: CENTER + r * Math.sin(angleRad),
    };
  });

  const handProps = useAnimatedProps(() => {
    const activeModeIsHour = modeSV.value === 0;
    const angle = activeModeIsHour ? rotationHour.value : rotationMinute.value;
    const r = activeModeIsHour
      ? isInnerSV.value === 1
        ? INNER_RADIUS
        : RADIUS
      : RADIUS;
    const angleRad = (angle - 90) * (Math.PI / 180);
    return {
      x2: CENTER + r * Math.cos(angleRad),
      y2: CENTER + r * Math.sin(angleRad),
    };
  });

  const handleMarkerPress = ({ type, ring, value }) => {
    if (type === "hour") {
      const newTime = new Date(time.getTime());
      newTime.setHours(value);
      setTime(newTime);

      setIsInner(ring === "inner");
      isInnerSV.value = ring === "inner" ? 1 : 0;

      rotationHour.value = withTiming(hourToAngle(value, time.getMinutes()), {
        duration: 300,
      });
    } else {
      const newTime = new Date(time.getTime());
      newTime.setMinutes(value);
      setTime(newTime);

      rotationMinute.value = withTiming(minuteToAngle(value), {
        duration: 220,
      });
    }
  };

  const markers = useMemo(() => {
    const result = [];
    if (mode === "hour") {
      const outerR = RADIUS - 2;
      for (let i = 1; i <= 12; i++) {
        const angleRad = (i * 30 - 90) * (Math.PI / 180);
        const hourNumber = i === 12 ? 12 : i;
        result.push(
          <TouchableOpacity
            key={`o-${i}`}
            onPress={() =>
              handleMarkerPress({
                type: "hour",
                ring: "outer",
                value: hourNumber,
              })
            }
            className="absolute w-11 h-11 justify-center items-center"
            style={{
              transform: [
                { translateX: outerR * Math.cos(angleRad) },
                { translateY: outerR * Math.sin(angleRad) },
              ],
            }}
          >
            <Text className="absolute text-[16px] font-semibold text-gray-800">
              {i}
            </Text>
          </TouchableOpacity>
        );
      }
      const innerHours = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];
      innerHours.forEach((hour, i) => {
        const angleRad = ((i + 1) * 30 - 90) * (Math.PI / 180);
        const display = hour === 0 ? "00" : String(hour);
        result.push(
          <TouchableOpacity
            key={`i-${hour}`}
            onPress={() =>
              handleMarkerPress({ type: "hour", ring: "inner", value: hour })
            }
            className="absolute w-11 h-11 justify-center items-center"
            style={{
              transform: [
                { translateX: INNER_RADIUS * Math.cos(angleRad) },
                { translateY: INNER_RADIUS * Math.sin(angleRad) },
              ],
            }}
          >
            <Text className="absolute text-[12px] text-gray-600">
              {display}
            </Text>
          </TouchableOpacity>
        );
      });
    } else {
      const outerR2 = RADIUS - 2;
      for (let i = 0; i < 12; i++) {
        const minute = i * 5;
        const angleRad = (i * 30 - 90) * (Math.PI / 180);
        result.push(
          <TouchableOpacity
            key={`m-${i}`}
            onPress={() => handleMarkerPress({ type: "minute", value: minute })}
            className="absolute w-11 h-11 justify-center items-center"
            style={{
              transform: [
                { translateX: outerR2 * Math.cos(angleRad) },
                { translateY: outerR2 * Math.sin(angleRad) },
              ],
            }}
          >
            <Text className="absolute text-[16px] font-semibold text-gray-800">
              {minute.toString().padStart(2, "0")}
            </Text>
          </TouchableOpacity>
        );
      }
    }
    return result;
  }, [mode, time]);

  return (
    <View className="items-center" style={{ width: SIZE, height: SIZE + 60 }}>
      {/* Header hh:mm */}
      <View className="flex-row items-center mb-3">
        <TouchableOpacity onPress={() => setMode("hour")}>
          <Text
            className={`text-[50px] font-semibold mx-1 ${
              mode === "hour" ? "text-violet-600" : "text-gray-600"
            }`}
          >
            {time.getHours().toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>
        <Text className="text-[50px] font-semibold text-gray-600">:</Text>
        <TouchableOpacity onPress={() => setMode("minute")}>
          <Text
            className={`text-[50px] font-semibold mx-1 ${
              mode === "minute" ? "text-violet-600" : "text-gray-600"
            }`}
          >
            {time.getMinutes().toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Center circle */}
      <TouchableOpacity
        className="absolute z-10 bg-violet-600 justify-center items-center"
        style={{
          width: CENTER_CIRCLE_RADIUS * 2,
          height: CENTER_CIRCLE_RADIUS * 2,
          borderRadius: CENTER_CIRCLE_RADIUS,
          top: "50%",
          left: "50%",
          transform: [
            { translateX: -CENTER_CIRCLE_RADIUS },
            { translateY: -CENTER_CIRCLE_RADIUS + 50 },
          ],
        }}
        onPress={() => setMode((m) => (m === "hour" ? "minute" : "hour"))}
      >
        <Text className="text-white text-3xl font-bold">
          {mode === "hour"
            ? time.getHours().toString().padStart(2, "0")
            : time.getMinutes().toString().padStart(2, "0")}
        </Text>
      </TouchableOpacity>

      {/* Circle selector */}
      <GestureDetector gesture={panGesture}>
        <Animated.View>
          <Svg height={SIZE} width={SIZE}>
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="#E9E9F0"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            <AnimatedCircle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="#C9B3F5"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={OUTER_CIRC}
              animatedProps={outerProgressProps}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
            <AnimatedCircle
              cx={CENTER}
              cy={CENTER}
              r={INNER_RADIUS}
              stroke="#C9B3F5"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={INNER_CIRC}
              animatedProps={innerProgressProps}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
            <AnimatedLine
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER}
              stroke="#7F56D9"
              strokeWidth={2}
              animatedProps={handProps}
            />
            <AnimatedThumb
              cx={CENTER}
              cy={CENTER}
              r={8}
              fill="#7F56D9"
              stroke="white"
              strokeWidth={2}
              animatedProps={thumbProps}
            />
            <Circle cx={CENTER} cy={CENTER} r={5} fill="#7F56D9" />
          </Svg>
          <View className="absolute inset-0 justify-center items-center">
            {markers}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

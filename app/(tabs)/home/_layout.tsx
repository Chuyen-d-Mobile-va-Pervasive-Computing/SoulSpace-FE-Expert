import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="analytic" options={{ title: "Thống kê" }} />
      <Stack.Screen
        name="diary/index"
        options={{ title: "Xem tổng quan nhật ký" }}
      />
      <Stack.Screen
        name="diary/detail"
        options={{ title: "Xem chi tiết nhật ký" }}
      />
      <Stack.Screen name="remind/index" options={{ title: "Nhắc nhở" }} />
      <Stack.Screen name="remind/add" options={{ title: "Thêm lời nhắc" }} />
      <Stack.Screen
        name="remind/update"
        options={{ title: "Chỉnh sửa lời nhắc" }}
      />
      <Stack.Screen
        name="remind/custom"
        options={{ title: "Tùy chỉnh lời nhắc" }}
      />
      <Stack.Screen name="consult/index" options={{ title: "Consult" }} />
      <Stack.Screen name="plant/index" options={{ title: "Trồng cây" }} />
      <Stack.Screen
        name="plant/list"
        options={{ title: "Danh sách hành động" }}
      />
      <Stack.Screen
        name="plant/action"
        options={{ title: "Thực hiện hành động" }}
      />
    </Stack>
  );
}

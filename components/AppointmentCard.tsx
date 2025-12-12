import { Calendar, Clock, MoreVertical } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Props {
  item: any;
  color: string;
  onPress: () => void;
  containerStyle?: any;
}

export default function AppointmentCard({
  item,
  color,
  onPress,
  containerStyle,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 shadow-sm border border-[#EAEAEA]"
      style={[
        {
          borderLeftWidth: 4,
          borderLeftColor: color,
        },
        containerStyle,
      ]}
    >
      {/* header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-500 font-[Poppins-Medium]">
          Appointment Details
        </Text>
        <MoreVertical size={18} color="#6B6B6B" />
      </View>

      {/* date & time */}
      <View className="flex-row items-center mt-2">
        <Calendar size={16} color="#000" />
        <Text className="ml-2 text-sm font-[Poppins-Medium]">{item.date}</Text>

        <Clock size={16} color="#000" style={{ marginLeft: 16 }} />
        <Text className="ml-2 text-sm font-[Poppins-Medium]">
          {item.start_time}
        </Text>
      </View>

      <View className="w-full h-[1px] bg-gray-200 my-3" />

      {/* user */}
      <View className="flex-row items-center">
        <Image
          source={{ uri: item.user.avatar_url || "" }}
          className="w-10 h-10 rounded-full mr-3 bg-gray-200"
        />
        <Text className="text-base font-[Poppins-SemiBold]">
          {item.user.full_name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

import Heading from "@/components/Heading";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import dayjs from "dayjs";
import { AudioLines } from "lucide-react-native";
import AngryIcon from "@/assets/images/angry.svg";
import { ScrollView, Text, View, TouchableOpacity, Modal, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import { emotionMap } from "@/constants/EmotionMap";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

export default function DiaryListScreen() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<any>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    const getToken = async () => {
        try {
            return await AsyncStorage.getItem("access_token");
        } catch (err) {
            console.error("Failed to get token", err);
            return null;
        }
    };

    const fetchDetail = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/api/v1/journal/${id}`, {
                headers: {  Authorization: `Bearer ${token}`},
            });
            const data = await res.json();
            setDetail(data);
        } catch (err) {
            console.log("ERROR FETCH DETAIL:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleConfirmCancel = () => {
        setShowConfirm(false);
        router.push("/(tabs)/home/diary");
    };

    const playRecording = async () => {
        if (!detail?.audio_url) return;

        const { sound } = await Audio.Sound.createAsync({ uri: detail.audio_url });
        setSound(sound);
        await sound.playAsync();
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#FAF9FF]">
                <ActivityIndicator size="large" color="#7F56D9" />
            </View>
        );
    }

    const emotion = detail?.emotion_label;
    const Icon = emotion ? (emotionMap[emotion] as any) : AngryIcon;

    return (
        <View className="flex-1 bg-[#FAF9FF]">
            <Heading title="Diary" />

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="flex-1 px-4 mt-4">
                <TouchableOpacity onPress={() => setShowConfirm(true)}>
                    <Text className="text-[#FF0000] font-[Poppins-Bold] text-right">Delete</Text>
                </TouchableOpacity>
                <View className="flex-1 w-full gap-6 px-4 items-center">
                    <Text className="text-[36px] text-center font-[Poppins-SemiBold]">
                        {detail?.created_at ? dayjs(detail.created_at).format("DD/MM/YYYY") : ""}
                    </Text>

                    <Text className="text-[24px] text-center font-[Poppins-Regular]">
                        {detail?.created_at ? dayjs(detail.created_at).format("HH:mm A") : ""}
                    </Text>

                    <Icon width={100} height={100} />

                    {/* Tags */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: "row", gap: 8 }}
                    >
                        {detail?.tags?.map((tag: string, index: number) => (
                            <View key={index} className="px-4 py-2 rounded-full border border-[#7F56D9]">
                                <Text className="font-[Poppins-Regular] text-[#7F56D9]">{tag}</Text>
                            </View>
                        ))}
                    </ScrollView>
                    <Text className="mt-1 text-[18px] font-[Poppins-Regular] text-[#736B66] text-center">
                        {detail?.text_content}
                    </Text>

                    {/* Audio */}
                    {detail?.audio_url && (
                        <TouchableOpacity
                            className="h-[60px] px-6 rounded-lg flex-row items-center justify-center gap-2 mt-3"
                            onPress={playRecording}
                        >
                            <AudioLines width={30} height={30} color="#4ADE80" />
                            <Text className="text-black font-[Poppins-SemiBold] text-sm tracking-wide">
                                Play Recording
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            <Modal transparent animationType="fade" visible={showConfirm}>
                <TouchableWithoutFeedback onPress={() => setShowConfirm(false)}>
                    <View className="flex-1 bg-black/60 justify-center items-center">
                        <View className="bg-white w-4/5 rounded-2xl p-6 items-center">
                            <Text className="text-lg font-[Poppins-SemiBold] mb-6 text-gray-800">
                                Are you sure you want to discard this diary?
                            </Text>
                            <View className="flex-row gap-4">
                                <TouchableOpacity
                                    onPress={() => setShowConfirm(false)}
                                    className="bg-gray-300 px-8 py-4 rounded-xl"
                                >
                                    <Text className="text-base font-[Poppins-SemiBold] text-gray-800">
                                        No
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleConfirmCancel}
                                    className="bg-red-500 px-8 py-4 rounded-xl"
                                >
                                    <Text className="text-base font-[Poppins-SemiBold] text-white">Yes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
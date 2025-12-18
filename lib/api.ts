import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_PATH;

async function api(path: string, options: RequestInit = {}) {
  try {
    const token = await SecureStore.getItemAsync("token"); // lấy token đã lưu

    const res = await fetch(`${BASE_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: options.body || undefined,
    });

    let data: any = null;

    try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid JSON.");
    }

    if (!res.ok) {
      let errorMessage = "Request failed";

      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail[0]?.msg || errorMessage;
      } else if (data.message) {
        errorMessage = data.message;
      } else {
        errorMessage = `Request failed with status ${res.status}`;
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    if (error.message.includes("Network request failed")) {
      throw new Error("Cannot connect to server. Check your internet.");
    }
    throw error;
  }
}


// === AUTH API ===
// REGISTER expert
export const registerExpert = (payload: any) =>
  api("/api/v1/auth/expert/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// COMPLETE expert profile
export const completeExpertProfile = (payload: any) =>
  api("/api/v1/auth/expert/complete-profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// LOGIN expert
export const loginUser = async (payload: { email: string; password: string }) => {
  const res = await api("/api/v1/auth/expert/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.access_token) {
    await SecureStore.setItemAsync("token", res.access_token);  // LƯU TOKEN
  }

  return res;
};

// UPLOAD expert avatar
export const uploadExpertAvatar = async (uri: string) => {
  const formData = new FormData();

  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "avatar.jpg",
  } as any);

  const res = await fetch(`${BASE_URL}/api/v1/upload/expert/avatar`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return await res.json();
};

// UPLOAD expert certificate
export const uploadExpertCertificate = async (uri: string) => {
  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "certificate.jpg",
  } as any);

  const res = await fetch(`${BASE_URL}/api/v1/upload/expert/certificate`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return await res.json();
};

// GET expert dashboard
export const getExpertDashboard = () =>
  api("/api/v1/expert/dashboard/", {
    method: "GET",
  });

// GET schedules by month
export const getExpertSchedules = (month: string) =>
  api(`/api/v1/expert/schedules/?month=${month}`, {
    method: "GET",
  });

// CREATE schedule
interface SchedulePayload {
  date: string;
  start_time: string;
  end_time: string;
}

export const createExpertSchedule = (payload: SchedulePayload) =>
  api("/api/v1/expert/schedules/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// DELETE schedule
export const deleteExpertSchedule = (scheduleId: string) =>
  api(`/api/v1/expert/schedules/${scheduleId}`, {
    method: "DELETE",
  });

// GET expert appointments by status
export const getExpertAppointments = (status: string) =>
  api(`/api/v1/expert/appointments/?status=${status}`, {
    method: "GET",
  });

// GET expert appointment detail
export const getExpertAppointmentDetail = (id: string) =>
  api(`/api/v1/expert/appointments/${id}`, {
    method: "GET",
  });

  // ACCEPT expert appointment
  export const acceptExpertAppointment = (appointmentId: string) =>
  api(`/api/v1/expert/appointments/${appointmentId}/action`, {
    method: "POST",
    body: JSON.stringify({ action: "accept" }),
  });

// DECLINE expert appointment
export const declineExpertAppointment = (
  appointmentId: string,
  reason: string
) =>
  api(`/api/v1/expert/appointments/${appointmentId}/action`, {
    method: "POST",
    body: JSON.stringify({
      action: "decline",
      reason,
    }),
  });

  // CANCEL expert appointment
  export const cancelExpertAppointment = (
  appointmentId: string,
  reason?: string
) =>
  api(`/api/v1/expert/appointments/${appointmentId}`, {
    method: "DELETE",
    body: reason ? JSON.stringify({ reason }) : undefined,
  });


  // GET all chats
export const getChats = () =>
  api("/api/v1/chat/chats", {
    method: "GET",
  });

  // GET messages of a chat
export const getChatMessages = (chatId: string) =>
  api(`/api/v1/chat/chats/${chatId}/messages`, {
    method: "GET",
  });

  // SEND message
export const sendChatMessage = (
  chatId: string,
  content: string
) =>
  api(`/api/v1/chat/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      type: "text",
      content,
    }),
  });

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

// UPLOAD expert article image
export const uploadExpertArticleImage = async (uri: string) => {
  const token = await SecureStore.getItemAsync("token");

  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "article.jpg",
  } as any);

  const res = await fetch(
    `${BASE_URL}/api/v1/upload/expert/article-image`,
    {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.detail || data?.message || "Upload article image failed"
    );
  }

  return data;
};

interface CreateArticlePayload {
  title: string;
  content: string;
  hashtags?: string;
  image?: string; // image_url
}

export const createExpertArticleWithImage = async ({
  title,
  content,
  hashtags,
  imageUri,
}: {
  title: string;
  content: string;
  hashtags?: string;
  imageUri?: string;
}) => {
  const token = await SecureStore.getItemAsync("token");

  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);

  if (hashtags) {
    formData.append("hashtags", hashtags);
  }

  if (imageUri) {
    formData.append("image", {
      uri: imageUri,
      name: "article.jpg",
      type: "image/jpeg",
    } as any);
  }

  const res = await fetch(
    `${BASE_URL}/api/v1/expert/articles`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};

// GET expert articles
export const getExpertArticles = async () => {
  return api("/api/v1/expert/articles/my-articles", {
    method: "GET",
  });
};

// GET newsfeed (Home)
export const getFeed = (limit: number = 20) =>
  api(`/api/v1/expert/articles/feed?limit=${limit}`, {
    method: "GET",
  });

export const getAnonPostDetail = (post_id: string) =>
  api(`/api/v1/anon-posts/${post_id}`, {
    method: "GET",
  });

  // GET anon post comments
export const getAnonPostComments = (post_id: string) =>
  api(`/api/v1/anon-comments/${post_id}`, {
    method: "GET",
  });

// GET users who liked anon post
export const getAnonPostLikes = (post_id: string) =>
  api(`/api/v1/anon-likes/${post_id}/users`, {
    method: "GET",
  });

// GET expert article detail
export const getExpertArticleDetail = (articleId: string) =>
  api(`/api/v1/expert/articles/${articleId}`, {
    method: "GET",
  });

  // DELETE expert article
export const deleteExpertArticle = (articleId: string) =>
  api(`/api/v1/expert/articles/${articleId}`, {
    method: "DELETE",
  });

  // LIKE anon post
export const likeAnonPost = (post_id: string) =>
  api(`/api/v1/anon-likes/${post_id}`, {
    method: "POST",
  });

// UNLIKE anon post
export const unlikeAnonPost = (post_id: string) =>
  api(`/api/v1/anon-likes/${post_id}`, {
    method: "DELETE",
  });

  // CREATE anon comment (always anonymous)
export const createAnonComment = (post_id: string, content: string) =>
  api("/api/v1/anon-comments/", {
    method: "POST",
    body: JSON.stringify({
      post_id,
      content,
      is_preset: false,
      is_anonymous: false,
    }),
  });

  // DELETE anon comment
export const deleteAnonComment = (comment_id: string) =>
  api(`/api/v1/anon-comments/${comment_id}`, {
    method: "DELETE",
  });

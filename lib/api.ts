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

export const registerExpert = (payload: any) =>
  api("/api/v1/auth/expert/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const completeExpertProfile = (payload: any) =>
  api("/api/v1/auth/expert/complete-profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });

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

export const getExpertDashboard = () =>
  api("/api/v1/expert/dashboard/", {
    method: "GET",
  });

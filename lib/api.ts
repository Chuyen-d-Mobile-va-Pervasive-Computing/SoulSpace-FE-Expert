const BASE_URL = process.env.EXPO_PUBLIC_API_PATH;

async function api(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    let data: any = null;

    // Parse JSON an toàn
    try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid JSON.");
    }

    // Nếu request lỗi (status >= 400)
    if (!res.ok) {
      let errorMessage = "Request failed";

      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      }

      else if (Array.isArray(data.detail)) {
        // Lấy msg đầu tiên
        errorMessage = data.detail[0]?.msg || errorMessage;
      }

      else if (data.message) {
        errorMessage = data.message;
      }

      else {
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

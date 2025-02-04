import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const userToken = (): string => {
  return localStorage.getItem("token") || "";
};

// Create an axiosInstance instance with default headers
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${userToken()}`,
  },
});

// Assistant types
export interface Assistant {
  id: string;
  name: string;
  firstMessage: string;
  systemPrompt: string;
  provider: string;
  model: string;
  tools: any[];
  voice?: {
    provider: string;
    voiceId: string;
    settings: {
      speed: number;
      pitch: number;
      stability: number;
      volume: number;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface LiveKitToken {
  success: boolean;
  data: string;
}

// Assistant API endpoints
export const assistantApi = {
  // Get all assistants
  getAll: async (): Promise<ApiResponse<Assistant[]>> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/assistants`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assistants:", error);
      throw error;
    }
  },

  // Get single assistant
  getById: async (id: string): Promise<ApiResponse<Assistant>> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/assistants/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching assistant:", error);
      throw error;
    }
  },

  // Create assistant
  create: async (
    assistant: Omit<Assistant, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Assistant>> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/assistants`,
        assistant
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assistant:", error);
      throw error;
    }
  },

  // Update assistant
  update: async (
    id: string,
    assistant: Partial<Assistant>
  ): Promise<ApiResponse<Assistant>> => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/assistants/${id}`,
        assistant
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assistant:", error);
      throw error;
    }
  },

  // Delete assistant
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosInstance.delete(
        `${API_BASE_URL}/assistants/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting assistant:", error);
      throw error;
    }
  },
};

// LiveKit API endpoints
export const liveKitApi = {
  // Create LiveKit room
  getToken: async (
    assistantName: string
  ): Promise<ApiResponse<LiveKitToken>> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/livekit/getToken`,
        assistantName
      );
      return response.data;
    } catch (error) {
      console.error("Error creating LiveKit room:", error);
      throw error;
    }
  },
};

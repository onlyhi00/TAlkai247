import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  roomName: string;
}

// Assistant API endpoints
export const assistantApi = {
  // Get all assistants
  getAll: async (): Promise<ApiResponse<Assistant[]>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assistants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching assistants:", error);
      throw error;
    }
  },

  // Get single assistant
  getById: async (id: string): Promise<ApiResponse<Assistant>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assistants/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
      const response = await axios.post(
        `${API_BASE_URL}/assistants`,
        assistant,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
      const response = await axios.put(
        `${API_BASE_URL}/assistants/${id}`,
        assistant,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
      const response = await axios.delete(`${API_BASE_URL}/assistants/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
      const response = await axios.post(
        `${API_BASE_URL}/livekit/getToken`,
        { assistantName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating LiveKit room:", error);
      throw error;
    }
  },
};

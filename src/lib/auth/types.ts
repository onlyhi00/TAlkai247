export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  settings: UserSettings;
}

export interface UserSettings {
  defaultTransparencyLevel: "FULL" | "PARTIAL" | "NONE";
  defaultAssistant?: string;
  recordingEnabled: boolean;
  webSearchEnabled: boolean;
  preferredVoice: "male" | "female";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  company?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

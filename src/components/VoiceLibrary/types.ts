export interface Voice {
  id: string;
  name: string;
  gender: string;
  nationality: string;
  language: string;
  provider: VoiceProvider | string; // Allow string for flexibility
  traits: string[];
  preview_url?: string;
  eleven_labs_id?: string;
  deepgram_id?: string;
  playht_id?: string;
  cartesia_id?: string;
  category?: string;
  available_for_tiers?: string[];
  voice_engine?: string;
};

export interface Provider {
  name: string;
  status: "Included" | "Premium";
  languages: string[];
};

export type VoiceProvider = "11Labs" | "Deepgram" | "PlayHT" | "Talkai247" | "Azure" | "Cartesia";
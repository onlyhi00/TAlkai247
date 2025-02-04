import type { Voice, Provider } from './types';

export const allTags = [
  "Friendly", "Professional", "Warm", "Energetic", "Soft", "Deep", 
  "Clear", "Authentic", "Storyteller", "Passionate", "Expressive", 
  "Polite", "Authoritative"
];

export const allLanguages = [
  "English", "Spanish (Spain)", "Spanish (Mexico)", "French (France)", 
  "French (Canada)", "German", "Italian", "Japanese", "Korean", 
  "Portuguese (Brazil)", "Portuguese (Portugal)", "Russian", 
  "Chinese (Mandarin)", "Chinese (Cantonese)"
];

export const allProviders: Provider[] = [
  { name: "Talkai247", status: "Included", languages: ["English"] },
  { name: "11Labs", status: "Premium", languages: ["English"] },
  { name: "Playht", status: "Premium", languages: ["English"] },
  { name: "Deepgram", status: "Included", languages: ["English"] },
  { name: "Cartesia", status: "Included", languages: ["English"] },
  { name: "Azure", status: "Included", languages: allLanguages },
];

export const initialVoices: Voice[] = [
  { name: "Emma", gender: "Female", nationality: "British", language: "English", provider: "Talkai247", traits: ["Friendly", "Professional"] },
  { name: "James", gender: "Male", nationality: "American", language: "English", provider: "11Labs", traits: ["Deep", "Authoritative"] },
  { name: "Sophia", gender: "Female", nationality: "Australian", language: "English", provider: "Playht", traits: ["Cheerful", "Energetic"] },
  // ... Add all other voices here
];
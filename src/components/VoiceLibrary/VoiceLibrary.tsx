import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { VoiceCard } from './VoiceCard';
import { VoiceFilters } from './VoiceFilters';
import { AddVoiceCloneModal } from './AddVoiceCloneModal';
import { VoiceDetailsModal } from './VoiceDetailsModal';
import type { Voice, Provider } from './types';
import { elevenLabsService } from '@/services/elevenlabs';

const allLanguages = [
  "English", "Spanish (Spain)", "Spanish (Mexico)", "French (France)", "French (Canada)",
  "German", "Italian", "Japanese", "Korean", "Portuguese (Brazil)", "Portuguese (Portugal)",
  "Russian", "Chinese (Mandarin)", "Chinese (Cantonese)"
];

const allProviders: Provider[] = [
  { name: "Talkai247", status: "Included", languages: ["English"] },
  { name: "11Labs", status: "Premium", languages: ["English"] },
  { name: "Playht", status: "Premium", languages: ["English"] },
  { name: "Deepgram", status: "Included", languages: ["English"] },
  { name: "Azure", status: "Included", languages: allLanguages },
];

const initialVoices: Voice[] = [];

export function VoiceLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [selectedProvider, setSelectedProvider] = useState("All Providers");
  const [voices, setVoices] = useState<Voice[]>(initialVoices);
  const [showAddVoiceModal, setShowAddVoiceModal] = useState(false);
  const [showVoiceDetailsModal, setShowVoiceDetailsModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElevenLabsVoices = async () => {
      try {
        setIsLoading(true);
        // console.log('Starting to fetch Eleven Labs voices...');
        // console.log('API Key available:', !!elevenLabsService.apiKey);
        const elevenLabsVoices = await elevenLabsService.getAllVoices();
        // console.log('Received voices:', elevenLabsVoices);
        
        if (!elevenLabsVoices || elevenLabsVoices.length === 0) {
          console.warn('No voices received from ElevenLabs API');
          return;
        }

        const formattedVoices: Voice[] = elevenLabsVoices.map((voice) => ({
          id: voice.voice_id,
          name: voice.name,
          gender: voice.labels?.gender || "Not specified",
          nationality: voice.labels?.accent || "Not specified",
          language: "English",
          provider: "11Labs",
          traits: [],
          eleven_labs_id: voice.voice_id
        }));

        // console.log('Formatted voices:', formattedVoices);
        setVoices(formattedVoices);
      } catch (error) {
        console.error('Error fetching Eleven Labs voices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElevenLabsVoices();
  }, []);

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.nationality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = selectedLanguage === "All Languages" || voice.language === selectedLanguage;
    const matchesProvider = selectedProvider === "All Providers" || voice.provider === selectedProvider;
    
    return matchesSearch && matchesLanguage && matchesProvider;
  });

  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice);
    setShowVoiceDetailsModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Voice Library</h2>
        <Button onClick={() => setShowAddVoiceModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Voice Clone
        </Button>
      </div>

      <VoiceFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        languages={allLanguages}
        providers={allProviders}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading voices...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              onSelect={handleVoiceSelect}
            />
          ))}
        </div>
      )}

      <AddVoiceCloneModal
        isOpen={showAddVoiceModal}
        onClose={() => setShowAddVoiceModal(false)}
      />

      <VoiceDetailsModal
        isOpen={showVoiceDetailsModal}
        onClose={() => setShowVoiceDetailsModal(false)}
        voice={selectedVoice}
      />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { VoiceCard } from './VoiceCard';
import { VoiceFilters } from './VoiceFilters';
import { AddVoiceCloneModal } from './AddVoiceCloneModal';
import { VoiceDetailsModal } from './VoiceDetailsModal';
import type { Voice, Provider } from './types';
import { elevenLabsService } from '@/services/elevenlabs';
import { deepgramApi } from '@/services/deepgram';
import { playhtApi } from '@/services/playht';
import { cartesiaApi } from '@/services/cartesia';
import { toast } from '@/components/ui/use-toast';

const allLanguages = [
  "English", "Spanish (Spain)", "Spanish (Mexico)", "French (France)", "French (Canada)",
  "German", "Italian", "Japanese", "Korean", "Portuguese (Brazil)", "Portuguese (Portugal)",
  "Russian", "Chinese (Mandarin)", "Chinese (Cantonese)"
];

const allProviders: Provider[] = [
  { name: "ElevenLabs", status: "Premium", languages: ["English"] },
  { name: "Deepgram", status: "Included", languages: ["English"] },
  { name: "Playht", status: "Premium", languages: allLanguages },
  { name: "Cartesia", status: "Premium", languages: ["English"] },
  { name: "Azure", status: "Included", languages: allLanguages },
];

export default function VoiceLibraryTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [selectedProvider, setSelectedProvider] = useState("All Providers");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [showAddVoiceModal, setShowAddVoiceModal] = useState(false);
  const [showVoiceDetailsModal, setShowVoiceDetailsModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setIsLoading(true);
        // console.log('Fetching voices...');
        
        // Fetch ElevenLabs voices
        let formattedElevenLabsVoices: Voice[] = [];
        try {
          const elevenLabsVoices = await elevenLabsService.getAllVoices();
          formattedElevenLabsVoices = elevenLabsVoices.map((voice) => {
            // Get all non-empty labels
            const traits = Object.entries(voice.labels || {})
              .filter(([_, value]) => value && typeof value === 'string')
              .map(([key, value]) => `${key}: ${value}`);

            // Add category if it exists
            if (voice.category) {
              traits.unshift(`Category: ${voice.category}`);
            }

            return {
              id: voice.voice_id,
              name: voice.name,
              gender: voice.labels?.gender || "Not specified",
              nationality: voice.labels?.accent || "Not specified",
              language: voice.fine_tuning?.language || "English",
              provider: "ElevenLabs",
              traits: traits.filter(Boolean),
              preview_url: voice.preview_url,
              eleven_labs_id: voice.voice_id,
              category: voice.category,
              available_for_tiers: voice.available_for_tiers
            };
          });
        } catch (error) {
          console.error('Error fetching ElevenLabs voices:', error);
          toast({
            title: "Warning",
            description: "Failed to fetch ElevenLabs voices. Other voices will still be available.",
            variant: "default",
          });
        }

        // Fetch Deepgram voices
        let formattedDeepgramVoices: Voice[] = [];
        try {
          const deepgramVoices = await deepgramApi.getVoices();
          formattedDeepgramVoices = deepgramVoices.map((voice) => ({
            id: voice.model_id,
            name: voice.name,
            gender: voice.gender,
            nationality: "Not specified",
            language: voice.language,
            provider: "Deepgram",
            traits: [
              voice.description || "",
            ].filter(Boolean),
            preview_url: voice.preview_url,
            deepgram_id: voice.model_id
          }));
        } catch (error) {
          console.error('Error fetching Deepgram voices:', error);
          toast({
            title: "Warning",
            description: "Failed to fetch Deepgram voices. Other voices will still be available.",
            variant: "default",
          });
        }

        // Fetch PlayHT voices
        let formattedPlayhtVoices: Voice[] = [];
        try {
          const playhtVoices = await playhtApi.getVoices();
          formattedPlayhtVoices = playhtVoices.map((voice) => ({
            id: voice.id,
            name: voice.name,
            gender: voice.gender,
            nationality: "Not specified",
            language: voice.language,
            provider: "Playht",
            traits: [
              voice.voiceEngine,
              voice.description || "",
            ].filter(Boolean),
            preview_url: voice.preview_url,
            playht_id: voice.id
          }));
        } catch (error) {
          console.error('Error fetching PlayHT voices:', error);
          toast({
            title: "Warning",
            description: "Failed to fetch PlayHT voices. Other voices will still be available.",
            variant: "default",
          });
        }

        // Fetch Cartesia voices
        let formattedCartesiaVoices: Voice[] = [];
        try {
          const cartesiaVoices = await cartesiaApi.getVoices();
          formattedCartesiaVoices = cartesiaVoices.map((voice) => ({
            id: voice.id,
            name: voice.name,
            gender: voice.gender || "Not specified",
            nationality: "Not specified",
            language: voice.language || "English",
            provider: "Cartesia",
            traits: [
              voice.description || "",
              voice.category ? `Category: ${voice.category}` : "",
            ].filter(Boolean),
            cartesia_id: voice.id
          }));
        } catch (error) {
          console.error('Error fetching Cartesia voices:', error);
          toast({
            title: "Warning",
            description: "Failed to fetch Cartesia voices. Other voices will still be available.",
            variant: "default",
          });
        }

        // Combine all voices
        const allVoices = [
          ...formattedElevenLabsVoices,
          ...formattedDeepgramVoices,
          ...formattedPlayhtVoices,
          ...formattedCartesiaVoices
        ];
        
        // console.log('All voices:', allVoices);
        setVoices(allVoices);
      } catch (error) {
        console.error('Error fetching voices:', error);
        toast({
          title: "Error",
          description: "Failed to fetch voices. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, []);

  const filteredVoices = voices.filter((voice) => {
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
        <Button
          onClick={() => setShowAddVoiceModal(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Voice
        </Button>
      </div>

      <VoiceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        languages={allLanguages}
        providers={allProviders}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading voices...</p>
        </div>
      ) : filteredVoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No voices found matching your criteria.</p>
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
        voice={selectedVoice}
        isOpen={showVoiceDetailsModal}
        onClose={() => setShowVoiceDetailsModal(false)}
        providers={allProviders}
      />
    </div>
  );
}
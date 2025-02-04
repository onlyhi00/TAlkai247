import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';

interface VoiceFiltersProps {
  searchQuery: string;
  selectedLanguage: string;
  selectedProvider: string;
  onSearchChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onProviderChange: (value: string) => void;
  languages: string[];
  providers: { name: string; status: string; }[];
}

export function VoiceFilters({
  searchQuery,
  selectedLanguage,
  selectedProvider,
  onSearchChange,
  onLanguageChange,
  onProviderChange,
  languages,
  providers
}: VoiceFiltersProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4 space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search voices..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Language</label>
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Languages">All Languages</SelectItem>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Provider</label>
          <Select value={selectedProvider} onValueChange={onProviderChange}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Providers">All Providers</SelectItem>
              {providers.map(provider => (
                <SelectItem key={provider.name} value={provider.name}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
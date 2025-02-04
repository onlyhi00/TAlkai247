import React from 'react';
import { Calendar, Globe, MessageSquare } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  icon: React.ElementType;
  configFields: string[];
}

interface ToolConfig {
  [key: string]: {
    [key: string]: string;
  };
}

interface ConfigureToolsProps {
  formData: any;
  onNext: (tools: { id: string; config: any }[]) => void;
  onBack: () => void;
}

export default function ConfigureTools({ formData, onNext, onBack }: ConfigureToolsProps) {
  const [selectedTools, setSelectedTools] = React.useState<string[]>([]);
  const [toolConfigs, setToolConfigs] = React.useState<ToolConfig>({
    calendar: { provider: '' },
    scraping: { url: '' },
    sms: { apiKey: '', fromNumber: '' }
  });

  const tools: Tool[] = [
    {
      id: 'calendar',
      name: 'Calendar Integration',
      icon: Calendar,
      configFields: ['provider']
    },
    {
      id: 'scraping',
      name: 'Scraping Tool',
      icon: Globe,
      configFields: ['url']
    },
    {
      id: 'sms',
      name: 'Send SMS',
      icon: MessageSquare,
      configFields: ['apiKey', 'fromNumber']
    }
  ];

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleNext = () => {
    const configuredTools = selectedTools.map(toolId => ({
      id: toolId,
      config: toolConfigs[toolId]
    }));
    onNext(configuredTools);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className={`p-6 rounded-lg cursor-pointer border-2 transition-colors ${
                selectedTools.includes(tool.id)
                  ? 'border-teal-600 bg-gray-700'
                  : 'border-transparent bg-gray-700 hover:border-gray-600'
              }`}
              onClick={() => toggleTool(tool.id)}
            >
              <div className="flex items-center space-x-3">
                <Icon className="text-teal-400" size={24} />
                <span className="text-white font-medium">{tool.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTools.map((toolId) => {
        const tool = tools.find(t => t.id === toolId);
        if (!tool) return null;

        return (
          <div key={toolId} className="mt-6 p-6 bg-gray-700 rounded-lg">
            <h3 className="text-white font-medium mb-4">{tool.name} Configuration</h3>
            {tool.configFields.map((field) => (
              <div key={field} className="mb-4">
                <label className="block text-gray-400 mb-2 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600"
                  value={toolConfigs[toolId][field] || ''}
                  onChange={(e) =>
                    setToolConfigs(prev => ({
                      ...prev,
                      [toolId]: { ...prev[toolId], [field]: e.target.value }
                    }))
                  }
                />
              </div>
            ))}
          </div>
        );
      })}

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
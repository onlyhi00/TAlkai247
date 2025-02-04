import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AssistantCard from "./AssistantCard";
import AssistantWizard from "../AssistantWizard";
import DeleteConfirmation from "../DeleteConfirmation";
import { useToast } from "@/components/ui/use-toast";
import { assistantApi } from "@/services/api";

interface Assistant {
  id: string;
  name: string;
  modes: string[];
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
}

export default function AssistantsTab() {
  const { toast } = useToast();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await assistantApi.getAll();
        if (response.success && response.data) {
          setAssistants(response.data);
          console.log("assistants =====> ", response.data);          
        } else {
          throw new Error(
            response.error?.message || "Failed to fetch assistants"
          );
        }
      } catch (error) {
        console.error("Error fetching assistants:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch assistants",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssistants();
  }, [toast]);

  const handleCreateAssistant = async (assistant: Assistant) => {
    try {
      const response = await assistantApi.create(assistant);
      if (response.success && response.data) {
        setAssistants([...assistants, response.data]);
        setShowWizard(false);
        toast({
          title: "Success",
          description: "Assistant created successfully",
        });
      } else {
        throw new Error(
          response.error?.message || "Failed to create assistant"
        );
      }
    } catch (error) {
      console.error("Error creating assistant:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create assistant",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAssistant = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedAssistant) {
      try {
        // console.log('Deleting assistant:', selectedAssistant.id);
        const response = await assistantApi.delete(selectedAssistant.id);
        if (response.success) {
          setAssistants(
            assistants.filter((a) => a.id !== selectedAssistant.id)
          );
          toast({
            title: "Success",
            description: "Assistant deleted successfully",
          });
        } else {
          throw new Error(
            response.error?.message || "Failed to delete assistant"
          );
        }
      } catch (error) {
        console.error("Error deleting assistant:", error);
        // Refresh the assistants list to ensure we have the latest data
        const response = await assistantApi.getAll();
        if (response.success && response.data) {
          setAssistants(response.data);
        }
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to delete assistant",
          variant: "destructive",
        });
      }
      setSelectedAssistant(null);
      setShowDeleteDialog(false);
    }
  };

  const handleUpdateAssistant = async (updatedAssistant: Assistant) => {
    try {
      const response = await assistantApi.update(
        updatedAssistant.id,
        updatedAssistant
      );
      if (response.success && response.data) {
        setAssistants(
          assistants.map((assistant) =>
            assistant.id === updatedAssistant.id ? response.data : assistant
          )
        );
        toast({
          title: "Success",
          description: "Assistant updated successfully",
        });
      } else {
        throw new Error(
          response.error?.message || "Failed to update assistant"
        );
      }
    } catch (error) {
      console.error("Error updating assistant:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update assistant",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-400">Assistants</h1>
          <p className="text-gray-400">Manage your AI assistants</p>
        </div>
        <Button
          onClick={() => setShowWizard(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Assistant
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading assistants...</p>
        </div>
      ) : !assistants.length ? (
        <div className="text-center py-8">
          <p className="text-gray-400">
            No assistants found. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assistants.map((assistant) => (
            <AssistantCard
              key={assistant.id}
              assistant={assistant}
              onDelete={() => handleDeleteAssistant(assistant)}
              onUpdate={handleUpdateAssistant}
            />
          ))}
        </div>
      )}

      {showWizard && (
        <AssistantWizard
          onClose={() => setShowWizard(false)}
          onComplete={handleCreateAssistant}
        />
      )}

      <DeleteConfirmation
        isOpen={showDeleteDialog}
        assistant={selectedAssistant}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Assistant"
        description="Are you sure you want to delete this assistant? This action cannot be undone."
      />
    </div>
  );
}

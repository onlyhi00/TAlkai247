import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Assistant {
  name: string;
  id: string;
  modes: string[];
  firstMessage: string;
  systemPrompt: string;
  provider: string;
  model: string;
  tools: string[];
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  assistant: Assistant | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmation({ isOpen, assistant, onClose, onConfirm }: DeleteConfirmationProps) {
  if (!assistant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-300">
            Are you sure you want to delete <span className="font-semibold text-white">{assistant.name}</span>? 
            This action cannot be undone.
          </p>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-700 text-white hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete Assistant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
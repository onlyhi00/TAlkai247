import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, PhoneOff } from 'lucide-react';

interface CallTranscriptEntry {
  role: 'ai' | 'user';
  message: string;
}

interface ActiveCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  transcript: CallTranscriptEntry[];
  onJoinCall: () => void;
  onEndCall: () => void;
  onSendMessage: (message: string) => void;
}

export function ActiveCallDialog({
  open,
  onOpenChange,
  phoneNumber,
  transcript,
  onJoinCall,
  onEndCall,
  onSendMessage,
}: ActiveCallDialogProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Ongoing Call
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-300">Call with: {phoneNumber}</p>
          <Button 
            onClick={onJoinCall}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Mic className="h-4 w-4 mr-2" />
            Join Call
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">Call Transcript</h3>
            <ScrollArea className="h-[300px] rounded-md border border-gray-700 bg-gray-900 p-4">
              <div className="space-y-2">
                {transcript.map((entry, index) => (
                  <div key={index} className="text-sm">
                    <span className={entry.role === 'ai' ? 'text-gray-300' : 'text-blue-400'}>
                      {entry.role === 'ai' ? 'AI: ' : 'User: '}
                    </span>
                    <span className="text-gray-300">{entry.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 border-gray-600 text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleVoiceInput}
              className={`${
                isListening ? 'text-red-400 hover:text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              onClick={handleSendMessage}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="destructive"
            onClick={onEndCall}
            className="bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
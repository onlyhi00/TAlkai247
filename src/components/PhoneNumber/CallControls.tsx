import React, { useState } from 'react';
import { Info, PhoneOutgoing, Eye, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CallControlsProps {
  selectedNumber: string;
  onScheduleCall: () => void;
  onGetNewNumber: () => void;
  onAddPurchasedNumber: () => void;
}

export function CallControls({
  selectedNumber,
  onScheduleCall,
  onGetNewNumber,
  onAddPurchasedNumber,
}: CallControlsProps) {
  const [answerBeforeAI, setAnswerBeforeAI] = useState(false);
  const [ringCount, setRingCount] = useState(3);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCallNumber, setActiveCallNumber] = useState<string | null>(null);
  const [outboundNumber, setOutboundNumber] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState('mark');
  const [fallbackNumber, setFallbackNumber] = useState('');

  const handleViewCall = (number: string) => {
    setActiveCallNumber(number);
    setShowCallDialog(true);
  };

  const handleCallNow = () => {
    if (outboundNumber) {
      setActiveCallNumber(outboundNumber);
      setShowCallDialog(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inbound Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Inbound
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                Configure how incoming calls are handled
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Choose Assistant</Label>
            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mark">Mark</SelectItem>
                <SelectItem value="sarah">Sarah</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fallback Destination</Label>
            <Input
              placeholder="Enter fallback phone number"
              value={fallbackNumber}
              onChange={(e) => setFallbackNumber(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label>Answer Call Before AI</Label>
              <Switch
                checked={answerBeforeAI}
                onCheckedChange={setAnswerBeforeAI}
              />
            </div>
            {answerBeforeAI && (
              <div className="flex items-center space-x-2">
                <Label>Rings Before AI Takes Over</Label>
                <Select
                  value={ringCount.toString()}
                  onValueChange={(value) => setRingCount(parseInt(value))}
                >
                  <SelectTrigger className="w-[80px] bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-teal-400 mb-3">Active Inbound Calls</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <PhoneOutgoing className="h-4 w-4 text-teal-400" />
                  <div>
                    <p className="text-sm text-white">+1 (444) 555-6666</p>
                    <p className="text-xs text-gray-400">00:02:47</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={() => handleViewCall('+1 (444) 555-6666')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outbound Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Outbound
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                Make outbound calls using AI assistant
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Enter Phone Number</Label>
            <Input
              placeholder="+1 (555) 123-4567"
              value={outboundNumber}
              onChange={(e) => setOutboundNumber(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div>
            <Label>Choose Assistant</Label>
            <Select defaultValue="mark">
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mark">Mark</SelectItem>
                <SelectItem value="sarah">Sarah</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Button
              className="bg-teal-600 hover:bg-teal-700 flex-1"
              onClick={handleCallNow}
            >
              Call Now
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onScheduleCall}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Call
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-teal-400 mb-3">Call Schedule</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <div>
                  <p className="text-sm text-white">+1 (123) 456-7890</p>
                  <p className="text-xs text-gray-400">2023-06-15 14:30</p>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-teal-400 mb-3">Active Outbound Calls</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <PhoneOutgoing className="h-4 w-4 text-teal-400" />
                  <div>
                    <p className="text-sm text-white">+1 (111) 222-3333</p>
                    <p className="text-xs text-gray-400">00:05:23</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={() => handleViewCall('+1 (111) 222-3333')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Ongoing Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Call with: {activeCallNumber}</p>
            <div className="bg-gray-700 rounded-lg p-4 min-h-[200px]">
              <h3 className="text-lg font-semibold mb-4">Call Transcript</h3>
              <div className="space-y-2">
                <p className="text-gray-300">AI: Hello, how can I help you today?</p>
                <p className="text-blue-400">User: I'd like to schedule an appointment.</p>
                <p className="text-gray-300">AI: I'll help you with that. What time works best for you?</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 border-gray-600"
              />
              <Button className="bg-teal-600 hover:bg-teal-700">Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
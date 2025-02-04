import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimelineEvent } from '@/types/contact';
import { Calendar, Phone, Mail, Users, FileText, Target } from 'lucide-react';

interface TimelineViewProps {
  open: boolean;
  onClose: () => void;
  events: TimelineEvent[];
  onAddEvent: (event: TimelineEvent) => void;
  contactId: string;
}

export function TimelineView({ open, onClose, events, onAddEvent, contactId }: TimelineViewProps) {
  const [showAddEvent, setShowAddEvent] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState<Partial<TimelineEvent>>({
    type: 'Note',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'Call':
        return <Phone className="h-4 w-4" />;
      case 'Email':
        return <Mail className="h-4 w-4" />;
      case 'Meeting':
        return <Users className="h-4 w-4" />;
      case 'Note':
        return <FileText className="h-4 w-4" />;
      case 'Goal':
        return <Target className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const handleAddEvent = () => {
    onAddEvent({
      id: Date.now().toString(),
      contactId,
      ...newEvent as TimelineEvent
    });
    setShowAddEvent(false);
    setNewEvent({
      type: 'Note',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Contact Timeline</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Button
            onClick={() => setShowAddEvent(true)}
            className="mb-4 bg-teal-600 hover:bg-teal-700"
          >
            Add Event
          </Button>

          {showAddEvent && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value: TimelineEvent['type']) => 
                      setNewEvent({ ...newEvent, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Note">Note</SelectItem>
                      <SelectItem value="Goal">Goal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                
                <Textarea
                  placeholder="Event description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddEvent(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddEvent}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Add Event
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {events
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-4 p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{event.type}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-300">{event.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
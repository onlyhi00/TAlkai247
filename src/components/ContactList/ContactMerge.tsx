import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Contact } from '@/types/contact';
import { GitMerge } from 'lucide-react';

interface ContactMergeProps {
  contacts: Contact[];
  onMerge: (mergedContact: Contact) => void;
}

export function ContactMerge({ contacts, onMerge }: ContactMergeProps) {
  const [showDialog, setShowDialog] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string>>({});

  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'type', label: 'Type' },
    { key: 'transparencyLevel', label: 'Transparency Level' },
    { key: 'subcategory', label: 'Subcategory' }
  ];

  const handleMerge = () => {
    const mergedContact: Contact = {
      id: Date.now().toString(),
      ...contacts[0], // Base contact
      ...Object.fromEntries(
        Object.entries(selectedValues).map(([key, value]) => [
          key,
          contacts.find(c => c.id === value)?.[key as keyof Contact]
        ])
      ),
      // Merge tags
      tags: Array.from(new Set(contacts.flatMap(c => c.tags || []))),
      // Merge goals
      goals: contacts.flatMap(c => c.goals || []),
      // Merge timeline
      timeline: contacts.flatMap(c => c.timeline || []).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    };

    onMerge(mergedContact);
    setShowDialog(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="bg-gray-700 hover:bg-gray-600"
        disabled={contacts.length < 2}
      >
        <GitMerge className="mr-2 h-4 w-4" />
        Merge Contacts
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Merge Contacts</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <RadioGroup
                  value={selectedValues[field.key]}
                  onValueChange={(value) => 
                    setSelectedValues({ ...selectedValues, [field.key]: value })
                  }
                >
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={contact.id} id={`${field.key}-${contact.id}`} />
                      <Label htmlFor={`${field.key}-${contact.id}`}>
                        {contact[field.key as keyof Contact]?.toString()}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <div className="space-y-2">
              <Label>Additional Information</Label>
              <p className="text-sm text-gray-400">
                Tags, goals, and timeline entries will be combined from all contacts.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMerge}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Merge Contacts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
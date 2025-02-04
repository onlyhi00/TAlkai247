import React from 'react';
import { Button } from "@/components/ui/button";
import { Contact } from '@/types/contact';

interface GoalsCellProps {
  contact: Contact;
  onManageGoals: (contact: Contact) => void;
}

export function GoalsCell({ contact, onManageGoals }: GoalsCellProps) {
  return (
    <div className="flex items-center space-x-2">
      <span>{contact.goals?.length || 0} goals</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onManageGoals(contact)}
        className="text-blue-400 hover:text-blue-500"
      >
        Manage
      </Button>
    </div>
  );
}
import React from 'react';
import { ContactList as ContactListComponent } from '../components/ContactList';
import { ContactProvider } from '@/lib/contexts/ContactContext';

export default function ContactListPage() {
  return (
    <ContactProvider>
      <div className="min-h-screen">
        <ContactListComponent />
      </div>
    </ContactProvider>
  );
}
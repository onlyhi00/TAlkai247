import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, BarChart, GitMerge, Download, Upload } from 'lucide-react';
import { ContactTable } from './ContactTable';
import { ContactForm } from './ContactForm';
import { QuickView } from './QuickView';
import { GoalManager } from './GoalManager';
import { ContactFilters } from './ContactFilters';
import { BulkActions } from './BulkActions';
import { ActivityReport } from './ActivityReport';
import { ContactMerge } from './ContactMerge';
import { ExportImport } from './ExportImport';
import { Contact, TransparencyLevel } from '@/types/contact';
import { useToast } from "@/components/ui/use-toast";
import { useContactContext } from '@/lib/contexts/ContactContext';

const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    type: 'Personal',
    transparencyLevel: 'Full Disclosure',
    subcategory: 'Business',
    goals: [
      {
        id: '1',
        title: 'Quarterly Business Review',
        callType: 'Business',
        template: 'Business Review Template',
        aiPrompt: 'Conduct a quarterly business review focusing on KPIs and growth opportunities',
        urls: ['https://example.com/business-review'],
        files: []
      }
    ],
    tags: ['VIP', 'Business Partner']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 234-5678',
    type: 'Personal',
    transparencyLevel: 'Partial Disclosure',
    subcategory: 'Family',
    goals: [],
    tags: ['Family', 'Priority']
  }
];

interface ContactListProps {
  initialShowModal?: boolean;
}

export function ContactList({ initialShowModal = false }: ContactListProps) {
  const { toast } = useToast();
  const { showAddContactModal, setShowAddContactModal } = useContactContext();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Personal');
  const [filterType, setFilterType] = useState('All');
  const [filterTransparency, setFilterTransparency] = useState<TransparencyLevel | 'all'>('all');
  const [filterSubcategory, setFilterSubcategory] = useState('all');
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [showGoalManagerModal, setShowGoalManagerModal] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (initialShowModal) {
      setShowAddContactModal(true);
    }
  }, [initialShowModal, setShowAddContactModal]);

  const handleSaveContact = (contact: Contact) => {
    if (contact.id) {
      setContacts(contacts.map(c => c.id === contact.id ? contact : c));
      toast({
        title: "Contact Updated",
        description: "Contact information has been successfully updated."
      });
    } else {
      const newContact = { ...contact, id: Date.now().toString(), goals: [] };
      setContacts([...contacts, newContact]);
      toast({
        title: "Contact Added",
        description: "New contact has been successfully created."
      });
    }
    setShowAddContactModal(false);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    toast({
      title: "Contact Deleted",
      description: "Contact has been permanently removed."
    });
  };

  const handleQuickView = (contact: Contact) => {
    setCurrentContact(contact);
    setShowQuickViewModal(true);
  };

  const handleManageGoals = (contact: Contact) => {
    setCurrentContact(contact);
    setShowGoalManagerModal(true);
  };

  const handleSaveGoals = (goals: any[]) => {
    if (currentContact) {
      const updatedContact = { ...currentContact, goals };
      setContacts(contacts.map(c => c.id === currentContact.id ? updatedContact : c));
      setShowGoalManagerModal(false);
      toast({
        title: "Goals Updated",
        description: "Contact goals have been successfully updated."
      });
    }
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        setContacts(contacts.filter(c => !selectedContacts.includes(c.id)));
        setSelectedContacts([]);
        toast({
          title: "Bulk Delete",
          description: `${selectedContacts.length} contacts have been deleted.`
        });
        break;
      // Add other bulk actions here
    }
  };

  const handleImport = (importedContacts: Contact[]) => {
    setContacts([...contacts, ...importedContacts]);
    toast({
      title: "Contacts Imported",
      description: `${importedContacts.length} contacts have been imported.`
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    const matchesType = filterType === 'All' || contact.type === filterType;
    const matchesTransparency = filterTransparency === 'all' || contact.transparencyLevel === filterTransparency;
    const matchesSubcategory = filterSubcategory === 'all' || contact.subcategory === filterSubcategory;
    const matchesTab = contact.type === activeTab;
    
    return matchesSearch && matchesType && matchesTransparency && matchesSubcategory && matchesTab;
  });

  return (
    <div className="p-8 bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-400">Contact List</h1>
          <p className="text-gray-400">Manage your contacts and their AI interaction preferences</p>
        </div>
        <div className="flex space-x-2">
          <ExportImport contacts={contacts} onImport={handleImport} />
          <Button 
            onClick={() => setShowAddContactModal(true)} 
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Contact
          </Button>
        </div>
      </div>

      <ContactFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterTransparency={filterTransparency}
        onFilterTransparencyChange={setFilterTransparency}
        filterSubcategory={filterSubcategory}
        onFilterSubcategoryChange={setFilterSubcategory}
        filterCampaign={'all'}
        onFilterCampaignChange={() => {}}
        campaigns={[]}
        showPersonalFilters={activeTab === 'Personal'}
      />

      {selectedContacts.length > 0 && (
        <BulkActions
          selectedCount={selectedContacts.length}
          onAction={handleBulkAction}
        />
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <ContactTable
          contacts={filteredContacts}
          selectedContacts={selectedContacts}
          onSelectContact={(id) => {
            setSelectedContacts(prev => 
              prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
            );
          }}
          onSelectAll={(selected) => {
            setSelectedContacts(selected ? filteredContacts.map(c => c.id) : []);
          }}
          onEdit={(contact) => {
            setCurrentContact(contact);
            setShowAddContactModal(true);
          }}
          onDelete={handleDeleteContact}
          onQuickView={handleQuickView}
          onManageGoals={handleManageGoals}
        />
      </div>

      {showAddContactModal && (
        <ContactForm
          contact={currentContact}
          isOpen={showAddContactModal}
          onClose={() => {
            setShowAddContactModal(false);
            setCurrentContact(null);
          }}
          onSave={handleSaveContact}
        />
      )}

      {showQuickViewModal && currentContact && (
        <QuickView
          contact={currentContact}
          isOpen={showQuickViewModal}
          onClose={() => setShowQuickViewModal(false)}
        />
      )}

      {showGoalManagerModal && currentContact && (
        <GoalManager
          contact={currentContact}
          isOpen={showGoalManagerModal}
          onClose={() => setShowGoalManagerModal(false)}
          onSave={handleSaveGoals}
        />
      )}
    </div>
  );
}
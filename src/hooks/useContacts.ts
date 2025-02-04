import { useState, useCallback } from 'react';
import { contactsApi } from '@/lib/api/services/contacts';
import { Contact } from '@/types/schema';
import { usePaginatedQuery } from '@/lib/api/hooks/useQuery';
import { useMutation } from '@/lib/api/hooks/useMutation';

export function useContacts(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: 'PERSONAL' | 'BUSINESS';
  campaignId?: string;
}) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const {
    data,
    error,
    loading,
    page,
    setPage,
    hasNextPage,
    hasPreviousPage,
    refetch,
  } = usePaginatedQuery<Contact>({
    endpoint: '/contacts',
    params,
  });

  const createMutation = useMutation<Contact, Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
    endpoint: '/contacts',
    onSuccess: () => refetch(),
  });

  const updateMutation = useMutation<Contact, Partial<Contact>>({
    endpoint: `/contacts/${selectedContacts[0]}`,
    method: 'PUT',
    onSuccess: () => refetch(),
  });

  const deleteMutation = useMutation<void, void>({
    endpoint: `/contacts/${selectedContacts[0]}`,
    method: 'DELETE',
    onSuccess: () => {
      refetch();
      setSelectedContacts([]);
    },
  });

  const bulkDeleteMutation = useMutation<void, { contactIds: string[] }>({
    endpoint: '/contacts/bulk',
    onSuccess: () => {
      refetch();
      setSelectedContacts([]);
    },
  });

  const toggleContact = useCallback((contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  }, []);

  const selectAll = useCallback((contacts: Contact[]) => {
    setSelectedContacts(contacts.map(contact => contact.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedContacts([]);
  }, []);

  return {
    contacts: data?.items || [],
    totalContacts: data?.total || 0,
    selectedContacts,
    loading,
    error,
    page,
    setPage,
    hasNextPage,
    hasPreviousPage,
    toggleContact,
    selectAll,
    clearSelection,
    createContact: createMutation.mutate,
    updateContact: updateMutation.mutate,
    deleteContact: deleteMutation.mutate,
    bulkDeleteContacts: bulkDeleteMutation.mutate,
    isCreating: createMutation.loading,
    isUpdating: updateMutation.loading,
    isDeleting: deleteMutation.loading || bulkDeleteMutation.loading,
    refetch,
  };
}
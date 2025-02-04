import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../client';
import { PaginatedResponse } from '@/types/schema';

interface InfiniteQueryOptions<T> {
  endpoint: string;
  params?: Record<string, any>;
  pageSize?: number;
  enabled?: boolean;
  onSuccess?: (data: T[]) => void;
  onError?: (error: Error) => void;
}

interface InfiniteQueryResult<T> {
  data: T[];
  error: Error | null;
  loading: boolean;
  hasNextPage: boolean;
  loadNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInfiniteQuery<T>({
  endpoint,
  params = {},
  pageSize = 10,
  enabled = true,
  onSuccess,
  onError,
}: InfiniteQueryOptions<T>): InfiniteQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPage = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        ...params,
        page: page.toString(),
        pageSize: pageSize.toString(),
      }).toString();

      const result = await apiClient.get<PaginatedResponse<T>>(`${endpoint}?${queryParams}`);

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || loading) return;

    try {
      const result = await fetchPage(currentPage + 1);
      
      setData(prev => [...prev, ...result.items]);
      setCurrentPage(prev => prev + 1);
      setHasNextPage(currentPage + 1 < result.totalPages);
      
      onSuccess?.(result.items);
    } catch (error) {
      // Error already handled in fetchPage
    }
  }, [currentPage, hasNextPage, loading]);

  const refetch = useCallback(async () => {
    setData([]);
    setCurrentPage(1);
    setHasNextPage(true);

    try {
      const result = await fetchPage(1);
      
      setData(result.items);
      setHasNextPage(1 < result.totalPages);
      
      onSuccess?.(result.items);
    } catch (error) {
      // Error already handled in fetchPage
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      refetch();
    }
  }, [enabled, JSON.stringify(params)]);

  return {
    data,
    error,
    loading,
    hasNextPage,
    loadNextPage,
    refetch,
  };
}
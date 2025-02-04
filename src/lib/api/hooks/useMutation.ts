import { useState } from 'react';
import { apiClient } from '../client';

interface MutationOptions<TData, TVariables> {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'DELETE';
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: Error | null;
  loading: boolean;
  reset: () => void;
}

export function useMutation<TData = unknown, TVariables = unknown>({
  endpoint,
  method = 'POST',
  onSuccess,
  onError,
  onSettled,
}: MutationOptions<TData, TVariables>): MutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  const mutate = async (variables: TVariables): Promise<TData> => {
    try {
      setLoading(true);
      setError(null);

      let result: TData;
      
      switch (method) {
        case 'POST':
          result = await apiClient.post<TData>(endpoint, variables);
          break;
        case 'PUT':
          result = await apiClient.put<TData>(endpoint, variables);
          break;
        case 'DELETE':
          result = await apiClient.delete<TData>(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
      onSettled?.();
    }
  };

  return {
    mutate,
    data,
    error,
    loading,
    reset,
  };
}
import { useQuery } from '@tanstack/react-query';
import { useToken } from '../../../core/session/session';
import { authApi } from '../api/authApi';

export const AUTH_QUERY_KEYS = {
  currentUser: ['auth', 'current-user'],
} as const;

export function useCurrentUser() {
  const token = useToken();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: authApi.currentUser,
    enabled: Boolean(token),
    retry: false,
  });
}

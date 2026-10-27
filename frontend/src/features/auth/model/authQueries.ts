import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../core/api/queryKeys';
import { useToken } from '../../../core/session/session';
import { authApi } from '../api/authApi';

export function useCurrentUser() {
  const token = useToken();
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: authApi.currentUser,
    enabled: Boolean(token),
    retry: false,
  });
}

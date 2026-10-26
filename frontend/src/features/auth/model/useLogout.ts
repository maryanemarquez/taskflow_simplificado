import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { session } from '../../../core/session/session';

const LOGIN_ROUTE = '/login';

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    session.clear();
    queryClient.clear();
    router.replace(LOGIN_ROUTE);
  };
}

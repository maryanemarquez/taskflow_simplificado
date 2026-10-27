import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { session } from '../../../core/session/session';
import { ROUTES } from '../../../core/routes';


export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    session.clear();
    queryClient.clear();
    router.replace(ROUTES.login);
  };
}

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useCurrentUser } from '../../features/auth/model/authQueries';
import type { CurrentUser } from '../../features/auth/model/authTypes';
import { MESSAGES } from '../messages/messages';
import { useToken } from '../session/session';
import { theme } from '../theme/theme';
import { AppShell } from './AppShell';

interface ProtectedProps {
  children: (user: CurrentUser) => ReactNode;
}

/** Exige sessão e equipe: sem token vai ao login; sem equipe vai à tela "Sem equipe". */
export function Protected({ children }: ProtectedProps) {
  const token = useToken();
  const { data, isError } = useCurrentUser();
  if (!token || isError) {
    return <Redirect href="/login" />;
  }
  if (!data) {
    return (
      <View style={styles.loading}>
        <Text style={styles.text}>{MESSAGES.common.loading}</Text>
      </View>
    );
  }
  if (!data.equipe) {
    return <Redirect href="/sem-equipe" />;
  }
  return <AppShell user={data}>{children(data)}</AppShell>;
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  text: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular },
});

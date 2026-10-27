import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLogout } from '../../features/auth/model/useLogout';
import { MESSAGES } from '../messages/messages';
import { theme } from '../theme/theme';

/** Tela de espera enquanto a sessão é carregada. */
export function SessionLoading() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>{MESSAGES.common.loading}</Text>
    </View>
  );
}

interface SessionErrorProps {
  message: string;
  onRetry: () => void;
}

/** Falha ao carregar a sessão: permite tentar de novo ou sair. */
export function SessionError({ message, onRetry }: SessionErrorProps) {
  const logout = useLogout();
  return (
    <View style={styles.center}>
      <Text accessibilityRole="alert" style={styles.text}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry}>
        <Text style={styles.action}>{MESSAGES.session.retry}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={logout}>
        <Text style={styles.action}>{MESSAGES.common.logout}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, gap: theme.spacing.medium, justifyContent: 'center', padding: theme.spacing.large },
  text: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, textAlign: 'center' },
  action: { color: theme.colors.primary, fontFamily: theme.typography.semibold },
});

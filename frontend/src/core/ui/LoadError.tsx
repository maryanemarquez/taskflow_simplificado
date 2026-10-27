import { Pressable, StyleSheet, Text, View } from 'react-native';
import { errorMessage } from '../api/httpErrors';
import { MESSAGES } from '../messages/messages';
import { theme } from '../theme/theme';

interface LoadErrorProps {
  message: string;
  onRetry: () => void;
}

/** Falha ao carregar dados: mostra o motivo e permite tentar de novo. */
export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <View style={styles.box}>
      <Text accessibilityRole="alert" style={styles.message}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry}>
        <Text style={styles.retry}>{MESSAGES.common.retry}</Text>
      </Pressable>
    </View>
  );
}

export function LoadingNotice() {
  return <Text style={styles.message}>{MESSAGES.common.loading}</Text>;
}

interface QueryStatusProps {
  data: unknown;
  isError: boolean;
  error: unknown;
  /** Texto usado quando o erro não traz mensagem própria (rede e API já têm texto). */
  fallback: string;
  onRetry: () => void;
}

/** Estado de uma consulta sem dados: carregando ou erro. Com dados, não mostra nada. */
export function QueryStatus({ data, isError, error, fallback, onRetry }: QueryStatusProps) {
  if (data) {
    return null;
  }
  if (isError) {
    return <LoadError message={errorMessage(error, fallback)} onRetry={onRetry} />;
  }
  return <LoadingNotice />;
}

const styles = StyleSheet.create({
  box: { gap: theme.spacing.large },
  message: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular },
  retry: { color: theme.colors.primary, fontFamily: theme.typography.semibold },
});

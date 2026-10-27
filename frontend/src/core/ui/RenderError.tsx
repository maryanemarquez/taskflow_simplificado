import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { logger } from '../log/logger';
import { MESSAGES } from '../messages/messages';
import { theme } from '../theme/theme';

interface RenderErrorProps {
  onRetry: () => void;
}

/** Tela de último recurso: uma falha ao desenhar a interface é registrada (sem detalhes) e a pessoa pode tentar de novo. */
export function RenderError({ onRetry }: RenderErrorProps) {
  useEffect(() => {
    logger.error('UI_FALHA_RENDER');
  }, []);
  return (
    <View style={styles.center}>
      <Text accessibilityRole="header" style={styles.title}>{MESSAGES.errors.renderTitle}</Text>
      <Text accessibilityRole="alert" style={styles.text}>{MESSAGES.errors.render}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry}>
        <Text style={styles.action}>{MESSAGES.common.retry}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, gap: theme.spacing.medium, justifyContent: 'center', padding: theme.spacing.large },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.pageHeading, textAlign: 'center' },
  text: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, textAlign: 'center' },
  action: { color: theme.colors.primary, fontFamily: theme.typography.semibold },
});

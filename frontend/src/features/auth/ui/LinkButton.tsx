import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../../core/theme/theme';

interface LinkButtonProps {
  label: string;
  onPress: () => void;
}

export function LinkButton({ label, onPress }: LinkButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.link}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { alignItems: 'center', padding: theme.spacing.small },
  label: {
    color: theme.colors.primary,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.body,
  },
});

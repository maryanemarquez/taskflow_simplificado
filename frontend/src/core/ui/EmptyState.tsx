import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  text?: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, text, children }: EmptyStateProps) {
  return (
    <View style={styles.box}>
      <View style={styles.icon}>
        <Icon color={theme.colors.primary} name={icon} size={22} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', gap: theme.spacing.small, paddingVertical: theme.spacing.section },
  icon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.xlarge,
    height: theme.layout.iconBoxLarge,
    justifyContent: 'center',
    marginBottom: theme.spacing.small,
    width: theme.layout.iconBoxLarge,
  },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.bodyLarge },
  text: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
});

import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

/** Título da página com subtítulo opcional. */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: theme.spacing.xsmall },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.pageTitle },
  subtitle: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.body },
});

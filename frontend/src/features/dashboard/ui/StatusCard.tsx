import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { Icon, type IconName } from '../../../core/ui/Icon';

interface StatusCardProps {
  section: string;
  label: string;
  count: number;
  color: string;
  softColor: string;
  icon: IconName;
}

export function StatusCard({ section, label, count, color, softColor, icon }: StatusCardProps) {
  return (
    <View accessibilityLabel={`${section} - ${label}: ${count}`} style={styles.card}>
      <View style={[styles.icon, { backgroundColor: softColor }]}>
        <Icon color={color} name={icon} size={20} />
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.count, { color }]}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    boxShadow: theme.shadows.soft,
    flexBasis: 220,
    flexDirection: 'row',
    flexGrow: 1,
    gap: theme.spacing.large,
    padding: theme.spacing.xlarge,
  },
  icon: {
    alignItems: 'center',
    borderRadius: theme.radii.xlarge,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  text: { gap: theme.spacing.xsmall },
  label: { color: theme.colors.textSecondary, fontFamily: theme.typography.semibold, fontSize: theme.typography.small },
  count: { fontFamily: theme.typography.bold, fontSize: theme.typography.heading + 5 },
});

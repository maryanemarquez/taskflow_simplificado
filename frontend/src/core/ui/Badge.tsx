import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

interface BadgeProps {
  label: string;
  color: string;
  softColor: string;
}

export function Badge({ label, color, softColor }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: softColor }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    gap: theme.spacing.small - 2,
    paddingHorizontal: theme.spacing.medium - 2,
    paddingVertical: theme.spacing.xsmall - 1,
  },
  dot: { borderRadius: theme.radii.pill, height: 6, width: 6 },
  label: { fontFamily: theme.typography.semibold, fontSize: theme.typography.caption },
});

import { StyleSheet, Text } from 'react-native';
import { theme } from '../theme/theme';

/** Contador em forma de pílula, usado nos cabeçalhos de grupos e colunas. */
export function CountBadge({ value }: { value: number }) {
  return <Text style={styles.count}>{value}</Text>;
}

const styles = StyleSheet.create({
  count: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.caption,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.small,
    paddingVertical: 2,
  },
});

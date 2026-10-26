import { StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../messages/messages';
import { theme } from '../theme/theme';
import { Icon } from './Icon';

/** Logo do TaskFlow: ícone em quadrado verde mais o nome. */
export function Brand() {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <Icon color={theme.colors.surface} name="check-square" size={18} />
      </View>
      <Text style={styles.name}>{MESSAGES.brand}<Text style={styles.dot}>.</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium },
  mark: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.large,
    height: theme.layout.brandMarkSize,
    justifyContent: 'center',
    width: theme.layout.brandMarkSize,
  },
  name: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.brand - 3 },
  dot: { color: theme.colors.primary },
});

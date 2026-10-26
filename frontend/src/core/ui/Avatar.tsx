import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function Avatar({ name, size = theme.layout.avatarSize }: { name: string; size?: number }) {
  return (
    <View style={[styles.circle, { borderRadius: size / 2, height: size, width: size }]}>
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>{initialOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', backgroundColor: theme.colors.primarySoft, justifyContent: 'center' },
  letter: { color: theme.colors.primary, fontFamily: theme.typography.bold },
});

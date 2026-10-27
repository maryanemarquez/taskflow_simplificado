import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import type { Role } from '../model/authTypes';

interface AccountTypeFieldProps {
  value: Role | null;
  error?: string;
  onChange: (type: Role) => void;
}

const OPTIONS: { type: Role; label: string; hint: string }[] = [
  { type: 'DONO', label: MESSAGES.registration.typeOwner, hint: MESSAGES.registration.typeOwnerHint },
  { type: 'MEMBRO', label: MESSAGES.registration.typeMember, hint: MESSAGES.registration.typeMemberHint },
];

/** Escolha obrigatória entre conta de Dono (cria equipe) e de Membro (entra numa equipe existente). */
export function AccountTypeField({ value, error, onChange }: AccountTypeFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{MESSAGES.registration.typeLabel}</Text>
      {OPTIONS.map((option) => {
        const selected = value === option.type;
        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.type}
            onPress={() => onChange(option.type)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.optionLabel, selected && styles.selectedLabel]}>{option.label}</Text>
            <Text style={styles.hint}>{option.hint}</Text>
          </Pressable>
        );
      })}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: theme.spacing.small },
  label: {
    color: theme.colors.text,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.label,
  },
  option: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    gap: theme.spacing.xsmall,
    padding: theme.spacing.medium,
  },
  selected: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
  optionLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.body,
  },
  selectedLabel: { color: theme.colors.primary },
  hint: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.label,
  },
  error: {
    color: theme.colors.destructive,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.label,
  },
});

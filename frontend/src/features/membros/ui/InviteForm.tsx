import { StyleSheet, Text, TextInput, View } from 'react-native';
import { FIELD_LIMITS } from '../../../core/api/apiContract';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { ErrorNotice } from '../../../core/ui/ErrorNotice';
import { formStyles } from '../../../core/ui/formStyles';
import { Icon } from '../../../core/ui/Icon';
import { PrimaryButton } from '../../../core/ui/PrimaryButton';

const ADD_BUTTON_MIN_WIDTH = 150;

interface InviteFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onAdd: () => void;
  adding: boolean;
  message: string | null;
  isMobile: boolean;
}

/** Formulário do Dono para adicionar um membro pelo e-mail. */
export function InviteForm({ email, onEmailChange, onAdd, adding, message, isMobile }: InviteFormProps) {
  return (
    <View style={styles.invite}>
      <View style={styles.inviteHeader}>
        <Icon color={theme.colors.primary} name="user-plus" size={18} />
        <Text accessibilityRole="header" style={styles.inviteTitle}>{MESSAGES.members.inviteTitle}</Text>
      </View>
      <Text style={styles.inviteHint}>{MESSAGES.members.inviteHint}</Text>
      <View style={[styles.addRow, isMobile && styles.addRowMobile]}>
        <TextInput
          accessibilityLabel={MESSAGES.members.email}
          autoCapitalize="none"
          autoComplete="off"
          keyboardType="email-address"
          maxLength={FIELD_LIMITS.email}
          onChangeText={onEmailChange}
          placeholder={MESSAGES.members.emailPlaceholder}
          style={[formStyles.input, styles.input]}
          value={email}
        />
        <View style={styles.addButton}>
          <PrimaryButton icon="plus" label={MESSAGES.members.add} loading={adding} onPress={onAdd} />
        </View>
      </View>
      {message ? <ErrorNotice message={message} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  invite: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    gap: theme.spacing.medium,
    padding: theme.spacing.xlarge,
  },
  inviteHeader: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.small },
  inviteTitle: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.sectionTitle },
  inviteHint: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
  addRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium },
  addRowMobile: { alignItems: 'stretch', flexDirection: 'column' },
  input: { flex: 1 },
  addButton: { minWidth: ADD_BUTTON_MIN_WIDTH },
});

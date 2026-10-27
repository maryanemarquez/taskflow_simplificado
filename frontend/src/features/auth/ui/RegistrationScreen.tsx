import { StyleSheet, Text, View } from 'react-native';
import { FIELD_LIMITS } from '../../../core/api/apiContract';
import { MESSAGES } from '../../../core/messages/messages';
import { ROUTES } from '../../../core/routes';
import { theme } from '../../../core/theme/theme';
import { useRegistration } from '../model/useRegistration';
import { AccountTypeField } from './AccountTypeField';
import { FormField } from '../../../core/ui/FormField';
import { AuthLayout } from './AuthLayout';
import { ErrorNotice } from '../../../core/ui/ErrorNotice';
import { PrimaryButton } from '../../../core/ui/PrimaryButton';

export function RegistrationScreen() {
  const registration = useRegistration();
  const { form, errors, updateField } = registration;
  return (
    <AuthLayout
      icon="user-plus"
      subtitle={MESSAGES.registration.subtitle}
      title={MESSAGES.registration.title}
      topLink={{ prompt: MESSAGES.registration.hasAccount, label: MESSAGES.registration.signIn, route: ROUTES.login }}
    >
      <View style={styles.form}>
        <AccountTypeField error={errors.tipo} onChange={registration.updateType} value={form.tipo} />
        <FormField
          field={{
            label: MESSAGES.registration.name,
            value: form.nome,
            error: errors.nome,
            autoCapitalize: 'words',
            autoComplete: 'name',
            textContentType: 'name',
            maxLength: FIELD_LIMITS.nome,
            onChangeText: (value) => updateField('nome', value),
          }}
        />
        <FormField
          field={{
            label: MESSAGES.registration.email,
            value: form.email,
            error: errors.email,
            keyboardType: 'email-address',
            autoComplete: 'email',
            textContentType: 'emailAddress',
            maxLength: FIELD_LIMITS.email,
            onChangeText: (value) => updateField('email', value),
          }}
        />
        <FormField
          field={{
            label: MESSAGES.registration.password,
            value: form.senha,
            error: errors.senha,
            secureTextEntry: true,
            autoComplete: 'new-password',
            textContentType: 'newPassword',
            onChangeText: (value) => updateField('senha', value),
          }}
        />
        <Text style={styles.hint}>{MESSAGES.registration.passwordHint}</Text>
        {registration.errorMessage ? <ErrorNotice message={registration.errorMessage} /> : null}
        <PrimaryButton
          disabled={registration.isSubmitting}
          icon="arrow-right"
          label={MESSAGES.registration.submit}
          loading={registration.isSubmitting}
          onPress={registration.submit}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.large },
  hint: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.label,
  },
});

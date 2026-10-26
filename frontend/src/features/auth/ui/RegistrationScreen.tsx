import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useRegistration } from '../model/useRegistration';
import { AccountTypeField } from './AccountTypeField';
import { AuthField } from './AuthField';
import { AuthLayout } from './AuthLayout';
import { ErrorNotice } from './ErrorNotice';
import { LinkButton } from './LinkButton';
import { PrimaryButton } from './PrimaryButton';

export function RegistrationScreen() {
  const registration = useRegistration();
  const { form, errors, updateField } = registration;
  return (
    <AuthLayout
      icon="user-plus"
      subtitle={MESSAGES.registration.subtitle}
      title={MESSAGES.registration.title}
      topLink={{ prompt: MESSAGES.registration.hasAccount, label: MESSAGES.registration.signIn, route: '/login' }}
    >
      <View style={styles.form}>
        <AccountTypeField error={errors.tipo} onChange={registration.updateType} value={form.tipo} />
        <AuthField
          field={{
            label: MESSAGES.registration.name,
            value: form.nome,
            error: errors.nome,
            autoCapitalize: 'words',
            onChangeText: (value) => updateField('nome', value),
          }}
        />
        <AuthField
          field={{
            label: MESSAGES.registration.email,
            value: form.email,
            error: errors.email,
            keyboardType: 'email-address',
            onChangeText: (value) => updateField('email', value),
          }}
        />
        <AuthField
          field={{
            label: MESSAGES.registration.password,
            value: form.senha,
            error: errors.senha,
            secureTextEntry: true,
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
        <LinkButton label={MESSAGES.registration.haveAccount} onPress={() => router.replace('/login')} />
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

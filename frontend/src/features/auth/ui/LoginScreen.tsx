import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useSessionExpired } from '../../../core/session/sessionNotice';
import { useLogin } from '../model/useLogin';
import { AuthField } from './AuthField';
import { AuthLayout } from './AuthLayout';
import { ErrorNotice } from './ErrorNotice';
import { LinkButton } from './LinkButton';
import { PrimaryButton } from './PrimaryButton';

export function LoginScreen() {
  const login = useLogin();
  const sessionExpired = useSessionExpired();
  return (
    <AuthLayout
      icon="lock"
      subtitle={MESSAGES.login.subtitle}
      title={MESSAGES.login.title}
      topLink={{ prompt: MESSAGES.login.noAccount, label: MESSAGES.login.signUp, route: '/cadastro' }}
    >
      <View style={styles.form}>
        {sessionExpired ? <ErrorNotice message={MESSAGES.session.expired} /> : null}
        <AuthField
          field={{
            label: MESSAGES.registration.email,
            value: login.form.email,
            keyboardType: 'email-address',
            onChangeText: (value) => login.updateField('email', value),
          }}
        />
        <AuthField
          field={{
            label: MESSAGES.registration.password,
            value: login.form.senha,
            secureTextEntry: true,
            onChangeText: (value) => login.updateField('senha', value),
          }}
        />
        {login.errorMessage ? <ErrorNotice message={login.errorMessage} /> : null}
        <PrimaryButton
          disabled={login.isSubmitting}
          icon="arrow-right"
          label={MESSAGES.login.submit}
          loading={login.isSubmitting}
          onPress={login.submit}
        />
        <LinkButton label={MESSAGES.login.createAccount} onPress={() => router.replace('/cadastro')} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.large },
});

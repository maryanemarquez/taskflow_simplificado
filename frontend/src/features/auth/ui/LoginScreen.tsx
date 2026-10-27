import { StyleSheet, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { ROUTES } from '../../../core/routes';
import { theme } from '../../../core/theme/theme';
import { useSessionExpired } from '../../../core/session/sessionNotice';
import { useLogin } from '../model/useLogin';
import { FormField } from '../../../core/ui/FormField';
import { AuthLayout } from './AuthLayout';
import { ErrorNotice } from '../../../core/ui/ErrorNotice';
import { PrimaryButton } from '../../../core/ui/PrimaryButton';

export function LoginScreen() {
  const login = useLogin();
  const sessionExpired = useSessionExpired();
  return (
    <AuthLayout
      icon="lock"
      subtitle={MESSAGES.login.subtitle}
      title={MESSAGES.login.title}
      topLink={{ prompt: MESSAGES.login.noAccount, label: MESSAGES.login.signUp, route: ROUTES.register }}
    >
      <View style={styles.form}>
        {sessionExpired ? <ErrorNotice message={MESSAGES.session.expired} /> : null}
        <FormField
          field={{
            label: MESSAGES.registration.email,
            value: login.form.email,
            keyboardType: 'email-address',
            onChangeText: (value) => login.updateField('email', value),
          }}
        />
        <FormField
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
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.large },
});

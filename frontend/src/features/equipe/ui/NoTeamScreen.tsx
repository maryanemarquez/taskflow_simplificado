import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { Brand } from '../../../core/ui/Brand';
import { Icon } from '../../../core/ui/Icon';
import { SessionError } from '../../../core/ui/SessionNotice';
import { useLogout } from '../../auth/model/useLogout';
import { useRequireSession } from '../../auth/model/useRequireSession';
import { PrimaryButton } from '../../auth/ui/PrimaryButton';

export function NoTeamScreen() {
  const session = useRequireSession();
  const logout = useLogout();
  if (session.status === 'anonymous') {
    return <Redirect href="/login" />;
  }
  if (session.status === 'ready') {
    return <Redirect href="/dashboard" />;
  }
  if (session.status === 'error') {
    return <SessionError message={session.message} onRetry={session.retry} />;
  }
  const email = session.status === 'no-team' ? session.user.usuario.email : null;
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Brand />
      </View>
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <Icon color={theme.colors.primary} name="clock" size={24} />
          </View>
          <Text accessibilityRole="header" style={styles.title}>{MESSAGES.noTeam.title}</Text>
          <Text style={styles.text}>{MESSAGES.noTeam.text}</Text>
          {email ? (
            <View style={styles.email}>
              <Text style={styles.emailText}>{MESSAGES.noTeam.yourEmail(email)}</Text>
            </View>
          ) : null}
          <View style={styles.button}>
            <PrimaryButton disabled={false} icon="log-out" label={MESSAGES.common.logout} loading={false} onPress={logout} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: theme.colors.background, flex: 1 },
  header: { padding: theme.spacing.xlarge },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: theme.spacing.large },
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    boxShadow: theme.shadows.medium,
    gap: theme.spacing.medium,
    maxWidth: 460,
    padding: theme.spacing.page,
    width: '100%',
  },
  icon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.xlarge,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.pageHeading, textAlign: 'center' },
  text: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.body, lineHeight: 22, textAlign: 'center' },
  email: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radii.large, paddingHorizontal: theme.spacing.large, paddingVertical: theme.spacing.small },
  emailText: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.small },
  button: { alignSelf: 'stretch', marginTop: theme.spacing.small },
});

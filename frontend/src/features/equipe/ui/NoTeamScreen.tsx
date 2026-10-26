import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { MESSAGES } from '../../../core/messages/messages';
import { useToken } from '../../../core/session/session';
import { theme } from '../../../core/theme/theme';
import { Brand } from '../../../core/ui/Brand';
import { Icon } from '../../../core/ui/Icon';
import { useCurrentUser } from '../../auth/model/authQueries';
import { useLogout } from '../../auth/model/useLogout';
import { PrimaryButton } from '../../auth/ui/PrimaryButton';

export function NoTeamScreen() {
  const token = useToken();
  const { data, isError } = useCurrentUser();
  const logout = useLogout();
  if (!token || isError) {
    return <Redirect href="/login" />;
  }
  if (data?.equipe) {
    return <Redirect href="/dashboard" />;
  }
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
          {data ? (
            <View style={styles.email}>
              <Text style={styles.emailText}>{MESSAGES.noTeam.yourEmail(data.usuario.email)}</Text>
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

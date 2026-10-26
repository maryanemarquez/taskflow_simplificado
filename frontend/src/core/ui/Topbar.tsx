import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CurrentUser } from '../../features/auth/model/authTypes';
import { useLogout } from '../../features/auth/model/useLogout';
import { MESSAGES } from '../messages/messages';
import { theme } from '../theme/theme';
import { useViewport } from '../theme/useViewport';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

interface TopbarProps {
  user: CurrentUser;
  onMenu: () => void;
}

export function Topbar({ user, onMenu }: TopbarProps) {
  const logout = useLogout();
  const { isMobile } = useViewport();
  const name = user.usuario.nome;
  const role = user.equipe?.papel === 'DONO' ? MESSAGES.common.owner : MESSAGES.common.member;
  return (
    <View style={styles.bar}>
      {isMobile ? (
        <Pressable accessibilityLabel={MESSAGES.common.menu} accessibilityRole="button" onPress={onMenu} style={styles.iconButton}>
          <Icon color={theme.colors.text} name="menu" size={22} />
        </Pressable>
      ) : (
        <Text style={styles.greeting}>{MESSAGES.nav.greeting(name.split(' ')[0])}</Text>
      )}
      <View style={styles.spacer} />
      <View style={styles.user}>
        <Avatar name={name} />
        {!isMobile ? (
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.role}>{role}</Text>
          </View>
        ) : null}
      </View>
      <Pressable accessibilityLabel={MESSAGES.common.logout} accessibilityRole="button" onPress={logout} style={styles.logout}>
        <Icon name="log-out" />
        {!isMobile ? <Text style={styles.logoutLabel}>{MESSAGES.common.logout}</Text> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.large,
    height: theme.layout.topbarHeight,
    paddingHorizontal: theme.spacing.xlarge,
  },
  iconButton: { padding: theme.spacing.xsmall },
  greeting: { color: theme.colors.textSecondary, fontFamily: theme.typography.semibold, fontSize: theme.typography.body },
  spacer: { flexGrow: 1 },
  user: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium },
  name: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.small },
  role: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.caption },
  logout: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  logoutLabel: { color: theme.colors.textSecondary, fontFamily: theme.typography.semibold, fontSize: theme.typography.small },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import type { CurrentUser } from '../../auth/model/authTypes';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { Icon, type IconName } from '../../../core/ui/Icon';
import { Brand } from '../../../core/ui/Brand';
import { ROUTES } from '../../../core/routes';

const ITEMS: { label: string; route: string; icon: IconName }[] = [
  { label: MESSAGES.nav.dashboard, route: ROUTES.dashboard, icon: 'grid' },
  { label: MESSAGES.nav.tasks, route: ROUTES.tasks, icon: 'check-square' },
  { label: MESSAGES.nav.members, route: ROUTES.members, icon: 'users' },
];

interface SidebarProps {
  user: CurrentUser;
  onNavigate?: () => void;
}

export function Sidebar({ user, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const go = (route: string) => {
    onNavigate?.();
    router.replace(route);
  };
  return (
    <View style={styles.sidebar}>
      <Brand />
      <Text style={styles.section}>{MESSAGES.nav.workspace}</Text>
      <View style={styles.items}>
        {ITEMS.map((item) => {
          const active = pathname === item.route;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={item.route}
              onPress={() => go(item.route)}
              style={[styles.item, active && styles.itemActive]}
            >
              <Icon color={active ? theme.colors.primary : theme.colors.textSecondary} name={item.icon} />
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.spacer} />
      <View style={styles.team}>
        <View style={styles.teamIcon}>
          <Icon color={theme.colors.primary} name="users" size={16} />
        </View>
        <View style={styles.teamText}>
          <Text numberOfLines={1} style={styles.teamName}>{user.equipe?.nome ?? ''}</Text>
          <Text style={styles.teamCaption}>{MESSAGES.common.team}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: theme.colors.surface,
    borderRightColor: theme.colors.border,
    borderRightWidth: 1,
    gap: theme.spacing.small,
    height: '100%',
    padding: theme.spacing.large,
    width: theme.layout.sidebarWidth,
  },
  section: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.caption,
    letterSpacing: 0.8,
    marginTop: theme.spacing.xlarge,
    paddingHorizontal: theme.spacing.medium,
    textTransform: 'uppercase',
  },
  items: { gap: theme.spacing.xsmall },
  item: {
    alignItems: 'center',
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.medium - 1,
  },
  itemActive: { backgroundColor: theme.colors.primarySoft },
  label: { color: theme.colors.textSecondary, fontFamily: theme.typography.semibold, fontSize: theme.typography.body },
  labelActive: { color: theme.colors.primary },
  spacer: { flexGrow: 1 },
  team: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    paddingTop: theme.spacing.large,
  },
  teamIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.large,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  teamText: { flexShrink: 1 },
  teamName: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.small },
  teamCaption: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.caption },
});

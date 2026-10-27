import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useViewport } from '../../../core/theme/useViewport';
import { Avatar } from '../../../core/ui/Avatar';
import { Badge } from '../../../core/ui/Badge';
import { EmptyState } from '../../../core/ui/EmptyState';
import { formStyles } from '../../../core/ui/formStyles';
import { Icon } from '../../../core/ui/Icon';
import { QueryStatus } from '../../../core/ui/LoadError';
import type { CurrentUser, Role } from '../../auth/model/authTypes';
import { isOwner, isOwnerRole } from '../../auth/model/roles';
import { ErrorNotice } from '../../../core/ui/ErrorNotice';
import { PageHeader } from '../../../core/ui/PageHeader';
import { PrimaryButton } from '../../../core/ui/PrimaryButton';
import { useMemberActions, useMembers } from '../model/useMembers';

const ADD_BUTTON_MIN_WIDTH = 150;

export function MembersScreen({ user }: { user: CurrentUser }) {
  const members = useMembers();
  const actions = useMemberActions();
  const { isMobile } = useViewport();
  const owner = isOwner(user);
  const list = members.data ?? [];
  return (
    <View style={styles.page}>
      <PageHeader subtitle={members.data ? MESSAGES.members.subtitle(list.length) : undefined} title={MESSAGES.members.title} />
      <QueryStatus
        data={members.data}
        error={members.error}
        fallback={MESSAGES.members.loadError}
        isError={members.isError}
        onRetry={() => void members.refetch()}
      />
      {!members.data ? null : list.length === 0 ? (
        <EmptyState icon="users" title={MESSAGES.members.empty} />
      ) : (
        <View style={styles.table}>
          {!isMobile ? (
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.headerCell, styles.colMember]}>{MESSAGES.members.columnMember}</Text>
              <Text style={[styles.headerCell, styles.colEmail]}>{MESSAGES.members.columnEmail}</Text>
              <Text style={[styles.headerCell, styles.colRole]}>{MESSAGES.members.columnRole}</Text>
              {owner ? <View style={styles.colAction} /> : null}
            </View>
          ) : null}
          {list.map((member) => (
            <View key={member.id} style={[styles.row, isMobile && styles.rowMobile]}>
              <View style={[styles.colMember, styles.memberCell]}>
                <Avatar name={member.nome} />
                <Text numberOfLines={1} style={styles.name}>{member.nome}</Text>
              </View>
              <Text numberOfLines={1} style={[styles.email, styles.colEmail]}>{member.email}</Text>
              <View style={styles.colRole}>
                <Badge
                  color={isOwnerRole(member.papel) ? theme.colors.primary : theme.colors.textSecondary}
                  label={roleLabel(member.papel)}
                  softColor={isOwnerRole(member.papel) ? theme.colors.primarySoft : theme.colors.border}
                />
              </View>
              {owner ? (
                <View style={styles.colAction}>
                  {!isOwnerRole(member.papel) ? (
                    <Pressable
                      accessibilityLabel={MESSAGES.members.remove}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: actions.removingId !== null }}
                      disabled={actions.removingId !== null}
                      onPress={() => actions.remove(member.id)}
                      style={[styles.removeButton, actions.removingId === member.id && styles.removing]}
                    >
                      <Icon color={theme.colors.destructive} name="trash-2" size={14} />
                      <Text style={styles.remove}>{MESSAGES.members.remove}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}
      {owner ? (
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
              keyboardType="email-address"
              onChangeText={actions.setEmail}
              placeholder={MESSAGES.members.emailPlaceholder}
              style={[formStyles.input, styles.input]}
              value={actions.email}
            />
            <View style={styles.addButton}>
              <PrimaryButton icon="plus" label={MESSAGES.members.add} loading={actions.isAdding} onPress={actions.add} />
            </View>
          </View>
          {actions.message ? <ErrorNotice message={actions.message} /> : null}
        </View>
      ) : null}
    </View>
  );
}

function roleLabel(role: Role) {
  return isOwnerRole(role) ? MESSAGES.common.owner : MESSAGES.common.member;
}

const styles = StyleSheet.create({
  removing: { opacity: theme.states.disabledOpacity },
  page: { gap: theme.spacing.xlarge },
  table: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    boxShadow: theme.shadows.soft,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.large,
    paddingHorizontal: theme.spacing.xlarge,
    paddingVertical: theme.spacing.row,
  },
  rowMobile: { alignItems: 'flex-start', flexDirection: 'column', gap: theme.spacing.small, paddingHorizontal: theme.spacing.large },
  headerRow: { backgroundColor: theme.colors.surfaceMuted, borderTopWidth: 0, paddingVertical: theme.spacing.medium },
  headerCell: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.caption,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  colMember: { flex: 2, minWidth: 0 },
  colEmail: { flex: 3, minWidth: 0 },
  colRole: { flex: 1.2 },
  colAction: { alignItems: 'flex-end', flex: 1 },
  memberCell: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium },
  name: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.body },
  email: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
  removeButton: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.xsmall },
  remove: { color: theme.colors.destructive, fontFamily: theme.typography.semibold, fontSize: theme.typography.label },
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

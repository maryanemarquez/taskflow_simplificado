import { StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useViewport } from '../../../core/theme/useViewport';
import { EmptyState } from '../../../core/ui/EmptyState';
import { QueryStatus } from '../../../core/ui/LoadError';
import { PageHeader } from '../../../core/ui/PageHeader';
import type { CurrentUser } from '../../auth/model/authTypes';
import { isOwner } from '../../auth/model/roles';
import type { Member } from '../api/membrosApi';
import { useMemberActions, useMembers } from '../model/useMembers';
import { InviteForm } from './InviteForm';
import { MemberRow } from './MemberRow';
import { memberColumns } from './memberColumns';

export function MembersScreen({ user }: { user: CurrentUser }) {
  const members = useMembers();
  const actions = useMemberActions();
  const { isMobile } = useViewport();
  const owner = isOwner(user);
  const list = members.data ?? [];

  const renderList = (data: Member[]) => {
    if (data.length === 0) {
      return <EmptyState icon="users" title={MESSAGES.members.empty} />;
    }
    return (
      <View style={styles.table}>
        {!isMobile ? (
          <View style={[memberColumns.row, styles.headerRow]}>
            <Text style={[styles.headerCell, memberColumns.colMember]}>{MESSAGES.members.columnMember}</Text>
            <Text style={[styles.headerCell, memberColumns.colEmail]}>{MESSAGES.members.columnEmail}</Text>
            <Text style={[styles.headerCell, memberColumns.colRole]}>{MESSAGES.members.columnRole}</Text>
            {owner ? <View style={memberColumns.colAction} /> : null}
          </View>
        ) : null}
        {data.map((member) => (
          <MemberRow
            isMobile={isMobile}
            key={member.id}
            member={member}
            onRemove={actions.remove}
            owner={owner}
            removeLocked={actions.removingId !== null}
            removing={actions.removingId === member.id}
          />
        ))}
      </View>
    );
  };

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
      {members.data ? renderList(members.data) : null}
      {owner ? (
        <InviteForm
          adding={actions.isAdding}
          email={actions.email}
          isMobile={isMobile}
          message={actions.message}
          onAdd={actions.add}
          onEmailChange={actions.setEmail}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: theme.spacing.xlarge },
  table: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    boxShadow: theme.shadows.soft,
    overflow: 'hidden',
  },
  headerRow: { backgroundColor: theme.colors.surfaceMuted, borderTopWidth: 0, paddingVertical: theme.spacing.medium },
  headerCell: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.caption,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

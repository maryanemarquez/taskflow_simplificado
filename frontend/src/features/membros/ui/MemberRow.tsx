import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { Avatar } from '../../../core/ui/Avatar';
import { Badge } from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import type { Role } from '../../auth/model/authTypes';
import { isOwnerRole } from '../../auth/model/roles';
import type { Member } from '../api/membrosApi';
import { memberColumns } from './memberColumns';

interface MemberRowProps {
  member: Member;
  /** Quem vê a tela é o Dono: mostra a coluna de ações. */
  owner: boolean;
  isMobile: boolean;
  /** Alguma remoção está em andamento: os botões ficam desabilitados. */
  removeLocked: boolean;
  /** Este membro está sendo removido. */
  removing: boolean;
  onRemove: (id: number) => void;
}

function roleLabel(role: Role) {
  return isOwnerRole(role) ? MESSAGES.common.owner : MESSAGES.common.member;
}

/** Uma linha da tabela de membros. */
export function MemberRow({ member, owner, isMobile, removeLocked, removing, onRemove }: MemberRowProps) {
  const memberIsOwner = isOwnerRole(member.papel);
  return (
    <View style={[memberColumns.row, isMobile && memberColumns.rowMobile]}>
      <View style={[memberColumns.colMember, styles.memberCell]}>
        <Avatar name={member.nome} />
        <Text numberOfLines={1} style={styles.name}>{member.nome}</Text>
      </View>
      <Text numberOfLines={1} style={[styles.email, memberColumns.colEmail]}>{member.email}</Text>
      <View style={memberColumns.colRole}>
        <Badge
          color={memberIsOwner ? theme.colors.primary : theme.colors.textSecondary}
          label={roleLabel(member.papel)}
          softColor={memberIsOwner ? theme.colors.primarySoft : theme.colors.border}
        />
      </View>
      {owner ? (
        <View style={memberColumns.colAction}>
          {!memberIsOwner ? (
            <Pressable
              accessibilityLabel={MESSAGES.members.remove}
              accessibilityRole="button"
              accessibilityState={{ disabled: removeLocked }}
              disabled={removeLocked}
              onPress={() => onRemove(member.id)}
              style={[styles.removeButton, removing && styles.removing]}
            >
              <Icon color={theme.colors.destructive} name="trash-2" size={14} />
              <Text style={styles.remove}>{MESSAGES.members.remove}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  removing: { opacity: theme.states.disabledOpacity },
  memberCell: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium },
  name: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.body },
  email: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
  removeButton: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.xsmall },
  remove: { color: theme.colors.destructive, fontFamily: theme.typography.semibold, fontSize: theme.typography.label },
});

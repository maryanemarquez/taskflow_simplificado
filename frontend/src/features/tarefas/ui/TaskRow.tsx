import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useViewport } from '../../../core/theme/useViewport';
import { Avatar } from '../../../core/ui/Avatar';
import { Icon, type IconName } from '../../../core/ui/Icon';
import type { CurrentUser } from '../../auth/model/authTypes';
import type { Task } from '../api/tarefasApi';
import { isoToBr } from '../model/dateFormat';
import { isOwner } from '../../auth/model/roles';
import { canManage, neighborStatus } from '../model/taskRules';
import type { TaskBoardActions } from './taskBoardTypes';

interface TaskRowProps extends TaskBoardActions {
  task: Task;
  user: CurrentUser;
  /** Há uma ação desta tarefa em andamento: as ações ficam desabilitadas. */
  busy?: boolean;
}

interface ActionProps {
  label: string;
  icon: IconName;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}

function Action({ label, icon, onPress, danger, disabled }: ActionProps) {
  const color = danger ? theme.colors.destructive : theme.colors.primary;
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.action, disabled && styles.actionDisabled]}
    >
      <Icon color={color} name={icon} size={14} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** Uma tarefa por linha: título e descrição, responsável, prazo e ações. */
export function TaskRow({ task, user, busy, onChangeStatus, onEdit, onRemove }: TaskRowProps) {
  const { isMobile } = useViewport();
  const manage = canManage(user, task);
  const previous = neighborStatus(task.status, -1);
  const next = neighborStatus(task.status, 1);
  return (
    <View style={[styles.row, isMobile && styles.rowMobile]}>
      <View style={styles.main}>
        <Text numberOfLines={1} style={styles.title}>{task.titulo}</Text>
        {task.descricao ? <Text numberOfLines={1} style={styles.description}>{task.descricao}</Text> : null}
      </View>
      <View style={[styles.assignee, !isMobile && styles.assigneeColumn]}>
        <Avatar name={task.responsavel.nome} size={24} />
        <Text numberOfLines={1} style={styles.detail}>{task.responsavel.nome}</Text>
      </View>
      <View style={[styles.due, !isMobile && styles.dueColumn]}>
        {task.prazo ? (
          <>
            <Icon name="calendar" size={13} />
            <Text style={styles.detail}>{MESSAGES.tasks.dueOn(isoToBr(task.prazo))}</Text>
          </>
        ) : null}
      </View>
      <View style={[styles.actions, !isMobile && styles.actionsColumn]}>
        {manage && previous ? <Action disabled={busy} icon="arrow-left" label={MESSAGES.tasks.back} onPress={() => onChangeStatus(task.id, previous)} /> : null}
        {manage && next ? <Action disabled={busy} icon="arrow-right" label={MESSAGES.tasks.advance} onPress={() => onChangeStatus(task.id, next)} /> : null}
        {manage ? <Action disabled={busy} icon="edit-2" label={MESSAGES.tasks.edit} onPress={() => onEdit(task)} /> : null}
        {isOwner(user) ? <Action danger disabled={busy} icon="trash-2" label={MESSAGES.tasks.remove} onPress={() => onRemove(task.id)} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.large,
    paddingHorizontal: theme.spacing.xlarge,
    paddingVertical: theme.spacing.medium + 2,
  },
  rowMobile: { alignItems: 'flex-start', flexDirection: 'column', gap: theme.spacing.small, paddingHorizontal: theme.spacing.large },
  main: { flex: 1, gap: 2, minWidth: 0, alignSelf: 'stretch' },
  title: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.body },
  description: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
  assignee: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.small },
  assigneeColumn: { width: 150 },
  due: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.xsmall },
  dueColumn: { width: 140 },
  detail: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.label },
  actions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.large },
  actionsColumn: { flexWrap: 'nowrap', justifyContent: 'flex-end', width: 330 },
  action: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.xsmall },
  actionDisabled: { opacity: theme.states.disabledOpacity },
  actionLabel: { fontFamily: theme.typography.semibold, fontSize: theme.typography.label },
});

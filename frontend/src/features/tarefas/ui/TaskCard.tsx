import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { Avatar } from '../../../core/ui/Avatar';
import { Icon, type IconName } from '../../../core/ui/Icon';
import type { CurrentUser } from '../../auth/model/authTypes';
import type { Task, TaskStatus } from '../api/tarefasApi';
import { isoToBr } from '../model/dateFormat';
import { isOwner } from '../../auth/model/roles';
import { canManage, neighborStatus } from '../model/taskRules';

interface TaskCardProps {
  task: Task;
  user: CurrentUser;
  dragging?: boolean;
  /** Há uma ação desta tarefa em andamento: as ações ficam desabilitadas. */
  busy?: boolean;
  onEdit: (task: Task) => void;
  onRemove: (id: number) => void;
  onChangeStatus: (id: number, status: TaskStatus) => void;
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
      style={[styles.actionButton, disabled && styles.actionDisabled]}
    >
      <Icon color={color} name={icon} size={14} />
      <Text style={[styles.action, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function TaskCard({ task, user, dragging, busy, onEdit, onRemove, onChangeStatus }: TaskCardProps) {
  const manage = canManage(user, task);
  const previous = neighborStatus(task.status, -1);
  const next = neighborStatus(task.status, 1);
  return (
    <View style={[styles.card, dragging && styles.dragging]}>
      <Text style={styles.title}>{task.titulo}</Text>
      {task.descricao ? <Text numberOfLines={3} style={styles.description}>{task.descricao}</Text> : null}
      <View style={styles.meta}>
        <View style={styles.assignee}>
          <Avatar name={task.responsavel.nome} size={22} />
          <Text numberOfLines={1} style={styles.detail}>{task.responsavel.nome}</Text>
        </View>
        {task.prazo ? (
          <View style={styles.due}>
            <Icon name="calendar" size={13} />
            <Text style={styles.detail}>{MESSAGES.tasks.dueOn(isoToBr(task.prazo))}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        {manage && previous ? <Action disabled={busy} icon="arrow-left" label={MESSAGES.tasks.back} onPress={() => onChangeStatus(task.id, previous)} /> : null}
        {manage && next ? <Action disabled={busy} icon="arrow-right" label={MESSAGES.tasks.advance} onPress={() => onChangeStatus(task.id, next)} /> : null}
        {manage ? <Action disabled={busy} icon="edit-2" label={MESSAGES.tasks.edit} onPress={() => onEdit(task)} /> : null}
        {isOwner(user) ? <Action danger disabled={busy} icon="trash-2" label={MESSAGES.tasks.remove} onPress={() => onRemove(task.id)} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    boxShadow: theme.shadows.soft,
    gap: theme.spacing.medium,
    padding: theme.spacing.large,
  },
  dragging: { opacity: 0.45 },
  title: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.body + 1 },
  description: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
  meta: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.large },
  assignee: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: theme.spacing.small - 2 },
  due: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.xsmall },
  detail: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.label },
  actions: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.large,
    paddingTop: theme.spacing.medium,
  },
  actionButton: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.xsmall },
  actionDisabled: { opacity: theme.states.disabledOpacity },
  action: { fontFamily: theme.typography.semibold, fontSize: theme.typography.label },
});

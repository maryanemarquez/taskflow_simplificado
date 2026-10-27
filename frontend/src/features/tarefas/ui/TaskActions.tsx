import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { Icon, type IconName } from '../../../core/ui/Icon';
import type { CurrentUser } from '../../auth/model/authTypes';
import { isOwner } from '../../auth/model/roles';
import type { Task } from '../api/tarefasApi';
import { canManage, neighborStatus } from '../model/taskRules';
import type { TaskBoardActions } from './taskBoardTypes';

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

interface TaskActionsProps {
  task: Task;
  user: CurrentUser;
  busy?: boolean;
  onEdit: TaskBoardActions['onEdit'];
  onRemove: TaskBoardActions['onRemove'];
  onChangeStatus: TaskBoardActions['onChangeStatus'];
  style?: StyleProp<ViewStyle>;
}

/** Botões de uma tarefa: voltar, avançar, editar (quem pode gerenciar) e remover (só o Dono). */
export function TaskActions({ task, user, busy, onEdit, onRemove, onChangeStatus, style }: TaskActionsProps) {
  const manage = canManage(user, task);
  const previous = neighborStatus(task.status, -1);
  const next = neighborStatus(task.status, 1);
  return (
    <View style={[styles.actions, style]}>
      {manage && previous ? <Action disabled={busy} icon="arrow-left" label={MESSAGES.tasks.back} onPress={() => onChangeStatus(task.id, previous)} /> : null}
      {manage && next ? <Action disabled={busy} icon="arrow-right" label={MESSAGES.tasks.advance} onPress={() => onChangeStatus(task.id, next)} /> : null}
      {manage ? <Action disabled={busy} icon="edit-2" label={MESSAGES.tasks.edit} onPress={() => onEdit(task)} /> : null}
      {isOwner(user) ? <Action danger disabled={busy} icon="trash-2" label={MESSAGES.tasks.remove} onPress={() => onRemove(task.id)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.large },
  actionButton: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.xsmall },
  actionDisabled: { opacity: theme.states.disabledOpacity },
  action: { fontFamily: theme.typography.semibold, fontSize: theme.typography.label },
});

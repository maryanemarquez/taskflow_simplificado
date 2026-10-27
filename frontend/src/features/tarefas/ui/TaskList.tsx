import { StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { CountBadge } from '../../../core/ui/CountBadge';
import { Icon } from '../../../core/ui/Icon';
import type { CurrentUser } from '../../auth/model/authTypes';
import type { Task } from '../api/tarefasApi';
import { STATUS_META } from '../model/statusMeta';
import { STATUS_ORDER } from '../model/taskRules';
import type { TaskBoardActions, TaskBoardBusy } from './taskBoardTypes';
import { TaskRow } from './TaskRow';

interface TaskListProps extends TaskBoardActions, TaskBoardBusy {
  tasks: Task[];
  user: CurrentUser;
}

/** Visão em lista: um bloco por status, com uma tarefa por linha, uma abaixo da outra. */
export function TaskList({ tasks, user, isTaskBusy, onChangeStatus, onEdit, onRemove }: TaskListProps) {
  return (
    <View style={styles.list}>
      {STATUS_ORDER.map((status) => {
        const group = tasks.filter((item) => item.status === status);
        const meta = STATUS_META[status];
        return (
          <View key={status} style={styles.group}>
            <View style={styles.groupHeader}>
              <Icon color={meta.color} name={meta.icon} size={16} />
              <Text style={styles.groupTitle}>{MESSAGES.tasks.status[status]}</Text>
              <CountBadge value={group.length} />
            </View>
            <View style={styles.panel}>
              {group.length === 0 ? <Text style={styles.empty}>{MESSAGES.tasks.empty}</Text> : null}
              {group.map((item, index) => (
                <View key={item.id} style={index === 0 ? styles.first : undefined}>
                  <TaskRow
                    busy={isTaskBusy(item.id)}
                    onChangeStatus={onChangeStatus}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    task={item}
                    user={user}
                  />
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: theme.spacing.xlarge },
  group: { gap: theme.spacing.medium },
  groupHeader: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.small },
  groupTitle: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.bodyLarge },
  panel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    boxShadow: theme.shadows.soft,
    overflow: 'hidden',
  },
  first: { marginTop: -1 },
  empty: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small, padding: theme.spacing.large },
});

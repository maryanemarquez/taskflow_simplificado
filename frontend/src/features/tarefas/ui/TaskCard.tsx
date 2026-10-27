import { StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { Avatar } from '../../../core/ui/Avatar';
import { Icon } from '../../../core/ui/Icon';
import type { CurrentUser } from '../../auth/model/authTypes';
import type { Task, TaskStatus } from '../api/tarefasApi';
import { isoToBr } from '../model/dateFormat';
import { TaskActions } from './TaskActions';

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

export function TaskCard({ task, user, dragging, busy, onEdit, onRemove, onChangeStatus }: TaskCardProps) {
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
      <TaskActions busy={busy} onChangeStatus={onChangeStatus} onEdit={onEdit} onRemove={onRemove} style={styles.actions} task={task} user={user} />
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
  dragging: { opacity: theme.states.draggingOpacity },
  title: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.bodyLarge },
  description: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
  meta: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.large },
  assignee: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: theme.spacing.tight },
  due: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.xsmall },
  detail: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.label },
  actions: { borderTopColor: theme.colors.border, borderTopWidth: 1, paddingTop: theme.spacing.medium },
});

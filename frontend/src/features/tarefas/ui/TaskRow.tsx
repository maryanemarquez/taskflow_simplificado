import { StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useViewport } from '../../../core/theme/useViewport';
import { Avatar } from '../../../core/ui/Avatar';
import { Icon } from '../../../core/ui/Icon';
import type { CurrentUser } from '../../auth/model/authTypes';
import type { Task } from '../api/tarefasApi';
import { isoToBr } from '../model/dateFormat';
import { TaskActions } from './TaskActions';
import type { TaskBoardActions } from './taskBoardTypes';

const ASSIGNEE_COLUMN_WIDTH = 150;
const DUE_COLUMN_WIDTH = 140;
const ACTIONS_COLUMN_WIDTH = 330;

interface TaskRowProps extends TaskBoardActions {
  task: Task;
  user: CurrentUser;
  /** Há uma ação desta tarefa em andamento: as ações ficam desabilitadas. */
  busy?: boolean;
}

/** Uma tarefa por linha: título e descrição, responsável, prazo e ações. */
export function TaskRow({ task, user, busy, onChangeStatus, onEdit, onRemove }: TaskRowProps) {
  const { isMobile } = useViewport();
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
      <TaskActions busy={busy} onChangeStatus={onChangeStatus} onEdit={onEdit} onRemove={onRemove} style={[styles.actions, !isMobile && styles.actionsColumn]} task={task} user={user} />
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
    paddingVertical: theme.spacing.row,
  },
  rowMobile: { alignItems: 'flex-start', flexDirection: 'column', gap: theme.spacing.small, paddingHorizontal: theme.spacing.large },
  main: { flex: 1, gap: 2, minWidth: 0, alignSelf: 'stretch' },
  title: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.body },
  description: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
  assignee: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.small },
  assigneeColumn: { width: ASSIGNEE_COLUMN_WIDTH },
  due: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.xsmall },
  dueColumn: { width: DUE_COLUMN_WIDTH },
  detail: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.label },
  actions: { alignItems: 'center' },
  actionsColumn: { flexWrap: 'nowrap', justifyContent: 'flex-end', width: ACTIONS_COLUMN_WIDTH },
});

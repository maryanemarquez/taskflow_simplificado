import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { Icon } from '../../../core/ui/Icon';
import type { CurrentUser } from '../../auth/model/authTypes';
import type { Task } from '../api/tarefasApi';
import { STATUS_META } from '../model/statusMeta';
import { canManage, STATUS_ORDER } from '../model/taskRules';
import { useKanbanDrag } from '../model/useKanbanDrag';
import { Draggable, DropZone } from './dragDrop';
import type { TaskBoardActions } from './taskBoardTypes';
import { TaskCard } from './TaskCard';
import { ErrorNotice } from '../../auth/ui/ErrorNotice';

interface KanbanBoardProps extends TaskBoardActions {
  tasks: Task[];
  user: CurrentUser;
}

/** Visão Kanban: uma coluna por status; arraste o cartão para a coluna vizinha para mudar o status. */
export function KanbanBoard({ tasks, user, onChangeStatus, onEdit, onRemove }: KanbanBoardProps) {
  const drag = useKanbanDrag(tasks, user, onChangeStatus);
  return (
    <View style={styles.wrapper}>
      {drag.hint ? <ErrorNotice message={drag.hint} /> : null}
      <ScrollView contentContainerStyle={styles.board} horizontal>
        {STATUS_ORDER.map((status) => {
          const column = tasks.filter((item) => item.status === status);
          const meta = STATUS_META[status];
          const highlighted = drag.overStatus === status && drag.draggingId !== null;
          return (
            <DropZone
              key={status}
              onDrop={() => drag.dropOn(status)}
              onEnter={() => drag.hoverOver(status)}
              onLeave={() => drag.hoverOver(null)}
              style={[styles.column, highlighted && { backgroundColor: meta.soft, borderColor: meta.color }]}
            >
              <View style={styles.header}>
                <Icon color={meta.color} name={meta.icon} size={16} />
                <Text style={styles.title}>{MESSAGES.tasks.status[status]}</Text>
                <Text style={styles.count}>{column.length}</Text>
              </View>
              {column.length === 0 ? <Text style={styles.empty}>{MESSAGES.tasks.empty}</Text> : null}
              {column.map((item) => (
                <Draggable
                  enabled={canManage(user, item)}
                  key={item.id}
                  onDragEnd={drag.endDrag}
                  onDragStart={() => drag.startDrag(item.id)}
                >
                  <TaskCard
                    dragging={drag.draggingId === item.id}
                    onChangeStatus={onChangeStatus}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    task={item}
                    user={user}
                  />
                </Draggable>
              ))}
            </DropZone>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: theme.spacing.medium },
  board: { alignItems: 'flex-start', flexGrow: 1, gap: theme.spacing.large, paddingBottom: theme.spacing.small },
  column: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    gap: theme.spacing.medium,
    minHeight: 160,
    minWidth: theme.layout.kanbanColumnMinWidth,
    padding: theme.spacing.medium,
    flexBasis: 300,
    flexGrow: 1,
  },
  header: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.small, paddingHorizontal: theme.spacing.xsmall },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.body },
  count: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.caption,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.small,
    paddingVertical: 2,
  },
  empty: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small, padding: theme.spacing.small },
});

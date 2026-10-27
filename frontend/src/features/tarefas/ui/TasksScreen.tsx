import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { EmptyState } from '../../../core/ui/EmptyState';
import { Icon, type IconName } from '../../../core/ui/Icon';
import { Modal } from '../../../core/ui/Modal';
import type { CurrentUser } from '../../auth/model/authTypes';
import { ErrorNotice } from '../../auth/ui/ErrorNotice';
import { useMembers } from '../../membros/model/useMembers';
import type { Task, TaskInput } from '../api/tarefasApi';
import { isOwner } from '../model/taskRules';
import { useTaskActions, useTasks } from '../model/useTasks';
import { useTaskView, type TaskView } from '../model/useTaskView';
import { KanbanBoard } from './KanbanBoard';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

type Editing = null | 'new' | Task;

const VIEWS: { view: TaskView; label: string; icon: IconName }[] = [
  { view: 'LIST', label: MESSAGES.tasks.viewList, icon: 'list' },
  { view: 'KANBAN', label: MESSAGES.tasks.viewKanban, icon: 'columns' },
];

function NewTaskButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.newTask}>
      <Icon color={theme.colors.surface} name="plus" size={16} />
      <Text style={styles.newTaskLabel}>{MESSAGES.tasks.newTask}</Text>
    </Pressable>
  );
}

export function TasksScreen({ user }: { user: CurrentUser }) {
  const [editing, setEditing] = useState<Editing>(null);
  const { view, setView } = useTaskView();
  const tasks = useTasks();
  const members = useMembers();
  const actions = useTaskActions(() => setEditing(null));
  const task = editing && editing !== 'new' ? editing : null;
  const save = (input: TaskInput) => (task ? actions.update(task.id, input) : actions.create(input));
  const items = tasks.data ?? [];
  // Abrir ou fechar o formulário descarta o erro anterior: ele pertence à tentativa que o gerou.
  const openEditor = (next: Exclude<Editing, null>) => {
    actions.clearMessage();
    setEditing(next);
  };
  const closeEditor = () => {
    actions.clearMessage();
    setEditing(null);
  };
  const board = { isTaskBusy: actions.isTaskBusy, onChangeStatus: actions.changeStatus, onEdit: openEditor, onRemove: actions.remove };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>{MESSAGES.tasks.title}</Text>
          <Text style={styles.subtitle}>{MESSAGES.tasks.subtitle(items.length)}</Text>
        </View>
        <NewTaskButton onPress={() => openEditor('new')} />
      </View>
      <View accessibilityLabel={MESSAGES.tasks.viewLabel} style={styles.toggle}>
        {VIEWS.map((option) => {
          const selected = view === option.view;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.view}
              onPress={() => setView(option.view)}
              style={[styles.toggleItem, selected && styles.toggleSelected]}
            >
              <Icon color={selected ? theme.colors.primary : theme.colors.textSecondary} name={option.icon} size={15} />
              <Text style={[styles.toggleLabel, selected && styles.toggleLabelSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {!editing && actions.message ? <ErrorNotice message={actions.message} /> : null}
      {tasks.data && items.length === 0 ? (
        <EmptyState icon="folder" text={MESSAGES.tasks.emptyText} title={MESSAGES.tasks.emptyTitle}>
          <NewTaskButton onPress={() => openEditor('new')} />
        </EmptyState>
      ) : view === 'KANBAN' ? (
        <KanbanBoard tasks={items} user={user} {...board} />
      ) : (
        <TaskList tasks={items} user={user} {...board} />
      )}
      {editing ? (
        <Modal
          onClose={closeEditor}
          title={task ? MESSAGES.tasks.editTaskTitle : MESSAGES.tasks.newTaskTitle}
        >
          <TaskForm
            key={task?.id ?? 'new'}
            members={isOwner(user) ? (members.data ?? []) : null}
            message={actions.message}
            onCancel={closeEditor}
            onSubmit={save}
            submitting={actions.isSaving}
            task={task}
          />
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: theme.spacing.xlarge },
  header: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.large, justifyContent: 'space-between' },
  heading: { gap: theme.spacing.xsmall },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.pageHeading + 4 },
  subtitle: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.body },
  newTask: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    gap: theme.spacing.small,
    minHeight: theme.layout.buttonHeight,
    paddingHorizontal: theme.spacing.large,
  },
  newTaskLabel: { color: theme.colors.surface, fontFamily: theme.typography.semibold, fontSize: theme.typography.body },
  toggle: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    gap: 2,
    padding: 3,
  },
  toggleItem: {
    alignItems: 'center',
    borderRadius: theme.radii.medium,
    flexDirection: 'row',
    gap: theme.spacing.small - 2,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.small,
  },
  toggleSelected: { backgroundColor: theme.colors.surface },
  toggleLabel: { color: theme.colors.textSecondary, fontFamily: theme.typography.semibold, fontSize: theme.typography.small },
  toggleLabelSelected: { color: theme.colors.primary },
});

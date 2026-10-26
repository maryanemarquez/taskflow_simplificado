import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { AuthField } from '../../auth/ui/AuthField';
import { ErrorNotice } from '../../auth/ui/ErrorNotice';
import { PrimaryButton } from '../../auth/ui/PrimaryButton';
import type { Member } from '../../membros/api/membrosApi';
import type { Task, TaskInput } from '../api/tarefasApi';
import { DatePickerField } from './DatePickerField';

interface TaskFormProps {
  task: Task | null;
  members: Member[] | null;
  message: string | null;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
}

/** `members` só é informado ao Dono, que pode escolher o responsável. */
export function TaskForm({ task, members, message, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.titulo ?? '');
  const [description, setDescription] = useState(task?.descricao ?? '');
  const [dueDate, setDueDate] = useState<string | null>(task?.prazo ?? null);
  const [assigneeId, setAssigneeId] = useState<number | null>(task?.responsavel.id ?? null);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!title.trim()) {
      setError(MESSAGES.tasks.titleRequired);
      return;
    }
    setError(null);
    onSubmit({
      titulo: title.trim(),
      descricao: description.trim() || null,
      prazo: dueDate,
      responsavelId: assigneeId,
    });
  };

  return (
    <View style={styles.form}>
      <AuthField field={{ label: MESSAGES.tasks.taskTitle, value: title, onChangeText: setTitle, autoCapitalize: 'sentences' }} />
      <AuthField field={{ label: MESSAGES.tasks.description, value: description, onChangeText: setDescription, autoCapitalize: 'sentences' }} />
      <DatePickerField onChange={setDueDate} originalValue={task?.prazo ?? null} value={dueDate} />
      {members ? (
        <View style={styles.assigneeField}>
          <Text style={styles.label}>{MESSAGES.tasks.assignee}</Text>
          <View style={styles.assignees}>
          {members.map((member) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: assigneeId === member.id }}
              key={member.id}
              onPress={() => setAssigneeId(member.id)}
              style={[styles.chip, assigneeId === member.id && styles.chipSelected]}
            >
              <Text style={[styles.option, assigneeId === member.id && styles.selected]}>{member.nome}</Text>
            </Pressable>
          ))}
          </View>
        </View>
      ) : null}
      {error || message ? <ErrorNotice message={error ?? message ?? ''} /> : null}
      <View style={styles.buttons}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancel}>{MESSAGES.common.cancel}</Text>
        </Pressable>
        <View style={styles.save}>
          <PrimaryButton disabled={false} icon="check" label={MESSAGES.common.save} loading={false} onPress={submit} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.large },
  assigneeField: { gap: theme.spacing.small },
  assignees: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.small },
  chip: {
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small - 2,
  },
  chipSelected: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
  buttons: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium, justifyContent: 'flex-end' },
  save: { minWidth: 140 },
  cancelButton: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: theme.layout.buttonHeight,
    paddingHorizontal: theme.spacing.xlarge,
  },
  label: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.label },
  option: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular },
  selected: { color: theme.colors.primary, fontFamily: theme.typography.bold },
  cancel: { color: theme.colors.text, fontFamily: theme.typography.semibold, textAlign: 'center' },
});

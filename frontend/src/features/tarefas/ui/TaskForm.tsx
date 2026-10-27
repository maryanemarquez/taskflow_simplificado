import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FIELD_LIMITS } from '../../../core/api/apiContract';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { formStyles } from '../../../core/ui/formStyles';
import { FormField } from '../../../core/ui/FormField';
import { ErrorNotice } from '../../../core/ui/ErrorNotice';
import { PrimaryButton } from '../../../core/ui/PrimaryButton';
import { isOwnerRole } from '../../auth/model/roles';
import type { Member } from '../../membros/api/membrosApi';
import type { Task, TaskInput } from '../api/tarefasApi';
import { validateTask, type TaskErrors } from '../model/taskValidation';
import { DatePickerField } from './DatePickerField';

const SAVE_BUTTON_MIN_WIDTH = 140;

interface TaskFormProps {
  task: Task | null;
  members: Member[] | null;
  message: string | null;
  /** Erros da API por campo (`titulo`, `descricao`, `prazo`, `responsavelId`), mostrados junto de cada campo. */
  fieldErrors?: Record<string, string>;
  /** Salvando: bloqueia novo envio (clique duplo) e o cancelamento. */
  submitting?: boolean;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
}

/** `members` só é informado ao Dono, que pode escolher o responsável. */
export function TaskForm({ task, members, message, fieldErrors = {}, submitting = false, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.titulo ?? '');
  const [description, setDescription] = useState(task?.descricao ?? '');
  const [dueDate, setDueDate] = useState<string | null>(task?.prazo ?? null);
  const [pickedAssigneeId, setAssigneeId] = useState<number | null>(task?.responsavel.id ?? null);
  const [errors, setErrors] = useState<TaskErrors>({});
  // Tarefa nova: o Dono já vem escolhido como responsável, e ele troca se quiser.
  const assigneeId = pickedAssigneeId ?? (task ? null : (members?.find((member) => isOwnerRole(member.papel))?.id ?? null));

  const submit = () => {
    const found = validateTask({ titulo: title, descricao: description });
    setErrors(found);
    if (found.titulo || found.descricao) {
      return;
    }
    onSubmit({
      titulo: title.trim(),
      descricao: description.trim() || null,
      prazo: dueDate,
      responsavelId: assigneeId,
    });
  };

  const changeTitle = (value: string) => {
    setTitle(value);
    setErrors((current) => ({ ...current, titulo: undefined }));
  };
  const changeDescription = (value: string) => {
    setDescription(value);
    setErrors((current) => ({ ...current, descricao: undefined }));
  };

  return (
    <View style={styles.form}>
      <FormField
        field={{
          label: MESSAGES.tasks.taskTitle,
          value: title,
          onChangeText: changeTitle,
          error: errors.titulo ?? fieldErrors.titulo,
          autoCapitalize: 'sentences',
          maxLength: FIELD_LIMITS.titulo,
        }}
      />
      <FormField
        field={{
          label: MESSAGES.tasks.description,
          value: description,
          onChangeText: changeDescription,
          error: errors.descricao ?? fieldErrors.descricao,
          autoCapitalize: 'sentences',
          maxLength: FIELD_LIMITS.descricao,
        }}
      />
      <DatePickerField error={fieldErrors.prazo} onChange={setDueDate} originalValue={task?.prazo ?? null} value={dueDate} />
      {members ? (
        <View style={styles.assigneeField}>
          <Text style={formStyles.label}>{MESSAGES.tasks.assignee}</Text>
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
          {fieldErrors.responsavelId ? <Text accessibilityRole="alert" style={formStyles.error}>{fieldErrors.responsavelId}</Text> : null}
        </View>
      ) : null}
      {message ? <ErrorNotice message={message} /> : null}
      <View style={styles.buttons}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={onCancel}
          style={[styles.cancelButton, submitting && styles.cancelDisabled]}
        >
          <Text style={styles.cancel}>{MESSAGES.common.cancel}</Text>
        </Pressable>
        <View style={styles.save}>
          <PrimaryButton icon="check" label={MESSAGES.common.save} loading={submitting} onPress={submit} />
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
    paddingVertical: theme.spacing.tight,
  },
  chipSelected: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
  buttons: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium, justifyContent: 'flex-end' },
  save: { minWidth: SAVE_BUTTON_MIN_WIDTH },
  cancelButton: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: theme.layout.buttonHeight,
    paddingHorizontal: theme.spacing.xlarge,
  },
  cancelDisabled: { opacity: theme.states.disabledOpacity },
  option: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular },
  selected: { color: theme.colors.primary, fontFamily: theme.typography.bold },
  cancel: { color: theme.colors.text, fontFamily: theme.typography.semibold, textAlign: 'center' },
});

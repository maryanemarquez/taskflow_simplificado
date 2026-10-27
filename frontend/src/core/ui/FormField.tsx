import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { theme } from '../theme/theme';
import { formStyles } from './formStyles';

export interface FormFieldDefinition {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
}

interface FormFieldProps {
  field: FormFieldDefinition;
}

export function FormField({ field }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={formStyles.label}>{field.label}</Text>
      <TextInput
        accessibilityLabel={field.label}
        autoCapitalize={field.autoCapitalize ?? 'none'}
        autoCorrect={false}
        keyboardType={field.keyboardType}
        onChangeText={field.onChangeText}
        secureTextEntry={field.secureTextEntry}
        style={formStyles.input}
        value={field.value}
      />
      {field.error ? <Text accessibilityRole="alert" style={formStyles.error}>{field.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: theme.spacing.small },
});

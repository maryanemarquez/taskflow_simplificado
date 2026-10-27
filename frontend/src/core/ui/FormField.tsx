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
  /** Limite de caracteres do campo; o backend rejeita acima disso. */
  maxLength?: number;
  /** Dicas para o gerenciador de senhas e o autopreenchimento do navegador e do celular. */
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
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
        autoComplete={field.autoComplete}
        autoCorrect={false}
        keyboardType={field.keyboardType}
        maxLength={field.maxLength}
        onChangeText={field.onChangeText}
        secureTextEntry={field.secureTextEntry}
        style={formStyles.input}
        textContentType={field.textContentType}
        value={field.value}
      />
      {field.error ? <Text accessibilityRole="alert" style={formStyles.error}>{field.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: theme.spacing.small },
});

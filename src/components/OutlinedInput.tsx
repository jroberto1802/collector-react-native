import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme/colors';

type OutlinedInputProps = ComponentProps<typeof TextInput> & {
  label: string;
  trailing?: ReactNode;
};

export function OutlinedInput({
  label,
  style,
  trailing,
  ...inputProps
}: OutlinedInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor="#A0A0A0"
        selectionColor={colors.orange}
        style={[styles.input, trailing ? styles.inputWithTrailing : null, style]}
      />
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 38,
    justifyContent: 'center',
    marginBottom: 18,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    color: colors.text,
    fontSize: 13,
    height: 38,
    paddingHorizontal: 11,
    paddingVertical: 0,
  },
  inputWithTrailing: {
    paddingRight: 43,
  },
  label: {
    backgroundColor: colors.background,
    color: '#888888',
    fontSize: 9,
    left: 8,
    paddingHorizontal: 4,
    position: 'absolute',
    top: -6,
    zIndex: 1,
  },
  trailing: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    top: 0,
    width: 38,
  },
});

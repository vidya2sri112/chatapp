import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { register } from '../services/api';
import { colors, spacing, typography, radius } from '../theme/theme';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try {
      await register(username, email, password);
      Alert.alert('Success', 'Registered. Please login.');
      navigation.replace('Login');
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e?.response?.data?.error;
      const msg = serverMsg || e?.message || 'Please try again';
      Alert.alert('Registration failed', String(msg));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput value={username} onChangeText={setUsername} placeholder="yourname" placeholderTextColor={colors.textSecondary} style={styles.input} />
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="you@example.com" placeholderTextColor={colors.textSecondary} style={styles.input} />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor={colors.textSecondary} style={styles.input} />
        <View style={{ height: spacing(1) }} />
        <Button title="Register" color={colors.primary} onPress={onRegister} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing(2),
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.title,
    color: colors.textPrimary,
    marginBottom: spacing(2),
  },
  label: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing(0.5),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    marginBottom: spacing(1.5),
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
});

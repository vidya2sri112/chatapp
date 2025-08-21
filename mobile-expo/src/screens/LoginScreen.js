import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { login } from '../services/api';
import { initSocket } from '../services/socket';
import { colors, spacing, typography, radius } from '../theme/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      await login(email, password);
      await initSocket();
      navigation.replace('Home');
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e?.message || 'Check your credentials';
      Alert.alert('Login failed', serverMsg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          placeholder="you@example.com"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
        <View style={{ height: spacing(1) }} />
        <Button title="Login" color={colors.primary} onPress={onLogin} />
        <View style={{ height: spacing(1) }} />
        <Button title="Create an account" onPress={() => navigation.navigate('Register')} />
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

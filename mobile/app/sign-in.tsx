import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { signIn } from '../services/auth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Sign in failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Focus</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6B6B6B"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6B6B6B"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 24 },
  title: { color: '#F5F0E8', fontSize: 28, fontWeight: '700', marginBottom: 40, textAlign: 'center' },
  input: {
    backgroundColor: '#1A1A1A', color: '#F5F0E8', borderRadius: 8,
    padding: 14, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#2A2A2A',
  },
  button: {
    backgroundColor: '#BF5B45', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#F5F0E8', fontSize: 16, fontWeight: '600' },
});

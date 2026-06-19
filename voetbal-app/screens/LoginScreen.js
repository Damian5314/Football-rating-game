import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { colors, fonts, spacing, radius, shadow } from '../theme';

const friendlyError = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Ongeldig e-mailadres.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail of wachtwoord klopt niet.';
    case 'auth/email-already-in-use':
      return 'Dit e-mailadres is al in gebruik.';
    case 'auth/weak-password':
      return 'Wachtwoord moet minstens 6 tekens zijn.';
    case 'auth/missing-password':
      return 'Vul een wachtwoord in.';
    default:
      return 'Er ging iets mis. Probeer het opnieuw.';
  }
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      setError('Vul je e-mail en wachtwoord in.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Decoratieve stippen */}
      <View style={[styles.dot, { backgroundColor: colors.coin, top: 90, left: 40 }]} />
      <View style={[styles.dot, { backgroundColor: colors.live, top: 150, right: 70 }]} />
      <View style={[styles.dot, { backgroundColor: colors.primary, top: 210, right: 40 }]} />

      <View style={styles.logoWrap}>
        <View style={styles.logoTile}>
          <Ionicons name="football" size={46} color={colors.white} />
        </View>
        <Text style={styles.appName}>Voorspel & Win</Text>
        <Text style={styles.tagline}>Raad de uitslag, verdien coins</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{isRegistering ? 'Account aanmaken' : 'Inloggen'}</Text>

        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color={colors.muted} />
          <TextInput
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.muted}
          />
        </View>

        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.muted} />
          <TextInput
            placeholder="Wachtwoord"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
          <TouchableOpacity onPress={() => setShowPw(!showPw)} hitSlop={8}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>{isRegistering ? 'Registreren' : 'Log in'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setIsRegistering(!isRegistering); setError(''); }}>
          <Text style={styles.switch}>
            {isRegistering ? 'Heb je al een account? Log in' : 'Nog geen account? Registreer'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.bg },
  dot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, opacity: 0.7 },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  logoTile: {
    width: 92,
    height: 92,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow,
  },
  appName: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.ink, marginTop: spacing.md },
  tagline: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 2 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl, ...shadow },
  title: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.ink, marginBottom: spacing.lg },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.ink, fontFamily: fonts.body },
  error: { color: colors.live, marginBottom: spacing.sm, fontFamily: fonts.bodyMed },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadow,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontSize: 16, fontFamily: fonts.bodyExtra },
  switch: { color: colors.primaryDark, marginTop: spacing.lg, textAlign: 'center', fontFamily: fonts.bodyBold },
});

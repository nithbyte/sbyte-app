import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { theme } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { login, register, loginDemoCustomer, isLoading } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'OTP'>('LOGIN');

  const [phone, setPhone] = useState('+919876543210');
  const [password, setPassword] = useState('Password@123');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!phone || !password) {
      setErrorMsg('Please enter your mobile number and password');
      return;
    }
    try {
      await login(phone.trim(), password);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Login failed. Please check credentials.');
    }
  };

  const handleRegister = async () => {
    setErrorMsg(null);
    if (!fullName || !phone || !password) {
      setErrorMsg('Full name, mobile number, and password are required');
      return;
    }
    try {
      await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        password,
      });
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Registration failed');
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    try {
      await loginDemoCustomer();
      onClose();
    } catch (e: any) {
      setErrorMsg('Demo login failed');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.dragPill} />

          <View style={styles.header}>
            <View>
              <Text style={styles.brandTitle}>S BYTE</Text>
              <Text style={styles.subTitle}>
                {mode === 'LOGIN'
                  ? 'Login to your quick-commerce account'
                  : mode === 'REGISTER'
                  ? 'Create your customer account'
                  : 'Verify your phone number'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {mode === 'REGISTER' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Karthik Raja"
                  placeholderTextColor={theme.colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number (India)</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {mode === 'REGISTER' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@domain.com"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {mode === 'LOGIN' ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.primaryTealDark} />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.primaryTealDark} />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Quick Demo Customer Button */}
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoLogin}
              disabled={isLoading}
            >
              <Text style={styles.demoButtonText}>⚡ Quick Demo Sign In (+919876543210)</Text>
            </TouchableOpacity>

            <View style={styles.toggleFooter}>
              {mode === 'LOGIN' ? (
                <TouchableOpacity onPress={() => setMode('REGISTER')}>
                  <Text style={styles.toggleText}>
                    New to S BYTE?{' '}
                    <Text style={styles.toggleHighlight}>Create an Account</Text>
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setMode('LOGIN')}>
                  <Text style={styles.toggleText}>
                    Already have an account?{' '}
                    <Text style={styles.toggleHighlight}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 35, 31, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  dragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDE2DC',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.primaryTeal,
  },
  subTitle: {
    fontSize: 13,
    color: theme.colors.textSlate,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: theme.colors.textInk,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textCharcoal,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textInk,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  primaryButton: {
    backgroundColor: theme.colors.accentLime,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: theme.colors.primaryTealDark,
    fontSize: 15,
    fontWeight: '800',
  },
  demoButton: {
    backgroundColor: theme.colors.primarySurface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(18, 61, 53, 0.2)',
  },
  demoButtonText: {
    color: theme.colors.primaryTeal,
    fontSize: 13,
    fontWeight: '700',
  },
  toggleFooter: {
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 13,
    color: theme.colors.textSlate,
  },
  toggleHighlight: {
    color: theme.colors.primaryTeal,
    fontWeight: '800',
  },
});

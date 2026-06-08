import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../../App';
import { authService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from '../components/CustomModal';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const LOGO = require('../../assets/logo.png');

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const showError = (title, message) => {
    setErrorModal({ visible: true, title, message });
  };

  const handleLoginPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => handleLogin());
  };

  const handleLogin = async () => {
    if (!email || !email.trim()) {
      showError('Campos incompletos', 'Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password) {
      showError('Campos incompletos', 'Por favor ingresa tu contraseña.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      showError('Formato inválido', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({
        correo_electronico: email.trim().toLowerCase(),
        password: password,
      });

      const { usuario, token } = response.data;

      const roleName = (usuario.rol?.nombre_rol || usuario.nombre_rol || '').toUpperCase();
      const roleId = Number(usuario.rol?.id_rol || usuario.id_rol || 0);
      const isPaciente = roleName.includes('PACIENTE') || roleId === 3;

      if (!isPaciente) {
        showError(
          'Acceso Denegado',
          'Esta aplicación es exclusiva para pacientes. El personal médico debe acceder por la web.'
        );
        return;
      }

      await login(usuario, token);
    } catch (error) {
      console.log('Error detallado:', error?.response?.data || error.message);

      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          showError('Contraseña Incorrecta', '❌ La contraseña que ingresaste es incorrecta. Por favor, verifícala e intenta de nuevo.');
        } else if (status === 404) {
          showError('Usuario no encontrado', '📧 El correo electrónico ingresado no está registrado en el sistema. ¿Deseas crear una cuenta nueva?');
        } else if (status === 400) {
          const msg = data?.message || data?.error || 'Datos inválidos. Verifica tu información.';
          showError('Solicitud inválida', msg);
        } else {
          const msg = data?.message || data?.error || 'Error en el servidor. Intenta más tarde.';
          showError(`Error ${status}`, msg);
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('Network')) {
        showError(
          '⚠️ Sin Conexión al Servidor',
          'No se pudo conectar al servidor.\n\nVerifica:\n1. Tu conexión a internet\n2. Que el servidor esté encendido\n3. La IP y puerto son correctos'
        );
      } else if (error.message?.includes('timeout')) {
        showError('⏱️ Tiempo de espera agotado', 'El servidor no responde. Verifica que la dirección IP sea correcta.');
      } else {
        showError('Error de conexión', 'Ocurrió un problema inesperado: ' + (error.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Background decorations */}
      <View style={[styles.bgCircle1, { backgroundColor: isDark ? 'rgba(255,105,180,0.06)' : 'rgba(255,105,180,0.08)' }]} />
      <View style={[styles.bgCircle2, { backgroundColor: isDark ? 'rgba(0,191,255,0.04)' : 'rgba(0,191,255,0.06)' }]} />
      <View style={[styles.bgCircle3, { backgroundColor: isDark ? 'rgba(255,105,180,0.03)' : 'rgba(255,105,180,0.05)' }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View
          style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}
        >
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
          <Text style={[styles.subtitle, { color: isDark ? colors.textMuted : '#9b7fa6' }]}>
            Salud y Bienestar Femenino
          </Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? colors.borderLight : 'rgba(255,105,180,0.08)',
              shadowColor: isDark ? '#000' : '#FF69B4',
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Iniciar Sesión</Text>

          {/* Email */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Correo Electrónico</Text>
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBg,
            borderColor: isDark ? colors.inputBorder : '#f0e0f0',
          }]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="ejemplo@correo.com"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña</Text>
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBg,
            borderColor: isDark ? colors.inputBorder : '#f0e0f0',
          }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="••••••••"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLoginPress}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              disabled={loading}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLoginPress}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? colors.borderLight : '#f0e0f0' }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>¿Primera vez?</Text>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? colors.borderLight : '#f0e0f0' }]} />
          </View>

          {/* Register */}
          <TouchableOpacity
            style={[styles.registerBtn, {
              borderColor: colors.primary,
              backgroundColor: isDark ? 'rgba(255,105,180,0.08)' : 'rgba(255,105,180,0.05)',
            }]}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Ionicons name="person-add-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.registerText, { color: colors.primary }]}>Crear una cuenta</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Error Modal */}
      <CustomModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ ...errorModal, visible: false })}
        title={errorModal.title}
        icon="alert-circle-outline"
        iconColor="#FF4757"
      >
        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
          {errorModal.message}
        </Text>
        <TouchableOpacity
          style={styles.modalBtn}
          onPress={() => setErrorModal({ ...errorModal, visible: false })}
        >
          <Text style={styles.modalBtnText}>Entendido</Text>
        </TouchableOpacity>
      </CustomModal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 100,
    left: -60,
  },
  bgCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: 40,
    right: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoImage: {
    width: width * 0.55,
    height: 90,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 18,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  eyeBtn: {
    padding: 8,
  },
  button: {
    backgroundColor: '#FF69B4',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  registerText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: '#FF4757',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
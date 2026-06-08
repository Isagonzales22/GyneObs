import React, { useState, useContext, useRef, useEffect } from 'react';
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
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../App';
import { authService, uploadService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from '../components/CustomModal';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const LOGO = require('../../assets/logo.png');

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const { colors, isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [modal, setModal] = useState({ visible: false, title: '', message: '', isSuccess: false });

  // Form States
  const [primerNombre,    setPrimerNombre]    = useState('');
  const [segundoNombre,   setSegundoNombre]   = useState('');
  const [primerApellido,  setPrimerApellido]  = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ci,              setCi]              = useState('');
  const [complementoCi,   setComplementoCi]   = useState('');
  const [telefono,        setTelefono]        = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(null);   // Date | null
  const [sexo,            setSexo]            = useState('');
  const [direccion,       setDireccion]       = useState('');
  const [fotoPerfilUrl,   setFotoPerfilUrl]   = useState(null);   // Cloudinary URL
  const [fotoLocalUri,    setFotoLocalUri]    = useState(null);   // preview URI

  // UI toggles
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker,      setShowDatePicker]      = useState(false);
  const [showPhotoModal,      setShowPhotoModal]      = useState(false);

  // Animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // ─── Password Validation ──────────────────────────────────────────────────
  const pv = {
    minLength:      password.length >= 8,
    hasUpperCase:   /[A-Z]/.test(password),
    hasLowerCase:   /[a-z]/.test(password),
    hasNumber:      /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const isPasswordValid = () => Object.values(pv).every(v => v);

  // ─── Date Helpers ─────────────────────────────────────────────────────────
  const formatDisplay = (d) => {
    if (!d) return '';
    return [
      String(d.getDate()).padStart(2, '0'),
      String(d.getMonth() + 1).padStart(2, '0'),
      d.getFullYear(),
    ].join('/');
  };
  const formatApi = (d) => {
    if (!d) return null;
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  };
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) setFechaNacimiento(selectedDate);
  };

  // ─── Cloudinary Upload ────────────────────────────────────────────────────
  const uploadToCloudinary = async (uri) => {
    setUploadingPhoto(true);
    try {
      const response = await uploadService.uploadProfilePhoto(uri);
      const data = response?.data;
      const url = data?.fotoUrl || data?.foto_perfil_url || data?.url || null;
      if (url) {
        setFotoPerfilUrl(url);
        setFotoLocalUri(uri);   // keep local preview
        return url;
      } else {
        throw new Error('No se recibió URL de Cloudinary');
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      Alert.alert('Error al subir foto', 'No se pudo subir la imagen. Intenta de nuevo.');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ─── Image Picker ─────────────────────────────────────────────────────────
  const requestPerm = async (type) => {
    const { status } = type === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        type === 'camera'
          ? 'Necesitamos acceso a la cámara para tomar una foto.'
          : 'Necesitamos acceso a tu galería para elegir una foto.'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    setShowPhotoModal(false);
    if (!await requestPerm('camera')) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      await uploadToCloudinary(result.assets[0].uri);
    }
  };

  const handlePickGallery = async () => {
    setShowPhotoModal(false);
    if (!await requestPerm('gallery')) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      await uploadToCloudinary(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    setFotoPerfilUrl(null);
    setFotoLocalUri(null);
    setShowPhotoModal(false);
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const showMsg = (title, message, isSuccess = false) =>
    setModal({ visible: true, title, message, isSuccess });

  const handleRegister = async () => {
    if (!primerNombre || !primerApellido || !email || !password) {
      showMsg('Campos Obligatorios', 'Por favor completa todos los campos marcados con (*).');
      return;
    }
    if (password !== confirmPassword) {
      showMsg('Error de Contraseña', 'Las contraseñas no coinciden. Verifica e intenta de nuevo.');
      return;
    }
    if (!isPasswordValid()) {
      showMsg('Contraseña Débil', 'La contraseña debe cumplir con todos los requisitos de seguridad indicados.');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        id_rol: 3,
        correo_electronico: email.trim().toLowerCase(),
        password,
        primer_nombre:    primerNombre.trim(),
        segundo_nombre:   segundoNombre.trim()   || null,
        primer_apellido:  primerApellido.trim(),
        segundo_apellido: segundoApellido.trim() || null,
        ci:               ci.trim()              || null,
        complemento_ci:   complementoCi.trim()   || null,
        telefono:         telefono.trim()         || null,
        fecha_nacimiento: formatApi(fechaNacimiento),
        sexo:             sexo                   || null,
        direccion:        direccion.trim()        || null,
        foto_perfil_url:  fotoPerfilUrl           || null,  // Cloudinary URL
      };

      await authService.register(userData);
      showMsg('¡Registro Exitoso!', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión con tus credenciales.', true);
    } catch (error) {
      console.error('Register error:', error);
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network')) {
        showMsg('Sin Conexión', 'No se pudo conectar al servidor. Verifica la IP del servidor en el Perfil.');
      } else {
        const msg = error.response?.data?.message || error.response?.data?.error || 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        showMsg('Error de Registro', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared dynamic shorthands ────────────────────────────────────────────
  const inp = { backgroundColor: colors.inputBg, borderColor: colors.inputBorder };
  const tc  = { color: colors.text };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

        {/* BG Blobs */}
        <View style={[styles.bgCircle1, { backgroundColor: isDark ? 'rgba(255,105,180,0.05)' : 'rgba(255,105,180,0.07)' }]} />
        <View style={[styles.bgCircle2, { backgroundColor: isDark ? 'rgba(0,191,255,0.03)' : 'rgba(0,191,255,0.05)' }]} />

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[styles.card, {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.borderLight : 'rgba(255,105,180,0.08)',
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.title,    { color: colors.primary }]}>Nueva Cuenta</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Registro de Paciente · GyneObs</Text>
          </View>

          {/* ── Foto de Perfil ─────────────────────────────────────────── */}
          <View style={styles.photoSection}>
            {/* Outer wrapper con overflow visible para que el badge salga */}
            <View style={styles.photoWrapper}>
              <TouchableOpacity
                style={[styles.photoCircle, { borderColor: colors.primary, backgroundColor: colors.inputBg }]}
                onPress={() => setShowPhotoModal(true)}
                activeOpacity={0.8}
              >
                {uploadingPhoto ? (
                  <View style={styles.photoUploading}>
                    <ActivityIndicator color={colors.primary} size="large" />
                    <Text style={[styles.uploadingText, { color: colors.textSecondary }]}>Subiendo...</Text>
                  </View>
                ) : fotoLocalUri ? (
                  <Image source={{ uri: fotoLocalUri }} style={styles.photoImage} />
                ) : (
                  <Ionicons name="person" size={44} color={colors.textMuted} />
                )}
              </TouchableOpacity>

              {/* Badge FUERA del círculo (encima, esquina inferior derecha del wrapper) */}
              <TouchableOpacity
                style={[styles.cameraBadge, { backgroundColor: colors.primary }]}
                onPress={() => setShowPhotoModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
              {fotoPerfilUrl ? '✓ Foto subida a nube' : 'Foto de perfil (opcional)'}
            </Text>
          </View>

          {/* ── Form ───────────────────────────────────────────────────── */}
          <View style={styles.form}>

            {/* Nombres */}
            <View style={styles.row}>
              <View style={styles.flexItem}>
                <Text style={[styles.label, tc]}>Primer Nombre *</Text>
                <View style={[styles.inputContainer, inp]}>
                  <TextInput style={[styles.input, tc]} placeholder="Ana" value={primerNombre} onChangeText={setPrimerNombre} placeholderTextColor={colors.placeholder} />
                </View>
              </View>
              <View style={styles.flexItem}>
                <Text style={[styles.label, tc]}>Segundo Nombre</Text>
                <View style={[styles.inputContainer, inp]}>
                  <TextInput style={[styles.input, tc]} placeholder="María" value={segundoNombre} onChangeText={setSegundoNombre} placeholderTextColor={colors.placeholder} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flexItem}>
                <Text style={[styles.label, tc]}>Primer Apellido *</Text>
                <View style={[styles.inputContainer, inp]}>
                  <TextInput style={[styles.input, tc]} placeholder="Silva" value={primerApellido} onChangeText={setPrimerApellido} placeholderTextColor={colors.placeholder} />
                </View>
              </View>
              <View style={styles.flexItem}>
                <Text style={[styles.label, tc]}>Segundo Apellido</Text>
                <View style={[styles.inputContainer, inp]}>
                  <TextInput style={[styles.input, tc]} placeholder="Pérez" value={segundoApellido} onChangeText={setSegundoApellido} placeholderTextColor={colors.placeholder} />
                </View>
              </View>
            </View>

            {/* Correo */}
            <Text style={[styles.label, tc]}>Correo Electrónico *</Text>
            <View style={[styles.inputContainer, inp]}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, tc]}
                placeholder="ejemplo@correo.com"
                value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            {/* CI */}
            <View style={styles.row}>
              <View style={[styles.flexItem, { flex: 2 }]}>
                <Text style={[styles.label, tc]}>C.I. (Cédula de Identidad)</Text>
                <View style={[styles.inputContainer, inp]}>
                  <TextInput style={[styles.input, tc]} placeholder="12345678" value={ci} onChangeText={setCi} keyboardType="numeric" placeholderTextColor={colors.placeholder} />
                </View>
              </View>
              <View style={[styles.flexItem, { flex: 1 }]}>
                <Text style={[styles.label, tc]}>Comp.</Text>
                <View style={[styles.inputContainer, inp]}>
                  <TextInput style={[styles.input, tc]} placeholder="LP" value={complementoCi} onChangeText={setComplementoCi} autoCapitalize="characters" placeholderTextColor={colors.placeholder} />
                </View>
              </View>
            </View>

            {/* Teléfono y Fecha */}
            <View style={styles.row}>
              <View style={styles.flexItem}>
                <Text style={[styles.label, tc]}>Teléfono</Text>
                <View style={[styles.inputContainer, inp]}>
                  <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                  <TextInput style={[styles.input, tc]} placeholder="71234567" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" placeholderTextColor={colors.placeholder} />
                </View>
              </View>

              {/* Date Picker Trigger */}
              <View style={styles.flexItem}>
                <Text style={[styles.label, tc]}>Fecha de Nacimiento</Text>
                <TouchableOpacity
                  style={[styles.inputContainer, inp, { justifyContent: 'space-between' }]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.input, { color: fechaNacimiento ? colors.text : colors.placeholder, lineHeight: 46 }]}>
                    {fechaNacimiento ? formatDisplay(fechaNacimiento) : 'DD/MM/AAAA'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Android DatePicker inline */}
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={fechaNacimiento || new Date(2000, 0, 1)}
                mode="date" display="calendar"
                maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)}
                onChange={onDateChange}
              />
            )}

            {/* iOS DatePicker in modal */}
            {Platform.OS === 'ios' && (
              <Modal visible={showDatePicker} transparent animationType="slide">
                <View style={styles.iosPickerOverlay}>
                  <View style={[styles.iosPickerContainer, { backgroundColor: colors.surface }]}>
                    <View style={[styles.iosPickerHeader, { borderBottomColor: colors.border }]}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.iosPickerCancel, { color: colors.textSecondary }]}>Cancelar</Text>
                      </TouchableOpacity>
                      <Text style={[styles.iosPickerTitle, { color: colors.text }]}>Fecha de Nacimiento</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.iosPickerDone, { color: colors.primary }]}>Listo</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={fechaNacimiento || new Date(2000, 0, 1)}
                      mode="date" display="spinner" locale="es-ES"
                      maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)}
                      onChange={onDateChange}
                      style={{ width: '100%' }}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Sexo */}
            <Text style={[styles.label, tc]}>Sexo</Text>
            <View style={styles.sexSelectorContainer}>
              <TouchableOpacity
                style={[styles.sexButton, { borderColor: colors.border, backgroundColor: colors.inputBg }, sexo === 'FEMENINO' && styles.sexButtonActivePink]}
                onPress={() => setSexo('FEMENINO')}
              >
                <Ionicons name="female" size={18} color={sexo === 'FEMENINO' ? '#ffffff' : '#FF69B4'} />
                <Text style={[styles.sexText, { color: sexo === 'FEMENINO' ? '#fff' : colors.textSecondary }]}>Femenino</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sexButton, { borderColor: colors.border, backgroundColor: colors.inputBg }, sexo === 'MASCULINO' && styles.sexButtonActiveBlue]}
                onPress={() => setSexo('MASCULINO')}
              >
                <Ionicons name="male" size={18} color={sexo === 'MASCULINO' ? '#ffffff' : '#00BFFF'} />
                <Text style={[styles.sexText, { color: sexo === 'MASCULINO' ? '#fff' : colors.textSecondary }]}>Masculino</Text>
              </TouchableOpacity>
            </View>

            {/* Dirección */}
            <Text style={[styles.label, tc]}>Dirección</Text>
            <View style={[styles.inputContainer, inp, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
              <TextInput
                style={[styles.input, tc, { textAlignVertical: 'top' }]}
                placeholder="Av. Principal #456..."
                value={direccion} onChangeText={setDireccion}
                multiline numberOfLines={3}
                placeholderTextColor={colors.placeholder}
              />
            </View>

            {/* Contraseña — key fijo evita parpadeo en re-renders */}
            <Text style={[styles.label, tc]}>Contraseña *</Text>
            <View style={[styles.inputContainer, inp]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                key="password-field"
                style={[styles.input, tc]}
                placeholder="Mínimo 8 caracteres"
                value={password} onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="newPassword"
                autoComplete="new-password"
                importantForAutofill="no"
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Password requirements */}
            {password.length > 0 && (
              <View style={[styles.validationBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={[styles.validationTitle, { color: colors.textSecondary }]}>Requisitos de la contraseña:</Text>
                {[
                  { key: 'minLength',      text: 'Mínimo 8 caracteres' },
                  { key: 'hasUpperCase',   text: 'Al menos una mayúscula' },
                  { key: 'hasLowerCase',   text: 'Al menos una minúscula' },
                  { key: 'hasNumber',      text: 'Al menos un número' },
                  { key: 'hasSpecialChar', text: 'Un carácter especial (!@#$%^&*)' },
                ].map(({ key, text }) => (
                  <View key={key} style={styles.rowReq}>
                    <Ionicons name={pv[key] ? 'checkmark-circle' : 'close-circle'} size={16} color={pv[key] ? '#28c76f' : '#ea5455'} />
                    <Text style={[styles.validationText, { color: pv[key] ? '#28c76f' : '#ea5455' }]}>{text}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Confirmar Contraseña — key fijo, sin autoComplete que cause flash */}
            <Text style={[styles.label, tc]}>Confirmar Contraseña *</Text>
            <View style={[styles.inputContainer, inp]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                key="confirm-password-field"
                style={[styles.input, tc]}
                placeholder="Confirma tu contraseña"
                value={confirmPassword} onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                textContentType="newPassword"
                autoComplete="new-password"
                importantForAutofill="no"
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.rowReq}>
                <Ionicons
                  name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={password === confirmPassword ? '#28c76f' : '#ea5455'}
                />
                <Text style={[styles.validationText, { color: password === confirmPassword ? '#28c76f' : '#ea5455' }]}>
                  {password === confirmPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleRegister}
              style={[
                styles.button,
                { marginTop: 16 },
                (!isPasswordValid() || password !== confirmPassword || !primerNombre || !primerApellido || !email) && styles.buttonDisabled,
              ]}
              disabled={loading || uploadingPhoto}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Registrarse</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginBackContainer}>
              <Text style={[styles.loginBackText, { color: colors.textSecondary }]}>
                ¿Ya tienes una cuenta?{' '}
                <Text style={{ color: colors.secondary, fontWeight: 'bold' }}>Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Photo Source Modal ──────────────────────────────────────────── */}
      <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
        <TouchableOpacity style={styles.photoModalOverlay} activeOpacity={1} onPress={() => setShowPhotoModal(false)}>
          <View style={[styles.photoModalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.photoModalTitle, { color: colors.text }]}>Foto de Perfil</Text>
            <Text style={[styles.photoModalSub,   { color: colors.textSecondary }]}>La foto se sube automáticamente a la nube</Text>

            <TouchableOpacity style={[styles.photoOptionBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={handleTakePhoto} activeOpacity={0.8}>
              <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(255,105,180,0.12)' }]}>
                <Ionicons name="camera" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.photoOptionText, { color: colors.text }]}>Tomar Foto</Text>
                <Text style={[styles.photoOptionSub, { color: colors.textSecondary }]}>Usar la cámara del dispositivo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.photoOptionBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={handlePickGallery} activeOpacity={0.8}>
              <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(0,191,255,0.12)' }]}>
                <Ionicons name="images" size={24} color={colors.secondary} />
              </View>
              <View>
                <Text style={[styles.photoOptionText, { color: colors.text }]}>Elegir de Galería</Text>
                <Text style={[styles.photoOptionSub, { color: colors.textSecondary }]}>Seleccionar desde tus fotos</Text>
              </View>
            </TouchableOpacity>

            {fotoPerfilUrl && (
              <TouchableOpacity style={[styles.photoRemoveBtn, { borderColor: '#FF4757' }]} onPress={removePhoto} activeOpacity={0.8}>
                <Ionicons name="trash-outline" size={18} color="#FF4757" />
                <Text style={styles.photoRemoveText}>Eliminar foto</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.photoCancelBtn, { borderColor: colors.border, backgroundColor: colors.inputBg }]}
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={[styles.photoCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Result Modal */}
      <CustomModal
        visible={modal.visible}
        onClose={() => { setModal({ ...modal, visible: false }); if (modal.isSuccess) navigation.navigate('Login'); }}
        title={modal.title}
        icon={modal.isSuccess ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        iconColor={modal.isSuccess ? '#28c76f' : '#FF4757'}
      >
        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>{modal.message}</Text>
        <TouchableOpacity
          style={[styles.modalBtn, modal.isSuccess && styles.modalBtnSuccess]}
          onPress={() => { setModal({ ...modal, visible: false }); if (modal.isSuccess) navigation.navigate('Login'); }}
        >
          <Text style={styles.modalBtnText}>{modal.isSuccess ? 'Ir a Iniciar Sesión' : 'Entendido'}</Text>
        </TouchableOpacity>
      </CustomModal>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 20, paddingTop: 50, paddingBottom: 30 },

  bgCircle1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -80, right: -80 },
  bgCircle2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, bottom: 60, left: -60 },

  logoContainer: { alignItems: 'center', marginBottom: 16 },
  logoImage: { width: width * 0.45, height: 70 },

  card: {
    borderRadius: 24, padding: 20,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 8,
    borderWidth: 1, marginBottom: 24,
  },

  header: { position: 'relative', alignItems: 'center', marginBottom: 20, paddingTop: 16 },
  backButton: { position: 'absolute', left: 0, top: 0, padding: 8 },
  title:    { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 13, fontWeight: '500' },

  // Photo Section — overflow visible so badge renders outside circle
  photoSection: { alignItems: 'center', marginBottom: 24 },
  photoWrapper: {
    width: 104,
    height: 104,
    marginBottom: 8,
    // No overflow hidden here — allows badge to escape
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: { width: '100%', height: '100%' },
  photoUploading: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  uploadingText: { fontSize: 10, fontWeight: '600' },

  // Badge sits outside the circle, at bottom-right corner of the wrapper
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  photoHint: { fontSize: 12, textAlign: 'center', lineHeight: 18 },

  // Form
  form: { width: '100%' },
  row: { flexDirection: 'row', gap: 12 },
  flexItem: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1, marginBottom: 16,
    paddingHorizontal: 12, height: 46,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: '100%', fontSize: 14 },

  // iOS DatePicker
  iosPickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  iosPickerContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  iosPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  iosPickerCancel: { fontSize: 16 },
  iosPickerTitle:  { fontSize: 16, fontWeight: '700' },
  iosPickerDone:   { fontSize: 16, fontWeight: '700' },

  // Sexo
  sexSelectorContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  sexButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 12, borderWidth: 1, gap: 8 },
  sexButtonActivePink: { backgroundColor: '#FF69B4', borderColor: '#FF69B4' },
  sexButtonActiveBlue: { backgroundColor: '#00BFFF', borderColor: '#00BFFF' },
  sexText: { fontSize: 14, fontWeight: '600' },

  // Validation
  validationBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  validationTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  rowReq: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  validationText: { fontSize: 12 },

  // Buttons
  button: {
    backgroundColor: '#FF69B4', height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  buttonDisabled: { backgroundColor: '#f5b5d5', shadowOpacity: 0, elevation: 0 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  loginBackContainer: { alignItems: 'center', marginTop: 20, padding: 8 },
  loginBackText: { fontSize: 14 },

  // Photo Modal
  photoModalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  photoModalCard:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  photoModalTitle:    { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  photoModalSub:      { fontSize: 12, textAlign: 'center', marginBottom: 20 },
  photoOptionBtn:     { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  photoOptionIcon:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  photoOptionText:    { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  photoOptionSub:     { fontSize: 12 },
  photoRemoveBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 12, borderWidth: 1.5, marginBottom: 10 },
  photoRemoveText:    { color: '#FF4757', fontSize: 14, fontWeight: '600' },
  photoCancelBtn:     { height: 46, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  photoCancelText:    { fontSize: 15, fontWeight: '600' },

  // Result Modal
  modalMessage:   { fontSize: 15, lineHeight: 22, marginBottom: 20, textAlign: 'center' },
  modalBtn:       { backgroundColor: '#FF4757', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modalBtnSuccess:{ backgroundColor: '#28c76f' },
  modalBtnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
});

import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../App';
import { usuarioService, uploadService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from '../components/CustomModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const LOGO = require('../../assets/logo.png');

export default function ProfileScreen() {
  const { colors, mode, setMode } = useTheme();
  const { user, logout, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [passModal, setPassModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [infoModal, setInfoModal] = useState({ visible: false, title: '', message: '', isSuccess: false });

  // Profile fields
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [ci, setCi] = useState('');
  const [complementoCi, setComplementoCi] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [localPhoto, setLocalPhoto] = useState(null);

  // Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Animations
  const contentFade = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadUserData();
  }, [user]);

  const startAnimation = () => {
    contentFade.setValue(0);
    scaleAnim.setValue(0.9);
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadUserData = () => {
    if (user) {
      setPrimerNombre(user.primer_nombre || '');
      setSegundoNombre(user.segundo_nombre || '');
      setPrimerApellido(user.primer_apellido || '');
      setSegundoApellido(user.segundo_apellido || '');
      setCi(user.ci || '');
      setComplementoCi(user.complemento_ci || '');
      setTelefono(user.telefono || '');
      setFechaNacimiento(user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '');
      setSexo(user.sexo || '');
      setDireccion(user.direccion || '');
      startAnimation();
    }
  };

  const showInfo = (title, message, isSuccess = false) => {
    setInfoModal({ visible: true, title, message, isSuccess });
  };

  // ─── Photo Picker ───────────────────────────────────────────────
  const pickFromGallery = async () => {
    setPhotoModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showInfo('Permiso Denegado', 'Necesitamos permiso para acceder a tu galería de fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setLocalPhoto(result.assets[0].uri);
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    setPhotoModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showInfo('Permiso Denegado', 'Necesitamos permiso para acceder a tu cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setLocalPhoto(result.assets[0].uri);
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri) => {
    setLoading(true);
    try {
      const uploadRes = await uploadService.uploadProfilePhoto(uri);
      const fotoUrl = uploadRes.data?.fotoUrl;
      
      if (fotoUrl) {
        const userId = user.id_usuario || user.id;
        const response = await usuarioService.update(userId, { foto_perfil_url: fotoUrl });
        const updatedUser = response.data?.usuario || { ...user, foto_perfil_url: fotoUrl };
        await updateUser(updatedUser);
        setLocalPhoto(null);
        showInfo('Foto Actualizada', '¡Tu foto de perfil ha sido actualizada exitosamente!', true);
      } else {
        throw new Error('No se recibió la URL de la foto');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showInfo('Error', 'No se pudo actualizar la foto. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Update Profile ─────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    if (!primerNombre || !primerApellido) {
      showInfo('Campos Obligatorios', 'El primer nombre y primer apellido son requeridos.');
      return;
    }
    setLoading(true);
    try {
      const userId = user.id_usuario || user.id;
      const payload = {
        primer_nombre: primerNombre.trim(),
        segundo_nombre: segundoNombre.trim() || null,
        primer_apellido: primerApellido.trim(),
        segundo_apellido: segundoApellido.trim() || null,
        correo_electronico: user.correo_electronico,
        telefono: telefono.trim() || null,
        ci: ci.trim() || null,
        complemento_ci: complementoCi.trim() || null,
        fecha_nacimiento: fechaNacimiento || null,
        sexo: sexo || null,
        direccion: direccion.trim() || null,
      };
      const response = await usuarioService.update(userId, payload);
      const updatedUser = response.data?.usuario || { ...user, ...payload };
      await updateUser(updatedUser);
      setEditMode(false);
      showInfo('Perfil Actualizado', '¡Tu información personal ha sido actualizada con éxito!', true);
    } catch (error) {
      console.error(error);
      showInfo('Error', error.response?.data?.message || 'No se pudo actualizar tu perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Validate Password Strength ─────────────────────────────────
  const validatePasswordStrength = (pwd) => {
    const strength = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
    setPasswordStrength(strength);
    return Object.values(strength).every(v => v);
  };

  const handlePasswordChange = (pwd) => {
    setPassword(pwd);
    validatePasswordStrength(pwd);
  };

  // ─── Change Password ─────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!password) { showInfo('Campo Obligatorio', 'Por favor ingresa la nueva contraseña.'); return; }
    if (password !== confirmPassword) { showInfo('Error', 'Las contraseñas no coinciden.'); return; }
    
    // Validar todos los requisitos
    if (!validatePasswordStrength(password)) {
      showInfo('Contraseña Débil', 'Tu contraseña debe cumplir con todos los requisitos:\n✓ Mínimo 8 caracteres\n✓ Una mayúscula\n✓ Una minúscula\n✓ Un número\n✓ Un carácter especial');
      return;
    }

    setPassLoading(true);
    try {
      const userId = user.id_usuario || user.id;
      await usuarioService.update(userId, { password });
      setPassModal(false);
      setPassword('');
      setConfirmPassword('');
      showInfo('Contraseña Actualizada', '¡Tu contraseña ha sido cambiada con éxito!', true);
    } catch (error) {
      console.error(error);
      showInfo('Error', 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setPassLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return 'No especificada';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const photoUri = localPhoto || user?.foto_perfil_url;
  const initials = (user?.primer_nombre?.charAt(0) || 'P').toUpperCase();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Background Decorations */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Header Card con Gradiente ── */}
        <LinearGradient
          colors={['#FF69B4', '#FF1493']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Avatar y botón de cámara FUERA del círculo */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrap}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImg} />
              ) : (
                <LinearGradient
                  colors={['#ffffff', '#f0f0f0']}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </LinearGradient>
              )}
            </View>
            {/* Botón de cámara fuera del círculo */}
            <TouchableOpacity style={styles.cameraButton} onPress={() => setPhotoModal(true)} activeOpacity={0.8}>
              <LinearGradient
                colors={['#28c76f', '#20a85a']}
                style={styles.cameraButtonGradient}
              >
                <Ionicons name="camera" size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>
            {user?.primer_nombre} {user?.primer_apellido}
          </Text>
          <Text style={styles.profileEmail}>{user?.correo_electronico}</Text>
        </LinearGradient>

        {/* ── Content ── */}
        <Animated.View style={{ opacity: contentFade, transform: [{ scale: scaleAnim }] }}>
          {editMode ? (
            // ── Edit Form ──
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>✏️ Editar Información</Text>

              <View style={styles.row}>
                <View style={styles.flexItem}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Primer Nombre *</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={primerNombre} onChangeText={setPrimerNombre} placeholderTextColor={colors.placeholder} />
                </View>
                <View style={styles.flexItem}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Segundo Nombre</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={segundoNombre} onChangeText={setSegundoNombre} placeholderTextColor={colors.placeholder} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.flexItem}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Primer Apellido *</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={primerApellido} onChangeText={setPrimerApellido} placeholderTextColor={colors.placeholder} />
                </View>
                <View style={styles.flexItem}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Segundo Apellido</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={segundoApellido} onChangeText={setSegundoApellido} placeholderTextColor={colors.placeholder} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.flexItem, { flex: 2 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>C.I.</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={ci} onChangeText={setCi} keyboardType="numeric" placeholderTextColor={colors.placeholder} />
                </View>
                <View style={[styles.flexItem, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Comp.</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={complementoCi} onChangeText={setComplementoCi} autoCapitalize="characters" placeholderTextColor={colors.placeholder} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.flexItem}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" placeholderTextColor={colors.placeholder} />
                </View>
                <View style={styles.flexItem}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>F. Nacimiento</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={fechaNacimiento} onChangeText={setFechaNacimiento} placeholder="AAAA-MM-DD" placeholderTextColor={colors.placeholder} />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Sexo</Text>
              <View style={styles.sexRow}>
                <TouchableOpacity
                  style={[styles.sexBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }, sexo === 'FEMENINO' && styles.sexBtnPink]}
                  onPress={() => setSexo('FEMENINO')}
                >
                  <Ionicons name="female" size={18} color={sexo === 'FEMENINO' ? '#fff' : '#FF69B4'} />
                  <Text style={[styles.sexText, sexo === 'FEMENINO' && styles.sexTextActive]}>Femenino</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sexBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }, sexo === 'MASCULINO' && styles.sexBtnBlue]}
                  onPress={() => setSexo('MASCULINO')}
                >
                  <Ionicons name="male" size={18} color={sexo === 'MASCULINO' ? '#fff' : '#00BFFF'} />
                  <Text style={[styles.sexText, sexo === 'MASCULINO' && styles.sexTextActive]}>Masculino</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Dirección</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={direccion}
                onChangeText={setDireccion}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={colors.placeholder}
              />

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setEditMode(false); loadUserData(); }}>
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Guardar Cambios</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // ── Info View ──
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>📋 Información Personal</Text>

              {[
                { icon: 'mail-outline', label: 'Correo Electrónico', value: user?.correo_electronico },
                { icon: 'card-outline', label: 'Cédula de Identidad', value: user?.ci ? `${user.ci}${user.complemento_ci ? ` - ${user.complemento_ci}` : ''}` : 'No especificada' },
                { icon: 'call-outline', label: 'Teléfono', value: user?.telefono || 'No especificado' },
                { icon: 'calendar-outline', label: 'Fecha de Nacimiento', value: formatDate(user?.fecha_nacimiento) },
                { icon: 'transgender-outline', label: 'Sexo', value: user?.sexo ? user.sexo.charAt(0) + user.sexo.slice(1).toLowerCase() : 'No especificado' },
                { icon: 'location-outline', label: 'Dirección', value: user?.direccion || 'No especificada' },
              ].map((item, i) => (
                <View key={i} style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
                  <View style={styles.infoIconWrap}>
                    <Ionicons name={item.icon} size={20} color="#FF69B4" />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
                <Ionicons name="create-outline" size={18} color="#FF69B4" />
                <Text style={styles.editBtnText}>Editar Información</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Settings */}
          {!editMode && (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>🔒 Seguridad</Text>

              <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.borderLight }]} onPress={() => setPassModal(true)}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(255,105,180,0.15)' }]}>
                  <Ionicons name="lock-closed" size={20} color="#FF69B4" />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Cambiar Contraseña</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.borderLight }]} onPress={() => setPhotoModal(true)}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(40,199,111,0.15)' }]}>
                  <Ionicons name="camera-outline" size={20} color="#28c76f" />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Cambiar Foto de Perfil</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Apariencia (Tema) */}
          {!editMode && (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>🎨 Apariencia</Text>
              <Text style={[styles.appearanceSubtitle, { color: colors.textSecondary }]}>
                Selecciona cómo deseas ver la aplicación:
              </Text>

              {[
                { id: 'auto', label: 'Automático (Sistema)', desc: 'Se adapta a la configuración de tu dispositivo', icon: 'phone-portrait-outline' },
                { id: 'light', label: 'Modo Claro (Día)', desc: 'Colores suaves y fondo brillante', icon: 'sunny-outline' },
                { id: 'dark', label: 'Modo Oscuro (Noche)', desc: 'Fondo oscuro ideal para entornos de poca luz', icon: 'moon-outline' }
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.themeOptionRow,
                    mode === opt.id && { borderColor: '#FF69B4', backgroundColor: colors.isDark ? 'rgba(255,105,180,0.08)' : 'rgba(255,105,180,0.04)' }
                  ]}
                  onPress={() => setMode(opt.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeOptionIcon, { backgroundColor: mode === opt.id ? 'rgba(255,105,180,0.15)' : colors.borderLight }]}>
                    <Ionicons name={opt.icon} size={22} color={mode === opt.id ? '#FF69B4' : colors.textSecondary} />
                  </View>
                  <View style={styles.themeOptionText}>
                    <Text style={[styles.themeOptionLabel, { color: colors.text, fontWeight: mode === opt.id ? '700' : '500' }]}>{opt.label}</Text>
                    <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>{opt.desc}</Text>
                  </View>
                  <View style={[styles.themeRadio, { borderColor: mode === opt.id ? '#FF69B4' : colors.textMuted }]}>
                    {mode === opt.id && <View style={styles.themeRadioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Logout */}
          {!editMode && (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => setLogoutModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={22} color="#fff" />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Photo Selection Modal ── */}
      <CustomModal
        visible={photoModal}
        onClose={() => setPhotoModal(false)}
        title="Actualizar Foto"
        icon="camera-outline"
        iconColor="#28c76f"
      >
        <Text style={[styles.photoModalDesc, { color: colors.textSecondary }]}>
          Elige cómo deseas actualizar tu foto de perfil:
        </Text>
        <TouchableOpacity style={[styles.photoOptionBtn, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]} onPress={pickFromCamera}>
          <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(255,105,180,0.15)' }]}>
            <Ionicons name="camera" size={28} color="#FF69B4" />
          </View>
          <View style={styles.photoOptionText}>
            <Text style={[styles.photoOptionTitle, { color: colors.text }]}>Tomar Foto</Text>
            <Text style={[styles.photoOptionSub, { color: colors.textSecondary }]}>Usa la cámara de tu dispositivo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.photoOptionBtn, { marginTop: 12, backgroundColor: colors.inputBg, borderColor: colors.borderLight }]} onPress={pickFromGallery}>
          <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(0,191,255,0.15)' }]}>
            <Ionicons name="images" size={28} color="#00BFFF" />
          </View>
          <View style={styles.photoOptionText}>
            <Text style={[styles.photoOptionTitle, { color: colors.text }]}>Elegir de Galería</Text>
            <Text style={[styles.photoOptionSub, { color: colors.textSecondary }]}>Selecciona una foto existente</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </CustomModal>

      {/* ── Change Password Modal ── */}
      <CustomModal
        visible={passModal}
        onClose={() => { setPassModal(false); setPassword(''); setConfirmPassword(''); }}
        title="Cambiar Contraseña"
        icon="lock-closed-outline"
        iconColor="#FF69B4"
      >
        <Text style={[styles.label, { color: colors.textSecondary }]}>Nueva Contraseña</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="lock-closed-outline" size={18} color="#FF69B4" style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.modalInput, { color: colors.text }]}
            placeholder="Ingresa tu nueva contraseña"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Password Strength Requirements */}
        <View style={[styles.strengthContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Text style={[styles.strengthTitle, { color: colors.text }]}>Requisitos de contraseña segura:</Text>
          
          <View style={styles.requirementRow}>
            <Ionicons 
              name={passwordStrength.length ? 'checkmark-circle' : 'close-circle'} 
              size={18} 
              color={passwordStrength.length ? '#28c76f' : colors.textMuted} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.length ? colors.text : colors.textMuted }]}>
              Mínimo 8 caracteres
            </Text>
          </View>

          <View style={styles.requirementRow}>
            <Ionicons 
              name={passwordStrength.uppercase ? 'checkmark-circle' : 'close-circle'} 
              size={18} 
              color={passwordStrength.uppercase ? '#28c76f' : colors.textMuted} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.uppercase ? colors.text : colors.textMuted }]}>
              Una letra mayúscula (A-Z)
            </Text>
          </View>

          <View style={styles.requirementRow}>
            <Ionicons 
              name={passwordStrength.lowercase ? 'checkmark-circle' : 'close-circle'} 
              size={18} 
              color={passwordStrength.lowercase ? '#28c76f' : colors.textMuted} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.lowercase ? colors.text : colors.textMuted }]}>
              Una letra minúscula (a-z)
            </Text>
          </View>

          <View style={styles.requirementRow}>
            <Ionicons 
              name={passwordStrength.number ? 'checkmark-circle' : 'close-circle'} 
              size={18} 
              color={passwordStrength.number ? '#28c76f' : colors.textMuted} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.number ? colors.text : colors.textMuted }]}>
              Un número (0-9)
            </Text>
          </View>

          <View style={styles.requirementRow}>
            <Ionicons 
              name={passwordStrength.special ? 'checkmark-circle' : 'close-circle'} 
              size={18} 
              color={passwordStrength.special ? '#28c76f' : colors.textMuted} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.special ? colors.text : colors.textMuted }]}>
              Un carácter especial (!@#$%^&*)
            </Text>
          </View>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Confirmar Contraseña</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="lock-closed-outline" size={18} color="#FF69B4" style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.modalInput, { color: colors.text }]}
            placeholder="Repite la contraseña"
            placeholderTextColor={colors.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {password && confirmPassword && password !== confirmPassword && (
          <View style={styles.errorMatch}>
            <Ionicons name="alert-circle" size={16} color="#FF4757" />
            <Text style={styles.errorMatchText}>Las contraseñas no coinciden</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (passLoading || !Object.values(passwordStrength).every(v => v)) && { opacity: 0.5 }]}
          onPress={handleChangePassword}
          disabled={passLoading || !Object.values(passwordStrength).every(v => v)}
        >
          {passLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Actualizar Contraseña</Text>}
        </TouchableOpacity>
      </CustomModal>

      {/* ── Info/Success Modal ── */}
      <CustomModal
        visible={infoModal.visible}
        onClose={() => setInfoModal({ ...infoModal, visible: false })}
        title={infoModal.title}
        icon={infoModal.isSuccess ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        iconColor={infoModal.isSuccess ? '#28c76f' : '#FF4757'}
      >
        <Text style={[styles.infoModalMsg, { color: colors.text }]}>{infoModal.message}</Text>
        <TouchableOpacity
          style={[styles.submitBtn, infoModal.isSuccess && { backgroundColor: '#28c76f' }]}
          onPress={() => setInfoModal({ ...infoModal, visible: false })}
        >
          <Text style={styles.submitBtnText}>Entendido</Text>
        </TouchableOpacity>
      </CustomModal>

      {/* ── Logout Confirmation Modal ── */}
      <CustomModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Cerrar Sesión"
        icon="log-out-outline"
        iconColor="#FF4757"
      >
        {/* Ilustración central */}
        <View style={styles.logoutIllustration}>
          <LinearGradient
            colors={['#FF6B6B', '#FF4757']}
            style={styles.logoutIconBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="log-out" size={36} color="#fff" />
          </LinearGradient>
        </View>

        {/* Mensaje */}
        <Text style={[styles.logoutModalTitle, { color: colors.text }]}>¿Deseas cerrar sesión?</Text>
        <Text style={[styles.logoutModalMsg, { color: colors.textSecondary }]}>
          Tu sesión actual será terminada. Podrás volver a ingresar en cualquier momento con tus credenciales.
        </Text>

        {/* Separador decorativo */}
        <View style={styles.logoutDividerRow}>
          <View style={[styles.logoutDividerLine, { backgroundColor: colors.borderLight }]} />
          <Text style={[styles.logoutDividerText, { color: colors.textMuted }]}>acción</Text>
          <View style={[styles.logoutDividerLine, { backgroundColor: colors.borderLight }]} />
        </View>

        {/* Botones */}
        <TouchableOpacity
          style={styles.logoutConfirmBtn}
          onPress={() => { setLogoutModal(false); logout(); }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF4757']}
            style={styles.logoutConfirmGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutConfirmText}>Sí, cerrar sesión</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutCancelBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
          onPress={() => setLogoutModal(false)}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.logoutCancelText, { color: colors.text }]}>Quedarse aquí</Text>
        </TouchableOpacity>
      </CustomModal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fdf6fb' 
  },
  bgCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,105,180,0.08)',
    top: -80,
    right: -80,
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0,191,255,0.06)',
    bottom: 100,
    left: -60,
    zIndex: 0,
  },
  bgCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,105,180,0.05)',
    bottom: 40,
    right: 20,
    zIndex: 0,
  },
  scroll: { paddingBottom: 40 },

  // Header Gradient
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 44, fontWeight: 'bold', color: '#FF69B4' },
  // Botón de cámara fuera del círculo
  cameraButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cameraButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roleText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 20 },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 14,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,105,180,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '600' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FF69B4',
    gap: 8,
    marginTop: 20,
  },
  editBtnText: { color: '#FF69B4', fontWeight: '700', fontSize: 15 },

  // Edit form
  row: { flexDirection: 'row', gap: 12 },
  flexItem: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 4 },
  input: {
    height: 46,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  textArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  sexRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  sexBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    gap: 8,
  },
  sexBtnPink: { backgroundColor: '#FF69B4', borderColor: '#FF69B4' },
  sexBtnBlue: { backgroundColor: '#00BFFF', borderColor: '#00BFFF' },
  sexText: { fontSize: 14, fontWeight: '600', color: '#6c757d' },
  sexTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: '#888', fontWeight: '600', fontSize: 15 },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 14,
  },
  settingIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FF4757',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Modal common
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  modalInput: { flex: 1, height: '100%', fontSize: 14, color: '#333' },
  submitBtn: {
    backgroundColor: '#FF69B4',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Photo modal
  photoModalDesc: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20, textAlign: 'center' },
  photoOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  photoOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionText: { flex: 1 },
  photoOptionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 3 },
  photoOptionSub: { fontSize: 12, color: '#999' },

  // Info modal
  infoModalMsg: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },

  // Password strength indicator
  strengthContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  strengthTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  requirementText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  errorMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  errorMatchText: {
    fontSize: 13,
    color: '#FF4757',
    fontWeight: '600',
  },

  // ── Logout Modal styles ──────────────────────────────────────────
  logoutIllustration: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  logoutIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 10,
  },
  logoutModalMsg: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  logoutDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  logoutDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ececec',
  },
  logoutDividerText: {
    fontSize: 11,
    color: '#bbb',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutConfirmBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    gap: 10,
  },
  logoutConfirmText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  logoutCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#fafafa',
    gap: 8,
    marginBottom: 4,
  },
  logoutCancelText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 15,
  },
  appearanceSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '500',
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 10,
    gap: 12,
  },
  themeOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionText: {
    flex: 1,
  },
  themeOptionLabel: {
    fontSize: 14,
  },
  themeOptionDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  themeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF69B4',
  },
});
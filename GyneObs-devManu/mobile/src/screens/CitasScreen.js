import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  TextInput,
  RefreshControl,
  Animated
} from 'react-native';
import { AuthContext } from '../../App';
import { citaService, medicoService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from '../components/CustomModal';
import { useTheme } from '../context/ThemeContext';

export default function CitasScreen() {
  const { colors } = useTheme();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [citas, setCitas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming / past
  
  // Check if user is a patient
  const isPaciente = user && (
    (user.rol?.nombre_rol || user.nombre_rol || '').toUpperCase().includes('PACIENTE') ||
    (user.rol?.id_rol || user.id_rol) === 3
  );
  
  // Modal State for Booking
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoCita, setTipoCita] = useState('');
  const [fechaCita, setFechaCita] = useState(''); // YYYY-MM-DD
  const [horaCita, setHoraCita] = useState(''); // HH:MM
  const [motivo, setMotivo] = useState('');
  const [selectedMedicoId, setSelectedMedicoId] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [resultModal, setResultModal] = useState({ visible: false, title: '', message: '', isSuccess: false });

  // Animations
  const listFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
  }, []);

  const startAnimation = () => {
    listFade.setValue(0);
    Animated.timing(listFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fetchData = async () => {
    try {
      const [citasRes, medicosRes] = await Promise.all([
        citaService.getAll(),
        medicoService.getAll()
      ]);

      const citasData = citasRes.data?.citas || citasRes.data || [];
      const medicosData = medicosRes.data?.medicos || medicosRes.data || [];

      setCitas(Array.isArray(citasData) ? citasData : []);
      setMedicos(Array.isArray(medicosData) ? medicosData : []);
    } catch (error) {
      console.error('Error fetching appointments data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      startAnimation();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter appointments
  const getFilteredCitas = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return citas.filter(c => {
      const date = new Date(c.fecha_cita);
      const isPast = isNaN(date.getTime()) || date < today;
      const status = (c.estado_cita || c.estado || 'PROGRAMADA').toUpperCase();
      const isCompletedOrCancelled = ['CANCELADA', 'COMPLETADA', 'FINALIZADA'].includes(status);

      if (activeTab === 'upcoming') {
        return !isPast && !isCompletedOrCancelled;
      } else {
        return isPast || isCompletedOrCancelled;
      }
    }).sort((a, b) => {
      if (activeTab === 'upcoming') {
        return new Date(a.fecha_cita) - new Date(b.fecha_cita); // Soonest first
      } else {
        return new Date(b.fecha_cita) - new Date(a.fecha_cita); // Latest first
      }
    });
  };

  const handleCancelCita = (citaId) => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás segura de que deseas cancelar esta cita médica?',
      [
        { text: 'No, mantener', style: 'cancel' },
        { 
          text: 'Sí, cancelar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await citaService.update(citaId, { estado_cita: 'CANCELADA' });
              setResultModal({ visible: true, title: 'Cita Cancelada', message: 'La cita ha sido cancelada correctamente.', isSuccess: true });
              fetchData();
            } catch (error) {
              console.error(error);
              setResultModal({ visible: true, title: 'Error', message: 'No se pudo cancelar la cita. Inténtalo de nuevo.', isSuccess: false });
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleBookAppointment = async () => {
    if (!tipoCita || !fechaCita || !horaCita || !selectedMedicoId) {
      setResultModal({ visible: true, title: 'Campos Incompletos', message: 'Por favor llena todos los campos obligatorios (*).', isSuccess: false });
      return;
    }

    // Date formatting regex validation YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fechaCita)) {
      setResultModal({ visible: true, title: 'Fecha inválida', message: 'La fecha debe tener el formato AAAA-MM-DD (Ej. 2026-06-12).', isSuccess: false });
      return;
    }

    // Time formatting regex validation HH:MM
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(horaCita)) {
      setResultModal({ visible: true, title: 'Hora inválida', message: 'La hora debe tener el formato HH:MM (Ej. 14:30).', isSuccess: false });
      return;
    }

    setBookingLoading(true);
    try {
      // Find patient details or just send userId since backend handles linking or requires user.id_usuario
      // In the web app, booking sends: id_paciente, id_medico, fecha_cita, hora_inicio, hora_fin, motivo, observaciones (Tipo: X)
      // Since it's booked by the patient themselves, the backend associates it with their patient profile automatically based on session token.
      
      const payload = {
        id_medico: Number(selectedMedicoId),
        fecha_cita: fechaCita,
        hora_inicio: horaCita,
        hora_fin: horaCita,
        motivo: motivo || null,
        observaciones: `Tipo: ${tipoCita}`,
        estado_cita: 'PROGRAMADA'
      };

      await citaService.create(payload);
      
      setResultModal({ visible: true, title: 'Cita Agendada', message: 'Tu cita médica ha sido agendada con éxito.', isSuccess: true });
      setModalVisible(false);
      
      // Reset form
      setTipoCita('');
      setFechaCita('');
      setHoraCita('');
      setMotivo('');
      setSelectedMedicoId('');

      // Refresh
      fetchData();
    } catch (error) {
      console.error(error);
      const serverMessage = error.response?.data?.message;
      setResultModal({ visible: true, title: 'Error', message: serverMessage || 'No se pudo agendar la cita. Verifica la disponibilidad.', isSuccess: false });
    } finally {
      setBookingLoading(false);
    }
  };

  const formatCitaDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    const s = (status || 'PROGRAMADA').toUpperCase();
    if (s === 'COMPLETADA') return '#28c76f';
    if (s === 'CANCELADA') return '#ea5455';
    return '#00BFFF';
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  const filteredCitas = getFilteredCitas();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Decorations */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Toggles */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => { setActiveTab('upcoming'); startAnimation(); }}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'upcoming' && styles.activeTabText]}>
            Próximas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => { setActiveTab('past'); startAnimation(); }}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'past' && styles.activeTabText]}>
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <Animated.View style={{ flex: 1, opacity: listFade }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF69B4']} />
          }
        >
          {filteredCitas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tienes citas en esta sección.</Text>
            </View>
          ) : (
            filteredCitas.map(cita => {
              const status = (cita.estado_cita || cita.estado || 'PROGRAMADA').toUpperCase();
              const isUpcoming = activeTab === 'upcoming';
              return (
                <View key={cita.id_cita} style={[styles.citaCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <View style={styles.cardInfo}>
                    <View style={styles.doctorHeader}>
                      <Ionicons name="person-circle" size={32} color="#FF69B4" />
                      <View>
                        <Text style={[styles.doctorName, { color: colors.text }]}>
                          Dr/a. {cita.medico?.usuario?.primer_nombre || cita.medico?.nombre || 'Especialista'} {cita.medico?.usuario?.primer_apellido || cita.medico?.apellido || ''}
                        </Text>
                        <Text style={[styles.doctorSpecialty, { color: colors.textSecondary }]}>
                          {cita.medico?.especialidad || 'Ginecología y Obstetricia'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

                    <View style={styles.detailRow}>
                      <Ionicons name="sparkles-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        Tipo: <Text style={[styles.boldText, { color: colors.text }]}>{cita.tipo_cita || cita.observaciones?.replace('Tipo: ', '') || 'Consulta'}</Text>
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {formatCitaDate(cita.fecha_cita)} · {cita.hora_inicio || cita.hora_cita}
                      </Text>
                    </View>

                    {cita.motivo && (
                      <View style={styles.detailRow}>
                        <Ionicons name="medical-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
                          Motivo: {cita.motivo}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardActions}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15', borderColor: getStatusColor(status) }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                        {status}
                      </Text>
                    </View>
                    
                    {isUpcoming && status === 'PROGRAMADA' && (
                      <TouchableOpacity 
                        style={styles.cancelBtn}
                        onPress={() => handleCancelCita(cita.id_cita)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ea5455" />
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button - Hidden for Patients */}
      {!isPaciente && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Booking Appointment Modal */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Agendar Cita Médica"
        icon="calendar-outline"
        iconColor="#FF69B4"
        scrollable={true}
      >
        {/* Doctor Selector */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Médico Especialista *</Text>
        <View style={styles.selectorContainer}>
          {medicos.map(med => (
            <TouchableOpacity 
              key={med.id_medico}
              style={[
                styles.selectorItem,
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                selectedMedicoId === String(med.id_medico) && styles.selectorItemActive
              ]}
              onPress={() => setSelectedMedicoId(String(med.id_medico))}
            >
              <Ionicons 
                name="person" 
                size={16} 
                color={selectedMedicoId === String(med.id_medico) ? '#ffffff' : '#FF69B4'} 
              />
              <Text style={[
                styles.selectorText,
                { color: colors.textSecondary },
                selectedMedicoId === String(med.id_medico) && styles.selectorTextActive
              ]}>
                Dr/a. {med.usuario?.primer_nombre || med.nombre} {med.usuario?.primer_apellido || med.apellido}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tipo de consulta */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo de Cita *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <TextInput 
            style={[styles.input, { color: colors.text }]}
            placeholder="Ej. Control Prenatal, Ecografía, Consulta Ginecología"
            value={tipoCita}
            onChangeText={setTipoCita}
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Fecha */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha (AAAA-MM-DD) *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput 
            style={[styles.input, { color: colors.text }]}
            placeholder="Ej. 2026-06-15"
            value={fechaCita}
            onChangeText={setFechaCita}
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Hora */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Hora (HH:MM) *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="time-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput 
            style={[styles.input, { color: colors.text }]}
            placeholder="Ej. 15:30"
            value={horaCita}
            onChangeText={setHoraCita}
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Motivo */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Motivo o Síntomas</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
          <TextInput 
            style={[styles.input, { color: colors.text, textAlignVertical: 'top' }]}
            placeholder="Indica brevemente el motivo de tu cita..."
            value={motivo}
            onChangeText={setMotivo}
            multiline={true}
            numberOfLines={3}
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitBtn, bookingLoading && styles.btnDisabled]}
          onPress={handleBookAppointment}
          disabled={bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Agendar Cita</Text>
          )}
        </TouchableOpacity>
      </CustomModal>

      {/* Result Notification Modal */}
      <CustomModal
        visible={resultModal.visible}
        onClose={() => setResultModal({...resultModal, visible: false})}
        title={resultModal.title}
        icon={resultModal.isSuccess ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        iconColor={resultModal.isSuccess ? '#28c76f' : '#FF4757'}
      >
        <Text style={{fontSize: 15, color: colors.text, lineHeight: 22, marginBottom: 20, textAlign: 'center'}}>{resultModal.message}</Text>
        <TouchableOpacity
          style={{backgroundColor: resultModal.isSuccess ? '#28c76f' : '#FF4757', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8}}
          onPress={() => setResultModal({...resultModal, visible: false})}
        >
          <Text style={{color: '#fff', fontWeight: '700', fontSize: 16}}>Entendido</Text>
        </TouchableOpacity>
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6fb',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf6fb',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 6,
    margin: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FF69B4', // Primary pink
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#87929d',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  citaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
  },
  cardInfo: {
    width: '100%',
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f3f5',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '500',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333333',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  cancelBtnText: {
    color: '#ea5455',
    fontSize: 13,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  modalForm: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginLeft: 2,
  },
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  selectorItemActive: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF69B4',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  selectorTextActive: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333333',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#FF69B4',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnDisabled: {
    backgroundColor: '#f5b5d5',
  },
});

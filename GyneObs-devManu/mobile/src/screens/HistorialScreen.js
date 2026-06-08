import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  Animated
} from 'react-native';
import { AuthContext } from '../../App';
import { pacienteService, historiaClinicaService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function HistorialScreen() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historia, setHistoria] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // summary / antecedentes / consultas

  // Animation values
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchHistorial();
  }, []);

  const startAnimation = () => {
    contentFade.setValue(0);
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const fetchHistorial = async () => {
    try {
      // 1. Fetch all patients to find self
      const pacRes = await pacienteService.getAll();
      const patients = pacRes.data?.pacientes || pacRes.data || [];
      
      const selfPaciente = patients.find(p => p.id_usuario === user.id_usuario || p.usuario?.id_usuario === user.id_usuario);
      
      if (selfPaciente) {
        const pacId = selfPaciente.id_paciente || selfPaciente.id;
        // 2. Fetch clinical history for this patient
        const hcRes = await historiaClinicaService.getByPaciente(pacId);
        setHistoria(hcRes.data?.historia || null);
      }
    } catch (error) {
      console.error('Error fetching clinical history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      startAnimation();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistorial();
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    const date = new Date(fechaStr);
    if (isNaN(date.getTime())) return fechaStr;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  // Render Sub-sections
  const renderSummaryTab = () => {
    if (!historia) return null;
    const pac = historia.paciente || {};
    return (
      <View style={styles.tabContent}>
        {/* Basic medical card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardHeading}>Información Clínica</Text>
          <View style={styles.infoGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Código Paciente</Text>
              <Text style={styles.gridValue}>{pac.codigo_paciente || 'PAC-0000'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Grupo Sanguíneo</Text>
              <Text style={[styles.gridValue, { color: '#ea5455', fontWeight: 'bold' }]}>
                {pac.tipo_sangre || 'No registrado'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Estado Civil</Text>
              <Text style={styles.gridValue}>{pac.estado_civil || 'Soltera'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Seguro Médico</Text>
              <Text style={styles.gridValue}>{pac.seguro_medico || 'Particular'}</Text>
            </View>
            <View style={[styles.gridItem, { width: '100%' }]}>
              <Text style={styles.gridLabel}>Ocupación</Text>
              <Text style={styles.gridValue}>{pac.ocupacion || 'Particular'}</Text>
            </View>
          </View>
        </View>

        {/* Notes block */}
        {pac.observaciones && (
          <View style={styles.infoCard}>
            <Text style={styles.cardHeading}>Observaciones Médicas</Text>
            <Text style={styles.notesText}>{pac.observaciones}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderAntecedentesTab = () => {
    if (!historia) return null;
    const go = historia.antecedenteGO || {};
    const pat = historia.antecedentePatologico || {};
    const npat = historia.antecedenteNoPatologico || {};
    const fam = historia.antecedenteFamiliar || {};

    return (
      <View style={styles.tabContent}>
        {/* Gineco-obstetricos */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="female-outline" size={20} color="#FF69B4" />
            <Text style={styles.cardHeading}>Antecedentes Gineco-Obstétricos</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.gridItemSmall}>
              <Text style={styles.gridLabel}>Gesta</Text>
              <Text style={styles.gridValue}>{go.gestas ?? '0'}</Text>
            </View>
            <View style={styles.gridItemSmall}>
              <Text style={styles.gridLabel}>Partos</Text>
              <Text style={styles.gridValue}>{go.partos ?? '0'}</Text>
            </View>
            <View style={styles.gridItemSmall}>
              <Text style={styles.gridLabel}>Cesáreas</Text>
              <Text style={styles.gridValue}>{go.cesareas ?? '0'}</Text>
            </View>
            <View style={styles.gridItemSmall}>
              <Text style={styles.gridLabel}>Abortos</Text>
              <Text style={styles.gridValue}>{go.abortos ?? '0'}</Text>
            </View>
            <View style={[styles.gridItem, { width: '100%' }]}>
              <Text style={styles.gridLabel}>FUM (Fecha Última Menstruación)</Text>
              <Text style={styles.gridValue}>{formatFecha(go.fum) || 'No registrada'}</Text>
            </View>
            <View style={[styles.gridItem, { width: '100%' }]}>
              <Text style={styles.gridLabel}>FPP (Fecha Probable Parto)</Text>
              <Text style={styles.gridValue}>{formatFecha(go.fpp) || 'No registrada'}</Text>
            </View>
          </View>
        </View>

        {/* Patologias y Familiares */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="pulse" size={20} color="#ea5455" />
            <Text style={styles.cardHeading}>Antecedentes Clínicos</Text>
          </View>
          
          <View style={styles.itemSpacing}>
            <Text style={styles.backgroundLabel}>Patológicos (Enfermedades/Cirugías):</Text>
            <Text style={styles.backgroundValue}>{pat.descripcion || 'Sin novedades clínicas registradas.'}</Text>
          </View>

          <View style={styles.itemSpacing}>
            <Text style={styles.backgroundLabel}>No Patológicos (Alergias/Hábitos):</Text>
            <Text style={styles.backgroundValue}>{npat.descripcion || 'Sin novedades clínicas registradas.'}</Text>
          </View>

          <View style={styles.itemSpacing}>
            <Text style={styles.backgroundLabel}>Familiares (Hereditarios):</Text>
            <Text style={styles.backgroundValue}>{fam.descripcion || 'Sin novedades clínicas registradas.'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderConsultasTab = () => {
    if (!historia || !historia.consultas || historia.consultas.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-text-outline" size={48} color="#cccccc" />
          <Text style={styles.emptyText}>No tienes consultas previas registradas.</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {historia.consultas.map((consulta) => (
          <View key={consulta.id_consulta_medica} style={styles.consultaCard}>
            <View style={styles.consultaHeader}>
              <View style={styles.consultaHeaderTitle}>
                <Ionicons name="medical" size={16} color="#764ba2" />
                <Text style={styles.consultaDate}>{formatFecha(consulta.fecha_consulta)}</Text>
              </View>
              <View style={styles.consultaDoctorBg}>
                <Text style={styles.consultaDoctor}>Consulta Médica</Text>
              </View>
            </View>

            <View style={styles.consultaBody}>
              {consulta.motivo && (
                <View style={styles.consultaRow}>
                  <Text style={styles.consultaLabel}>Motivo:</Text>
                  <Text style={styles.consultaValue}>{consulta.motivo}</Text>
                </View>
              )}

              {consulta.diagnostico && (
                <View style={styles.consultaRow}>
                  <Text style={styles.consultaLabel}>Diagnóstico:</Text>
                  <Text style={styles.consultaValue}>{consulta.diagnostico}</Text>
                </View>
              )}

              {consulta.tratamiento && (
                <View style={styles.consultaRow}>
                  <Text style={styles.consultaLabel}>Tratamiento:</Text>
                  <Text style={styles.consultaValue}>{consulta.tratamiento}</Text>
                </View>
              )}

              {consulta.observaciones && (
                <View style={styles.consultaRow}>
                  <Text style={styles.consultaLabel}>Notas:</Text>
                  <Text style={styles.consultaValue}>{consulta.observaciones}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sub-Header Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => { setActiveTab('summary'); startAnimation(); }}
        >
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
            Resumen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'antecedentes' && styles.activeTab]}
          onPress={() => { setActiveTab('antecedentes'); startAnimation(); }}
        >
          <Text style={[styles.tabText, activeTab === 'antecedentes' && styles.activeTabText]}>
            Antecedentes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'consultas' && styles.activeTab]}
          onPress={() => { setActiveTab('consultas'); startAnimation(); }}
        >
          <Text style={[styles.tabText, activeTab === 'consultas' && styles.activeTabText]}>
            Consultas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content ScrollView */}
      {!historia ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF69B4']} />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="#cccccc" />
            <Text style={styles.emptyText}>Tu expediente clínico no ha sido creado en el sistema aún.</Text>
          </View>
        </ScrollView>
      ) : (
        <Animated.View style={{ flex: 1, opacity: contentFade }}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF69B4']} />
            }
          >
            {activeTab === 'summary' && renderSummaryTab()}
            {activeTab === 'antecedentes' && renderAntecedentesTab()}
            {activeTab === 'consultas' && renderConsultasTab()}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  tabsContainer: {
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
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FF69B4',
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  tabContent: {
    width: '100%',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },
  gridItem: {
    width: '50%',
    paddingRight: 10,
  },
  gridItemSmall: {
    width: '25%',
  },
  gridLabel: {
    fontSize: 11,
    color: '#87929d',
    fontWeight: '600',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  notesText: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
  },
  itemSpacing: {
    marginBottom: 14,
  },
  backgroundLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 4,
  },
  backgroundValue: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#87929d',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  consultaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  consultaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  consultaHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consultaDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  consultaDoctorBg: {
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  consultaDoctor: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#764ba2',
  },
  consultaBody: {
    gap: 8,
  },
  consultaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  consultaLabel: {
    width: 90,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
  },
  consultaValue: {
    flex: 1,
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Animated
} from 'react-native';
import { recetaService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from '../components/CustomModal';
import { useTheme } from '../context/ThemeContext';

export default function RecetasScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recetas, setRecetas] = useState([]);
  const [selectedReceta, setSelectedReceta] = useState(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRecetas();
  }, []);

  const startAnimation = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fetchRecetas = async () => {
    try {
      const response = await recetaService.getAll();
      const data = response.data?.recetas || response.data || [];
      setRecetas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      startAnimation();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecetas();
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Decorations */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Top Banner Stat */}
      <View style={[styles.statBanner, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={[styles.statIconBg, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="document-text" size={24} color="#00BFFF" />
        </View>
        <View>
          <Text style={[styles.statCount, { color: colors.text }]}>{recetas.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Recetas Recibidas</Text>
        </View>
      </View>

      {/* Recetas List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF69B4']} />
          }
        >
          {recetas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bandage-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aún no tienes recetas médicas registradas.</Text>
            </View>
          ) : (
            recetas.map(receta => {
              const id = receta.id_receta || receta.id;
              const medicName = receta.medico?.usuario
                ? `${receta.medico.usuario.primer_nombre || ''} ${receta.medico.usuario.primer_apellido || ''}`.trim()
                : receta.medico?.especialidad || 'Médico tratante';

              return (
                <TouchableOpacity 
                  key={id} 
                  style={[styles.recetaCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={() => setSelectedReceta(receta)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      <Ionicons name="pill" size={20} color="#00BFFF" />
                      <Text style={[styles.cardTitle, { color: colors.text }]}>Receta Médica</Text>
                    </View>
                    <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                      {formatFecha(receta.fecha_receta)}
                    </Text>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={[styles.doctorLabel, { color: colors.textSecondary }]}>Emitida por:</Text>
                    <Text style={[styles.doctorValue, { color: colors.text }]}>Dr/a. {medicName}</Text>

                    {receta.indicaciones_generales && (
                      <Text style={[styles.indicacionesText, { color: colors.textSecondary }]} numberOfLines={2}>
                        Indicaciones: {receta.indicaciones_generales}
                      </Text>
                    )}
                  </View>

                  <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
                    <Text style={styles.viewLink}>Ver receta completa</Text>
                    <Ionicons name="chevron-forward" size={16} color="#FF69B4" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </Animated.View>

      {/* Recipe Detail Modal */}
      <CustomModal
        visible={selectedReceta !== null}
        onClose={() => setSelectedReceta(null)}
        title="Detalle de Receta"
        icon="document-text"
        iconColor="#FF69B4"
        scrollable={true}
      >
        {selectedReceta && (
          <>
            {/* Info block */}
            <View style={[styles.infoBlock, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Médico tratante</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                Dr/a. {selectedReceta.medico?.usuario
                  ? `${selectedReceta.medico.usuario.primer_nombre || ''} ${selectedReceta.medico.usuario.primer_apellido || ''}`.trim()
                  : selectedReceta.medico?.especialidad || 'Especialista'}
              </Text>
              <Text style={[styles.infoDate, { color: colors.textSecondary }]}>
                Fecha de emisión: {formatFecha(selectedReceta.fecha_receta)}
              </Text>
            </View>

            {/* Medicines List */}
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Medicamentos recetados</Text>
            {selectedReceta.detalleReceta?.length > 0 ? (
              selectedReceta.detalleReceta.map((med, index) => (
                <View key={index} style={[styles.medicationItem, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <View style={styles.medHeader}>
                    <Ionicons name="ellipse" size={8} color="#FF69B4" style={styles.medDot} />
                    <Text style={[styles.medName, { color: colors.text }]}>{med.medicamento}</Text>
                  </View>
                  <View style={styles.medDetails}>
                    {med.dosis && <Text style={[styles.medDetailText, { color: colors.textSecondary }]}>Dosis: {med.dosis}</Text>}
                    {med.frecuencia && <Text style={[styles.medDetailText, { color: colors.textSecondary }]}>Frecuencia: {med.frecuencia}</Text>}
                    {med.duracion && <Text style={[styles.medDetailText, { color: colors.textSecondary }]}>Duración: {med.duracion}</Text>}
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.noMedsText, { color: colors.textMuted }]}>Sin medicamentos detallados.</Text>
            )}

            {/* General Instructions */}
            {selectedReceta.indicaciones_generales && (
              <View style={styles.instructionsBlock}>
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Indicaciones generales</Text>
                <Text style={[styles.instructionsTextContent, { 
                  backgroundColor: colors.isDark ? 'rgba(255,105,180,0.1)' : '#fff9fa', 
                  borderColor: colors.isDark ? 'rgba(255,105,180,0.25)' : '#ffe9ec', 
                  color: colors.text 
                }]}>
                  {selectedReceta.indicaciones_generales}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setSelectedReceta(null)}
            >
              <Text style={styles.closeBtnText}>Cerrar Receta</Text>
            </TouchableOpacity>
          </>
        )}
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
  statBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 16,
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 24,
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
    textAlign: 'center',
  },
  recetaCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  cardDate: {
    fontSize: 12,
    color: '#87929d',
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: 12,
  },
  doctorLabel: {
    fontSize: 11,
    color: '#87929d',
    fontWeight: '600',
    marginBottom: 2,
  },
  doctorValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  indicacionesText: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingTop: 12,
  },
  viewLink: {
    fontSize: 13,
    color: '#FF69B4',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    paddingBottom: 15,
    marginBottom: 15,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  modalBody: {
    paddingBottom: 10,
  },
  infoBlock: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 11,
    color: '#87929d',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  infoDate: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
    marginTop: 8,
  },
  medicationItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medDot: {
    marginRight: 6,
  },
  medName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  medDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingLeft: 14,
  },
  medDetailText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  noMedsText: {
    fontSize: 13,
    color: '#87929d',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  instructionsBlock: {
    marginTop: 12,
    marginBottom: 16,
  },
  instructionsTextContent: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
    backgroundColor: '#fff9fa',
    borderWidth: 1,
    borderColor: '#ffe9ec',
    borderRadius: 12,
    padding: 12,
  },
  closeBtn: {
    backgroundColor: '#FF69B4',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { AuthContext } from '../../App';
import { citaService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingCitas, setUpcomingCitas] = useState([]);
  const [stats, setStats] = useState({ totalCitas: 0, nextCitaStr: 'Ninguna' });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const startAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  };

  const fetchDashboardData = async () => {
    try {
      const response = await citaService.getAll();
      const citasData = response.data?.citas || response.data || [];
      
      if (Array.isArray(citasData)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filtered = citasData.filter(c => {
          const status = (c.estado_cita || c.estado || 'PROGRAMADA').toUpperCase();
          if (['CANCELADA', 'COMPLETADA', 'FINALIZADA'].includes(status)) return false;
          
          const date = new Date(c.fecha_cita);
          return !isNaN(date.getTime()) && date >= today;
        }).sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita));

        setUpcomingCitas(filtered);

        let nextCitaText = 'Ninguna';
        if (filtered.length > 0) {
          const next = filtered[0];
          const date = new Date(next.fecha_cita);
          const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          const timeStr = next.hora_inicio || next.hora_cita || '';
          nextCitaText = `${dateStr} · ${timeStr}`;
        }

        setStats({
          totalCitas: citasData.length,
          nextCitaStr: nextCitaText
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      startAnimations();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCitaDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getStatusColor = (status) => {
    const s = (status || 'PROGRAMADA').toUpperCase();
    if (s === 'COMPLETADA') return '#28c76f';
    if (s === 'CANCELADA') return '#ea5455';
    return '#00BFFF';
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF69B4']} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Background Decorations */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Welcome Section - Diseño Premium */}
      <Animated.View 
        style={[
          styles.welcomeSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <LinearGradient
          colors={['#FF69B4', '#FF85C0', '#FFB6D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeGradient}
        >
          {/* Decorative Elements */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorLine} />
          
          {/* Main Content */}
          <View style={styles.welcomeInner}>
            <View style={styles.logoBox}>
              <Image 
                source={require('../../src/logotipo/LOGOTIPO.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.greetingText}>¡Hola {user?.primer_nombre || 'Paciente'}!</Text>
            <Text style={styles.nameText}>Bienvenida a tu espacio de salud</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.subtitleText}>Estamos aquí para cuidar tu bienestar femenino 💕</Text>
            
            {/* Bottom Accent */}
            <View style={styles.accentBar} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Status Cards - Nuevo diseño */}
      <Animated.View 
        style={[
          styles.cardsRow,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={[styles.cardIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="calendar" size={28} color="#FF69B4" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Próxima Cita</Text>
            <Text style={[styles.cardValueSmall, { color: colors.text }]}>{stats.nextCitaStr}</Text>
          </View>
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={[styles.cardIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="checkmark-circle" size={28} color="#00BFFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Total Citas</Text>
            <Text style={[styles.cardValueSmall, { color: colors.text }]}>{stats.totalCitas}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions - Versión minimalista */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Acciones Rápidas</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]} 
            onPress={() => navigation.navigate('Recetas')}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text" size={20} color="#FF69B4" />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Recetas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]} 
            onPress={() => navigation.navigate('Educación')}
            activeOpacity={0.7}
          >
            <Ionicons name="book" size={20} color="#00BFFF" />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Educación</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]} 
            onPress={() => navigation.navigate('Perfil')}
            activeOpacity={0.7}
          >
            <Ionicons name="person" size={20} color="#764ba2" />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Appointments - Nuevo Diseño */}
      <View style={styles.sectionContainer}>
        <View style={styles.upcomingHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tu Historial de Citas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Citas')}>
            <Text style={styles.seeAllText}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        {upcomingCitas.length === 0 ? (
          <View style={[styles.emptyStateContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name="calendar-outline" size={56} color="#FF69B4" />
            </View>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Sin citas próximas</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Tus citas aparecerán aquí. Accede a la sección de Citas para más información.</Text>
          </View>
        ) : (
          upcomingCitas.slice(0, 3).map(cita => (
            <View key={cita.id_cita} style={[styles.citaItemNew, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={[styles.citaTimeBox, { backgroundColor: colors.isDark ? 'rgba(255,105,180,0.15)' : '#fff3f9' }]}>
                <Text style={styles.citaDay}>
                  {new Date(cita.fecha_cita).getDate()}
                </Text>
                <Text style={styles.citaMonth}>
                  {new Date(cita.fecha_cita).toLocaleDateString('es-ES', { month: 'short' })}
                </Text>
              </View>
              <View style={styles.citaDetailsNew}>
                <Text style={[styles.citaDoctorNew, { color: colors.text }]}>
                  Dr/a. {cita.medico?.usuario?.primer_nombre || cita.medico?.nombre || 'Especialista'}
                </Text>
                <Text style={[styles.citaTypeNew, { color: colors.textSecondary }]}>{cita.tipo_cita || 'Control'}</Text>
                <View style={styles.citaTimeRowNew}>
                  <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.citaTimeNew, { color: colors.textSecondary }]}>{cita.hora_inicio || cita.hora_cita || '00:00'}</Text>
                </View>
              </View>
              <View style={[styles.statusPill, { backgroundColor: getStatusColor(cita.estado_cita || cita.estado) + '15' }]}>
                <Text style={[styles.statusPillText, { color: getStatusColor(cita.estado_cita || cita.estado) }]}>
                  {cita.estado_cita || cita.estado || 'PROGRAMADA'}
                </Text>
              </View>
            </View>
          ))
        )}
        
        {upcomingCitas.length > 0 && (
          <TouchableOpacity 
            style={[styles.viewMoreBtn, { backgroundColor: colors.isDark ? 'rgba(255,105,180,0.15)' : '#fff3f9', borderColor: colors.isDark ? 'rgba(255,105,180,0.3)' : '#FFB6D9' }]}
            onPress={() => navigation.navigate('Citas')}
          >
            <Text style={styles.viewMoreText}>Ver todas las citas ({upcomingCitas.length})</Text>
            <Ionicons name="chevron-forward" size={18} color="#FF69B4" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf6fb',
  },
  welcomeSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  welcomeGradient: {
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 240,
    justifyContent: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  decorCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -50,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    left: -30,
  },
  decorLine: {
    position: 'absolute',
    width: 2,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    bottom: 50,
    right: 25,
  },
  welcomeInner: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  emojiBox: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  welcomeEmoji: {
    fontSize: 44,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    width: 50,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
    marginVertical: 12,
  },
  subtitleText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#f0e0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fdf6fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#87929d',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValueSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    height: 130,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardBlue: {
    shadowColor: '#00BFFF',
  },
  cardPink: {
    shadowColor: '#FF69B4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  cardFooter: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0e0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginTop: 8,
    textAlign: 'center',
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#FF69B4',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0e0f0',
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff3f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#87929d',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyText: {
    color: '#87929d',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  bookBtn: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookBtnGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  citaItemNew: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0e0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  citaTimeBox: {
    backgroundColor: '#fff3f9',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 50,
  },
  citaDay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF69B4',
  },
  citaMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF69B4',
    marginTop: 2,
  },
  citaDetailsNew: {
    flex: 1,
  },
  citaDoctorNew: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 3,
  },
  citaTypeNew: {
    fontSize: 12,
    color: '#87929d',
    marginBottom: 4,
    fontWeight: '500',
  },
  citaTimeRowNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  citaTimeNew: {
    fontSize: 11,
    color: '#87929d',
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  viewMoreBtn: {
    backgroundColor: '#fff3f9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFB6D9',
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF69B4',
  },
  citaItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  citaInfo: {
    flex: 1,
    marginRight: 10,
  },
  citaDoctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  citaDoctor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  citaType: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 6,
  },
  citaTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  citaTime: {
    fontSize: 11,
    color: '#87929d',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
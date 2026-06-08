import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Animated,
  Image,
} from 'react-native';
import { contenidoEducativoService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from '../components/CustomModal';
import { useTheme } from '../context/ThemeContext';

export default function EducacionScreen() {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contenidos, setContenidos] = useState([]);
  const [activeFiltro, setActiveFiltro] = useState('todos');
  const [selectedItem, setSelectedItem] = useState(null);

  const typesConfig = useMemo(() => ({
    Video:     { label: 'Video',      icon: 'videocam',       color: '#00BFFF', bg: isDark ? 'rgba(0,191,255,0.18)'    : 'rgba(0,191,255,0.10)'    },
    Documento: { label: 'Documento',  icon: 'document-text',  color: '#764ba2', bg: isDark ? 'rgba(118,75,162,0.18)'   : 'rgba(118,75,162,0.10)'   },
    Infografia:{ label: 'Infografía', icon: 'image',          color: '#FF69B4', bg: isDark ? 'rgba(255,105,180,0.18)'  : 'rgba(255,105,180,0.10)'  },
  }), [isDark]);

  // Fade animation for list
  const listFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchContenidos();
  }, []);

  const startAnimation = () => {
    listFade.setValue(0);
    Animated.timing(listFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  const fetchContenidos = async () => {
    try {
      const response = await contenidoEducativoService.getAll();
      const data = response.data?.contenidos || response.data || [];
      const activos = (Array.isArray(data) ? data : []).filter(
        c => (c.estado || 'PUBLICADO') !== 'ARCHIVADO'
      );
      setContenidos(activos);
    } catch (error) {
      console.error('Error fetching educational contents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      startAnimation();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchContenidos();
  };

  const normalizarTipo = (tipo) => {
    const t = String(tipo || 'Documento').toLowerCase();
    if (t.includes('video')) return 'Video';
    if (t.includes('infograf')) return 'Infografia';
    return 'Documento';
  };

  const getEnlaceContenido = (item) => {
    if (!item) return '';
    if (item.enlace_url) return item.enlace_url;
    const tipo = normalizarTipo(item.tipo_contenido);
    if (tipo === 'Video') return item.url_video || '';
    if (tipo === 'Infografia') return item.imagen_portada_url || item.archivo_url || '';
    return item.archivo_url || item.url_video || '';
  };

  const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url || '');
  const isDocumentUrl = (url) => /\.(pdf|docx?|pptx?|xlsx?|xls|txt)(\?|$)/i.test(url || '');

  const handleOpenLink = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const filteredContenidos = useMemo(() => {
    if (activeFiltro === 'todos') return contenidos;
    return contenidos.filter(c => normalizarTipo(c.tipo_contenido) === activeFiltro);
  }, [contenidos, activeFiltro]);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ─── Filter button helper ────────────────────────────────────────────────────
  const filterInactiveStyle = { backgroundColor: colors.inputBg, borderColor: colors.border };
  const filterInactiveTextColor = colors.textSecondary;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Decorations */}
      <View style={[styles.bgCircle1, { backgroundColor: isDark ? 'rgba(255,105,180,0.06)' : 'rgba(255,105,180,0.08)' }]} />
      <View style={[styles.bgCircle2, { backgroundColor: isDark ? 'rgba(0,191,255,0.04)' : 'rgba(0,191,255,0.06)' }]} />
      <View style={[styles.bgCircle3, { backgroundColor: isDark ? 'rgba(255,105,180,0.03)' : 'rgba(255,105,180,0.05)' }]} />

      {/* ── Filter Bar ── */}
      <View style={[styles.filterOuterContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContainer}
        >
          {/* Todos */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeFiltro === 'todos' ? styles.filterBtnActivePink : filterInactiveStyle,
            ]}
            onPress={() => { setActiveFiltro('todos'); startAnimation(); }}
          >
            <Ionicons name="book-open" size={16} color={activeFiltro === 'todos' ? '#fff' : filterInactiveTextColor} />
            <Text style={[styles.filterText, { color: activeFiltro === 'todos' ? '#fff' : filterInactiveTextColor }]}>
              Todos
            </Text>
          </TouchableOpacity>

          {/* Videos */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeFiltro === 'Video' ? styles.filterBtnActiveBlue : filterInactiveStyle,
            ]}
            onPress={() => { setActiveFiltro('Video'); startAnimation(); }}
          >
            <Ionicons name="videocam" size={16} color={activeFiltro === 'Video' ? '#fff' : filterInactiveTextColor} />
            <Text style={[styles.filterText, { color: activeFiltro === 'Video' ? '#fff' : filterInactiveTextColor }]}>
              Videos
            </Text>
          </TouchableOpacity>

          {/* Documentos */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeFiltro === 'Documento' ? styles.filterBtnActivePurple : filterInactiveStyle,
            ]}
            onPress={() => { setActiveFiltro('Documento'); startAnimation(); }}
          >
            <Ionicons name="document-text" size={16} color={activeFiltro === 'Documento' ? '#fff' : filterInactiveTextColor} />
            <Text style={[styles.filterText, { color: activeFiltro === 'Documento' ? '#fff' : filterInactiveTextColor }]}>
              Documentos
            </Text>
          </TouchableOpacity>

          {/* Infografías */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeFiltro === 'Infografia' ? styles.filterBtnActivePink : filterInactiveStyle,
            ]}
            onPress={() => { setActiveFiltro('Infografia'); startAnimation(); }}
          >
            <Ionicons name="image" size={16} color={activeFiltro === 'Infografia' ? '#fff' : filterInactiveTextColor} />
            <Text style={[styles.filterText, { color: activeFiltro === 'Infografia' ? '#fff' : filterInactiveTextColor }]}>
              Infografías
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Content List ── */}
      <Animated.View style={{ flex: 1, opacity: listFade }}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {filteredContenidos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay materiales disponibles en esta categoría.
              </Text>
            </View>
          ) : (
            filteredContenidos.map(item => {
              const tipo = normalizarTipo(item.tipo_contenido);
              const config = typesConfig[tipo] || typesConfig.Documento;

              return (
                <TouchableOpacity
                  key={item.id_contenido || item.id}
                  style={[styles.card, {
                    backgroundColor: colors.card,
                    borderColor: colors.borderLight,
                    shadowColor: isDark ? '#000' : '#000',
                  }]}
                  onPress={() => setSelectedItem(item)}
                  activeOpacity={0.85}
                >
                  {/* Card Header */}
                  <View style={[styles.cardHeader, { backgroundColor: config.bg }]}>
                    <View style={styles.typeBadge}>
                      <Ionicons name={config.icon} size={14} color={config.color} />
                      <Text style={[styles.typeText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                    <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
                  </View>

                  {/* Card Body */}
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {item.titulo}
                    </Text>
                    {item.descripcion && (
                      <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                        {item.descripcion}
                      </Text>
                    )}
                  </View>

                  {/* Card Footer */}
                  <View style={[styles.cardFooter, {
                    borderTopColor: colors.borderLight,
                    backgroundColor: isDark ? colors.surfaceElevated : '#fafbfc',
                  }]}>
                    <Text style={[styles.readMore, { color: colors.primary }]}>Leer más</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </Animated.View>

      {/* ── Detail Modal ── */}
      <CustomModal
        visible={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title="Detalle del Artículo"
        icon="book-outline"
        iconColor={colors.primary}
        scrollable={true}
      >
        {selectedItem && (() => {
          const tipo = normalizarTipo(selectedItem.tipo_contenido);
          const config = typesConfig[tipo] || typesConfig.Documento;
          const url = getEnlaceContenido(selectedItem);

          return (
            <>
              {/* Type Badge */}
              <View style={[styles.modalBadge, { backgroundColor: config.bg }]}>
                <Ionicons name={config.icon} size={14} color={config.color} style={{ marginRight: 4 }} />
                <Text style={[styles.modalBadgeText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>

              {/* Title */}
              <Text style={[styles.modalArticleTitle, { color: colors.text }]}>
                {selectedItem.titulo}
              </Text>

              {/* Divider */}
              <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

              {/* Description */}
              {selectedItem.descripcion && (
                <Text style={[styles.modalArticleDesc, { color: colors.textSecondary }]}>
                  {selectedItem.descripcion}
                </Text>
              )}

              {url && (tipo === 'Infografia' || (tipo === 'Documento' && isImageUrl(url))) && (
                <Image
                  source={{ uri: url }}
                  style={styles.modalPreviewImage}
                  resizeMode="contain"
                />
              )}

              {url ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: config.color }]}
                  onPress={() => handleOpenLink(url)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={tipo === 'Video' ? 'logo-youtube' : 'open-outline'}
                    size={20}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.actionBtnText}>
                    {tipo === 'Video'
                      ? 'Ver video en Youtube'
                      : tipo === 'Infografia'
                      ? 'Ver infografía'
                      : isDocumentUrl(url)
                      ? 'Abrir documento'
                      : 'Abrir recurso educativo'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.noLinkContainer, { backgroundColor: colors.inputBg, borderRadius: 10, padding: 10 }]}> 
                  <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                  <Text style={[styles.noLinkText, { color: colors.textSecondary }]}> 
                    No hay recursos externos para este artículo.
                  </Text>
                </View>
              )}

              {/* Close Button */}
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                onPress={() => setSelectedItem(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>
                  Volver al blog
                </Text>
              </TouchableOpacity>
            </>
          );
        })()}
      </CustomModal>
    </View>
  );
}

// ─── Base Styles (non-color values only) ─────────────────────────────────────
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
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 100,
    left: -60,
    zIndex: 0,
  },
  bgCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: 40,
    right: 20,
    zIndex: 0,
  },
  modalPreviewImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginTop: 18,
    marginBottom: 16,
    backgroundColor: '#f2f2f2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterOuterContainer: {
    borderBottomWidth: 1,
  },
  filterScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterBtnActivePink: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF69B4',
  },
  filterBtnActiveBlue: {
    backgroundColor: '#00BFFF',
    borderColor: '#00BFFF',
  },
  filterBtnActivePurple: {
    backgroundColor: '#764ba2',
    borderColor: '#764ba2',
  },
  filterText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    padding: 14,
  },
  readMore: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalArticleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalDivider: {
    height: 1,
    marginBottom: 16,
  },
  modalArticleDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noLinkText: {
    fontSize: 12,
  },
  closeBtn: {
    borderWidth: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
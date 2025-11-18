import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '../config/firebase';

export default function DashboardScreen({ navigation }) {
  const currentUser = auth.currentUser;
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Hola, {userName}</Text>
        </View>
        <MaterialIcons name="insights" size={32} color="#4285F4" />
      </View>

      <View style={styles.content}>
        {/* Estadísticas Generales */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="event" size={28} color="#4285F4" />
              </View>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Eventos Asistidos</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="create" size={28} color="#34A853" />
              </View>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Eventos Creados</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="comment" size={28} color="#FBBC04" />
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Comentarios</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="star" size={28} color="#FFC107" />
              </View>
              <Text style={styles.statNumber}>4.7</Text>
              <Text style={styles.statLabel}>Calificación Prom.</Text>
            </View>
          </View>
        </View>

        {/* Gráfica de Participación */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="show-chart" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Participación Mensual</Text>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              <View style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: '60%', backgroundColor: '#4285F4' }]} />
                <Text style={styles.chartLabel}>Ene</Text>
              </View>
              <View style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: '45%', backgroundColor: '#4285F4' }]} />
                <Text style={styles.chartLabel}>Feb</Text>
              </View>
              <View style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: '80%', backgroundColor: '#4285F4' }]} />
                <Text style={styles.chartLabel}>Mar</Text>
              </View>
              <View style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: '70%', backgroundColor: '#4285F4' }]} />
                <Text style={styles.chartLabel}>Abr</Text>
              </View>
              <View style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: '90%', backgroundColor: '#34A853' }]} />
                <Text style={styles.chartLabel}>May</Text>
              </View>
              <View style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: '65%', backgroundColor: '#4285F4' }]} />
                <Text style={styles.chartLabel}>Jun</Text>
              </View>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#34A853' }]} />
                <Text style={styles.legendText}>Mes Actual</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4285F4' }]} />
                <Text style={styles.legendText}>Meses Anteriores</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categorías Favoritas */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-offer" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Categorías Favoritas</Text>
          </View>
          
          <View style={styles.categoriesList}>
            <View style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <MaterialIcons name="sports-soccer" size={24} color="#4285F4" />
                <Text style={styles.categoryName}>Deportes</Text>
              </View>
              <View style={styles.categoryBar}>
                <View style={[styles.categoryProgress, { width: '75%' }]} />
              </View>
              <Text style={styles.categoryCount}>6 eventos</Text>
            </View>

            <View style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <MaterialIcons name="palette" size={24} color="#EA4335" />
                <Text style={styles.categoryName}>Cultura</Text>
              </View>
              <View style={styles.categoryBar}>
                <View style={[styles.categoryProgress, { width: '50%' }]} />
              </View>
              <Text style={styles.categoryCount}>4 eventos</Text>
            </View>

            <View style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <MaterialIcons name="computer" size={24} color="#34A853" />
                <Text style={styles.categoryName}>Tecnología</Text>
              </View>
              <View style={styles.categoryBar}>
                <View style={[styles.categoryProgress, { width: '35%' }]} />
              </View>
              <Text style={styles.categoryCount}>3 eventos</Text>
            </View>
          </View>
        </View>

        {/* Historial de Eventos Pasados */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="history" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Historial de Eventos</Text>
          </View>

          <View style={styles.historyList}>
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyIconContainer}>
                  <MaterialIcons name="event" size={24} color="#4285F4" />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>Torneo de Fútbol 2024</Text>
                  <Text style={styles.historyDate}>15 de octubre, 2024</Text>
                </View>
                <View style={styles.historyBadge}>
                  <MaterialIcons name="check-circle" size={16} color="#34A853" />
                  <Text style={styles.historyBadgeText}>Asistido</Text>
                </View>
              </View>
              <View style={styles.historyStats}>
                <View style={styles.historyStatItem}>
                  <MaterialIcons name="people" size={14} color="#666" />
                  <Text style={styles.historyStatText}>45 personas</Text>
                </View>
                <View style={styles.historyStatItem}>
                  <MaterialIcons name="star" size={14} color="#FFC107" />
                  <Text style={styles.historyStatText}>5.0</Text>
                </View>
              </View>
            </View>

            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyIconContainer}>
                  <MaterialIcons name="event" size={24} color="#4285F4" />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>Concierto de Jazz</Text>
                  <Text style={styles.historyDate}>22 de septiembre, 2024</Text>
                </View>
                <View style={styles.historyBadge}>
                  <MaterialIcons name="check-circle" size={16} color="#34A853" />
                  <Text style={styles.historyBadgeText}>Asistido</Text>
                </View>
              </View>
              <View style={styles.historyStats}>
                <View style={styles.historyStatItem}>
                  <MaterialIcons name="people" size={14} color="#666" />
                  <Text style={styles.historyStatText}>120 personas</Text>
                </View>
                <View style={styles.historyStatItem}>
                  <MaterialIcons name="star" size={14} color="#FFC107" />
                  <Text style={styles.historyStatText}>4.8</Text>
                </View>
              </View>
            </View>

            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyIconContainer}>
                  <MaterialIcons name="create" size={24} color="#34A853" />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>Workshop de Desarrollo Web</Text>
                  <Text style={styles.historyDate}>10 de agosto, 2024</Text>
                </View>
                <View style={[styles.historyBadge, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialIcons name="create" size={16} color="#34A853" />
                  <Text style={[styles.historyBadgeText, { color: '#34A853' }]}>Organizado</Text>
                </View>
              </View>
              <View style={styles.historyStats}>
                <View style={styles.historyStatItem}>
                  <MaterialIcons name="people" size={14} color="#666" />
                  <Text style={styles.historyStatText}>30 personas</Text>
                </View>
                <View style={styles.historyStatItem}>
                  <MaterialIcons name="star" size={14} color="#FFC107" />
                  <Text style={styles.historyStatText}>4.6</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>Ver todos los eventos</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#4285F4" />
          </TouchableOpacity>
        </View>

        {/* Actividad Reciente */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="notifications-active" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          </View>

          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#E3F2FD' }]}>
                <MaterialIcons name="comment" size={18} color="#4285F4" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  Dejaste un comentario en <Text style={styles.activityBold}>Torneo de Fútbol</Text>
                </Text>
                <Text style={styles.activityTime}>Hace 2 días</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#FFF3E0' }]}>
                <MaterialIcons name="star" size={18} color="#FFC107" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  Calificaste <Text style={styles.activityBold}>Concierto de Jazz</Text> con 5 estrellas
                </Text>
                <Text style={styles.activityTime}>Hace 1 semana</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#E8F5E9' }]}>
                <MaterialIcons name="event-available" size={18} color="#34A853" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  Te registraste en <Text style={styles.activityBold}>Expo Tecnología 2024</Text>
                </Text>
                <Text style={styles.activityTime}>Hace 2 semanas</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 16,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartContainer: {
    marginTop: 12,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  chartBar: {
    width: 24,
    backgroundColor: '#4285F4',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 11,
    color: '#666',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  categoriesSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  categoriesList: {
    gap: 16,
  },
  categoryItem: {
    gap: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  categoryBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
  },
  historySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34A853',
  },
  historyStats: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 52,
  },
  historyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyStatText: {
    fontSize: 12,
    color: '#666',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    padding: 10,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '600',
  },
  activitySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  activityBold: {
    fontWeight: '600',
    color: '#333',
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
  },
});

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../config/firebase";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// =========================================
// DASHBOARD PRINCIPAL — LÓGICA CON FIRESTORE
// =========================================
export default function DashboardScreen({ navigation }) {
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Usuario";

  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState([]);

  const [personalStats, setPersonalStats] = useState({
    attended: 0,
    created: 0,
    comments: 0,
    avgRating: 0,
  });

  const [globalStats, setGlobalStats] = useState({
    totalEvents: 0,
    totalComments: 0,
    avgRating: 0,
  });

  const [history, setHistory] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    values: [],
  });

  // =========================================
  // 1) ESCUCHAR EVENTOS EN TIEMPO REAL
  // =========================================
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = collection(db, "events");
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Ordenar por fecha desc (like EventsScreen)
        eventsData.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        setAllEvents(eventsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error cargando eventos Dashboard:", error);
        setAllEvents([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  // =========================================
  // 2) DERIVAR ESTADÍSTICAS CUANDO CAMBIA allEvents
  // =========================================
  useEffect(() => {
    if (!uid) return;

    const createdEvents = allEvents.filter(
      (e) => (e.organizerId || e.creatorId) === uid
    );

    const attendedEvents = allEvents.filter((e) =>
      (e.participants || []).some((p) => p.userId === uid)
    );

    // --------------------------
    // COMENTARIOS Y RATINGS
    // --------------------------
    let totalUserComments = 0;
    let userRatings = [];

    let totalCommentsGlobal = 0;
    let globalRatings = [];

    allEvents.forEach((ev) => {
      const commentsArr = Array.isArray(ev.comments) ? ev.comments : [];

      commentsArr.forEach((c) => {
        totalCommentsGlobal++;
        if (typeof c.rating === "number") globalRatings.push(c.rating);

        if (c.userId === uid) {
          totalUserComments++;
          if (typeof c.rating === "number") userRatings.push(c.rating);
        }
      });
    });

    const avgUserRating =
      userRatings.length > 0
        ? (
            userRatings.reduce((sum, r) => sum + r, 0) /
            userRatings.length
          ).toFixed(1)
        : 0;

    const avgGlobalRating =
      globalRatings.length > 0
        ? (
            globalRatings.reduce((sum, r) => sum + r, 0) /
            globalRatings.length
          ).toFixed(1)
        : 0;

    // --------------------------
    // HISTORIAL DE PASADOS
    // --------------------------
    const now = new Date();
    const past = [];

    [...createdEvents, ...attendedEvents].forEach((e) => {
      if (!e?.date) return;

      const time = e.time || "00:00";
      const eventDate = new Date(`${e.date}T${time}`);

      if (eventDate < now) past.push(e);
    });

    past.sort(
      (a, b) =>
        new Date(`${b.date}T${b.time || "00:00"}`) -
        new Date(`${a.date}T${a.time || "00:00"}`)
    );

    // --------------------------
    // ACTIVIDAD RECIENTE
    // --------------------------
    const recent = [];

    createdEvents.forEach((e) => {
      recent.push({
        type: "created",
        title: e.title,
        date: e.date,
        time: e.time || "00:00",
      });
    });

    attendedEvents.forEach((e) => {
      recent.push({
        type: "attended",
        title: e.title,
        date: e.date,
        time: e.time || "00:00",
      });
    });

    allEvents.forEach((ev) => {
      const commentsArr = Array.isArray(ev.comments) ? ev.comments : [];
      commentsArr.forEach((c) => {
        if (c.userId === uid) {
          recent.push({
            type: "comment",
            title: ev.title,
            date: c.createdAt
              ? dayjs(c.createdAt).format("YYYY-MM-DD")
              : ev.date,
            time: ev.time || "00:00",
            rating: c.rating,
          });
        }
      });
    });

    recent.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());

    // --------------------------
    // PARTICIPACIÓN ÚLTIMOS 6 MESES
    // --------------------------
    const labels = [];
    const values = [];

    for (let i = 5; i >= 0; i--) {
      const m = dayjs().subtract(i, "month");
      labels.push(m.format("MMM")); // ej: "nov", "dic"
      values.push(0);
    }

    attendedEvents.forEach((e) => {
      if (!e?.date) return;
      const mEvent = dayjs(e.date);
      const diff = dayjs().startOf("month").diff(mEvent.startOf("month"), "month");
      // diff 0 = mes actual, 5 = hace 5 meses
      if (diff >= 0 && diff <= 5) {
        const index = 5 - diff;
        values[index] += 1;
      }
    });

    // --------------------------
    // SET FINAL
    // --------------------------
    setPersonalStats({
      attended: attendedEvents.length,
      created: createdEvents.length,
      comments: totalUserComments,
      avgRating: avgUserRating,
    });

    setGlobalStats({
      totalEvents: allEvents.length,
      totalComments: totalCommentsGlobal,
      avgRating: avgGlobalRating,
    });

    setHistory(past);
    setRecentActivity(recent);
    setMonthlyData({ labels, values });
  }, [allEvents, uid]);

  // =========================================
  // UI: CARGA
  // =========================================
  if (loading) {
    return (
      <View style={{ padding: 30 }}>
        <Text style={{ fontSize: 18 }}>Cargando Dashboard...</Text>
      </View>
    );
  }

  // =========================================
  // UI FINAL (MISMO DISEÑO)
  // =========================================
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
              <Text style={styles.statNumber}>
                {personalStats.attended}
              </Text>
              <Text style={styles.statLabel}>Eventos Asistidos</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="create" size={28} color="#34A853" />
              </View>
              <Text style={styles.statNumber}>
                {personalStats.created}
              </Text>
              <Text style={styles.statLabel}>Eventos Creados</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="comment" size={28} color="#FBBC04" />
              </View>
              <Text style={styles.statNumber}>
                {personalStats.comments}
              </Text>
              <Text style={styles.statLabel}>Comentarios</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="star" size={28} color="#FFC107" />
              </View>
              <Text style={styles.statNumber}>
                {personalStats.avgRating}
              </Text>
              <Text style={styles.statLabel}>Calificación Prom.</Text>
            </View>
          </View>
        </View>

        {/* Gráfica participación mensual */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="show-chart" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Participación Mensual</Text>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {monthlyData.values.map((value, index) => (
                <View key={index} style={styles.chartBarWrapper}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: `${Math.min(value * 20, 100)}%`,
                        backgroundColor:
                          index === monthlyData.values.length - 1
                            ? "#34A853"
                            : "#4285F4",
                      },
                    ]}
                  />
                  <Text style={styles.chartLabel}>
                    {monthlyData.labels[index]}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: "#34A853" },
                  ]}
                />
                <Text style={styles.legendText}>Mes Actual</Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: "#4285F4" },
                  ]}
                />
                <Text style={styles.legendText}>Meses Anteriores</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categorías Favoritas (mantengo tu diseño fijo) */}
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
                <View style={[styles.categoryProgress, { width: "75%" }]} />
              </View>
              <Text style={styles.categoryCount}>6 eventos</Text>
            </View>

            <View style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <MaterialIcons name="palette" size={24} color="#EA4335" />
                <Text style={styles.categoryName}>Cultura</Text>
              </View>
              <View style={styles.categoryBar}>
                <View style={[styles.categoryProgress, { width: "50%" }]} />
              </View>
              <Text style={styles.categoryCount}>4 eventos</Text>
            </View>

            <View style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <MaterialIcons name="computer" size={24} color="#34A853" />
                <Text style={styles.categoryName}>Tecnología</Text>
              </View>
              <View style={styles.categoryBar}>
                <View style={[styles.categoryProgress, { width: "35%" }]} />
              </View>
              <Text style={styles.categoryCount}>3 eventos</Text>
            </View>
          </View>
        </View>

        {/* Historial */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="history" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Historial de Eventos</Text>
          </View>

          <View style={styles.historyList}>
            {history.length === 0 ? (
              <Text style={{ color: "#666" }}>No hay eventos pasados.</Text>
            ) : (
              history.map((e, index) => (
                <View key={index} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyIconContainer}>
                      <MaterialIcons
                        name={(e.organizerId || e.creatorId) === uid ? "create" : "event"}
                        size={24}
                        color={(e.organizerId || e.creatorId) === uid ? "#34A853" : "#4285F4"}
                      />
                    </View>

                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle}>{e.title}</Text>
                      <Text style={styles.historyDate}>
                        {dayjs(e.date).format("DD MMMM, YYYY")}
                      </Text>
                    </View>

                    <View style={styles.historyBadge}>
                      <MaterialIcons
                        name={(e.organizerId || e.creatorId) === uid ? "create" : "check-circle"}
                        size={16}
                        color="#34A853"
                      />
                      <Text style={styles.historyBadgeText}>
                        {(e.organizerId || e.creatorId) === uid ? "Organizado" : "Asistido"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.historyStats}>
                    <View style={styles.historyStatItem}>
                      <MaterialIcons name="people" size={14} color="#666" />
                      <Text style={styles.historyStatText}>
                        {(e.participants?.length ?? 0)} personas
                      </Text>
                    </View>

                    <View style={styles.historyStatItem}>
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                      <Text style={styles.historyStatText}>
                        {(() => {
                          const ratings = (e.comments || [])
                            .map(c => c.rating)
                            .filter(r => typeof r === "number");
                          if (ratings.length === 0) return "N/A";
                          const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
                          return avg.toFixed(1);
                        })()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate("Events")}
          >
            <Text style={styles.viewMoreText}>Ver todos los eventos</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#4285F4" />
          </TouchableOpacity>
        </View>

        {/* Actividad reciente */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="notifications-active" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          </View>

          <View style={styles.activityList}>
            {recentActivity.length === 0 ? (
              <Text style={{ color: "#666" }}>Sin actividad reciente.</Text>
            ) : (
              recentActivity.slice(0, 5).map((a, index) => (
                <View key={index} style={styles.activityItem}>
                  <View
                    style={[
                      styles.activityIcon,
                      {
                        backgroundColor:
                          a.type === "comment"
                            ? "#E3F2FD"
                            : a.type === "attended"
                            ? "#E8F5E9"
                            : "#FFF3E0",
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={
                        a.type === "comment"
                          ? "comment"
                          : a.type === "attended"
                          ? "event-available"
                          : "create"
                      }
                      size={18}
                      color={
                        a.type === "comment"
                          ? "#4285F4"
                          : a.type === "attended"
                          ? "#34A853"
                          : "#FB8C00"
                      }
                    />
                  </View>

                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      {a.type === "comment" && (
                        <>
                          Dejaste un comentario en{" "}
                          <Text style={styles.activityBold}>{a.title}</Text>
                        </>
                      )}
                      {a.type === "attended" && (
                        <>
                          Asististe a{" "}
                          <Text style={styles.activityBold}>{a.title}</Text>
                        </>
                      )}
                      {a.type === "created" && (
                        <>
                          Creaste el evento{" "}
                          <Text style={styles.activityBold}>{a.title}</Text>
                        </>
                      )}
                    </Text>

                    <Text style={styles.activityTime}>
                      {a.date ? dayjs(a.date).fromNow() : ""}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ================== ESTILOS (idénticos a tu archivo) ==================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "#666" },
  content: {
    padding: 16,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  statsSection: { marginBottom: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 140,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#666", textAlign: "center" },
  chartSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartContainer: { marginTop: 12 },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 180,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  chartBar: { width: 24, backgroundColor: "#4285F4", borderRadius: 4, marginBottom: 8 },
  chartLabel: { fontSize: 11, color: "#666" },
  chartLegend: { flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendColor: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontSize: 12, color: "#666" },
  categoriesSection: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 20 },
  categoriesList: { gap: 16 },
  categoryItem: { gap: 8 },
  categoryInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  categoryName: { fontSize: 14, fontWeight: "600", color: "#333", flex: 1 },
  categoryBar: { height: 8, backgroundColor: "#f0f0f0", borderRadius: 4, overflow: "hidden" },
  categoryProgress: { height: "100%", backgroundColor: "#4285F4", borderRadius: 4 },
  categoryCount: { fontSize: 12, color: "#666", alignSelf: "flex-end" },
  historySection: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 20 },
  historyList: { gap: 12 },
  historyCard: { backgroundColor: "#f9f9f9", borderRadius: 8, padding: 12 },
  historyHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  historyIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center" },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 2 },
  historyDate: { fontSize: 12, color: "#666" },
  historyBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#E8F5E9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  historyBadgeText: { fontSize: 11, fontWeight: "600", color: "#34A853" },
  historyStats: { flexDirection: "row", gap: 16, marginLeft: 52 },
  historyStatItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  historyStatText: { fontSize: 12, color: "#666" },
  viewMoreButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, padding: 10 },
  viewMoreText: { fontSize: 14, color: "#4285F4", fontWeight: "600" },
  activitySection: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 20 },
  activityList: { gap: 12 },
  activityItem: { flexDirection: "row", gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  activityIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  activityContent: { flex: 1 },
  activityText: { fontSize: 13, color: "#666", lineHeight: 18, marginBottom: 4 },
  activityBold: { fontWeight: "600", color: "#333" },
  activityTime: { fontSize: 11, color: "#999" },
});
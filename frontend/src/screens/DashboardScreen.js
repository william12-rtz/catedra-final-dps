import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

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

  // ⭐ NUEVO: categorías dinámicas
  const [categoryStats, setCategoryStats] = useState({});

  // ======================================================
  // 1) Cargar eventos en tiempo real desde Firestore
  // ======================================================
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

        eventsData.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        setAllEvents(eventsData);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [uid]);

  // ======================================================
  // 2) Procesar estadísticas
  // ======================================================
  useEffect(() => {
    if (!uid) return;

    const createdEvents = allEvents.filter(
      (e) => (e.organizerId || e.creatorId) === uid
    );

    const attendedEvents = allEvents.filter((e) =>
      (e.participants || []).some((p) => p.userId === uid)
    );

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
        ? (userRatings.reduce((s, r) => s + r, 0) / userRatings.length).toFixed(1)
        : 0;

    const avgGlobalRating =
      globalRatings.length > 0
        ? (globalRatings.reduce((s, r) => s + r, 0) / globalRatings.length).toFixed(1)
        : 0;

    // ---------------- HISTORIAL ----------------
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

    // ---------------- ACTIVIDAD RECIENTE ----------------
    const recent = [];

    createdEvents.forEach((e) =>
      recent.push({ type: "created", title: e.title, date: e.date })
    );

    attendedEvents.forEach((e) =>
      recent.push({ type: "attended", title: e.title, date: e.date })
    );

    allEvents.forEach((ev) => {
      const commentsArr = ev.comments || [];
      commentsArr.forEach((c) => {
        if (c.userId === uid) {
          recent.push({
            type: "comment",
            title: ev.title,
            date: c.createdAt ? dayjs(c.createdAt).format("YYYY-MM-DD") : ev.date,
          });
        }
      });
    });

    recent.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());

    // ---------------- PARTICIPACIÓN MENSUAL ----------------
    const labels = [];
    const values = [];

    for (let i = 5; i >= 0; i--) {
      const m = dayjs().subtract(i, "month");
      labels.push(m.format("MMM"));
      values.push(0);
    }

    attendedEvents.forEach((e) => {
      if (!e?.date) return;
      const diff = dayjs().startOf("month").diff(dayjs(e.date).startOf("month"), "month");
      if (diff >= 0 && diff <= 5) {
        const index = 5 - diff;
        values[index] += 1;
      }
    });

    // ---------------- CATEGORÍAS DINÁMICAS ----------------
    const categoryTotals = {};
    allEvents.forEach((ev) => {
      const cat = ev.category || "general";
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += 1;
    });

    setCategoryStats(categoryTotals);

    // ---------------- SET DE ESTADOS ----------------
    setPersonalStats({
      attended: attendedEvents.length,
      created: createdEvents.length,
      comments: totalUserComments,
      avgRating: avgUserRating,
    });

    setGlobalStats({
      totalEvents: allEvents.length, // ⭐ TODOS LOS EVENTOS CREADOS
      totalComments: totalCommentsGlobal,
      avgRating: avgGlobalRating,
    });

    setHistory(past);
    setRecentActivity(recent);
    setMonthlyData({ labels, values });
  }, [allEvents, uid]);

  // ======================================================
  // CARGA
  // ======================================================
  if (loading) {
    return (
      <View style={{ padding: 30 }}>
        <Text>Cargando Dashboard...</Text>
      </View>
    );
  }

  // ======================================================
  // UI COMPLETA
  // ======================================================
  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Hola, {userName}</Text>
        </View>
        <MaterialIcons name="insights" size={32} color="#4285F4" />
      </View>

      <View style={styles.content}>
        {/* ======================================================
              ESTADÍSTICAS GENERALES
        ======================================================= */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas Generales</Text>

          <View style={styles.statsGrid}>
            {/* ASISTIDOS */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="event" size={28} color="#4285F4" />
              </View>
              <Text style={styles.statNumber}>{personalStats.attended}</Text>
              <Text style={styles.statLabel}>Eventos Asistidos</Text>
            </View>

            {/* CREADOS (GLOBAL) */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="create" size={28} color="#34A853" />
              </View>
              <Text style={styles.statNumber}>{globalStats.totalEvents}</Text>
              <Text style={styles.statLabel}>Eventos Creados (Todos)</Text>
            </View>

            {/* COMENTARIOS */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="comment" size={28} color="#FBBC04" />
              </View>
              <Text style={styles.statNumber}>{personalStats.comments}</Text>
              <Text style={styles.statLabel}>Comentarios</Text>
            </View>

            {/* RATING */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="star" size={28} color="#FFC107" />
              </View>
              <Text style={styles.statNumber}>{personalStats.avgRating}</Text>
              <Text style={styles.statLabel}>Calificación Prom.</Text>
            </View>
          </View>
        </View>

        {/* ======================================================
              CATEGORÍAS FAVORITAS (DINÁMICAS)
        ======================================================= */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-offer" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Categorías Favoritas</Text>
          </View>

          <View style={styles.categoriesList}>
            {Object.keys(categoryStats).length === 0 ? (
              <Text style={{ color: "#666" }}>No hay eventos con categorías.</Text>
            ) : (
              Object.entries(categoryStats).map(([cat, count], idx) => (
                <View key={idx} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <MaterialIcons
                      name={
                        cat.toLowerCase() === "deportes"
                          ? "sports-soccer"
                          : cat.toLowerCase() === "cultura"
                          ? "palette"
                          : cat.toLowerCase() === "tecnología" ||
                            cat.toLowerCase() === "tecnologia"
                          ? "computer"
                          : "category"
                      }
                      size={24}
                      color="#4285F4"
                    />
                    <Text style={styles.categoryName}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </View>

                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryProgress,
                        {
                          width: `${(count / globalStats.totalEvents) * 100}%`,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.categoryCount}>{count} eventos</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* ======================================================
              HISTORIAL
        ======================================================= */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="history" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Historial de Eventos</Text>
          </View>

          <View style={styles.historyList}>
            {history.length === 0 ? (
              <Text style={{ color: "#666" }}>No hay eventos pasados.</Text>
            ) : (
              history.map((e, i) => (
                <View key={i} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyIconContainer}>
                      <MaterialIcons
                        name={
                          (e.organizerId || e.creatorId) === uid ? "create" : "event"
                        }
                        size={24}
                        color={
                          (e.organizerId || e.creatorId) === uid
                            ? "#34A853"
                            : "#4285F4"
                        }
                      />
                    </View>

                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle}>{e.title}</Text>
                      <Text style={styles.historyDate}>
                        {dayjs(e.date).format("DD MMM YYYY")}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
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

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },

  headerSubtitle: { fontSize: 14, color: "#666" },

  content: { padding: 16 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#333" },

  // ---------- STATS ----------
  statsSection: { marginBottom: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eef3ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: { fontSize: 28, fontWeight: "bold", color: "#333" },
  statLabel: { fontSize: 12, color: "#666" },

  // ---------- CATEGORÍAS ----------
  categoriesSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  categoriesList: { gap: 18 },
  categoryItem: { gap: 8 },
  categoryInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  categoryName: { fontSize: 14, fontWeight: "600", color: "#333", flex: 1 },
  categoryBar: {
    height: 8,
    backgroundColor: "#eaeaea",
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryProgress: {
    height: "100%",
    backgroundColor: "#4285F4",
  },
  categoryCount: {
    fontSize: 12,
    color: "#666",
    alignSelf: "flex-end",
  },

  // ---------- HISTORIAL ----------
  historySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  historyList: { gap: 12 },
  historyCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
  },
  historyHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eef3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: "600", color: "#333" },
  historyDate: { fontSize: 12, color: "#666" },

  // ---------- ACTIVIDAD ----------
  activitySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityText: { color: "#333" },
});
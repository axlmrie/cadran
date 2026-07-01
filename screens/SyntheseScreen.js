import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function SyntheseScreen() {
  const [currentDate, setCurrentDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [stats, setStats] = useState({
    net: 0,
    gross: 0,
    tteMinutes: 0,
    amplitudeMinutes: 0,
    daysWorked: 0,
    mealsCount: 0,
    dressingCount: 0,
  });

  useFocusEffect(
    useCallback(() => {
      calculateMonthlyStats(currentDate);
    }, [currentDate]),
  );

  const calculateMonthlyStats = async (dateForMonth) => {
    try {
      const existingData = await AsyncStorage.getItem("@cadran_days");
      if (!existingData) return;

      const allDays = JSON.parse(existingData);
      const targetMonth = dateForMonth.getMonth();
      const targetYear = dateForMonth.getFullYear();

      let monthlyNet = 0;
      let monthlyGross = 0;
      let monthlyTteMin = 0;
      let monthlyAmpMin = 0;
      let worked = 0;
      let meals = 0;
      let dressing = 0;

      allDays.forEach((day) => {
        const dayDate = new Date(day.date);

        if (
          dayDate.getMonth() === targetMonth &&
          dayDate.getFullYear() === targetYear
        ) {
          worked += 1;
          monthlyNet += day.net || 0;
          monthlyGross += day.gross || 0;
          monthlyTteMin += day.tteMinutes || 0;

          if (day.meal) meals += 1;
          if (day.dressing) dressing += 1;

          if (day.amplitude) {
            const parts = day.amplitude.split("h");
            if (parts.length === 2) {
              monthlyAmpMin += parseInt(parts[0]) * 60 + parseInt(parts[1]);
            }
          }
        }
      });

      setStats({
        net: monthlyNet,
        gross: monthlyGross,
        tteMinutes: monthlyTteMin,
        amplitudeMinutes: monthlyAmpMin,
        daysWorked: worked,
        mealsCount: meals,
        dressingCount: dressing,
      });
    } catch (e) {
      console.error("Erreur lors du calcul de la synthèse", e);
    }
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const formatMonthYear = (date) => {
    const month = date.toLocaleDateString("fr-FR", { month: "long" });
    const year = date.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const formatMinutesToHours = (totalMinutes) => {
    if (!totalMinutes || totalMinutes === 0) return "00h00";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (amount) => {
    return `${amount.toFixed(2).replace(".", ",")} €`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={previousMonth}>
          <Ionicons name="chevron-back" size={24} color="#44474C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{formatMonthYear(currentDate)}</Text>

        <TouchableOpacity style={styles.navButton} onPress={nextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#44474C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.salaryCard}>
          <Text style={styles.salaryLabel}>Salaire Net estimé</Text>
          <Text style={styles.netAmount}>{formatCurrency(stats.net)}</Text>
          <Text style={styles.grossAmount}>
            Brut : {formatCurrency(stats.gross)}
          </Text>
        </View>

        <View style={styles.timeCard}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>TTE TOTAL</Text>
            <Text style={styles.timeValue}>
              {formatMinutesToHours(stats.tteMinutes)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>AMPLITUDE TOTALE</Text>
            <Text style={styles.timeValue}>
              {formatMinutesToHours(stats.amplitudeMinutes)}
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={[styles.detailRow, styles.rowBorder]}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#007AFF"
              style={styles.icon}
            />
            <Text style={styles.detailText}>Jours travaillés</Text>
            <Text style={styles.detailValue}>{stats.daysWorked} jours</Text>
          </View>

          <View style={[styles.detailRow, styles.rowBorder]}>
            <Ionicons
              name="restaurant-outline"
              size={22}
              color="#007AFF"
              style={styles.icon}
            />
            <Text style={styles.detailText}>Paniers repas</Text>
            <Text style={styles.detailValue}>{stats.mealsCount}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons
              name="shirt-outline"
              size={22}
              color="#007AFF"
              style={styles.icon}
            />
            <Text style={styles.detailText}>Primes d'habillage</Text>
            <Text style={styles.detailValue}>{stats.dressingCount}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(197, 198, 205, 0.3)",
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B192C",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  salaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  salaryLabel: {
    fontSize: 13,
    color: "#44474C",
    marginBottom: 8,
  },
  netAmount: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#0B192C",
    letterSpacing: -1,
  },
  grossAmount: {
    fontSize: 15,
    color: "#44474C",
    marginTop: 8,
  },
  timeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  timeBlock: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(197, 198, 205, 0.3)",
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#44474C",
    letterSpacing: 1,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 22,
    fontWeight: "500",
    color: "#0B192C",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 16,
    marginLeft: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(197, 198, 205, 0.2)",
  },
  icon: {
    marginRight: 16,
    opacity: 0.8,
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    color: "#0B192C",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0B192C",
  },
});

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  dayNamesShort: ["D", "L", "M", "M", "J", "V", "S"],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = "fr";

export default function CalendrierScreen({ navigation }) {
  const [markedDates, setMarkedDates] = useState({});
  const [rawDaysData, setRawDaysData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      const existingData = await AsyncStorage.getItem("@cadran_days");
      if (existingData) {
        const parsedData = JSON.parse(existingData);
        setRawDaysData(parsedData);

        let marks = {};
        parsedData.forEach((day) => {
          marks[day.date] = {
            marked: true,
            dotColor: "#007AFF",
          };
        });

        if (selectedDate) {
          marks[selectedDate] = {
            ...marks[selectedDate],
            selected: true,
            selectedColor: "#007AFF",
          };
        }

        setMarkedDates(marks);
      }
    } catch (e) {
      console.error("Erreur de chargement du calendrier", e);
    }
  };

  const onDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    const newMarkedDates = { ...markedDates };

    Object.keys(newMarkedDates).forEach((key) => {
      if (newMarkedDates[key].selected) {
        newMarkedDates[key] = {
          marked: newMarkedDates[key].marked,
          dotColor: "#007AFF",
        };
      }
    });

    newMarkedDates[dateString] = {
      ...newMarkedDates[dateString],
      selected: true,
      selectedColor: "#007AFF",
    };

    setMarkedDates(newMarkedDates);

    const dayData = rawDaysData.find((d) => d.date === dateString);
    setSelectedDayInfo(dayData || null);
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatDateFr = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: "long", day: "numeric", month: "long" };
    const str = date.toLocaleDateString("fr-FR", options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          firstDay={1}
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            textSectionTitleColor: "#75777D",
            selectedDayBackgroundColor: "#007AFF",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#007AFF",
            dayTextColor: "#0B192C",
            textDisabledColor: "#DCE3EA",
            dotColor: "#007AFF",
            selectedDotColor: "#ffffff",
            arrowColor: "#007AFF",
            monthTextColor: "#0B192C",
            textDayFontWeight: "400",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "500",
            textDayFontSize: 16,
            textMonthFontSize: 20,
          }}
        />
      </View>

      {selectedDate !== "" && (
        <View style={styles.detailContainer}>
          {selectedDayInfo ? (
            <View>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>
                  {formatDateFr(selectedDate)}
                </Text>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={20} color="#007AFF" />
                  <Text style={styles.timeText}>
                    {formatTime(selectedDayInfo.startTime)} -{" "}
                    {formatTime(selectedDayInfo.endTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.grid}>
                <View style={styles.col}>
                  <Text style={styles.statLabel}>Amplitude</Text>
                  <Text style={styles.statValue}>
                    {selectedDayInfo.amplitude}
                  </Text>

                  <Text style={[styles.statLabel, { marginTop: 12 }]}>TTE</Text>
                  <Text style={styles.statValue}>{selectedDayInfo.tte}</Text>
                </View>

                <View style={[styles.col, styles.borderLeft]}>
                  <Text style={styles.statLabel}>Pause</Text>
                  <Text style={styles.statValue}>
                    {selectedDayInfo.pause} min
                  </Text>

                  <Text style={[styles.statLabel, { marginTop: 12 }]}>
                    Panier repas
                  </Text>
                  <Text style={styles.statValue}>
                    {selectedDayInfo.meal ? "Oui" : "Non"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.salaryRow}>
                <Text style={styles.salaryLabel}>Salaire Net estimé</Text>
                <Text style={styles.salaryValue}>
                  {selectedDayInfo.net
                    ? selectedDayInfo.net.toFixed(2).replace(".", ",")
                    : "0,00"}{" "}
                  €
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-clear-outline"
                size={48}
                color="#C5C6CD"
              />
              <Text style={styles.emptyTitle}>
                {formatDateFr(selectedDate)}
              </Text>
              <Text style={styles.emptyText}>
                Aucune garde enregistrée pour ce jour.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailHeader: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0B192C",
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    color: "#44474C",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8EFF5",
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    padding: 16,
  },
  col: {
    flex: 1,
    paddingHorizontal: 8,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: "#E8EFF5",
    paddingLeft: 16,
  },
  statLabel: {
    fontSize: 13,
    color: "#75777D",
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: "#0B192C",
    fontWeight: "500",
  },
  salaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#EEF4FB",
  },
  salaryLabel: {
    fontSize: 16,
    color: "#44474C",
  },
  salaryValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B192C",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0B192C",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#75777D",
    textAlign: "center",
  },
});

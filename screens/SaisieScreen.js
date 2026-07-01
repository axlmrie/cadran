import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SaisieScreen() {
  // --- ÉTATS (STATE) ---
  // On initialise les dates à aujourd'hui, 08:00 et 17:00
  const defaultStart = new Date();
  defaultStart.setHours(8, 0, 0, 0);

  const defaultEnd = new Date();
  defaultEnd.setHours(17, 0, 0, 0);

  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [pauseTime, setPauseTime] = useState("45");
  const [mealBonus, setMealBonus] = useState(true);
  const [dressingBonus, setDressingBonus] = useState(false);

  // États pour les calculs finaux
  const [results, setResults] = useState({
    amplitude: "00h00",
    tte: "00h00",
    gross: 0,
    net: 0,
    tteMinutes: 0, // Gardé en mémoire pour l'historique
  });

  // --- LOGIQUE MÉTIER ---
  useEffect(() => {
    calculate();
  }, [startTime, endTime, pauseTime, mealBonus, dressingBonus]);

  const calculate = () => {
    let start = new Date(startTime);
    let end = new Date(endTime);

    // Gestion du passage à minuit (si la fin est avant le début)
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const diffMs = end - start;
    const diffMinTotal = Math.floor(diffMs / 60000);
    const pauseMins = parseInt(pauseTime) || 0;

    const ampHours = Math.floor(diffMinTotal / 60);
    const ampMin = diffMinTotal % 60;
    const amplitudeStr = `${ampHours.toString().padStart(2, "0")}h${ampMin.toString().padStart(2, "0")}`;

    const tteMin = diffMinTotal - pauseMins;
    const tteHours = Math.max(0, Math.floor(tteMin / 60));
    const tteRemainderMin = Math.max(0, tteMin % 60);
    const tteStr = `${tteHours.toString().padStart(2, "0")}h${tteRemainderMin.toString().padStart(2, "0")}`;

    const hourlyRate = 14.5;
    const baseSalary = (Math.max(0, tteMin) / 60) * hourlyRate;
    const mealVal = mealBonus ? 9.2 : 0;
    const dressingVal = dressingBonus ? 2.5 : 0;

    const gross = baseSalary + mealVal + dressingVal;
    const net = gross * 0.78;

    setResults({
      amplitude: amplitudeStr,
      tte: tteStr,
      gross: gross,
      net: net,
      tteMinutes: tteMin,
    });
  };

  const saveDay = async () => {
    try {
      const todayString = new Date().toISOString().split("T")[0];
      const dailyData = {
        date: todayString,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        pause: parseInt(pauseTime) || 0,
        meal: mealBonus,
        dressing: dressingBonus,
        ...results,
      };

      const existingData = await AsyncStorage.getItem("@cadran_days");
      let daysArray = existingData ? JSON.parse(existingData) : [];

      const existingIndex = daysArray.findIndex((d) => d.date === todayString);
      if (existingIndex >= 0) {
        daysArray[existingIndex] = dailyData;
      } else {
        daysArray.push(dailyData);
      }

      await AsyncStorage.setItem("@cadran_days", JSON.stringify(daysArray));

      Alert.alert(
        "Succès",
        "Ta journée a bien été enregistrée sur cet iPhone !",
      );
    } catch (e) {
      Alert.alert("Erreur", "Impossible de sauvegarder la journée.");
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>Paramètres du jour</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom]}>
            <Text style={styles.label}>Heure de début</Text>
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, date) => date && setStartTime(date)}
              style={styles.timePicker}
            />
          </View>

          <View style={[styles.row, styles.borderBottom]}>
            <Text style={styles.label}>Heure de fin</Text>
            <DateTimePicker
              value={endTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, date) => date && setEndTime(date)}
              style={styles.timePicker}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Temps de pause (min)</Text>
            <TextInput
              style={styles.numberInput}
              keyboardType="number-pad"
              value={pauseTime}
              onChangeText={setPauseTime}
              maxLength={3}
              returnKeyType="done"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom]}>
            <View>
              <Text style={styles.label}>Panier repas</Text>
              <Text style={styles.subLabel}>Forfait conventionnel</Text>
            </View>
            <Switch
              value={mealBonus}
              onValueChange={setMealBonus}
              trackColor={{ false: "#E9E9EB", true: "#34C759" }}
            />
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Prime d'habillage</Text>
              <Text style={styles.subLabel}>Application quotidienne</Text>
            </View>
            <Switch
              value={dressingBonus}
              onValueChange={setDressingBonus}
              trackColor={{ false: "#E9E9EB", true: "#34C759" }}
            />
          </View>
        </View>

        <View style={styles.dashboard}>
          <View style={styles.dashHeader}>
            <View>
              <Text style={styles.dashLabel}>AMPLITUDE</Text>
              <Text style={styles.dashTime}>{results.amplitude}</Text>
            </View>
            <View style={styles.separator} />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.dashLabel}>TTE</Text>
              <Text style={styles.dashTime}>{results.tte}</Text>
            </View>
          </View>

          <View style={styles.dashSalaries}>
            <View style={styles.salaryRow}>
              <Text style={styles.salaryText}>Salaire Brut estimé</Text>
              <Text style={styles.salaryVal}>
                {results.gross.toFixed(2).replace(".", ",")} €
              </Text>
            </View>
            <View style={[styles.salaryRow, { marginTop: 8 }]}>
              <Text style={styles.netText}>Salaire Net estimé</Text>
              <Text style={styles.netVal}>
                {results.net.toFixed(2).replace(".", ",")} €
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveDay}>
          <Text style={styles.saveButtonText}>Enregistrer la journée</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  headerInfo: {
    marginBottom: 10,
    paddingLeft: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0B192C",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  label: {
    fontSize: 17,
    color: "#2C3338",
  },
  subLabel: {
    fontSize: 12,
    color: "#75777D",
    marginTop: 2,
  },
  timePicker: {
    width: 80,
  },
  numberInput: {
    fontSize: 17,
    fontWeight: "500",
    color: "#007AFF",
    textAlign: "right",
    width: 60,
  },
  dashboard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCE3EA",
    padding: 20,
    marginBottom: 24,
  },
  dashHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dashLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#75777D",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dashTime: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0B192C",
  },
  separator: {
    width: 1,
    backgroundColor: "#F0F0F0",
  },
  dashSalaries: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F7",
    paddingTop: 12,
  },
  salaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  salaryText: {
    fontSize: 14,
    color: "#2C3338",
  },
  salaryVal: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3338",
  },
  netText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0B192C",
  },
  netVal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0B192C",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});

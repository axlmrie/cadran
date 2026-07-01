import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActionSheetIOS,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const ANCIENNETE_OPTIONS = [
  "Annuler",
  "Moins d'1 an",
  "1 an",
  "2 ans",
  "3 ans et +",
];

export default function ParametresScreen() {
  const [tauxHoraire, setTauxHoraire] = useState("11.65");
  const [anciennete, setAnciennete] = useState(0);
  const [panierRepas, setPanierRepas] = useState("16.50");
  const [primeHabillage, setPrimeHabillage] = useState("2.50");
  const [mutuelle, setMutuelle] = useState(true);
  const [partSalariale, setPartSalariale] = useState("45.00");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("@cadran_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.tauxHoraire) setTauxHoraire(parsed.tauxHoraire);
        if (parsed.anciennete !== undefined) setAnciennete(parsed.anciennete);
        if (parsed.panierRepas) setPanierRepas(parsed.panierRepas);
        if (parsed.primeHabillage) setPrimeHabillage(parsed.primeHabillage);
        if (parsed.mutuelle !== undefined) setMutuelle(parsed.mutuelle);
        if (parsed.partSalariale) setPartSalariale(parsed.partSalariale);
      }
    } catch (e) {
      console.error("Erreur de chargement des paramètres", e);
    }
  };

  useEffect(() => {
    const saveSettings = async () => {
      const settingsToSave = {
        tauxHoraire,
        anciennete,
        panierRepas,
        primeHabillage,
        mutuelle,
        partSalariale,
      };
      await AsyncStorage.setItem(
        "@cadran_settings",
        JSON.stringify(settingsToSave),
      );
    };
    saveSettings();
  }, [
    tauxHoraire,
    anciennete,
    panierRepas,
    primeHabillage,
    mutuelle,
    partSalariale,
  ]);

  const handleAnciennetePress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ANCIENNETE_OPTIONS,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex > 0) {
          setAnciennete(buttonIndex - 1);
        }
      },
    );
  };

  const clearHistory = () => {
    Alert.alert(
      "Attention",
      "Es-tu sûr de vouloir supprimer toutes tes gardes enregistrées ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Effacer",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("@cadran_days");
            Alert.alert("Succès", "L'historique a été effacé.");
          },
        },
      ],
    );
  };

  const exportCSV = () => {
    Alert.alert(
      "Bientôt disponible",
      "La fonction d'export nécessitera le module expo-file-system que nous ajouterons pour la version finale.",
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.sectionTitle}>CONTRAT & RÉMUNÉRATION</Text>
      <View style={styles.card}>
        <View style={[styles.row, styles.borderBottom]}>
          <Text style={styles.label}>Taux horaire brut</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={tauxHoraire}
              onChangeText={setTauxHoraire}
              returnKeyType="done"
            />
            <Text style={styles.unit}>€/h</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.row} onPress={handleAnciennetePress}>
          <Text style={styles.label}>Ancienneté</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.pickerText}>
              {ANCIENNETE_OPTIONS[anciennete + 1]}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#75777D" />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>INDEMNITÉS & PRIMES</Text>
      <View style={styles.card}>
        <View style={[styles.row, styles.borderBottom]}>
          <Text style={styles.label}>Panier Repas</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={panierRepas}
              onChangeText={setPanierRepas}
              returnKeyType="done"
            />
            <Text style={styles.unit}>€</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Prime d'habillage</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={primeHabillage}
              onChangeText={setPrimeHabillage}
              returnKeyType="done"
            />
            <Text style={styles.unit}>€</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>COTISATIONS</Text>
      <View style={styles.card}>
        <View style={[styles.row, mutuelle && styles.borderBottom]}>
          <Text style={styles.label}>Mutuelle entreprise</Text>
          <Switch
            value={mutuelle}
            onValueChange={setMutuelle}
            trackColor={{ false: "#E9E9EB", true: "#34C759" }}
          />
        </View>

        {mutuelle && (
          <View style={styles.row}>
            <Text style={styles.label}>Part salariale</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={partSalariale}
                onChangeText={setPartSalariale}
                returnKeyType="done"
              />
              <Text style={styles.unit}>€/mois</Text>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.card, { marginTop: 16 }]}>
        <TouchableOpacity
          style={[styles.row, styles.borderBottom]}
          onPress={exportCSV}
        >
          <Text style={[styles.label, { color: "#007AFF" }]}>
            Exporter mes gardes (CSV)
          </Text>
          <Ionicons name="share-outline" size={20} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={clearHistory}>
          <Text style={[styles.label, { color: "#FF3B30" }]}>
            Effacer tout l'historique
          </Text>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#75777D",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 24,
    marginLeft: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  label: {
    fontSize: 17,
    color: "#2C3338",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 17,
    color: "#007AFF",
    textAlign: "right",
    minWidth: 60,
    padding: 0,
  },
  unit: {
    fontSize: 17,
    color: "#75777D",
    marginLeft: 4,
  },
  pickerText: {
    fontSize: 17,
    color: "#007AFF",
    marginRight: 4,
  },
});

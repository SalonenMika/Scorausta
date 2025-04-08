import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getRounds } from "@/utils/database"; // Lisää tarvittavat tuonnit

export default function StatsBox() {
  const [latestRound, setLatestRound] = useState<any | null>(null);

  useEffect(() => {
    const fetchLatestRound = async () => {
      try {
        const rounds = await getRounds();
        if (rounds && rounds.length > 0) {
          setLatestRound(rounds[rounds.length - 1]); // Oletetaan, että viimeisin kierros on viimeinen listassa
        }
      } catch (error) {
        console.error("Virhe viimeisimmän kierroksen hakemisessa:", error);
      }
    };

    fetchLatestRound();
  }, []);

  // Laske parin ero vain pelatuista väylistä
  const calculateParDifference = () => {
    if (latestRound?.holes) {
      const totalStrokes = latestRound.holes.reduce((sum: number, hole: any) => {
        return hole.strokes ? sum + hole.strokes : sum;
      }, 0);
      const totalPar = latestRound.holes.reduce((sum: number, hole: any) => {
        return hole.strokes ? sum + hole.par : sum;
      }, 0);
      return totalStrokes - totalPar;
    }
    return 0;
  };

  // Laske eri tulosten määrät
  const calculateStats = () => {
    const stats = {
      eagle: 0,
      birdie: 0,
      par: 0,
      bogey: 0,
      doubleBogeyOrWorse: 0,
    };

    if (latestRound?.holes) {
      latestRound.holes.forEach((hole: any) => {
        if (hole.strokes) {
          const strokeDifference = hole.strokes - hole.par;
          if (strokeDifference <= -2) stats.eagle += 1;
          else if (strokeDifference === -1) stats.birdie += 1;
          else if (strokeDifference === 0) stats.par += 1;
          else if (strokeDifference === 1) stats.bogey += 1;
          else stats.doubleBogeyOrWorse += 1;
        }
      });
    }

    return stats;
  };

  // Päivitetty vuokaavio
  const stats = calculateStats();

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.title}>Viimeisin kierros</Text>
        {latestRound ? (
          <>
            <Text style={styles.courseName}>{latestRound.course_name}</Text>
            <Text style={styles.date}>{new Date(latestRound.date).toLocaleDateString("fi-FI")}</Text>
            <Text style={styles.result}>
              {calculateParDifference() > 0 ? "+" : ""}
              {calculateParDifference()} lyöntiä parista
            </Text>
          </>
        ) : (
          <Text style={styles.loadingText}>Ladataan viimeisintä kierrosta...</Text>
        )}
      </View>

      <View style={styles.chartContainer}>
        {/* Vuokaavio */}
        {stats.eagle > 0 && (
          <View style={styles.chartItem}>
            <Text style={styles.chartLabel}>Eagle ({stats.eagle})</Text>
            <View style={[styles.chartLine, { flex: stats.eagle }]} />
          </View>
        )}
        {stats.birdie > 0 && (
          <View style={styles.chartItem}>
            <Text style={styles.chartLabel}>Birdie ({stats.birdie})</Text>
            <View style={[styles.chartLine, { flex: stats.birdie }]} />
          </View>
        )}
        {stats.par > 0 && (
          <View style={styles.chartItem}>
            <Text style={styles.chartLabel}>Par ({stats.par})</Text>
            <View style={[styles.chartLine, { flex: stats.par }]} />
          </View>
        )}
        {stats.bogey > 0 && (
          <View style={styles.chartItem}>
            <Text style={styles.chartLabel}>Bogey ({stats.bogey})</Text>
            <View style={[styles.chartLine, { flex: stats.bogey }]} />
          </View>
        )}
        {stats.doubleBogeyOrWorse > 0 && (
          <View style={styles.chartItem}>
            <Text style={styles.chartLabel}>Double Bogey + ({stats.doubleBogeyOrWorse})</Text>
            <View style={[styles.chartLine, { flex: stats.doubleBogeyOrWorse }]} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "90%",
    padding: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Läpinäkyvä tausta
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white', // Valkoinen reunaviiva
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'space-between', // Tasataan tekstit vasemmalle ja diagrammi oikealle
  },
  statsContainer: {
    flexDirection: "column",
    alignItems: "flex-start", // Tekstit vasemmalle
    width: "60%",
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 14,
    color: 'white',
    marginVertical: 4,
  },
  result: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    color: 'white',
  },
  chartContainer: {
    marginTop: 12,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: "40%",
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: 'white',
    marginRight: 8,
  },
  chartLine: {
    backgroundColor: 'white',
    height: 4,
    borderRadius: 2,
    minWidth: 20, // Minimileveys
  },
});

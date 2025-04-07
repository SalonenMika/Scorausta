import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getRoundById } from "@/utils/database";

interface Hole {
    hole_number: number;
    par: number;
    pituus: number;
    hcp: number;
    strokes: number | null;
    putts: number | null;
    gir: boolean | null;
}

interface Round {
    id: number;
    course_name: string;
    club_name: string;
    date: string;
    holes: Hole[];
}

export default function RoundDetailScreen() {
    const { id } = useLocalSearchParams();
    const [round, setRound] = useState<Round | null>(null);

    useEffect(() => {
        const fetchRound = async () => {
            try {
                const data = await getRoundById(Number(id));
                console.log("Fetched round data:", data);
                if (data) {
                    setRound(data);
                } else {
                    setRound(null); // Jos tietoa ei löydy, pidetään tila `null`:ina
                }
            } catch (error) {
                console.error("Virhe kierroksen haussa:", error);
                setRound(null);
            }
        };

        fetchRound();
    }, [id]);

    if (!round) {
        return <Text style={styles.loadingText}>Ladataan...</Text>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Kierros: {round.course_name}</Text>
                <Text style={styles.subtitle}>Seura: {round.club_name}</Text>
                <Text style={styles.date}>Päivämäärä: {new Date(round.date).toLocaleString("fi-FI")}</Text>
            </View>

            <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Väyläkohtaiset tulokset:</Text>
                {round.holes.map((hole) => (
                    <View key={hole.hole_number} style={styles.resultItem}>
                        <Text style={styles.holeText}>Väylä {hole.hole_number}</Text>
                        <Text style={styles.scoreText}>
                            Par: {hole.par} | Pituus: {hole.pituus}m | HCP: {hole.hcp}
                        </Text>
                        <Text style={styles.scoreText}>
                            Lyöntejä: {hole.strokes ?? "Ei tietoa"}, Putteja: {hole.putts ?? "Ei tietoa"}, GIR: {hole.gir ? "✅" : "❌"}
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#f4f4f9",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    subtitle: {
        fontSize: 18,
        color: "#666",
        marginTop: 5,
    },
    date: {
        fontSize: 16,
        color: "#999",
        marginTop: 5,
    },
    loadingText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 20,
        color: "#888",
    },
    resultsContainer: {
        marginTop: 20,
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    resultItem: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 3,
    },
    holeText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    scoreText: {
        fontSize: 16,
        color: "#666",
    },
});

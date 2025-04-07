import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getRoundById } from "@/utils/database";


interface Round {
    id: number;
    course_name: string;
    club_name: string;
    date: string;
    scores: string; // JSON-muodossa tallennettu tulokset
}

export default function RoundDetailScreen() {
    const { id } = useLocalSearchParams();
    const [round, setRound] = useState<Round | null>(null);

    useEffect(() => {
        const fetchRound = async () => {
            try {
                const data = await getRoundById(Number(id));
                
                // ✅ Tarkistetaan, että data on oikeantyyppinen
                if (data && typeof data === "object" && "id" in data && "course_name" in data) {
                    setRound(data as Round);
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
        return <Text>Ladataan...</Text>;
    }

    let scores = {};
    try {
        scores = JSON.parse(round.scores);
    } catch (error) {
        console.error("Virhe tulosten jäsentämisessä:", error);
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Kierros: {round.course_name}</Text>
                <Text style={styles.subtitle}>Seura: {round.club_name}</Text>
                <Text style={styles.date}>Päivämäärä: {round.date}</Text>
            </View>
            
            <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Tulokset:</Text>
                {Object.entries(scores).map(([hole, score]: any) => (
                    <View key={hole} style={styles.resultItem}>
                        <Text style={styles.holeText}>Väylä {hole}</Text>
                        <Text style={styles.scoreText}>Lyöntiä: {score.strokes}</Text>
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
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


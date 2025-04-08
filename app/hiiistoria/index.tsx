import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button, Alert } from "react-native";
import { getRounds, deleteRoundById, getRoundById } from "@/utils/database";
import { Link } from 'expo-router';

interface Hole {
    par: number;
    strokes: number | null; // Väylän lyöntimäärä
}

interface Round {
    id: number;
    course_name: string;
    club_name: string;
    date: string;
    scores: string; // JSON-muotoinen merkkijono, joka sisältää lyöntitiedot
}

interface RoundWithTotalStrokes extends Round {
    totalStrokes: number; // Lisätty kenttä, joka sisältää lyöntien kokonaismäärän
    totalPar: number; // Lisätty kenttä, joka sisältää kentän kokonaisparin pelatuista väylistä
    scoreDifference: number; // Kenttä, joka laskee eron lyöntien ja parin välillä
}

export default function HistoryScreen() {
    const [rounds, setRounds] = useState<RoundWithTotalStrokes[]>([]);
    const [selectedRound, setSelectedRound] = useState<RoundWithTotalStrokes | null>(null);

    useEffect(() => {
        const fetchRounds = async () => {
            try {
                const rawData = await getRounds();

                const roundsWithScores = await Promise.all(
                    rawData.map(async (round: any) => {
                        const holes = await getRoundById(round.id);

                        let totalStrokes = 0;
                        let totalPar = 0;
                        if (holes && holes.holes) {
                            // Lasketaan lyöntien ja parin määrä pelatuista väylistä
                            holes.holes.forEach((hole: Hole) => {
                                if (hole.strokes !== null) { // Lasketaan vain väylät, joilla on lyönnit
                                    totalStrokes += hole.strokes ?? 0;
                                    totalPar += hole.par;
                                }
                            });
                        }

                        const scoreDifference = totalStrokes - totalPar; // Laske ero lyöntien ja parin välillä

                        return {
                            ...round,
                            totalStrokes,
                            totalPar,
                            scoreDifference, // Lisää tulos
                        };
                    })
                );
                setRounds(roundsWithScores);
            } catch (error) {
                console.error("Virhe haettaessa kierroksia:", error);
            }
        };

        fetchRounds();
    }, []);

    const handleDelete = async () => {
        if (selectedRound) {
            try {
                await deleteRoundById(selectedRound.id);
                setRounds(rounds.filter((round) => round.id !== selectedRound.id));
                setSelectedRound(null);
            } catch (error) {
                Alert.alert("Virhe", "Kierroksen poistaminen epäonnistui.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tallennetut kierrokset</Text>
            <FlatList
                data={rounds}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const localDate = new Date(item.date);
                    localDate.setHours(localDate.getHours());

                    const formattedDate = localDate.toLocaleDateString("fi-FI", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    });
                    const formattedTime = localDate.toLocaleTimeString("fi-FI", {
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                    return (
                        <Link href={{
                            pathname: `/hiiistoria/round/[id]`,
                            params: { id: item.id },
                        }} asChild>
                            <TouchableOpacity style={styles.roundItem} onLongPress={() => setSelectedRound(item)}>
                                <Text style={styles.date}>{formattedDate} klo {formattedTime}</Text>
                                <Text style={styles.course}>{item.course_name} (ID: {item.id})</Text>
                                <View style={styles.scoreContainer}>
                                    <Text style={styles.strokes}>Lyönnit yhteensä: {item.totalStrokes}</Text>
                                    <Text style={styles.scoreDifference}>
                                        {item.scoreDifference >= 0 ? `+${item.scoreDifference}` : item.scoreDifference}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    );
                }}
            />
            {/* Poistomodaali */}
            <Modal visible={selectedRound !== null} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Haluatko poistaa kierroksen?</Text>
                        <Button title="Poista kierros" onPress={handleDelete} color="red" />
                        <Button title="Peruuta" onPress={() => setSelectedRound(null)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F5F5F5",
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    roundItem: {
        backgroundColor: "#FFF",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    date: {
        fontSize: 16,
        fontWeight: "bold",
    },
    course: {
        fontSize: 14,
        color: "#555",
    },
    scoreContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    strokes: {
        fontSize: 14,
        color: "#007BFF",
    },
    scoreDifference: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FF0000",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
});

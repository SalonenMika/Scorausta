import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button, Alert } from "react-native";
import { getRounds, deleteRoundById, getHolesByRoundId} from "@/utils/database";
import { Link } from 'expo-router';

interface Round {
    id: number;
    course_name: string;
    club_name: string;
    date: string;
    scores: string;
}

export default function HistoryScreen() {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [selectedRound, setSelectedRound] = useState<Round | null>(null); // Modaali-ikkunaa varten

    useEffect(() => {
        const fetchRounds = async () => {
            try {
                const rawData = await getRounds();
                const roundsWithScores = await Promise.all(
                    rawData.map(async (round: any) => {
                        // Haetaan väylien tiedot kierrokselle
                        const holes = await getHolesByRoundId(round.id);
                        
                        // Lasketaan lyöntien määrä väyliltä
                        let totalStrokes = 0;
                        holes.forEach((hole: any) => {
                            totalStrokes += hole.strokes || 0;
                        });
                        
                        return {
                            ...round,
                            totalStrokes, // Lisätään lyöntien määrä kierrokseen
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

    // Poista kierros
    const handleDelete = async () => {
        if (selectedRound) {
            try {
                await deleteRoundById(selectedRound.id);
                setRounds(rounds.filter((round) => round.id !== selectedRound.id)); // Päivitä lista
                setSelectedRound(null); // Sulje modaali
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
                    localDate.setHours(localDate.getHours()); // Korjaa Suomen ajan

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

                    let totalStrokes = 0;
                    // Tarkistetaan, että scores ei ole null tai tyhjä
                    if (item.scores) {
                        try {
                            const scores: Record<string, { strokes: number }> = JSON.parse(item.scores);
                            totalStrokes = Object.values(scores).reduce(
                                (sum, score) => sum + score.strokes,
                                0
                            );
                        } catch (error) {
                            console.error("Virhe parsittaessa lyöntejä kierrokselle:", item.id, error);
                        }
                    }

                    return (
                        <Link href={{
                            pathname: `/hiiistoria/round/[id]`,
                            params: { id: item.id },
                        }} asChild>
                            <TouchableOpacity style={styles.roundItem}
                                onLongPress={() => setSelectedRound(item)}>
                                <Text style={styles.date}>{formattedDate} klo {formattedTime}</Text>
                                <Text style={styles.course}>{item.course_name} (ID: {item.id})</Text>
                                <Text style={styles.strokes}>Lyönnit yhteensä: {totalStrokes}</Text>
                            </TouchableOpacity>
                        </Link>
                    );
                }}
            />
            {/* 📌 Poistomodaali */}
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
    strokes: {
        fontSize: 14,
        color: "#007BFF",
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

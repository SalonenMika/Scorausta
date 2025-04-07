import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

interface Kentta {
    id: number;
    club_name: string;
    course_name: string;
    vaylat: Record<number, { par: number; pituus: number; hcp: number }>;
    location: {
        city: string;
    };
}

export default function UusiKierrosScreen() {
    const [kentat, setKentat] = useState<Kentta[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Tarkistetaan, onko käynnissä oleva kierros
    useEffect(() => {
        const checkOngoingRound = async () => {
            try {
                const savedRound = await AsyncStorage.getItem("currentRound");
                if (savedRound) {
                    router.replace("/uusiKierros/(drawer)/(tabs)/holes"); // Siirtyy holes-näkymään, jos kierros on käynnissä
                }
            } catch (error) {
                console.error("Virhe tarkistettaessa tallennettua kierrosta:", error);
            }
        };

        checkOngoingRound();
    }, []);

    // Haetaan kentät
    useEffect(() => {
        const fetchKentat = async () => {
            try {
                const response = await fetch("/api/kenttapi"); // Muuta osoite vastaamaan API:a
                const data = await response.json();
                setKentat(data);
            } catch (error) {
                console.error("Virhe haettaessa kenttiä:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchKentat();
    }, []);

    const calculateTotalParAndLength = (vaylat: Record<number, { par: number; pituus: number }>) => {
        let totalPar = 0;
        let totalLength = 0;
        let totalHoles = 0; // Väylien määrä

        for (let key in vaylat) {
            totalPar += vaylat[key].par;
            totalLength += vaylat[key].pituus;
            totalHoles++; // Lasketaan väylien määrä
        }

        return { totalPar, totalLength, totalHoles }; // Palautetaan myös väylien määrä
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
        <Text style={styles.header}>Valitse kenttä</Text>
        <FlatList
            data={kentat}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
                const { totalPar, totalLength, totalHoles } = calculateTotalParAndLength(item.vaylat);

                return (
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/uusiKierros/(drawer)/(tabs)/holes",
                                params: { kentta: JSON.stringify(item) }
                            })
                        }
                    >
                        <View style={styles.card}>
                            <Text style={styles.courseName}>{item.club_name}</Text>
                            <Text style={styles.city}>{item.location.city}</Text>
                            <Text style={styles.summary}>
                                Par: {totalPar} | Pituus: {totalLength}m | Väyliä: {totalHoles}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            }}
            contentContainerStyle={{ paddingBottom: 20 }} // Estää viimeisten itemien jäämisen navigaatiopalkin alle
        />
    </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "rgba(192, 229, 149, 0.9)",
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    kenttaItem: {
        backgroundColor: "#FFF",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    courseName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    clubName: {
        fontSize: 14,
        color: "#555",
    },
    card: {
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        width: "100%",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    city: {
        fontSize: 14,
        color: "#007BFF",
    },
    summary: {
        fontSize: 14,
        color: "#333",
        marginTop: 5,
    },

});

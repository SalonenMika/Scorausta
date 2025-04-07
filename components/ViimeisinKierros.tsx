import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLastRound } from "@/utils/database"; // ✅ Haetaan viimeisin kierros tietokannasta

interface Kierros {
    course_name: string;
    club_name: string;
    date: string;
    scores: { hole: number; strokes: number; putts: number; gir: boolean }[];
}

interface Vayla {
    par: number;
    pituus: number;
    hcp: number;
}

export default function ViimeisinKierros() {
    const [kierros, setKierros] = useState<Kierros | null>(null);
    const [kenttaTiedot, setKenttaTiedot] = useState<Record<number, Vayla> | null>(null);
    const [otsikko, setOtsikko] = useState("Viime kierros");

    useEffect(() => {
        const fetchRound = async () => {
            try {
                const currentRound = await AsyncStorage.getItem("currentRound");
        
                if (currentRound) {
                    console.log("Kuluva kierros löytyi AsyncStoragesta:", currentRound);
                    const parsedRound = JSON.parse(currentRound);
        
                    if (parsedRound.course_name && parsedRound.club_name && parsedRound.scores) {
                        setKierros(parsedRound);
                        setOtsikko("Kuluva kierros");
                        await fetchKenttaTiedot(parsedRound.club_name, parsedRound.course_name);
                        return;
                    } else {
                        console.warn("Kuluva kierros puutteellinen:", parsedRound);
                    }
                }
        
                // Jos ei löytynyt AsyncStoragesta, haetaan viimeisin kierros tietokannasta
                const lastRound = await getLastRound();
                if (lastRound) {
                    console.log("Viimeisin kierros löytyi tietokannasta:", lastRound);
                    const parsedRound = {
                        course_name: lastRound.course_name,
                        club_name: lastRound.club_name,
                        date: lastRound.date,
                        scores: JSON.parse(lastRound.scores),
                    };
        
                    if (parsedRound.course_name && parsedRound.club_name && parsedRound.scores) {
                        // Haetaan API:sta vastaavan kentän tiedot
                        const kenttaData = await fetchKenttaTiedot(parsedRound.club_name, parsedRound.course_name);
                        if (kenttaData) {
                            parsedRound.vaylat = kenttaData.vaylat; // Lisätään puuttuva väylätieto
                        }
        
                        setKierros(parsedRound);
                        setOtsikko("Viime kierros");
                    } else {
                        console.warn("Viimeisin kierros puutteellinen:", parsedRound);
                    }
                } else {
                    console.log("Ei löytynyt tallennettuja kierroksia.");
                }
            } catch (error) {
                console.error("Virhe kierroksen haussa:", error);
            }
        };

        const fetchKenttaTiedot = async (clubName: string, courseName: string) => {
            try {
                const response = await fetch("api/kenttapi"); // 🟢 Vaihda API:n oikea URL
                const data = await response.json();

                // Etsitään oikea kenttä API:sta
                const foundCourse = data.find(
                    (course: any) => course.club_name === clubName && course.course_name === courseName
                );

                if (foundCourse) {
                    setKenttaTiedot(foundCourse.vaylat);
                }
            } catch (error) {
                console.error("Virhe kenttätietojen haussa API:sta:", error);
            }
        };

        fetchRound();
    }, []);

    if (!kierros) {
        return <Text style={styles.noData}>Ei pelattuja kierroksia</Text>;
    }

    if (!kenttaTiedot) {
        return <Text style={styles.loading}>Ladataan kenttätietoja...</Text>;
    }

    // Lasketaan yhteenvedon tilastot
    const totalPutts = kierros.scores.reduce((sum, hole) => sum + hole.putts, 0);
    const totalStrokes = kierros.scores.reduce((sum, hole) => sum + hole.strokes, 0);

    // Lasketaan kokonaispar API:sta haettujen tietojen perusteella
    const totalPar = Object.values(kenttaTiedot).reduce((sum, hole) => sum + hole.par, 0);

    const girPercentage = (kierros.scores.filter(hole => hole.gir).length / kierros.scores.length) * 100;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{otsikko}</Text>
            <Text style={styles.course}>
                {kierros.club_name} - {kierros.course_name}
            </Text>
            <Text style={styles.date}>{new Date(kierros.date).toLocaleDateString()}</Text>

            <View style={styles.statsContainer}>
                <Text style={styles.stats}>Puttien keskiarvo: {(totalPutts / kierros.scores.length).toFixed(1)}</Text>
                <Text style={styles.stats}>Tulos suhteessa pariin: {totalStrokes - totalPar}</Text>
                <Text style={styles.stats}>GIR: {girPercentage.toFixed(1)}%</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    course: {
        fontSize: 16,
        fontWeight: "600",
    },
    date: {
        fontSize: 14,
        color: "#555",
    },
    statsContainer: {
        marginTop: 10,
    },
    stats: {
        fontSize: 14,
        fontWeight: "500",
    },
    noData: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "500",
        color: "#555",
        marginTop: 20,
    },
    loading: {
        textAlign: "center",
        fontSize: 14,
        color: "#777",
        marginTop: 10,
    },
});

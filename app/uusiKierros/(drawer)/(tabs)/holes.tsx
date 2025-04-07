import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import NumberPad from "@/components/CircleButton";
import StatBox from "@/components/StatBox";
import VaylaInfo from "@/components/VaylaInfo";
import { saveRound } from "@/utils/database";

interface Hole {
    par: number;
    pituus: number;
    hcp: number;
}

interface Course {
    club_name: string;
    course_name: string;
    vaylat: Record<number, Hole>;
}

interface Score {
    strokes: number | null;
    putts: number | null;
    gir: boolean;
}

interface HoleWithScore extends Hole {
    strokes: number | null;
    putts: number | null;
    gir: boolean;
}

export default function HoleScreen() {
    const { kentta } = useLocalSearchParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [currentHoleIndex, setCurrentHoleIndex] = useState(1);
    const [scores, setScores] = useState<Record<number, Score>>({});
    const [activeStat, setActiveStat] = useState<"strokes" | "putts" | null>("strokes");
    

    useEffect(() => {
        if (kentta) {
            setCourse(JSON.parse(kentta as string));
        }
    }, [kentta]);

    useEffect(() => {
        const loadSavedRound = async () => {
            try {
                const savedRound = await AsyncStorage.getItem("currentRound");
                if (savedRound) {
                    const { savedCourse, savedScores, savedHoleIndex } = JSON.parse(savedRound);
                    setCourse(savedCourse);
                    setScores(savedScores);
                    setCurrentHoleIndex(savedHoleIndex);
                }
            } catch (error) {
                console.error("Virhe ladattaessa tallennettua kierrosta:", error);
            }
        };
    
        loadSavedRound();
    }, []);

    useEffect(() => {
        const loadSavedRound = async () => {
            try {
                const savedRound = await AsyncStorage.getItem("currentRound");
                const shouldEndRound = await AsyncStorage.getItem("endRoundTrigger");
    
                if (savedRound) {
                    const { savedCourse, savedScores, savedHoleIndex } = JSON.parse(savedRound);
                    setCourse(savedCourse);
                    setScores(savedScores);
                    setCurrentHoleIndex(savedHoleIndex);
                }
    
                if (shouldEndRound === "true") {
                    await AsyncStorage.removeItem("endRoundTrigger");
                    handleSaveRound(); // Tallennetaan ja poistutaan
                }
            } catch (error) {
                console.error("Virhe ladattaessa tallennettua kierrosta:", error);
            }
        };
    
        loadSavedRound();
    }, []);

    useEffect(() => {
        const saveCurrentRound = async () => {
            if (course) {
                try {
                    await AsyncStorage.setItem(
                        "currentRound",
                        JSON.stringify({
                            savedCourse: course,
                            savedScores: scores,
                            savedHoleIndex: currentHoleIndex,
                        })
                    );
                } catch (error) {
                    console.error("Virhe tallennettaessa kierrosta:", error);
                }
            }
        };
    
        saveCurrentRound();
    }, [scores, currentHoleIndex]);


    const handleNextHole = () => {
        if (course && currentHoleIndex < Object.keys(course.vaylat).length) {
            setCurrentHoleIndex(currentHoleIndex + 1);
            setActiveStat("strokes"); // Asetetaan lyönnit ensin aktiiviseksi
        }
    };

    const handlePreviousHole = () => {
        if (currentHoleIndex > 1) {
            setCurrentHoleIndex(currentHoleIndex - 1);
            setActiveStat("strokes"); // Asetetaan lyönnit ensin aktiiviseksi
        }
    };

    const updateScore = (field: keyof Score, value: number | boolean) => {
        setScores((prev) => ({
            ...prev,
            [currentHoleIndex]: {
                ...prev[currentHoleIndex],
                [field]: value,
            },
        }));

        // Vaihdetaan aktiivinen StatBox
        if (field === "strokes") {
            setActiveStat("putts"); // Siirrytään automaattisesti putteihin
        } else if (field === "putts") {
            setActiveStat(null); // Poistetaan korostus
        }
    };

    const handleSaveRound = () => {
        if (!course) return;
    
        // Luo väylien tiedot
        const vaylat = Object.keys(course.vaylat).reduce((acc, holeNumber) => {
            const holeIndex = parseInt(holeNumber); // Muutetaan holeNumber numeroon
            const hole = course.vaylat[holeIndex];
            const score = scores[holeIndex] || {}; // Käytetään holeIndex:ä myös scoresissa
            acc[holeIndex] = {
                ...hole, // Lisätään alkuperäiset väylän tiedot
                strokes: score.strokes || null,
                putts: score.putts || null,
                gir: score.gir || false,
            };
            return acc;
        }, {} as Record<number, HoleWithScore>);
    
        console.log("Tallennettavat tiedot:");
        console.log("Kenttä:", course.course_name, course.club_name);
        console.log("Väylät ja tilastot:", vaylat);
        console.log("Pisteet:", scores);
        // Tallenna kierros ja väylät SQLite:hen
        saveRound(course.course_name, course.club_name, scores, vaylat);
    };

    if (!course) {
        return (
            <View style={styles.container}>
                <Text>Ladataan kenttää...</Text>
            </View>
        );
    }

    const currentHole = course.vaylat[currentHoleIndex];
    const currentScore = scores[currentHoleIndex] || {};

    // ** Lasketaan kokonaistulokset vain annetuille arvoille **
    const playedHoles = Object.values(scores).filter((hole) => hole.strokes !== undefined);
    const totalStrokes = playedHoles.reduce((sum, hole) => sum + (hole.strokes || 0), 0);
    const totalPutts = playedHoles.reduce((sum, hole) => sum + (hole.putts || 0), 0);
    const totalGIR = playedHoles.filter((hole) => hole.gir).length;

    const totalPar = playedHoles.reduce((sum, _, index) => sum + course.vaylat[index + 1].par, 0);
    const totalRelativeScore = totalPar > 0 ? totalStrokes - totalPar : 0;
    const girPercentage = playedHoles.length > 0 ? Math.round((totalGIR / playedHoles.length) * 100) : 0;

    return (
        <View style={styles.container}>
            {/* Väylän tiedot */}
            <VaylaInfo 
                currentHoleIndex={currentHoleIndex}
                totalHoles={Object.keys(course.vaylat).length}
                currentHole={currentHole}
                onPrevious={handlePreviousHole}
                onNext={handleNextHole}
            />

            {/* Lyöntitiedot */}
            <View style={styles.statsContainer}>
                <StatBox 
                    label="Lyönnit" 
                    value={currentScore.strokes ?? "-"} 
                    onPress={() => setActiveStat("strokes")}
                    isActive={activeStat === "strokes"}
                />
                <StatBox 
                    label="Putit" 
                    value={currentScore.putts ?? "-"} 
                    onPress={() => setActiveStat("putts")}
                    isActive={activeStat === "putts"}
                />
                <StatBox 
                    label="GIR" 
                    value={currentScore.gir ? "✔️" : "❌"} 
                    onPress={() => updateScore("gir", !currentScore.gir)}
                    isActive={false} // Ei tarvitse aktiivisuutta
                />
            </View>

            {/* Kokonaistilastot */}
            <View style={styles.overallStats}>
                <Text style={styles.overallText}>Tulos suhteessa pariin: {totalRelativeScore >= 0 ? `+${totalRelativeScore}` : totalRelativeScore}</Text>
                <Text style={styles.overallText}>Kokonaislyönnit: {totalStrokes}</Text>
                <Text style={styles.overallText}>Putit yhteensä: {totalPutts}</Text>
                <Text style={styles.overallText}>GIR: {girPercentage}%</Text>
            </View>

            {/* Numeronäppäimistö */}
            {activeStat && <NumberPad onPress={(value) => {
                if (typeof value === "number") {
                    updateScore(activeStat as "strokes" | "putts", value);
            }
            }} />}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#7DC67D",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginVertical: 10,
    },

    overallStats: {
        marginTop: 20,
        alignItems: "center",
    },
    overallText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    statBoxActive: {
        backgroundColor: "#FFD700", // Korostettu väri
    },
    statBoxInactive: {
        backgroundColor: "#FFF",
    },
});

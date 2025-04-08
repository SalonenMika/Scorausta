import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import NumberPad from "@/components/CircleButton";
import StatBox from "@/components/StatBox";
import VaylaInfo from "@/components/VaylaInfo";

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

export default function HoleScreen() {
    const { kentta } = useLocalSearchParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [currentHoleIndex, setCurrentHoleIndex] = useState(1);
    const [scores, setScores] = useState<Record<number, Score>>({});
    const [activeStat, setActiveStat] = useState<"strokes" | "putts" | null>("strokes");

    // Ladataan data kun sivu tulee näkyviin (myös tabbar-vaihdoissa)
    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const loadData = async () => {
                try {
                    if (kentta && isActive) {
                        setCourse(JSON.parse(kentta as string));
                    }

                    const savedRound = await AsyncStorage.getItem("currentRound");
                    const shouldEndRound = await AsyncStorage.getItem("endRoundTrigger");

                    if (savedRound && isActive) {
                        const { savedCourse, savedScores, savedHoleIndex } = JSON.parse(savedRound);
                        setCourse(savedCourse || JSON.parse(kentta as string));
                        setScores(savedScores);
                        setCurrentHoleIndex(savedHoleIndex);
                    }

                    if (shouldEndRound === "true" && isActive) {
                        await AsyncStorage.removeItem("endRoundTrigger");
                    }
                } catch (error) {
                    console.error("Virhe ladattaessa dataa:", error);
                }
            };

            loadData();

            return () => {
                isActive = false;
            };
        }, [kentta])
    );

    // Tallennetaan muutokset AsyncStorageen
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
    }, [scores, currentHoleIndex, course]);

    const handleNextHole = () => {
        if (course && currentHoleIndex < Object.keys(course.vaylat).length) {
            setCurrentHoleIndex(currentHoleIndex + 1);
            setActiveStat("strokes");
        }
    };

    const handlePreviousHole = () => {
        if (currentHoleIndex > 1) {
            setCurrentHoleIndex(currentHoleIndex - 1);
            setActiveStat("strokes");
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

        if (field === "strokes") {
            setActiveStat("putts");
        } else if (field === "putts") {
            setActiveStat(null);
        }
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

    const playedHoles = Object.values(scores).filter((hole) => hole.strokes !== undefined);
    const totalStrokes = playedHoles.reduce((sum, hole) => sum + (hole.strokes || 0), 0);
    const totalPutts = playedHoles.reduce((sum, hole) => sum + (hole.putts || 0), 0);
    const totalGIR = playedHoles.filter((hole) => hole.gir).length;

    const totalPar = playedHoles.reduce((sum, _, index) => sum + course.vaylat[index + 1].par, 0);
    const totalRelativeScore = totalPar > 0 ? totalStrokes - totalPar : 0;
    const girPercentage = playedHoles.length > 0 ? Math.round((totalGIR / playedHoles.length) * 100) : 0;

    return (
        <View style={styles.container}>
            <VaylaInfo 
                currentHoleIndex={currentHoleIndex}
                totalHoles={Object.keys(course.vaylat).length}
                currentHole={currentHole}
                onPrevious={handlePreviousHole}
                onNext={handleNextHole}
            />

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
                    isActive={false}
                />
            </View>

            <View style={styles.overallStats}>
                <Text style={styles.overallText}>Tulos suhteessa pariin: {totalRelativeScore >= 0 ? `+${totalRelativeScore}` : totalRelativeScore}</Text>
                <Text style={styles.overallText}>Kokonaislyönnit: {totalStrokes}</Text>
                <Text style={styles.overallText}>Putit yhteensä: {totalPutts}</Text>
                <Text style={styles.overallText}>GIR: {girPercentage}%</Text>
            </View>

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
        backgroundColor: "#FFD700",
    },
    statBoxInactive: {
        backgroundColor: "#FFF",
    },
});
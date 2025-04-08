import { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export default function ScorecardScreen() {
    const { kentta } = useLocalSearchParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [scores, setScores] = useState<Record<number, Score>>({});
    const [showNetColorCoding, setShowNetColorCoding] = useState(false); // Uusi tila net-värikoodaukselle

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const loadSavedRound = async () => {
                try {
                    const savedRound = await AsyncStorage.getItem("currentRound");
                    if (savedRound && isActive) {
                        const { savedCourse, savedScores } = JSON.parse(savedRound);
                        setCourse(savedCourse);
                        setScores(savedScores);
                    }
                } catch (error) {
                    console.error("Virhe ladattaessa tallennettua kierrosta:", error);
                }
            };

            loadSavedRound();

            return () => {
                isActive = false;
            };
        }, [])
    );

    if (!course) {
        return (
            <View style={styles.container}>
                <Text>Ladataan kenttätietoja...</Text>
            </View>
        );
    }

    const playedHoles = Object.entries(scores).map(([holeNumber, score]) => ({
        holeNumber,
        score,
    }));
    const totalStrokes = playedHoles.reduce(
        (sum, { score }) => sum + (score.strokes ?? 0),
        0
    );
    const totalPar = playedHoles.reduce(
        (sum, { holeNumber }) => sum + (course.vaylat[parseInt(holeNumber)].par || 0),
        0
    );
    const totalRelativeScore = totalStrokes - totalPar;

    // Laske "Out" ja "In" -yhteenvedot
    const outHoles = Object.entries(course.vaylat).slice(0, 9);
    const inHoles = Object.entries(course.vaylat).slice(9, 18);

    const calculateTotal = (holes: [string, Hole][], type: "par" | "strokes") => {
        return holes.reduce((sum, [holeNumber]) => {
            if (type === "par") {
                return sum + course.vaylat[parseInt(holeNumber)].par;
            } else {
                const score = scores[parseInt(holeNumber)]?.strokes ?? 0;
                return sum + (score || 0);
            }
        }, 0);
    };

    const outPar = calculateTotal(outHoles, "par");
    const outStrokes = calculateTotal(outHoles, "strokes");
    const inPar = calculateTotal(inHoles, "par");
    const inStrokes = calculateTotal(inHoles, "strokes");

    const renderScoreCell = (holeNumber: string, hole: Hole, isNet = false) => {
        const score = scores[parseInt(holeNumber)]?.strokes;
        if (score === null || score === undefined) return (
            <View style={styles.dataCellContainer}>
                <Text style={styles.dataText}>-</Text>
            </View>
        );
        
        const par = hole.par;
        const displayValue = isNet ? score - 1 : score;
        const relativeScore = displayValue - par;
        
        let cellStyle = {};
        if (!isNet || showNetColorCoding) {
            if (relativeScore == -1) {
                cellStyle = styles.scoreBirdie;
            } else if (relativeScore == 1 ) {
                cellStyle = styles.scoreBogey;
            } else if (relativeScore >= 2) {
                cellStyle = styles.scoreTuplaBogey;
            } else if (relativeScore <= 2) {
                cellStyle = styles.scoreKotka;
            }
        }
        
        return (
            <View style={[styles.dataCellContainer, cellStyle]}>
                <Text style={styles.dataText}>{displayValue}</Text>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>{course.course_name}</Text>
            <Text style={styles.subtitle}>{course.club_name}</Text>

            {/* Väylät 1-9 */}
            <View style={styles.scorecardContainer}>
                <View style={[styles.headerRow, styles.bottomBorderDark]}>
                    <Text style={styles.headerCell}>Hole</Text>
                    {outHoles.map(([holeNumber]) => (
                        <View key={holeNumber} style={[styles.holeCell, styles.rightBorderLight]}>
                            <Text style={styles.headerText}>{holeNumber}</Text>
                        </View>
                    ))}
                    <Text style={styles.headerCell}> Out</Text>
                </View>

                <View style={[styles.dataRow, styles.bottomBorderDark]}>
                    <Text style={styles.headerCell}>Slope</Text>
                    {outHoles.map(([holeNumber, hole]) => (
                        <View key={holeNumber} style={[styles.dataCell, styles.rightBorderLight]}>
                            <Text style={styles.dataText}>{hole.hcp}</Text>
                        </View>
                    ))}
                    <Text style={styles.headerCell}></Text>
                </View>

                <View style={[styles.dataRow, styles.bottomBorderDark]}>
                    <Text style={styles.headerCell}>Par</Text>
                    {outHoles.map(([holeNumber, hole]) => (
                        <View key={holeNumber} style={[styles.dataCell, styles.rightBorderLight]}>
                            <Text style={styles.dataText}>{hole.par}</Text>
                        </View>
                    ))}
                    <Text style={styles.headerCell}> {outPar}</Text>
                </View>

                <View style={[styles.dataRow, styles.bottomBorderDark]}>
                    <Text style={styles.headerCell}>Score</Text>
                    {outHoles.map(([holeNumber, hole]) => (
                        <View key={holeNumber} style={[styles.dataCell, styles.rightBorderLight]}>
                            {renderScoreCell(holeNumber, hole)}
                        </View>
                    ))}
                    <Text style={styles.headerCell}> {outStrokes}</Text>
                </View>

                <View style={styles.dataRow}>
                    <Text style={styles.headerCell}>Net</Text>
                    {outHoles.map(([holeNumber, hole]) => (
                        <View key={holeNumber} style={[styles.dataCell, styles.rightBorderLight]}>
                            {renderScoreCell(holeNumber, hole, true)}
                        </View>
                    ))}
                    <Text style={styles.headerCell}> {outStrokes - 1}</Text>
                </View>
            </View>

            {/* Väylät 10-18 */}
            <View style={[styles.scorecardContainer, {marginTop: 20}]}>
                <View style={[styles.headerRow, styles.bottomBorderDark]}>
                    <Text style={styles.headerCell}>Hole</Text>
                    {inHoles.map(([holeNumber]) => (
                        <View key={holeNumber} style={[styles.holeCell, styles.rightBorderLight]}>
                            <Text style={styles.headerText}>{holeNumber}</Text>
                        </View>
                    ))}
                    <Text style={styles.headerCell}> In</Text>
                </View>

                <View style={[styles.dataRow, styles.bottomBorderDark]}>
                    <Text style={styles.headerCell}>Slope</Text>
                    {inHoles.map(([holeNumber, hole]) => (
                        <View key={holeNumber} style={[styles.dataCell, styles.rightBorderLight]}>
                            <Text style={styles.dataText}>{hole.hcp}</Text>
                        </View>
                    ))}
                    <Text style={styles.headerCell}></Text>
                </View>

                <View style={[styles.dataRow, styles.bottomBorderDark]}>
                    <Text style={styles.headerCell}>Par</Text>
                    {inHoles.map(([holeNumber, hole]) => (
                        <View key={holeNumber} style={[styles.dataCell, styles.rightBorderLight]}>
                            <Text style={styles.dataText}>{hole.par}</Text>
                        </View>
                    ))}
                    <Text style={styles.headerCell}> {inPar}</Text>
                </View>

                <View style={[styles.dataRow, styles.bottomBorderDark]}>
                    <Text style={styles.headerCell}>Score</Text>
                    {inHoles.map(([holeNumber, hole]) => (
                        <View key={holeNumber} style={[styles.dataCell, styles.rightBorderLight]}>
                            {renderScoreCell(holeNumber, hole)}
                        </View>
                    ))}
                    <Text style={styles.headerCell}> {inStrokes}</Text>
                </View>

                <View style={styles.dataRow}>
                    <Text style={styles.headerCell}>Net</Text>
                    {inHoles.map(([holeNumber, hole]) => (
                        <View key={holeNumber} style={[styles.dataCell, styles.rightBorderLight]}>
                            {renderScoreCell(holeNumber, hole, true)}
                        </View>
                    ))}
                    <Text style={styles.headerCell}> {inStrokes - 1}</Text>
                </View>
            </View>

            {/* Kokonaistilastot */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Par:</Text>
                    <Text style={styles.summaryValue}>{outPar + inPar}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Score:</Text>
                    <Text style={styles.summaryValue}>{outStrokes + inStrokes}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Net:</Text>
                    <Text style={styles.summaryValue}>{outStrokes + inStrokes - 2}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>To Par:</Text>
                    <Text style={styles.summaryValue}>
                        {totalRelativeScore >= 0 ? `+${totalRelativeScore}` : totalRelativeScore}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        padding: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 15,
        color: "#666",
    },
    scorecardContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        backgroundColor: "#f9f9f9",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    dataRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    headerCell: {
        width: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    holeCell: {
        width: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    dataCell: {
        width: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    dataCellContainer: {
        width: 26,
        height: 26,
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        fontWeight: "bold",
        fontSize: 14,
    },
    dataText: {
        fontSize: 14,
    },
    summaryContainer: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 15,
        backgroundColor: "#f0f8ff",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    summaryLabel: {
        fontWeight: "bold",
        fontSize: 16,
    },
    summaryValue: {
        fontSize: 16,
    },
    bottomBorderDark: {
        borderBottomWidth: 1,
        borderBottomColor: "#999",
    },
    rightBorderLight: {
        borderRightWidth: 1,
        borderRightColor: "#ddd",
    },
    scoreBirdie: {
        backgroundColor: "#add8e6",
        borderRadius: 13,
    },
    scoreKotka: {
        backgroundColor: "#78a1af",
        borderRadius: 13,
    },
    scoreBogey: {
        backgroundColor: "#ffcccb",
        borderRadius: 3,
    },
    scoreTuplaBogey: {
        backgroundColor: "#d99f9e",
        borderRadius: 3,
    },
});
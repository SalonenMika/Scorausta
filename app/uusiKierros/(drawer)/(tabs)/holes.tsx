// HoleScreen.js (Muokattu versio)

import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, Button } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native"; // Varmista, että tämä on oikea import expo-routerille, jos käytät vain sitä
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router"; // Oikea import expo-routerille

import NumberPad from "@/components/CircleButton";
import StatBox from "@/components/StatBox";
import VaylaInfo from "@/components/VaylaInfo";

interface Hole {
    par: number;
    pituus: number; // Käytetään tätä pituutena
    hcp: number;
}

interface Course {
    club_name: string;
    course_name: string;
    vaylat: Record<number, Hole>; // Oletetaan numerot stringeinä tai numeroina, tässä numeroina
}

interface Score {
    strokes: number | null;
    putts: number | null;
    gir: boolean;
}

// Poistettu HoleScreenProps, koska käytät expo-routeria ilman suoria propseja

// AsyncStorage avain videotietojen tallennukseen
const ASYNC_STORAGE_VIDEO_KEY = "@golfRoundVideoMetadata";

export default function HoleScreen() {
    const { kentta } = useLocalSearchParams<{ kentta?: string }>(); // Tyyppi parannus
    const [course, setCourse] = useState<Course | null>(null);
    const [currentHoleIndex, setCurrentHoleIndex] = useState(1);
    const [scores, setScores] = useState<Record<number, Score>>({});
    const [activeStat, setActiveStat] = useState<"strokes" | "putts" | null>("strokes");
    // --- UUSI TILA VIDEOMETADATALLE ---
    const [recordedVideosMetadata, setRecordedVideosMetadata] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const loadData = async () => {
                try {
                    // Ladataan kurssitiedot ensin (jos tulee paramerina)
                    if (kentta && isActive && !course) { // Ladataan vain kerran, jos ei jo ladattu
                        setCourse(JSON.parse(kentta));
                    }

                    // Ladataan tallennettu kierros (sisältää kurssin, tulokset, väyläindeksin)
                    const savedRound = await AsyncStorage.getItem("currentRound");
                    if (savedRound && isActive) {
                        const { savedCourse, savedScores, savedHoleIndex } = JSON.parse(savedRound);
                        // Aseta kurssi tallennuksesta, jos se on olemassa, muuten käytä parametrina tullutta
                        if (savedCourse) {
                            setCourse(savedCourse);
                        } else if (kentta && !course) { // Varmistus, jos savedCourse puuttuu tallennuksesta
                             setCourse(JSON.parse(kentta));
                        }
                        setScores(savedScores || {}); // Varmista, että scores on objekti
                        setCurrentHoleIndex(savedHoleIndex || 1); // Varmista oletusarvo
                    } else if (kentta && isActive && !course) {
                         // Jos ei tallennettua kierrosta, mutta kenttä param, alusta tyhjillä tuloksilla
                         setCourse(JSON.parse(kentta));
                         setScores({});
                         setCurrentHoleIndex(1);
                    }


                    // --- LADATAAN VIDEOMETADATA ---
                    const savedVideosJson = await AsyncStorage.getItem(ASYNC_STORAGE_VIDEO_KEY);
                    if (savedVideosJson && isActive) {
                        setRecordedVideosMetadata(JSON.parse(savedVideosJson));
                    } else if (isActive) {
                        // Jos ei tallennettuja videoita, varmista että tila on tyhjä lista
                        setRecordedVideosMetadata([]);
                    }

                    // Vanha endRoundTrigger logiikka (voi jättää tai poistaa tarpeen mukaan)
                    const shouldEndRound = await AsyncStorage.getItem("endRoundTrigger");
                    if (shouldEndRound === "true" && isActive) {
                        await AsyncStorage.removeItem("endRoundTrigger");
                    }

                } catch (error) {
                    console.error("Virhe ladattaessa dataa (sis. videot):", error);
                     // Voit näyttää virheilmoituksen käyttäjälle
                }
            };

            loadData();

            return () => {
                isActive = false;
            };
            // Lisätään riippuvuuksiin vain `kentta`, koska `course` asetetaan sen perusteella tai AsyncStoragesta
        }, [kentta])
    );

    // Tallennetaan kierroksen tila (ilman videometadataa, se tallennetaan videoRecorderissa)
    useEffect(() => {
        const saveCurrentRound = async () => {
            if (course) { // Varmista että kurssi on ladattu
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
        // Aja tallennus vain jos jotain relevanttia on muuttunut
        if (course) { // Aja vain jos kurssi on ladattu
           saveCurrentRound();
        }
    }, [scores, currentHoleIndex, course]);

    // --- VÄYLÄNVAIHTO HANDLERIT (ennallaan) ---
    const handleNextHole = () => {
        if (course && currentHoleIndex < Object.keys(course.vaylat).length) {
            setCurrentHoleIndex(currentHoleIndex + 1);
            setActiveStat("strokes");
        } else if (course && currentHoleIndex === Object.keys(course.vaylat).length) {
            // Viimeinen väylä -> ehkä siirry yhteenvetoon?
             console.log("Kierros päättyi!");
             // Voit navigoida yhteenvetosivulle tässä
             // router.push('/roundSummary'); // Esimerkki
        }
    };

    const handlePreviousHole = () => {
        if (currentHoleIndex > 1) {
            setCurrentHoleIndex(currentHoleIndex - 1);
            setActiveStat("strokes");
        }
    };

    // --- TULOKSEN PÄIVITYS (ennallaan) ---
    const updateScore = (field: keyof Score, value: number | boolean) => {
        setScores((prev) => ({
            ...prev,
            [currentHoleIndex]: {
                ...(prev[currentHoleIndex] || { strokes: null, putts: null, gir: false }), // Varmista oletusarvot
                [field]: value,
            },
        }));

        // Päivitä aktiivinen stat-boksi
        if (field === "strokes") {
            setActiveStat("putts");
        } else if (field === "putts") {
            setActiveStat(null); // Tai siirry seuraavaan logiikan mukaan
        }
    };

    // --- LATAUSNÄKYMÄ (ennallaan) ---
    if (!course) {
        return (
            <View style={styles.container}>
                <Text>Ladataan kenttää...</Text>
            </View>
        );
    }

    // --- VIDEOKUVAUSNAPIN HANDLER (muokattu) ---
    const handleRecordPress = async () => {
        const currentHoleData = course.vaylat[currentHoleIndex];
        if (!currentHoleData) return; // Varmistus

        // Laske tämän videon indeksi nykyiselle väylälle (1-pohjainen)
        const videosForCurrentHole = recordedVideosMetadata.filter(v => v.holeIndex === currentHoleIndex);
        const nextVideoIndex = videosForCurrentHole.length + 1;

        // Kerää kameraa varten tarvittavat tiedot väylästä
        const holeInfoForCamera = {
            number: currentHoleIndex,
            par: currentHoleData.par,
            length: currentHoleData.pituus, // Käytä `pituus` kenttää
            // Voit lisätä muita tietoja tarvittaessa, esim. hcp
        };

        // Siirry videoRecorder-ruutuun parametrien kanssa
        router.push({
            pathname: "./videoRecorder", // Varmista, että tämä reitti on oikein määritelty (esim. app/videoRecorder.js)
            params: {
                // Muunna objektit ja numerot stringeiksi parametreja varten
                holeInfo: JSON.stringify(holeInfoForCamera),
                holeIndex: currentHoleIndex.toString(),
                videoIndex: nextVideoIndex.toString(),
            }
        });
    };

    const currentHole = course.vaylat[currentHoleIndex];
    const currentScore = scores[currentHoleIndex] || { strokes: null, putts: null, gir: false }; // Oletusarvot

    // --- YHTEENVETOLASKENTA (pieni parannus oletusarvoihin ja logiikkaan) ---
    const playedHoleIndices = Object.keys(scores).map(Number).filter(index => scores[index]?.strokes !== null && scores[index]?.strokes !== undefined);

    const totalStrokes = playedHoleIndices.reduce((sum, index) => sum + (scores[index]?.strokes || 0), 0);
    const totalPutts = playedHoleIndices.reduce((sum, index) => sum + (scores[index]?.putts || 0), 0);
    const totalGIR = playedHoleIndices.filter((index) => scores[index]?.gir).length;

    const totalPar = playedHoleIndices.reduce((sum, index) => {
         // Varmista että väylä löytyy kurssista ennen parin lisäämistä
         return course.vaylat[index] ? sum + course.vaylat[index].par : sum;
     }, 0);

    // Laske suhteellinen tulos vain jos pareja on laskettu
    const totalRelativeScore = totalPar > 0 ? totalStrokes - totalPar : 0;
    const girPercentage = playedHoleIndices.length > 0 ? Math.round((totalGIR / playedHoleIndices.length) * 100) : 0;

    // --- Laske tälle väylälle tallennettujen videoiden määrä ---
    const videoCountForCurrentHole = recordedVideosMetadata.filter(v => v.holeIndex === currentHoleIndex).length;

    return (
        <View style={styles.container}>
            {/* VaylaInfo käyttää nyt currentHole-objektia suoraan */}
            <VaylaInfo
                currentHoleIndex={currentHoleIndex}
                totalHoles={Object.keys(course.vaylat).length}
                currentHole={currentHole} // Välitä koko väyläobjekti
                onPrevious={handlePreviousHole}
                onNext={handleNextHole}
            />

            <View style={styles.statsContainer}>
                {/* StatBoxit ennallaan, käyttävät currentScore-objektia */}
                 <StatBox
                    label="Lyönnit"
                    value={currentScore.strokes ?? "-"} // Näytä "-" jos null
                    onPress={() => setActiveStat("strokes")}
                    isActive={activeStat === "strokes"}
                />
                <StatBox
                    label="Putit"
                    value={currentScore.putts ?? "-"} // Näytä "-" jos null
                    onPress={() => setActiveStat("putts")}
                    isActive={activeStat === "putts"}
                />
                <StatBox
                    label="GIR"
                     // Varmista että gir on boolean, näytä X jos ei määritelty
                    value={currentScore.gir === true ? "✔️" : "❌"}
                     // Päivitä vastakkaiseksi, varmista että null/undefined -> true
                    onPress={() => updateScore("gir", !currentScore.gir)}
                    isActive={false} // GIR ei ole yleensä "aktiivinen" syöttökenttä
                />
            </View>

            {/* Yhteenvetotiedot ennallaan */}
            <View style={styles.overallStats}>
                 <Text style={styles.overallText}>Tulos suhteessa pariin: {totalRelativeScore >= 0 ? `+${totalRelativeScore}` : totalRelativeScore}</Text>
                <Text style={styles.overallText}>Kokonaislyönnit: {totalStrokes}</Text>
                <Text style={styles.overallText}>Putit yhteensä: {totalPutts}</Text>
                <Text style={styles.overallText}>GIR: {girPercentage}%</Text>
            </View>

            {/* NumberPad ennallaan */}
            {activeStat && <NumberPad onPress={(value) => {
                if (typeof value === "number" && activeStat) { // Varmista activeStat ei ole null
                    updateScore(activeStat, value);
                }
            }} />}

             {/* Näytä tieto tallennetuista videoista */}
             {videoCountForCurrentHole > 0 && (
                <Text style={styles.videoInfoText}>
                    Tälle väylälle tallennettu {videoCountForCurrentHole} video(ta).
                </Text>
            )}

            {/* --- VIDEOKUVAUSNAPPI --- */}
            <Button title="Kuvaa video" onPress={handleRecordPress} />

             {/* Voit lisätä napin siirtyäksesi videoiden koostamisnäkymään */}
             {/* Esimerkki: Näytä vain jos videoita on tallennettu */}
            {recordedVideosMetadata.length > 0 && (
                <Button
                     title="Siirry videokoosteeseen"
                     //onPress={() => router.push('/videoCompilation')} // Oletetaan reitti videokoostesivulle
                     // Voit lisätä tyylittelyä tälle napille
                />
            )}

        </View>
    );
}

// --- STYLESHEET (lisää videoInfoText) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#7DC67D",
        alignItems: "center",
        // justifyContent: "center", // Voit säätää keskitystä tarpeen mukaan
        paddingTop: 50, // Lisää tilaa ylös
        paddingBottom: 20,
        paddingHorizontal: 10, // Kapeampi padding sivuilla?
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginVertical: 15, // Lisää tilaa
    },
    overallStats: {
        marginVertical: 15, // Lisää tilaa
        alignItems: "center",
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Kevyt tausta erottamaan
        borderRadius: 8,
    },
    overallText: {
        fontSize: 16, // Hieman pienempi fontti?
        fontWeight: "bold",
        marginBottom: 5,
        color: '#FFFFFF', // Valkoinen teksti paremmin luettavissa
    },
    // StatBox tyylit olivat kommentoitu pois, voit lisätä ne takaisin tarvittaessa
    // statBoxActive: { backgroundColor: "#FFD700" },
    // statBoxInactive: { backgroundColor: "#FFF" },
    videoInfoText: { // Tyyli videotietotekstille
        marginTop: 10,
        marginBottom: 10,
        fontStyle: 'italic',
        color: '#FFFFFF', // Valkoinen teksti
    },
});
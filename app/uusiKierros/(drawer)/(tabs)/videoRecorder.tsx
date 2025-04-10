import React, { useRef, useState, useEffect } from "react"; // Varmista useEffect importattu
import { Button, Pressable, StyleSheet, Text, View, Alert, AppState, ActivityIndicator } from "react-native"; // Lisätty ActivityIndicator
import { FontAwesome6 } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video"; // VideoSource poistettu, käytetään URIa
// TÄRKEÄÄ: Nyt importoidaan juuresta, kuten sanoit toimivan
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system';

export default function App() {
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null); // Ref tyyppi on nyt CameraView
    const [facing, setFacing] = useState<CameraType>("back"); // CameraType tulee nyt juuresta
    const [recording, setRecording] = useState(false);
    const [videoUri, setVideoUri] = useState<string | null>(null);

    // --- Videosoittimen Alustus ---
    // Alustetaan ilman lähdettä, lähde asetetaan useEffectissä
    const videoPlayer = useVideoPlayer(null, (player) => {
        console.log("Player Initialized");
        player.loop = true; // Aseta looppi päälle
    });

    // --- Efekti, joka reagoi videon URI:n muutokseen ---
    useEffect(() => {
        if (videoUri && videoPlayer) {
            console.log("useEffect: videoUri available, replacing source and playing", videoUri);
            // Aseta uusi lähde ja aloita toisto
            videoPlayer.replace(videoUri); // Kerro soittimelle uusi URI
            videoPlayer.play(); // Aloita toisto
        } else if (!videoUri && videoPlayer) {
            // Kun palataan kameranäkymään (videoUri on null), pysäytä soitin
            console.log("useEffect: videoUri is null, pausing player");
            videoPlayer.pause();
            videoPlayer.replace(null); // Tyhjennä lähde
        }
    }, [videoUri, videoPlayer]); // Ajetaan kun videoUri tai videoPlayer muuttuu


    // --- Sovelluksen tilan seuranta (valinnainen) ---
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState.match(/inactive|background/) && videoPlayer?.playing) {
                console.log("App state changed, pausing video.");
                videoPlayer.pause();
            }
        });
        return () => { subscription.remove(); };
    }, [videoPlayer]);


    // --- Lupien Tarkistus ---
    // Näytä latausindikaattori, kunnes lupa on tarkistettu
    if (!permission) {
         console.log("Permissions loading...");
         // Käytetään samaa tyyliä kuin luvan puuttuessa
         return <View style={styles.centered}><ActivityIndicator size="large" color="#ffffff" /></View>;
     }

    if (!permission.granted) {
        return (
            <View style={styles.centered}>
                <Text style={styles.permissionText}>
                    Tarvitsemme luvan käyttää kameraa ja mikrofonia videoita varten.
                </Text>
                {/* Käytä permission-objektin canAskAgain -tietoa, jos haluat näyttää napin eri tavalla */}
                <Button onPress={requestPermission} title={permission.canAskAgain ? "Myönnä lupa" : "Avaa Asetukset"} />
            </View>
        );
    }

    // --- Videon Nauhoitus ---
    const recordVideo = async () => {
        if (!ref.current) {
            console.log("Camera ref not available yet.");
            return;
        }

        if (recording) {
            console.log("Stopping recording...");
            // Aseta tila heti, jotta UI päivittyy (vaikka lopetus kestää hetken)
            setRecording(false);
            ref.current.stopRecording(); // Pyydä kamerakomponenttia lopettamaan
            // recordAsync promise resolvaa tai rejectaa lopetuksen jälkeen
            return;
        }

        console.log("Starting recording...");
        setRecording(true);
        setVideoUri(null); // Tyhjennä edellinen video

        try {
            const video = await ref.current.recordAsync({
                 // maxDuration: 30, // Voit lisätä maksimikeston
            });
            // recordAsync promise resolvaa vasta kun nauhoitus on oikeasti päättynyt
            setRecording(false); // Varmista tila tässä (vaikka asetettiin jo stopissa)

            if (video?.uri) {
                console.log("Video recorded successfully:", video.uri);
                // Poistettu FileSystem.getInfoAsync - turha tässä vaiheessa
                setVideoUri(video.uri); // Aseta URI, useEffect hoitaa toiston
            } else {
                console.warn("Recording finished but no video URI received.");
                // Varmistetaan tila
                 setRecording(false);
            }
        } catch (error) {
            console.error("Error during recording:", error);
            Alert.alert("Nauhoitusvirhe", `Videon nauhoitus epäonnistui: ${error}`);
            setRecording(false); // Varmista, että tila palautuu virhetilanteessa
        }
    };

    // --- Kameran Vaihto ---
    const toggleFacing = () => {
        if (recording) return; // Älä vaihda nauhoituksen aikana
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    // --- Renderöinti ---
    return (
        <View style={styles.container}>
            {!videoUri ? (
                // --- Kameranäkymä ---
                <CameraView // Käytetään CameraView (importattu juuresta)
                    style={styles.camera}
                    ref={ref}
                    facing={facing}
                    mode="video"
                    // onError={(e) => console.error("CameraView Error:", e.nativeEvent.message)}
                >
                    <View style={styles.controlsContainer}>
                         <View style={{width: 60}}/>
                        <Pressable onPress={recordVideo} disabled={!permission?.granted}>
                            {({ pressed }) => (
                                <View style={[ styles.shutterBtn, { opacity: pressed ? 0.7 : 1 } ]}>
                                    <View style={[
                                            styles.shutterBtnInner,
                                            { backgroundColor: recording ? "white" : "red" },
                                            recording ? styles.stopIcon : styles.recordIcon,
                                        ]}
                                    />
                                </View>
                            )}
                        </Pressable>
                        <Pressable onPress={toggleFacing} disabled={recording} style={styles.controlButton}>
                              <FontAwesome6 name="rotate-left" size={28} color={recording? "grey" : "white"} />
                        </Pressable>
                    </View>
                </CameraView>
            ) : (
                // --- Videon Esikatselu ---
                <View style={styles.videoPreviewContainer}>
                    <Text style={styles.previewText}>Nauhoitettu video:</Text>
                    {videoUri && (
                        <VideoView
                            player={videoPlayer}
                            style={styles.video} // Käyttää aspectRatioa
                            allowsFullscreen
                            // nativeControls={true} // Kommentoitu pois loopin vuoksi
                        />
                    )}
                    <View style={styles.buttonContainer}>
                        <Button title="Kuvaa uusi video" onPress={() => setVideoUri(null)} />
                         {/* Tähän tallennus/lähetysnappi */}
                         {/* <Button title="Tallenna / Lähetä" onPress={() => { console.log("Tallennetaan/Lähetetään:", videoUri); /* Toteuta logiikka *\/ }} /> */}
                    </View>
                </View>
            )}
        </View>
    );
}

// --- Tyylit (Pidetty pääosin ennallaan) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    centered: {
         flex: 1,
         backgroundColor: "#000",
         alignItems: "center",
         justifyContent: "center",
         padding: 20,
     },
     permissionText: {
        textAlign: "center",
        color: "white",
        fontSize: 16,
        marginBottom: 20,
     },
    camera: {
        flex: 1,
        width: "100%",
        justifyContent: 'flex-end',
    },
    controlsContainer: {
        paddingBottom: 40,
        width: "100%",
        backgroundColor: 'rgba(0,0,0,0.3)',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 30,
        paddingTop: 15,
    },
     controlButton: {
         padding: 10,
         width: 60,
         height: 60,
         justifyContent: 'center',
         alignItems: 'center',
     },
    shutterBtn: {
        backgroundColor: "transparent",
        borderWidth: 4,
        borderColor: "white",
        width: 75,
        height: 75,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    shutterBtnInner: {
        width: 60,
        height: 60,
    },
     recordIcon: {
         borderRadius: 30,
         backgroundColor: 'red',
     },
     stopIcon: {
         borderRadius: 5,
         backgroundColor: 'white',
         width: 35,
         height: 35,
     },
    videoPreviewContainer: {
         flex: 1,
         justifyContent: "center",
         alignItems: "center",
         padding: 10,
         backgroundColor: '#000',
     },
     previewText: {
        textAlign: "center",
        marginBottom: 15,
        color: "white",
        fontSize: 18,
     },
    video: {
        width: "100%",
        aspectRatio: 16 / 9, // Säilyttää kuvasuhteen
        backgroundColor: 'black',
    },
     buttonContainer: {
        marginTop: 20,
        width: '80%',
        alignItems: 'center',
     }
});
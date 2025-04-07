import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Link } from 'expo-router';
import { initDatabase } from "@/utils/database";
import Button from '@/components/Button';
import { BlurView } from 'expo-blur';  // Käytämme expo-blur-komponenttia
import { LinearGradient } from 'expo-linear-gradient';  // Gradientti reunoille

export default function Index() {

    useEffect(() => {
        initDatabase();
    }, []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.backgroundCircleWrapper}>
                {/* Lisää gradientti reunoille */}
                <LinearGradient
                    colors={['rgba(233, 200, 147, 0)', 'rgb(233, 200, 147)', 'rgba(233, 200, 147, 0)']} // Haalean reunan luominen
                    style={styles.backgroundCircle}
                >
                </LinearGradient>
            </View>
            <View style={styles.buttonsContainer}>
                <View style={styles.row}>
                    <View style={styles.buttonContainer}>
                        <Link href="/uusiKierros" asChild>
                            <Button label="Uusi kierros" theme="primary" icon="sports-golf" />
                        </Link>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Link href="/hiiistoria" asChild>
                            <Button label="Historia" theme="primary" icon="analytics" />
                        </Link>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.buttonContainer}>
                        <Button label="Kentat" theme="primary" icon="golf-course" />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button label="Pelit" theme="primary" icon="videogame-asset" />
                    </View>
                </View>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3CC47C',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    backgroundCircleWrapper: {
        position: 'absolute',  // Absoluuttinen sijainti, jotta se ei mene muiden komponenttien päälle
        top: -200,  // Asetetaan ympyrä ruudun yläreunaan, vain alapuoli näkyy
        left: '0%',  // Sijoittaa ympyrän keskelle vaakasuunnassa
        transform: [{ translateX: -200 }],  // Korjaa ympyrän sijaintia, jotta se on tasan keskellä
        width: 800,  // Asetetaan ympyrän koko
        height: 500,
        borderRadius: 200,  // Asetetaan ympyrän muoto
        zIndex: -1,  // Varmistaa, että ympyrä on muiden komponenttien alla
    },
    backgroundCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 200,  // Ympyrän pyöristys
        overflow: 'hidden',  // Varmistaa, ettei blur ulotu ympyrän ulkopuolelle
    },
    buttonsContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 80,
        paddingHorizontal: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    buttonContainer: {
        flex: 1,
        marginHorizontal: 10,
    },
});

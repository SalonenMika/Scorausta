import React from "react";
import { Drawer } from "expo-router/drawer";
import { Feather } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveRound } from "@/utils/database"; 

// Määritellään HoleWithScore tässä, jotta virhe poistuu
interface Hole {
    par: number;
    pituus: number;
    hcp: number;
}

interface HoleWithScore extends Hole {
    strokes: number | null;
    putts: number | null;
    gir: boolean;
}

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {

    const confirmEndRound = () => {
        Alert.alert(
            "Oletko varma?",
            "Haluatko varmasti lopettaa kierroksen?",
            [
                {
                    text: "Peruuta",
                    style: "cancel",
                },
                {
                    text: "Kyllä",
                    onPress: () => handleEndRound(),
                },
            ]
        );
    };
    
    // Kierroksen tallennus ja poistaminen aktiivisesta muistista
    const handleEndRound = async () => {
        try {
            const savedRound = await AsyncStorage.getItem("currentRound");
            if (savedRound) {
                const { savedCourse, savedScores, savedHoleIndex } = JSON.parse(savedRound);
    
                // Kutsu handleSaveRoundia (voidaan ottaa logiikka siirrettynä HolesScreenistä tähän)
                const vaylat = Object.keys(savedCourse.vaylat).reduce((acc, holeNumber) => {
                    const holeIndex = parseInt(holeNumber);
                    const hole = savedCourse.vaylat[holeIndex];
                    const score = savedScores[holeIndex] || {}; 
                    acc[holeIndex] = {
                        ...hole,
                        strokes: score.strokes || null,
                        putts: score.putts || null,
                        gir: score.gir || false,
                    };
                    return acc;
                }, {} as Record<number, HoleWithScore>);
    
                console.log("Tallennettavat tiedot:");
                console.log("Kenttä:", savedCourse.course_name, savedCourse.club_name);
                console.log("Väylät ja tilastot:", vaylat);
                console.log("Pisteet:", savedScores);
    
                // Tallenna kierros ja väylät SQLite:hen
                await saveRound(savedCourse.course_name, savedCourse.club_name, savedScores, vaylat);
    
                // Poistetaan tallennettu kierros
                await AsyncStorage.removeItem("currentRound");
            }
            await AsyncStorage.setItem("endRoundTrigger", "true");
            router.push("/"); // Palaa aloitusnäyttöön
        } catch (error) {
            console.error("Virhe kierroksen lopetuksessa:", error);
        }
    };

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItem 
                icon={({color, size}) => (
                    <Feather name="list" color={color} size={24} />   
                )}
                label="Kierrokset"
                onPress={() => {router.push('/uusiKierros/(drawer)/(tabs)/holes')}}
            />
            <DrawerItem 
                icon={({color, size}) => (
                    <Feather name="map" color={color} size={24} />   
                )}
                label="GPS"
                onPress={() => {router.push('/uusiKierros/(drawer)/(tabs)/gps')}}
            />
            <DrawerItem 
                icon={({color, size}) => (
                    <Feather name="stop-circle" color={color} size={24} />   
                )}
                label="Lopeta kierros"
                onPress={confirmEndRound} // Kutsutaan tallennusfunktiota
            />
        </DrawerContentScrollView>
    );
};

export default function Layout() {
    return (
      <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{headerShown: false}}>
      </Drawer>
    );
}

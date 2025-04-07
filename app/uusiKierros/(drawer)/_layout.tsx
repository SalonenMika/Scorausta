import React from "react";
import {Drawer} from "expo-router/drawer";
import { Feather } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveRound } from "@/utils/database"; 


const CustomDrawerContent = (props) => {

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
                const { savedCourse, savedScores } = JSON.parse(savedRound);
                await saveRound(savedCourse.course_name, savedCourse.club_name, savedScores, savedCourse.vaylat);
                await AsyncStorage.removeItem("currentRound");
            }
            await AsyncStorage.setItem("endRoundTrigger", "true");
            router.push("/");
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
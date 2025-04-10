import { View, Text, Button } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function _layout() {
  return (
    <Tabs
      screenOptions={{
        headerTransparent: true, // Header on läpinäkyvä
        headerLeft: () => <DrawerToggleButton tintColor="#000" />,
        headerStyle: {
          backgroundColor: 'transparent', // Varmistaa että tausta on läpinäkyvä
          borderBottomWidth: 0, // Poistaa alarajaviivan
        },
        headerTitleStyle: {
          color: '0000', // Tekstin väri, jotta se näkyy tummalla taustalla
        },
        tabBarStyle: {
          position: 'absolute',
          height: 60, // Tab barin korkeus
          backgroundColor: 'rgba(26, 119, 69, 0.7)', // Taustan vihreä väri (#3CC47C) ja hieman läpinäkyvyyttä
          borderTopWidth: 1, // Ohut viiva tab barin yläreunassa
          borderTopColor: 'black', // Valkoinen vaalea rajaviiva
          borderRadius: 8, // Kulmien pyöristäminen
          shadowColor: 'transparent', // Varjon väri
          alignItems: 'center', // Asettaa ikonit vaakasuoraan keskelle
          justifyContent: 'center', // Asettaa ikonit pystysuoraan keskelle
          paddingBottom: 10, // Lisää tilaa tab barin alareunaan
          paddingHorizontal: 10, // Lisää tilaa vasemmalle ja oikealle
        },
        tabBarIconStyle: {
          marginTop: 5, // Lisää hieman tilaa ylös
          width: 30, // Rajaa ikonien kokoa
          height: 30, // Rajaa ikonien kokoa
        },
        tabBarActiveTintColor: 'white', // Asettaa aktiivisen tabin ikonin värin valkoiseksi
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Asettaa inaktiivisen tabin ikonin värin vaaleaksi
      }}
    >
      <Tabs.Screen
        name="holes"
        options={{
          tabBarIcon: ({ color }) => <Feather name="list" size={24} color={color} />,
          tabBarLabel: 'Tuloskortti',
          headerTitle: 'Tuloskortti',
        }}
      />
      <Tabs.Screen
        name="gps"
        options={{
          tabBarIcon: ({ color }) => <Feather name="map" size={24} color={color} />,
          tabBarLabel: 'GPS',
          headerTitle: 'GPS',
        }}
      />
      <Tabs.Screen
        name="ogScore"
        options={{
          tabBarIcon: ({ color }) => <Feather name="file-text" size={24} color={color} />,
          tabBarLabel: "Tuloskortti",
          headerTitle: "Tuloskortti",
        }}
      />
      <Tabs.Screen
        name="videoRecorder"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

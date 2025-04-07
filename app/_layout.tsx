import { Stack } from 'expo-router';
import { LogBox} from 'react-native';
import React from 'react';


LogBox.ignoreAllLogs(true);

export default function RootLayout() {
    return (
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
                <Stack.Screen name="uusiKierros" options={{ headerShown: false }}/>
                <Stack.Screen name="hiiistoria" options={{ headerShown: false }}/>
            </Stack>
    );
}

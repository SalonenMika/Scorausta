import { Stack } from 'expo-router';
import { LogBox} from 'react-native';
import React from 'react';


LogBox.ignoreAllLogs(true);

export default function RootLayout() {
    return (
            <Stack>
                <Stack.Screen name="index" />
                <Stack.Screen name="round/[id]" />
            </Stack>
    );
}
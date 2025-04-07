import { Text, View, StyleSheet } from 'react-native'
import React from 'react'

export default function MenuScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Menu tulossa joskus</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
    },
});
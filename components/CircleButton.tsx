import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface NumberPadProps {
    onPress: (value: number | string) => void;
}

export default function NumberPad({ onPress }: NumberPadProps) {
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    return (
        <View style={styles.keyboard}>
            {keys.map((num, index) => (
                <TouchableOpacity key={index} style={styles.key} onPress={() => onPress(num)}>
                    <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    keyboard: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: "100%",
        justifyContent: "center",
        marginTop: 20,
    },
    key: {
        width: "18%",
        aspectRatio: 1,
        margin: 5,
        backgroundColor: "#828081",
        padding: 15,
        alignItems: "center",
        borderRadius: 5,
    },
    keyText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF"
    },
});
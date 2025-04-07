import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Hole {
    par: number;
    pituus: number;
    hcp: number;
}

interface Props {
    currentHoleIndex: number;
    totalHoles: number;
    currentHole: Hole;
    onPrevious: () => void;
    onNext: () => void;
}

export default function VaylaInfo({ currentHoleIndex, totalHoles, currentHole, onPrevious, onNext }: Props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPrevious} disabled={currentHoleIndex === 1}>
                <Ionicons name="arrow-back-circle" size={32} color={currentHoleIndex === 1 ? "gray" : "black"} />
            </TouchableOpacity>

            <View style={styles.infoBox}>
                <Text style={styles.text}>Väylä {currentHoleIndex}</Text>
                <Text style={styles.text}>Par: {currentHole.par}</Text>
                <Text style={styles.text}>Pituus: {currentHole.pituus}m</Text>
                <Text style={styles.text}>Hcp: {currentHole.hcp}</Text>
            </View>

            <TouchableOpacity onPress={onNext} disabled={currentHoleIndex === totalHoles}>
                <Ionicons name="arrow-forward-circle" size={32} color={currentHoleIndex === totalHoles ? "gray" : "black"} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 10,
        width: "100%",
        marginBottom: 20,
        elevation: 5,
    },
    infoBox: {
        alignItems: "center",
    },
    text: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
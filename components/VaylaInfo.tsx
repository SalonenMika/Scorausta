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
                <Ionicons name="chevron-back-outline" size={32} color={currentHoleIndex === 1 ? "gray" : "white"} />
            </TouchableOpacity>

            <View style={styles.infoBox}>
                <View style={styles.infoItem}>
                    <Text style={styles.number}>{currentHoleIndex}</Text>
                    <Text style={styles.text}>Väylä</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.number}>{currentHole.par}</Text>
                    <Text style={styles.text}>Par</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.number}>{currentHole.pituus}m</Text>
                    <Text style={styles.text}>Pituus</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.number}>{currentHole.hcp}</Text>
                    <Text style={styles.text}>Hcp</Text>
                </View>
            </View>

            <TouchableOpacity onPress={onNext} disabled={currentHoleIndex === totalHoles}>
                <Ionicons name="chevron-forward-outline" size={32} color={currentHoleIndex === totalHoles ? "gray" : "white"} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(130, 128, 129, 0.5)", // Läpinäkyvä tausta
        padding: 15,
        borderRadius: 8, // Pienempi pyöristys, jos haluat terävämmät reunat
        width: "100%",
        marginBottom: 20,
        borderWidth: 0, // Poistaa reunan viivan
    },
    infoBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1, // Take the available space between the arrows
        marginHorizontal: 20,
    },
    infoItem: {
        alignItems: "center",
    },
    number: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white"
    },
    text: {
        fontSize: 12,
        fontWeight: "normal",
        color: "white"
    },
});

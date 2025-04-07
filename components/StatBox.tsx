import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface StatBoxProps {
    label: string;
    value: number | string | boolean;
    onPress: () => void;
    isActive?: boolean;
}

export default function StatBox({ label, value, onPress, isActive }: StatBoxProps) {
    const displayValue = typeof value === "boolean" ? (value ? "✔️" : "❌") : value;

    return (
        <TouchableOpacity 
            style={[styles.statBox, isActive && styles.activeBox]} 
            onPress={onPress}
        >
            <Text style={styles.statText}>{label}</Text>
            <Text style={styles.statNumber}>{displayValue}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    statBox: {
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    activeBox: {
        backgroundColor: "#FFD700", // Korostettu keltainen tausta
    },
    statText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    statNumber: {
        fontSize: 20,
        marginTop: 5,
    },
});

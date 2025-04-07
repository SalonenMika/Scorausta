import React, { forwardRef } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
    label: string;
    theme?: 'primary';
    onPress?: () => void;
    icon: string;
};

const Button = forwardRef<View, Props>(({ label, theme, onPress, icon }, ref) => {
    if (theme === 'primary') {
        return (
            <View ref={ref} style={styles.buttonContainer}>
                <Pressable style={[styles.button]} onPress={onPress}>
                    <MaterialIcons name={icon as any} size={70} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={[styles.buttonLabel]}>{label}</Text>
                </Pressable>
            </View>
        );
    }

    return <View ref={ref} style={styles.buttonContainer} />;
});

const styles = StyleSheet.create({
    buttonContainer: {
        width: 170,  // Suurennettu leveys
        height: 150, // Suurennettu korkeus
        marginHorizontal: 0, // Lisää tilaa nappien väliin
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#3FB172', // Määritä nappi vihreäksi
    },
    buttonIcon: {
        marginBottom: 8,
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 14, // Pienennetään tekstin kokoa
    },
});

export default Button;

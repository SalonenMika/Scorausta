import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
    return (
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#ffffff', // Aktiivisen tabin väri (valkoinen)
            tabBarInactiveTintColor: '#ffffff',
            headerShown: false, // Piilottaa otsikon
            tabBarStyle: {
                position: "absolute",
                height: 70, // Tab barin korkeus
                backgroundColor: "rgba(26, 119, 69, 0.7)", // Taustan vihreä väri (#3CC47C) ja hieman läpinäkyvyyttä
                borderTopWidth: 1, // Ohut viiva tab barin yläreunassa
                borderTopColor: 'black', // Valkoinen vaalea rajaviiva
                borderRadius: 8, // Kulmien pyöristäminen
                shadowColor: "transparent", // Varjon väri
                alignItems: 'center', // Asettaa ikonit vaakasuoraan keskelle
                justifyContent: 'center', // Asettaa ikonit pystysuoraan keskelle
                paddingBottom: 10, // Lisää tilaa tab barin alareunaan
                paddingHorizontal: 10, // Lisää tilaa vasemmalle ja oikealle
            },
            tabBarIconStyle: {
                marginTop: 5, // Lisää hieman tilaa ylös
                width: 40, // Rajaa ikonien kokoa
                height: 40, // Rajaa ikonien kokoa
            },
        }}
        >
            <Tabs.Screen
                name="menu"
                options={{
                    title: ' ',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'menu-sharp' : 'menu-outline'} color={color} size={40}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: ' ',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'home-sharp' : 'home-outline'}
                            color={color}
                            size={40} // Muuttaa kokoa aktiivisena ollessaan
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="premium"
                options={{
                    title: '',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'medal-sharp' : 'medal-outline'} color={color} size={40} />
                    ),
                }}
            />
        </Tabs>
    );
}

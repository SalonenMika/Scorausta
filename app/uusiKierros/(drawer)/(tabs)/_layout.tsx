import { View, Text, Button } from 'react-native'
import React from 'react'
import { Tabs, router } from 'expo-router'
import { Feather, AntDesign } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function _layout() {
  return (
   <Tabs screenOptions={{headerLeft: () => <DrawerToggleButton tintColor='#000' />}}>
    <Tabs.Screen name='holes' options={{
      tabBarIcon: ({color}) => (
        <Feather name="list" size={24} color={color} />
      ),
      tabBarLabel: 'Tuloskortti',
      headerTitle: 'Tuloskortti',
    }} />
    <Tabs.Screen name='gps' options={{
      tabBarIcon: ({color}) => (
        <Feather name="map" size={24} color={color} />
      ),
      tabBarLabel: 'GPS',
      headerTitle: 'GPS',
    }} />
   </Tabs>
  )
}
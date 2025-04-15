import ComingSoonScreen from '#/pages/ComingSoonScreen/ComingSoonScreen';
import DiaryScreen from '#/pages/DiaryScreen/DiaryScreen';
import SettingsScreen from '#/pages/SettingsScreen/SettingsScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {RootStackParamsList, Screens} from './type';
import Footer from '#/components/Footer';
import {MovieScreen} from '#/pages/MovieScreen/MovieScreen';
import AddMovieScreen from '#/pages/MovieScreen/AddMovieScreen';
import {ListMovieScreen} from '#/pages/MovieScreen/ListMovieScreen';
import {MovieDetailScreen} from '#/pages/MovieScreen/MovieDetailScreen';
import {SearchMovieScreen} from '#/pages/SearchMovieScreen';
import {RateScreen} from '#/pages/MovieScreen/RateScreen';
import NotificationsScreen from '#/pages/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamsList>();
const Tab = createBottomTabNavigator<RootStackParamsList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      tabBar={props => <Footer {...props} />}>
      <Tab.Screen name={Screens.MovieScreen} component={MovieScreen} />
      <Tab.Screen name={Screens.DiaryScreen} component={DiaryScreen} />
      <Tab.Screen
        name={Screens.ComingSoonScreen}
        component={ComingSoonScreen}
      />
      <Tab.Screen name={Screens.SettingsScreen} component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={Screens.MainScreen} component={TabNavigator} />
      <Stack.Screen name={Screens.RateScreen} component={RateScreen} />
      <Stack.Screen
        name={Screens.ListMovieScreen}
        component={ListMovieScreen}
      />
      <Stack.Screen
        name={Screens.MovieDetailScreen}
        component={MovieDetailScreen}
      />
      <Stack.Screen name={Screens.AddMovieScreen} component={AddMovieScreen} />
      <Stack.Screen
        name={Screens.SearchMovieScreen}
        component={SearchMovieScreen}
      />
      <Stack.Screen
        name={Screens.NotificationsScreen}
        component={NotificationsScreen}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;

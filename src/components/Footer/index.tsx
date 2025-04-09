import {Screens} from '#/navigator/type';
import {colors} from '#/themes/colors';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Icon} from 'react-native-paper';

const Footer: React.FC<BottomTabBarProps> = ({navigation, state}) => {
  const [selected, setSelected] = useState(Screens.MovieScreen);
  const navigateScreen = (name: string) => {
    navigation.navigate(name);
  };

  const handlePress = (buttonName: string) => {
    setSelected(buttonName);
    navigateScreen(buttonName);
  };

  const Button = ({
    name,
    icon,
    label,
  }: {
    name: string;
    icon: string;
    label: string;
  }) => (
    <TouchableOpacity
      style={[styles.button, selected === name && styles.selectedButton]}
      onPress={() => handlePress(name)}>
      <Icon
        source={icon}
        size={24}
        color={selected === name ? '#fff' : '#3d3d3d'}
      />
      <Text
        style={[
          styles.textButton,
          selected === name && styles.selectedTextButton,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.groupButton}>
      <Button name={Screens.MovieScreen} icon="home" label="Movie" />
      <Button name={Screens.DiaryScreen} icon="bell-outline" label="Diary" />
      <Button
        name={Screens.ComingSoonScreen}
        icon="chart-bar"
        label=" Coming Soon"
      />
      <Button
        name={Screens.SettingsScreen}
        icon="cog-outline"
        label="Settings"
      />
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  groupButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.Primary,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  selectedButton: {
    borderRadius: 10,
  },
  textButton: {
    color: '#3d3d3d',
    fontSize: 12,
    marginTop: 4,
  },
  selectedTextButton: {
    color: '#fff',
  },
});

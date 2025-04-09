import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  DefaultTheme,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
  configureFonts,
  useTheme,
} from 'react-native-paper';
import {customText} from 'react-native-paper';
import {MD3Type} from 'react-native-paper/lib/typescript/types';
import {colors} from './colors';

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});
type TextVariant =
  | 'Title1'
  | 'Title2'
  | 'Title3'
  | 'Title4'
  | 'Headline1'
  | 'Headline2'
  | 'Headline3'
  | 'SubHeadline0'
  | 'SubHeadline1'
  | 'SubHeadline2'
  | 'Body1'
  | 'Body2'
  | 'Captions';

export const TextVariantConfig: Record<TextVariant, MD3Type> = {
  Title1: {
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 45,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  Title2: {
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 38,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  Title3: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 32,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  Title4: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 23,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  Headline1: {
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 35,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  Headline2: {
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  Headline3: {
    fontWeight: undefined,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  SubHeadline0: {
    fontWeight: undefined,
    fontSize: 24,
    lineHeight: 24,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  SubHeadline1: {
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  SubHeadline2: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  Body1: {
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  Body2: {
    fontWeight: undefined,
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'system',
    letterSpacing: 0,
  },
  Captions: {
    fontWeight: undefined,
    fontSize: 14,
    lineHeight: 14.25,
    fontFamily: 'system',
    letterSpacing: 0,
  },
};

export const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
  },
};
export const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  fonts: configureFonts({
    config: TextVariantConfig,
  }),
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: '#000',
    primaryContainer: '#1c1c1e',
    background: colors.Bg,

    onPrimary: '#000',
    onSurfaceVariant: '#0A84FF',

    tertiaryContainer: '#7676803D',

    secondaryContainer: '#2C2C2E',
    labelSecondary: '#EBEBF599',
    labelPrimary: '#636366',
    text: '#fff',
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.Primary,
    secondary: colors.Primary,
  },
};
export type AppTheme = typeof CombinedDarkTheme;

export const useAppTheme = () => useTheme<AppTheme>();

export const Text = customText<TextVariant>();

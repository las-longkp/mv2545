import {colors} from '#/themes/colors';
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Icon} from 'react-native-paper';

const {width} = Dimensions.get('window');

interface MovieCardProps {
  id: number | string;
  title: string;
  posterPath: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  type: 'add' | 'show';
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterPath,
  size = 'medium',
  onPress,
  type,
}) => {
  const getCardDimensions = () => {
    switch (size) {
      case 'small':
        return {
          width: width / 3 - 20,
          height: (width / 3 - 20) * 1.5,
        };
      case 'large':
        return {
          width: width - 40,
          height: (width - 40) * 1.2,
        };
      case 'medium':
      default:
        return {
          width: width / 2 - 25,
          height: (width / 2 - 25) * 1.5,
        };
    }
  };

  const dimensions = getCardDimensions();

  const getPosterUrl = () => {
    if (posterPath.startsWith('http') || posterPath.startsWith('file')) {
      return posterPath;
    }
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, {width: dimensions.width}]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={[styles.card, {height: dimensions.height}]}>
        {type === 'add' ? (
          <View
            style={[
              styles.poster,
              {
                backgroundColor: colors.Primary3,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
            <Icon size={44} source="plus-circle-outline" />
          </View>
        ) : (
          <Image
            source={{uri: getPosterUrl()}}
            style={styles.poster}
            resizeMode="cover"
          />
        )}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, size === 'small' && styles.smallTitle]}
            numberOfLines={2}>
            {type === 'add' ? 'Add movie' : title}
          </Text>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 50,
              backgroundColor: '#fff',
              opacity: 10,
              position: 'absolute',
              bottom: -15,
              left: dimensions.width / 2 - 11,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  poster: {
    width: '100%',
    height: '75%',
  },
  titleContainer: {
    backgroundColor: colors.Primary2,
    borderTopColor: '#fff',
    borderTopWidth: 2,
    height: '25%',
    paddingTop: 12,
    position: 'relative',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  smallTitle: {
    fontSize: 12,
  },
});

export default MovieCard;

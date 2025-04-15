import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {IconButton} from 'react-native-paper';

type StarRatingProps = {
  rating: number;
  onRatingChange: (rating: number) => void;
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onRatingChange(i)}
          style={styles.starContainer}>
          <IconButton
            icon={i <= rating ? 'star' : 'star-outline'}
            size={40}
            iconColor="#0F4C3A"
            style={{margin: 0}}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  return <View style={styles.container}>{renderStars()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: 2,
  },
});

import {DiaryEntry} from '#/navigator/type';
import {colors} from '#/themes/colors';
import {getPosterUrl} from '#/utils/image';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {IconButton} from 'react-native-paper';

interface DiaryEntryCardProps {
  item: DiaryEntry;
  onDelete: (id: string) => void;
  onClick: (movie: DiaryEntry) => void;
}

const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({
  item,
  onDelete,
  onClick,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onClick(item)}
      style={styles.entryContainer}>
      <View style={styles.entryCard}>
        <Image
          source={{uri: getPosterUrl(item.posterPath || '')}}
          style={styles.entryPoster}
          resizeMode="cover"
        />
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>
              {item.title} ({item.year})
            </Text>
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              <IconButton
                icon="close"
                size={20}
                iconColor="#0F4C3A"
                style={{margin: 0}}
                onPress={() => onDelete(item.id)}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <IconButton
                key={`star-${star}`}
                icon={star <= item.rating ? 'star' : 'star-outline'}
                size={24}
                iconColor={colors.Primary}
                style={styles.starIcon}
              />
            ))}
          </View>

          <Text style={styles.reviewText} numberOfLines={4}>
            {item.review}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  entryContainer: {
    marginBottom: 15,
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  entryPoster: {
    width: 100,
    height: 140,
  },
  entryContent: {
    flex: 1,
    padding: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F4C3A',
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    margin: 0,
  },
  reviewText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
});
export default React.memo(DiaryEntryCard);

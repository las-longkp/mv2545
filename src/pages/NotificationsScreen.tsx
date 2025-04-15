import {MovieType} from '#/navigator/type';
import {colors} from '#/themes/colors';
import {useIsNotificationSetList} from '#/useLocalStorageSWR';
import notifee from '@notifee/react-native';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {IconButton} from 'react-native-paper';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const {data: dataNotificationList, saveData: saveDataNotificationList} =
    useIsNotificationSetList();

  const handleDismissNotification = (notificationId: string) => {
    Alert.alert(
      'Dismiss Notification',
      'Are you sure you want to dismiss this notification?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Dismiss',
          onPress: async () => {
            await notifee.cancelNotification(notificationId);
            const updatedNotifications = (dataNotificationList || []).filter(
              notification => notification.id !== notificationId,
            );
            saveDataNotificationList(updatedNotifications);
          },
        },
      ],
    );
  };

  const handleNotificationPress = (notification: MovieType) => {
    const updatedNotifications = (dataNotificationList || []).map(item =>
      item.id === notification.id ? {...item, isRead: true} : item,
    );
    saveDataNotificationList(updatedNotifications);
  };

  const renderNotificationItem = ({item}: {item: MovieType}) => (
    <TouchableOpacity
      style={[styles.notificationCard]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.9}>
      <Image
        source={{uri: item.backdrop_path}}
        style={styles.notificationPoster}
        resizeMode="cover"
      />

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.notificationTitle}>
              {item.title} ({item.release_date})
            </Text>
          </View>

          <IconButton
            icon="close"
            size={20}
            iconColor="#0F4C3A"
            onPress={() => handleDismissNotification(item.id.toString())}
            style={{margin: 0, padding: 0}}
          />
        </View>

        <Text style={styles.notificationDescription} numberOfLines={3}>
          {item.overview}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconButton
        icon="bell-off-outline"
        size={60}
        iconColor="#CCCCCC"
        disabled
      />
      <Text style={styles.emptyText}>No notifications</Text>
      <Text style={styles.emptySubtext}>
        You don't have any notifications at the moment
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ImageBackground
        source={{uri: 'blobBackground'}}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.header}>
          <IconButton
            onPress={() => navigation.goBack()}
            icon="chevron-left"
            size={28}
            iconColor={colors.Primary2}
            style={{margin: 0}}
          />
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={{width: 28}} />
        </View>

        <FlatList
          data={dataNotificationList || []}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F4C3A',
    textAlign: 'center',
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  readNotificationCard: {
    opacity: 0.7,
  },
  notificationPoster: {
    width: 100,
    height: 140,
  },
  notificationContent: {
    flex: 1,
    padding: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F4C3A',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 14,
    color: '#666666',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#0F4C3A',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F4C3A',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
});

export default NotificationsScreen;

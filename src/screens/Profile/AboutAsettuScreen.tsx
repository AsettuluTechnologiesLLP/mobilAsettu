import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import logger from '../../utils/logger';

const AboutAsettuScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    logger.debug('AboutAsettuScreen >>>> Mounted');
    return () => {
      logger.debug('AboutAsettuScreen <<<< UnMounted');
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ✅ Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* ✅ Title */}
      <Text style={styles.title}>About Asettu</Text>

      {/* ✅ Description and Terms */}
      <ScrollView style={styles.descriptionContainer}>
        <Text style={styles.description}>
          Asettu is your smart companion for managing assets, raising service requests, tracking
          warranties, and connecting with OEMs in one unified app. Built for consumers who want
          convenience, security, and seamless service experiences. Future updates will enable
          product resale, warranty extension purchases, and much more.
        </Text>

        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={styles.description}>
          By using Asettu, you agree to our terms of service and privacy policy. We are committed to
          protecting your personal data and providing a secure platform for managing all your
          household or business assets.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0191A7',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    color: '#0191A7',
  },
  descriptionContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
});

export default AboutAsettuScreen;

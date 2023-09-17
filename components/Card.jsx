import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Card = ({ card }) => (
  <View style={styles.card}>
    <Image source={card.image} style={styles.cardImage} />
    <LinearGradient
      colors={['transparent','transparent','transparent','transparent','transparent','transparent', 'black']}
      style={styles.blackGradient}
    />
    <LinearGradient colors={['#4caf50', '#8bc34a']} style={styles.tagBox}>
      <Text style={styles.tagText}>{card.tag}</Text>
    </LinearGradient>
    <Text style={styles.promptText}>{card.prompt}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 20,
    backgroundColor: 'white',
    position: 'absolute',
    padding: 0,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 20,
  },
  blackGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tagBox: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'green',
    alignSelf: 'flex-start',
    margin: 10,
  },
  tagText: {
    color: 'white',
    fontWeight: 'bold',
  },
  promptText: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Card;

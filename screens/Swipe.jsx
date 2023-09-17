import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Entypo from 'react-native-vector-icons/Entypo';

const { width, height } = Dimensions.get('window');

const data = [
  {
    id: '1',
    image: require('../assets/two-cats.png'), // Replace with your image
    prompt: 'This is the first prompt',
    tag: 'Art',
  },
  {
    id: '2',
    image: require('../assets/two-cats2.png'), // Replace with your image
    prompt: 'This is the second prompt',
    tag: 'Art',
  },
  // ... other cards
];

function Card({ item }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      rotation.value = translateX.value / 10;
    },
    onEnd: () => {
      if (Math.abs(translateX.value) > width * 0.25) {
        translateX.value = withSpring(translateX.value > 0 ? width : -width);
        translateY.value = withSpring(0);
        rotation.value = withSpring(translateX.value > 0 ? 15 : -15);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    },
  });

  const panStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>

        <Animated.View style={[styles.card, panStyle]}>
            <Image source={item.image} style={styles.image} />
            <LinearGradient
            colors={['transparent', 'black']}
            style={styles.blackGradient}
            ></LinearGradient>
            <LinearGradient colors={['#4caf50', '#8bc34a']} style={styles.tagBox}>
            <Text style={styles.tagText}>{item.tag}</Text>
            </LinearGradient>
            <Text style={styles.promptText}>{item.prompt}</Text>
            <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.button}>
                <LinearGradient colors={['#FF6347', '#FF0000']} style={styles.gradient}>
                <Entypo name="cross" size={32} color="white" />
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => console.log('Star clicked')}
            >
                <LinearGradient colors={['#1E90FF', '#0000FF']} style={styles.gradient}>
                <Entypo name="star" size={40} color="white" />
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
                <LinearGradient colors={['#32CD32', '#008000']} style={styles.gradient}>
                <Entypo name="heart" size={32} color="white" />
                </LinearGradient>
            </TouchableOpacity>
            </View>
        </Animated.View>
    </PanGestureHandler>
  );
}

export default function Swipe() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <GestureHandlerRootView style={styles.container}>
      {data.map((item, index) => {
        if (index !== currentIndex) return null;

        return <Card key={item.id} item={item} />;
      })}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 20,
    backgroundColor: 'white',
    position: 'absolute',
    padding: 0,
  },
  image: {
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
    bottom: 90,
    left: 20,
    color: 'white', // Changed to white
    fontWeight: '800',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
  },
  button: {
    marginHorizontal: 5,
    backgroundColor: 'transparent',
    borderRadius: 50,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
});

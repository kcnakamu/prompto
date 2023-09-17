import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Card from '../components/Card';
import Icon from 'react-native-vector-icons/Entypo';

const { width } = Dimensions.get('window');

const data = [
  {
    id: '1',
    image: require('../assets/two-cats.png'),
    prompt: 'Cat 1',
    tag: 'Art',
  },
  {
    id: '2',
    image: require('../assets/two-cats2.png'),
    prompt: 'Cat 2',
    tag: 'Art',
  },
];

export default function NewSwipe() {
  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);

  const onSwiped = () => {
    console.log("you swiped! ");
    setIndex((prevIndex) => prevIndex >= data.length ? (prevIndex + 1) % data.length : 0 );
    console.log(index);
  };

  const onSwipedLeft = () => {
    console.log("You swiped left!");
  };

  const onSwipedRight = () => {
    console.log("You swiped right!");
  };

  const handleX = () => {
    console.log("handling x");
  };

  const handleFavorite = () => {
    console.log("handling favorite");
  };

  const handleHeart = () => {
    console.log("handling heart ");
  };

  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.promptText}>Your starting prompt..</Text>
        <Swiper
            ref={swiperRef}
            cards={data}
            cardIndex={index}
            renderCard={(card) => <Card card={card} />}
            onSwiped={onSwiped}
            onSwipedLeft={onSwipedLeft}
            onSwipedRight={onSwipedRight}
            backgroundColor={'white'}
        />

        <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1  }]}
                onPress={handleX}
                >
            <Icon name="cross" size={50} color='#ff0000' />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1 }]}
                onPress={handleFavorite}
            >
            <Icon name="star" size={50} color='#ffb600' />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1  }]}
                onPress={handleHeart}
                >
            <Icon name="heart" size={50} color='#00bfff' />
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    position: 'absolute',
    bottom: 50,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 10,
  }
});

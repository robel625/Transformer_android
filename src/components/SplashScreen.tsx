import React, { useRef, useEffect } from 'react';
import { View, Text, Image, Animated, Easing, StyleSheet } from 'react-native';
import { AppImages } from '../assets';

const ANIMATION_CONFIG = {
  BOUNCE: {
    toValue: 1,
    friction: 5,
    tension: 40,
    useNativeDriver: true,
  },
  JUMP: {
    duration: 500,
    easing: Easing.ease,
    useNativeDriver: true,
  },
};

const JumpingLoader = React.memo(() => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const jumpAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          ...ANIMATION_CONFIG.JUMP,
          toValue: -20,
        }),
        Animated.timing(translateY, {
          ...ANIMATION_CONFIG.JUMP,
          toValue: 0,
        }),
      ])
    );

    jumpAnimation.start();
    return () => jumpAnimation.stop();
  }, []);

  return (
    <View style={styles.loaderContainer}>
      <Animated.View 
        style={[
          styles.dot, 
          { transform: [{ translateY }] }
        ]} 
      />
    </View>
  );
});

interface SplashScreenProps {
  progress?: number;
}

const SplashScreen = React.memo(({ progress = 0 }: SplashScreenProps) => {
  const bounceImage = useRef(new Animated.Value(0)).current;
  const bounceText = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(bounceImage, ANIMATION_CONFIG.BOUNCE),
      Animated.spring(bounceText, ANIMATION_CONFIG.BOUNCE),
    ]).start();
  }, []);

  const animatedScale = (value: Animated.Value) => ({
    transform: [{
      scale: value.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      })
    }]
  });

  return (
    <View style={styles.container}>
      <Animated.View style={animatedScale(bounceImage)}>
        <Image
          source={AppImages.eeu_logo}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      
      <Animated.Text style={[styles.title, animatedScale(bounceText)]}>
        {progress > 0 ? 'Updating...' : 'Transformer Card'}
      </Animated.Text>

      <JumpingLoader />
      
      {progress > 0 && (
        <Text style={styles.title}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(245, 235, 226)',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    color: 'rgb(21, 32, 54)',
    fontSize: 28,
    fontFamily: 'WorkSans-Bold',
    marginBottom: 20,
  },
  loaderContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgb(21, 32, 54)',
  },
  updateText: {
    color: 'rgb(21, 32, 54)',
    fontSize: 16,
    fontFamily: 'WorkSans-Regular',
    marginTop: 8,
    opacity: 0.7,
  },
});

export default SplashScreen;
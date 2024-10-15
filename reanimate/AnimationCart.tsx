import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';

interface CartAnimationProps {
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onAnimationEnd: () => void;
  isAnimating: boolean;
  style?: ViewStyle;
}

const CartAnimation: React.FC<CartAnimationProps> = ({
  startPosition,
  endPosition,
  onAnimationEnd,
  isAnimating,
  style,
}) => {
  const animatedValue = useRef(new Animated.ValueXY()).current;
  const fadeValue = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAnimating) {
      // Reset animation values
      animatedValue.setValue({ x: 0, y: 0 });
      fadeValue.setValue(1);
      scaleValue.setValue(1);

      // Calculate the path to cart
      const toX = endPosition.x - startPosition.x;
      const toY = endPosition.y - startPosition.y;

      // Run animation
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: { x: toX, y: toY },
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationEnd();
      });
    }
  }, [isAnimating, startPosition, endPosition]);

  if (!isAnimating) return null;

  return (
    <Animated.View
      style={[
        styles.animatedItem,
        {
          transform: [
            { translateX: animatedValue.x },
            { translateY: animatedValue.y },
            { scale: scaleValue },
          ],
          opacity: fadeValue,
          left: startPosition.x,
          top: startPosition.y,
        },
        style,
      ]}>
      <View style={styles.animatedItemInner} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedItem: {
    position: 'absolute',
    zIndex: 999,
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedItemInner: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CartAnimation;
import React from 'react';
import {Text, Pressable, Image, StyleSheet, View} from 'react-native';

const Label = ({
  onPressFunc,
  text,
  containerStyle,
  textStyle,
  iconSize,
  iconLeft,
  iconLeftStyle,
  iconRight,
  iconRightStyle,
}) => {
  const ContainerComponent = onPressFunc ? Pressable : View;
  return (
    <ContainerComponent
      style={[styles.baseContainerStyle, containerStyle]}
      onPress={onPressFunc}>
      {iconLeft ? (
        <Image
          resizeMode="contain"
          source={iconLeft}
          style={[
            {
              width: iconSize,
              height: iconSize,
            },
            styles.marginRight6,
            iconLeftStyle,
          ]}
        />
      ) : null}
      <Text style={[styles.baseTextStyle, textStyle]}>{text ?? ''}</Text>
      {iconRight ? (
        <Image
          resizeMode="contain"
          source={iconRight}
          style={[
            {
              width: iconSize,
              height: iconSize,
            },
            styles.marginLeft6,
            iconRightStyle,
          ]}
        />
      ) : null}
    </ContainerComponent>
  );
};

export default Label;

const styles = StyleSheet.create({
  baseContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseTextStyle: {
    marginRight: 3,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  marginRight6: {
    marginRight: 6,
  },
  marginLeft6: {
    marginLeft: 6,
  },
});

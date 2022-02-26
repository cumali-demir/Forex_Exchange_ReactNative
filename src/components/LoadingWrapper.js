import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {Colors} from 'utils/Constants';

const LoadingWrapper = ({loading, children, isReady}) => (
  <>
    {loading ? (
      <View style={styles.absLoading}>
        <ActivityIndicator size={'large'} />
      </View>
    ) : null}
    {isReady ? children : null}
  </>
);

const styles = StyleSheet.create({
  absLoading: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white50,
    flex: 1,
    zIndex: 9000,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingWrapper;

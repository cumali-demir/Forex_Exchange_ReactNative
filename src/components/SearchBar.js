import React from 'react';
import {TextInput, StyleSheet} from 'react-native';
import {Colors} from 'utils/Constants';

const SearchBar = ({reailtimeSearch, getSearchedText}) => {
  const [searchTextVar, setSearchTextVar] = React.useState('');
  return (
    <TextInput
      style={styles.textFieldContainer}
      placeholder="Type for search"
      value={searchTextVar}
      onChangeText={text => {
        setSearchTextVar(text);
        if (reailtimeSearch) {
          getSearchedText(searchTextVar);
        }
      }}
      onBlur={() => {
        if (!reailtimeSearch) {
          getSearchedText(searchTextVar);
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  textFieldContainer: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
});
export default SearchBar;

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          components: './src/components',
          flags: './src/assets/flags',
          images: './src/assets/images',
          utils: './src/utils',
        },
      },
    ],
  ],
};

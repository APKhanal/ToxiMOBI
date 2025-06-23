module.exports = {
  presets: [
    'babel-preset-expo',
    '@babel/preset-env',
    ['@babel/preset-react', {runtime: 'automatic'}]
  ],
  plugins: [
    'react-native-reanimated/plugin'
  ]
};

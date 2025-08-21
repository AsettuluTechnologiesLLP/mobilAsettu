module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'react-native/no-inline-styles': 'off'
  }
};

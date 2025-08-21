module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@ui': './src/ui',
        '@ui/*': './src/ui/*',
        '@assets': './src/assets',
        '@assets/*': './src/assets/*',
        '@components': './src/components',
        '@components/*': './src/components/*',
        '@screens': './src/screens',
        '@screens/*': './src/screens/*',
        '@navigation': './src/navigation',
        '@navigation/*': './src/navigation/*',
        '@services': './src/services',
        '@services/*': './src/services/*',
        '@utils': './src/utils',
        '@utils/*': './src/utils/*',
        '@constants': './src/constants',
        '@constants/*': './src/constants/*',
        '@styles': './src/styles',
        '@styles/*': './src/styles/*',
        '@config': './src/config',
        '@config/*': './src/config/*',
        '@hooks': './src/hooks',
        '@': './src',
        '@/*': './src/*'
      }
    }]
  ]
};

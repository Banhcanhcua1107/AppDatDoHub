module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:prettier/recommended', // Tích hợp Prettier với ESLint
  ],
  plugins: ['react', 'react-native', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    'react-native/react-native': true,
  },
  rules: {
    'prettier/prettier': 'error',
    // Thêm các quy tắc ESLint tùy chỉnh của bạn ở đây
  },
};

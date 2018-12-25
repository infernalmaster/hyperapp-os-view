module.exports = {
  "extends": ["react-app", "prettier"],
  "plugins": ["prettier"],
  'rules': {
    "prettier/prettier": "error",
    'no-unused-vars': [2, { 'varsIgnorePattern': 'h' }],
    'react/react-in-jsx-scope': [0]
  }
};

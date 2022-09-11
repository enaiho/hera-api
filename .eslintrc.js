module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': ['google', 'plugin:jsdoc/recommended'],
  'overrides': [
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'max-len': 'off',
    'valid-jsdoc': ['warn', {'requireReturnType': false, 'requireParamDescription': true, 'requireReturnDescription': true, 'requireParamType': true, 'requireReturn': true, 'matchDescription': ''}],
  },
  'plugins': [
    'jsdoc',
  ],

};

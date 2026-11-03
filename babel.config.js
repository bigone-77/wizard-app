// NativeWind v4: className을 RN 스타일로 바꾸려면 JSX 런타임을 nativewind로 바꾼다
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};

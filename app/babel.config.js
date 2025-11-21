module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // WAJIB: Tambahkan plugin reanimated di sini.
    // Ini harus berada di BARIS PALING AKHIR di bagian plugins.
    plugins: ["react-native-reanimated/plugin"],
  };
};

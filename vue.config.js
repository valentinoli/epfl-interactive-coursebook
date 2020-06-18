module.exports = {
  transpileDependencies: ["vuetify"],
  pwa: {
    name: "Interactive Coursebook",
    themeColor: "#ffffff",
    msTileColor: "#ffffff",
    assetsVersion: "1.0",
    manifestOptions: {
      // https://developer.mozilla.org/en-US/docs/Web/Manifest
      short_name: "Coursebook",
      background_color: "#ffffff",
      categories: ["education"],
      description: "Interactive visualization of EPFL courses",
      screenshots: [
        {
          src: "img/og-image.png",
          sizes: "1200x630",
          type: "image/png"
        }
      ]
    }
  }
};

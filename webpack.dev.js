const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new BrowserSyncPlugin(
      // BrowserSync options
      {
        // browse to http://localhost:3000/ during development
        host: 'localhost',
        port: 3000,
        // proxy the Node.js endpoint
        // through BrowserSync
        proxy: 'http://localhost:8080/',
      },
      // plugin options
      {
        // prevent BrowserSync from reloading the page
        // and let something else take care of this
        // reload: false
      }
    ),
  ]
});

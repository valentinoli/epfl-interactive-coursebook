const path = require('path');
const webpack = require('webpack');

const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
	mode: 'development',
  devtool: 'inline-source-map',

  devServer: {
    contentBase: './dist',
  },

  // If you are using a bundler, make sure your bundler is configured to consume
  // the modules entry point in the package.json. See webpack’s resolve.mainFields, for example.
  // https://github.com/d3/d3/wiki
  resolve: {
    mainFields: ['browser', 'module', 'main']
  },

	plugins: [
		new webpack.ProgressPlugin(),
    new BrowserSyncPlugin(
      // BrowserSync options
      {
        // browse to http://localhost:3000/ during development
        host: 'localhost',
        port: 3000,
        // proxy the Webpack Dev Server endpoint
        // through BrowserSync
        proxy: 'http://localhost:8080/',
      },
      // plugin options
      {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: false
      }
    ),
	],

	module: {
		rules: [
			{
				test: /.js$/,
				exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          },
          {
            loader: 'eslint-loader',
            options: {
              // This option will enable ESLint autofix feature
              // fix: true
              failOnError: true,
            }
          },
        ],
      },
			{
				test: /.s[ac]ss$/,

				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',

						options: {
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader',

						options: {
							sourceMap: true
						}
					}
				]
			}
		]
	},
};

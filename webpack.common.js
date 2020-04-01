const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const cssLoaders = [
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

// fallback to style-loader in development
if (process.env.NODE_ENV === 'production') {
  cssLoaders.unshift(
      'file-loader',
      MiniCssExtractPlugin.loader
  )
} else {
  cssLoaders.unshift('style-loader')
}

module.exports = {
  entry: {
    main: './src/main.js',
  },
  output: {
    publicPath: 'dist/'
  },

  // devServer: {
  //   contentBase: './dist',
  // },

  // If you are using a bundler, make sure your bundler is configured to consume
  // the modules entry point in the package.json. See webpack’s resolve.mainFields, for example.
  // https://github.com/d3/d3/wiki
  resolve: {
    mainFields: ['browser', 'module', 'main']
  },

  plugins: [
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],

  module: {
    rules: [{
        test: /\.html$/i,
        use: [
          'file-loader?name=[name].[ext]',
        ],  // simple file loading
      },
      {
        test: /.js$/,
        exclude: /node_modules/,
        use: [{
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                '@babel/plugin-proposal-object-rest-spread'
              ]
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
        use: cssLoaders
      },
    ]
  },
};

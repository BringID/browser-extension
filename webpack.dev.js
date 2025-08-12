const { merge } = require('webpack-merge');
const config = require('./webpack.config.js');

module.exports = merge(config, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
});

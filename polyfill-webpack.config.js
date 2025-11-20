const webpack = require('webpack');
const NodePolyFillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  plugins: [
    // add node core polyfills
    new NodePolyFillPlugin(),

    // ensure `process` global is provided as the browser shim
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  resolve: {
    fallback: {
      // explicit fallback to process/browser (helps some tooling resolve it)
      process: require.resolve('process/browser'),
    },
  },
};

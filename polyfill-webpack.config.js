const NodePolyFillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  plugins: [
    new NodePolyFillPlugin({
      excludeAliases: ["console"],
    }),
  ],
  resolve: {
    fallback: {
      fs: false,
    },
  },
};

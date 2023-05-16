// webpack.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
    // ... other configurations
    resolve: {
        alias: {
            // add as an alias
            buffer: 'buffer',
        },
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            path: require.resolve('path-browserify'),

        },
    },
    plugins: [
        // ... other plugins
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
};

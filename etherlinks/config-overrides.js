const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.alias = {
        ...config.resolve.alias,
        buffer: 'buffer',
    };

    config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        dgram: false,
        net: false,
        dns: false

    };

    config.module.rules.forEach((rule) => {
        if (rule.oneOf) {
            rule.oneOf.forEach((oneOfRule) => {
                if (oneOfRule.loader && oneOfRule.loader.includes('babel-loader')) {
                    oneOfRule.options.plugins = [
                        ...(oneOfRule.options.plugins || []),
                        '@babel/plugin-syntax-import-assertions',
                    ];
                }
            });
        }
    });

    config.plugins.push(
            new webpack.ProvidePlugin({
                process: 'process/browser.js',
                Buffer: ['buffer', 'Buffer']
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            }),
    );

    return config;
};

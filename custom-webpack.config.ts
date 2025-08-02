import * as webpack from 'webpack';
import * as dotenv from 'dotenv';
import * as path from 'path';

module.exports = (config: webpack.Configuration) => {
    const envPath = path.resolve(__dirname, '.env');
    const env = dotenv.config({ path: envPath }).parsed;

    if (!env) {
        console.warn('No .env file found or failed to parse.');
        return config;
    }
    const envKeys = Object.keys(env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(env[next]);
        return prev;
    }, {});

    config.plugins = [
        ...(config.plugins || []),
        new webpack.DefinePlugin(envKeys),
    ];

    return config;
};

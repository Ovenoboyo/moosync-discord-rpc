var path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.ts',
    target: "node",
    mode: "development",
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
        libraryExport: 'default',
    },
    resolve: {
        extensions: ['.ts', '.js'] //resolve all the modules other than index.ts
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                test: /\.ts?$/
            },
            {
                test: /\.node$/,
                loader: "node-loader",
            },
        ]
    },
    plugins: [new CopyPlugin({
        patterns: [
            { from: "node_modules/discord-game/build/Release/discord_game.node", to: '../build/Release/discord_game.node' },
        ],
    }),]
}
var path = require('path');

module.exports = {
    entry: './src/index.ts',
    target: "node",
    devtool: 'inline-source-map',
    mode: "production",
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
            }
        ]
    },
}
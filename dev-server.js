var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var configFile = './webpack.hotdev.config';
// Get Command Line arg if passed
if(process.argv.indexOf("-c") != -1){
    configFile = process.argv[process.argv.indexOf("-c") + 1];
}

var config = require(configFile);

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
}).listen(3000, 'localhost', function (err, result) {
    if (err) {
        return console.log(err);
    }
    
    console.log('Listening at http://localhost:3000');
});

var webpack = require("webpack");
var path = require("path");
var homeConfig = require('./home.config.js');

var DEBUG = process.argv.indexOf('--release') === -1;
process.env.NODE_ENV = DEBUG ? 'development' : 'production';

module.exports = function (options) {
   var plugins = [];

   // Stringify process.env.NODE_ENV in production for performance
   if (!DEBUG) {
      plugins.push(new webpack.DefinePlugin({
         'process.env.NODE_ENV': JSON.stringify('production'),
      }));
      // Save this for eventual end of ASP.NET Bundling
      plugins.push(new webpack.optimize.UglifyJsPlugin({
         compress: {
            warnings: false,
         },
      }));
   }

   // Add Hot Module Replacement Plugin for Hot Dev Server
   if (options.hotdev) {
      plugins.unshift(new webpack.HotModuleReplacementPlugin());
   }

   var entry, loaders, output;
   if (options.hotdev) {
      entry = {};
      Object.keys(homeConfig.apps).forEach(function (appKey) {         
         var entryPoints = require(path.join(homeConfig.apps[appKey], 'ui.js'));

         Object.keys(entryPoints).forEach(function (uiKey) {
            entry[`${appKey}-${uiKey}`] = [
               'webpack-dev-server/client?http://localhost:3000',
               'webpack/hot/dev-server',
               entryPoints[uiKey].entry,
            ];
         });
      });

      loaders = [
         {
            test: /\.js$/,
            loader: 'react-hot',
            include: path.resolve(__dirname, 'src'),
         },
         {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            include: [
               path.resolve(__dirname, 'src'),
            ],
            query: {
               // https://github.com/babel/babel-loader#options
               cacheDirectory: DEBUG,

               // https://babeljs.io/docs/usage/options/
               babelrc: false,
               presets: [
                  'react',
                  'es2015',
                  'stage-0',
               ],
               plugins: [
                  'transform-runtime',
               ],
            },
         },
         {
            test: /\.json$/,
            loader: 'json',
         },
         {
            test: /\.js(x|on)?$/,
            loader: 'l10n-loader',
            include: path.resolve(__dirname, 'src'),
         },
      ];
      output = {
         path: path.resolve(__dirname, 'build'),
         filename: '[name].js',
         publicPath: 'http://localhost:3000/static/',
      };
   }
   else {
      entry = {};
      Object.keys(homeConfig.apps).forEach(function (appKey) {
         var entryPoints = require(path.join(homeConfig.apps[appKey], 'ui.js'));
         Object.keys(entryPoints).forEach( function (uiKey) {
            entry[`${appKey}-${uiKey}`] = entryPoints[uiKey].entry;
         });
      });
      loaders = [
         {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            include: [
               path.resolve(__dirname, 'src'),
            ],
            query: {
               // https://github.com/babel/babel-loader#options
               cacheDirectory: DEBUG,

               // https://babeljs.io/docs/usage/options/
               babelrc: false,
               presets: [
                  'react',
                  'es2015',
                  'stage-0',
               ],
               plugins: [
                  'transform-runtime',
               ],
            },
         },
         {
            test: /\.json$/,
            loader: 'json',
         }
      ];
      output = {
         path: './build',
         filename: '[name].js',
      };
   }

   var config = {
      entry: entry,
      eslint: {
         configFile: '.eslintrc',
      },
      module: {
         loaders: loaders,
      },
      output: output,
      plugins: plugins,
      resolve: {
         // you can now require('file') instead of require('file.coffee')
         extensions: ['', '.js', '.json'],
         root: path.resolve('./src'),
      }
   };

   if (!DEBUG) {
      config.module.loaders.unshift({
         test: /\.js$/,
         loader: 'jsx?stripTypes',
      });
      config.plugins.push(new webpack.DefinePlugin({
         "process.env": {
            NODE_ENV: JSON.stringify("production"),
         }
      }));
   }
   else {
      config.debug = true;
      config.devtool = 'source-map';
   }

   return config;
};

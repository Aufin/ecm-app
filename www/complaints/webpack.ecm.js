const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
	complaints: './src/index.js'
  },
  output: {
	filename: "[name].ecm.js",
    //path: path.resolve(__dirname, './'),
    library: {
	  type: 'assign-properties',
	  name: 'ECM'
	}
  },
  externals: {
	"@spinal/zepto": 'S.$',
	"@spinal/underscore": 'S._',
	"@spinal/backbone": 'S.Backbone',
	"@spinal/materialize": 'S.M',
	"@spinal/widget": "S.Widget",
	"@spinal/element": "S.Element",
	"@spinal/table": "S.Table"
  },
  resolve: {
     alias: {
       '@scripts': path.join(__dirname, 'src/js'),
  //     '@styles': path.join(__dirname, 'src/scss'),
  //     '@images': path.join(__dirname, 'src/images'),
     },
  },

   module: {
    rules: [
	  {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
	  {
		test: /\.(woff(2)?|ttf|eot)$/,
		type: 'asset/resource',
		generator: {
		  filename: './font/[name][ext]',
		},
	  },
	  
      {
        test: /\.(ico|png|jpe?g|svg)/,
        type: 'asset',
        generator: {
          // save images to file
          filename: 'img/[name].[hash:8][ext]',
        },
     },
    ],
  },

  // enable HMR with live reload
  // devServer: {
  //   static: path.resolve(__dirname, 'dist'),
  //   watchFiles: {
  //     paths: ['src/**/*.*'],
  //     options: {
  //       usePolling: true,
  //     },
  //   },
  // },
};

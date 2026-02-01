const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, './')
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
    '@dist': path.join(__dirname, './dist')//,
  // //     '@styles': path.join(__dirname, 'src/scss'),
  // //     '@images': path.join(__dirname, 'src/images'),
  //    },
  }},

  plugins: [
    new HtmlBundlerPlugin({
      // path to templates
      entry: 'src/',
      js: {
        // output filename for JS
        filename: '../js/[name].js',
      },
      css: {
        // output filename for CSS
        filename: '../css/[name].css',
      },
    }),
  ],

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
		  filename: '../font/[name][ext]',
		},
	  },
	  
      {
        test: /\.(ico|png|jpe?g|svg)/,
        type: 'asset',
        generator: {
          // save images to file
          filename: '../img/[name].[hash:8][ext]',
        },
        parser: {
          dataUrlCondition: {
            // inline images < 2 KB
            maxSize: 2 * 1024,
          },
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

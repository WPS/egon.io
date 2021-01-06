// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
var browsers = (process.env.TEST_BROWSERS || 'Firefox')
  .replace(/^\s+|\s+$/, '')
  .split(/\s*,\s*/g)
  .map(function(browser) {
    if (browser === 'FirefoxHeadless') {
      process.env.FIREFOX_BIN = require('puppeteer').executablePath();

    } else {
      return browser;
    }
  });

module.exports = function(karma) {
  karma.set({
    frameworks: ['browserify', 'mocha', 'chai'],

    files: ['test/spec/**/*Spec.js'],

    reporters: ['spec'],

    preprocessors: {
      'test/spec/**/*Spec.js': ['browserify']
    },

    browsers: browsers,

    browserNoActivityTimeout: 100000,
    browserDisconnectTolerance: 1,
    browserDisconnectTimeout: 100000,
    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      captureConsole: true,
      debug: true,
      transform: [
        [
          'stringify',
          {
            global: true,
            extensions: ['.bpmn', '.css']
          }
        ],
        [
          'babelify', {
            global: true,
            presets:['@babel/preset-env']
          }
        ]
      ]
    }
  });
};

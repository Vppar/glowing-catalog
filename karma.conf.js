// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/jquery/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-i18n/angular-locale_pt-br.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/firebase/firebase.js',
      'app/bower_components/fastclick/lib/fastclick.js',
      'app/bower_components/firebase-simple-login/firebase-simple-login.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-affix.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-alert.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-dropdown.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-tooltip.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-modal.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-transition.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-button.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-popover.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-typeahead.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-carousel.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-scrollspy.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-collapse.js',
      'app/bower_components/bootstrap-sass/js/bootstrap-tab.js',
      'app/bower_components/select2/select2.js',
      'app/bower_components/angular-ui-select2/src/select2.js',
      'app/bower_components/node-uuid/uuid.js',
      'app/bower_components/angular-md5/angular-md5.js',
      'app/resources/config.js',
      'app/scripts/**/*.js',
      'app/components/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js',
      'test/helper/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    sauceLabs: {
        username: 'wesleyakio',
        accessKey: 'a1e78cf5-385a-4e02-ae4e-8e712275365d',
        testName: 'Tunts CI'
    },
    
    customLaunchers: {
        sl_chrome_linux: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'linux'
        }
    },

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};

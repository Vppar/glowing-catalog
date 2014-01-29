exports.config = {
    
    // If you are going to run a lot of tests keep a server running somewhere
    //seleniumAddress: 'http://localhost:4444/wd/hub',
    specs : [
        'test/e2e/**/*.spec.js'
    ],
    baseUrl : 'http://debug/glowing-catalog/app/'
};
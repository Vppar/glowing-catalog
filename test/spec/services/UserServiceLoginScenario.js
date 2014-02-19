'use strict';

xdescribe('Service: UserService', function() {
 
    // instantiate service
    var UserService = null;
    var scope = {};

    // load the service's module
    beforeEach(function() {
        module('angular-md5');
        module('tnt.catalog.user');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.replayer');
        
        delete localStorage.hashMD5;
    });

    beforeEach(inject(function(_UserService_, _$rootScope_) {
        UserService = _UserService_;
        scope = _$rootScope_;
    }));

    it('test', function() {

        var user = 'arnaldo.rodrigues@tuntscorp.com';
        var pass = 'passtest';
        var result = null;
        // when
        runs(function() {
            UserService.login(user, pass, false).then(function() {
                result = true;
            });
            result = true;
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        });

        //runs(function() {
           
        //});

    });

    

});

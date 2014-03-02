'use strict';

xdescribe ('Service: CacheController', function( ) {

    // load the service's module
    beforeEach (module ('tnt.catalog.manifest'));

    // instantiate service
    var CacheController;
    beforeEach (inject (function(_CacheController_) {
        CacheController = _CacheController_;
    }));

    it ('should do something', function( ) {
        expect (!!CacheController).toBe (true);
    });

});

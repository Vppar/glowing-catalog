'use strict';

ddescribe('Service: PersistentStorage.update', function() {

    var $q = {};
    var $log = {};
    var webSqlDriverMock = {};
    var PersistentStorage = undefined;
    
    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.storage.persistent');
        module('tnt.storage.websql');
        
        module(function($provide) {
            $provide.value('$log', $log);
            $provide.value('WebSQLDriver', webSqlDriverMock);
            
        });
    });

    beforeEach(inject(function(_PersistentStorage_,_$q_) {
        PersistentStorage = _PersistentStorage_;
        $q = _$q_;
    }));

    it('should be there', function() {
        expect(!!PersistentStorage).toBe(true);
    });

});

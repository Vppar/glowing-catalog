'use strict';

describe('Keeper: JournalKeeper', function() {

    var PersistentStorage;
    var WebSQLDriver;
    var JournalEntry;
    var JournalKeeper;
    var Replayer;
    var scope;
    var log = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.storage.persistent');
        module('tnt.storage.websql');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.keeper');
        module('tnt.catalog.journal.replayer');

        log.warn = jasmine.createSpy('warn');
        log.debug = angular.noop;
        log.error = angular.noop;

        module(function($provide) {
            $provide.value('$log', log);
        });

    });

    beforeEach(inject(function(_PersistentStorage_, _WebSQLDriver_, _JournalEntry_,
            _JournalKeeper_, _Replayer_, $rootScope) {

        PersistentStorage = _PersistentStorage_;
        WebSQLDriver = _WebSQLDriver_;
        JournalEntry = _JournalEntry_;
        JournalKeeper = _JournalKeeper_;
        Replayer = _Replayer_;

        scope = $rootScope;
    }));


});

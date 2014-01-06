(function(angular, ObjectUtils) {
    'use strict';

    /**
     * TODO create the test specs
     * 
     * The elementary journal entry. All journal entries must be created through
     * this factory.
     */
    angular.module('tnt.catalog.journal.entity', []).factory('JournalEntry', function JournalEntry() {

        var metadata = {
            // metadata version
            version : 1,
            // name of the pk column
            pk : 'sequence',
            // indexed columns
            ix : [],
        };

        var service = function svc(sequence, stamp, type, version, entry) {

            if (arguments.length != svc.length) {
                throw 'JournalEntry must be initialized with sequence, stamp, type, version and entry';
            }

            ObjectUtils.ro(this, 'sequence', sequence);
            ObjectUtils.ro(this, 'stamp', stamp);
            ObjectUtils.ro(this, 'type', type);
            ObjectUtils.ro(this, 'version', version);
            ObjectUtils.ro(this, 'event', event);
        };

        ObjectUtils.method(service, 'metadata', function() {
            return angular.copy(metadata);
        });

        return service;
    });

    /**
     * Journal Keeper
     * 
     * The CRUD for journal keeping operations
     */
    angular.module('tnt.catalog.journal.keeper', []).service('JournalKeeper', function JournalKeeper() {
        this.compose = function() {

        };

        this.read = function(filters) {

            // TODO map the necessary filters!

            if (angular.isObject(filters)) {

            }
        };

        this.remove = function() {

        };

        this.resync = function() {

        };
    });

    angular.module('tnt.catalog.journal', [
        'tnt.catalog.journal.entity', 'tnt.catalog.journal.keeper'
    ]);
})(angular, window.ObjectUtils);

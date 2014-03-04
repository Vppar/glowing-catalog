(function(angular) {
    'use strict';

    angular.module('tnt.catalog.keeper', [
        'tnt.catalog.journal', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 'tnt.catalog.journal.keeper'
    ]).factory('MasterKeeper', ['JournalEntry', 'JournalKeeper', function(JournalEntry, JournalKeeper) {

        /**
         * 
         * @param {String} eventDataType The name of the event. I.E. Order
         * @param {Function} eventType The constructor for the Event Object
         * @param {Number} eventVersion The version of the event
         */
        var MasterKeeper = function(eventDataType, eventType, eventVersion) {
            ObjectUtils.ro(this, 'eventDataType', eventDataType);
            ObjectUtils.ro(this, 'eventType', eventType);
            ObjectUtils.ro(this, 'eventVersion', eventVersion);
        };

        /**
         * 
         * @param {String} eventOp The name of the operation. I.E. Add
         * @param {Object} eventObj the event object(untyped please!)
         * @return {Object} the journal entry
         */
        ObjectUtils.method(MasterKeeper, 'journalize', function(eventOp, eventObj) {
            var eventName = (this.eventDataType.substr(0, 1)).toLowerCase() + this.eventDataType.substr(1) + (eventOp.substr(0, 1)).toUpperCase() + eventOp.substr(1);
            var now = (new Date()).getTime();
            var event = new this.eventType(eventObj);
            var entry = new JournalEntry(null, now, eventName, this.eventVersion, event);

            return JournalKeeper.compose(entry);
        });

        return MasterKeeper;
    }]);
})(angular);

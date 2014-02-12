(function(angular) {
  'use strict';

  angular.module('tnt.catalog.keeper', ['tnt.catalog.journal']).factory('MasterKeeper', function(JournalEntry) {

    /**
     * 
     * @param {String} eventName The name os the event. I.E. Order
     * @param {Function} eventType The constructor for the Event Object
     * @param {Number} eventVersion The version of the event
     */
    var MasterKeeper = function(eventName, eventType, eventVersion) {
      ObjectUtils.ro(this, 'eventName', eventName);
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
      var opName = this.eventName.substr(0, 1) + this.eventName.substr(1) + eventOp;
      var now = (new Date()).getTime();
      var event = new this.eventType(eventObj);
      var entry = new JournalEntry(null, now, opName, this.eventVersion, event);

      return JournalKeeper.compose(entry);
    });

    return MasterKeeper;
  });
})(angular);

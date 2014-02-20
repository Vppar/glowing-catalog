(function(angular) {
    'use strict';

    angular.module('tnt.catalog.journal.replayer', ['tnt.catalog.journal.entity']).service('Replayer', function Replayer($log, JournalEntry) {

        var eventHandlers = {};

        /**
         * <pre>
         * @spec Replayer.registerHandlers#1
         * Given a list of valid handlers
         * when a register is triggered
         * then the handlers must be added to the local hash
         * 
         * @spec Replayer.registerHandlers#2
         * Given a list of non function handlers
         * when a register is triggered
         * then an error must be raised
         * 
         * </pre>
         * 
         * Register a handler for a given event
         * 
         * @param name - Name of the event
         * @param version - Version of the event
         * @param handler - The handler for this event and version
         */
        this.registerHandlers = function(handlers) {
            for(var name in handlers){
                var handler = handlers[name];
                if (angular.isFunction(handler)) {
                    eventHandlers[name] = handler;
                } else {
                    throw 'Only functions are allowed';
                }
            }
        };


        this.nukeKeepers = function () {
          for (var name in eventHandlers) {
            // FIXME: we probably need a better way to get nuke handlers
            if (name.substr(0, 4) === 'nuke' && name.substr(-2) === 'V1') {
              $log.debug('Running ' + name + ' handler!');
              eventHandlers[name]();
            }
          }
        };


        /**
         * <pre>
         * @spec Replayer.replay#1
         * Given a JournalEntry 
         * with a valid event
         * when a replay is triggered
         * then the proper handler must be called
         * 
         * @spec Replayer.replay#2
         * Given a JournalEntry
         * with an invalid event
         * when a replay is triggered
         * then an error must be raised
         * 
         * @spec Replayer.replay#3
         * Given a random object
         * when a replay is triggered
         * then an error must be raised
         * 
         * </pre>
         * 
         * Replays a journal entry through the proper registered handler
         * 
         * @param entry - JournalEntry instance
         */
        this.replay = function(entry) {
            if (entry instanceof JournalEntry) {
                if (angular.isFunction(eventHandlers[entry.type + 'V' + entry.version])) {
                    $log.debug('Replaying', entry);
                    return eventHandlers[entry.type + 'V' + entry.version](entry.event);
                } else {
                    $log.fatal('We have no register of a proper handler for ' + entry.type + ' version ' + entry.version);
                }
            } else {
                throw 'Only instances of JournalEntry are allowed';
            }
        };

        /**
         * Forces an immediate sync for all the entries created since lastPos
         */
        this.sync = function() {
            // TODO get all journal entries since lastPos
            // TODO replay said events
        };
    });
}(angular));

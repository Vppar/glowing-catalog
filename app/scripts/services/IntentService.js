(function (angular) {
    'use strict';

    /**
     * This must become a proper intent service in the future... For now it is
     * an over-glorified bit pusher for communication between screens
     * 
     * For now:
     *  - Single bundle;
     *  - Single put, a second one overwrites;
     *  - Single get, the first one erases the data from the service.
     */
    angular.module('tnt.catalog.service.intent', []).service('IntentService', [
        '$log', function IntentService ($log) {

            var bundle = null;

            /**
             * Put a bundle that will be read by the next route that needs it
             * 
             * @param {Object} data Data to be stored in the bundle
             */
            this.putBundle = function (data) {
                if (bundle) {
                    $log.error('Overwriting a bundle... this showld not happen!', bundle);
                }

                bundle = data;
            };

            /**
             * Get the data that was put in the bundle
             * 
             * @returns {Object} The bundle stored in the service
             */
            this.getBundle = function () {
                var data = bundle;
                bundle = null;
                return data;
            };
        }
    ]);

}(angular));
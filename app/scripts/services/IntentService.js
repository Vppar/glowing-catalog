(function (angular) {
    'use strict';

    /**
     * This must become a proper intent service in the future... For now it is
     * an over-glorified bit pusher for communication between screens
     */
    angular.module('tnt.catalog.service.intent', []).service('IntentService', [
        '$log', function IntentService ($log) {

            var bundle = null;

            this.createBundle = function (data) {
                if (bundle) {
                    $log.error('Overwriting a bundle... this showld not happen!', bundle);
                }

                bundle = data;
            };

            this.getBundle = function (data) {
                var data = bundle;
                bundle = null;
                return data;
            };
        }
    ]);

}(angular));
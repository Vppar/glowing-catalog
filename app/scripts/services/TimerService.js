(function(angular) {

    angular
        .module('tnt.catalog.timer.service', [])
        .service('TimerService', function TimerService(
            $log
        ) {
            $log.debug('timer service loaded');
        });
}(angular));

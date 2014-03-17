var _LTracker = _LTracker || [];
(function (angular, localStorage, _LTracker) {
    'use strict';

    angular.module('tnt.util.log', [
        'tnt.catalog.config'
    ]).config([
        '$provide', function ($provide) {
            $provide.decorator('$log', [
                '$delegate', function ($delegate) {
                    $delegate.fatal = $delegate.log;
                    return $delegate;
                }
            ]);
        }
    ]).service(
        'logger',
        [
            '$log',
            'CatalogConfig',
            function logger ($log, CatalogConfig) {
                _LTracker.push({
                    'logglyKey' : CatalogConfig.logglyKey
                });

                var levelMap = {
                    '0' : 'fatal',
                    '1' : 'error',
                    '2' : 'warn',
                    '4' : 'info',
                    '5' : 'log',
                    '7' : 'debug'
                };

                this.getLogger =
                    function (name) {

                        var facility = name;
                        var search = name;
                        var consoleLevel;
                        var syncLevel;

                        while (consoleLevel === undefined || syncLevel === undefined) {
                            if (consoleLevel === undefined) {
                                consoleLevel = CatalogConfig.logLevel[search + '.console'];
                            }

                            if (syncLevel === undefined) {
                                syncLevel = CatalogConfig.logLevel[search + '.sync'];
                            }

                            search = search.split('.');
                            search.pop();
                            search = search.join('.');
                        }

                        $log.debug('Creating a new logger for ' + facility + '. Console: ' +
                            consoleLevel + ' Sync: ' + syncLevel);

                        function _console (level, data) {
                            if (consoleLevel >= level) {
                                // TODO Uncommenting the following line breaks
                                // the tests but must be done in the future
                                // Array.prototype.unshift.call(data, facility);
                                $log[levelMap[level]].apply(null, data);
                            }
                        }

                        function sync (level, data) {
                            if (syncLevel >= level) {
                                _LTracker.push({
                                    level : levelMap[level],
                                    user : localStorage.user,
                                    facility : facility,
                                    data : data
                                });
                            }
                        }

                        function logMe (level, data) {
                            _console(level, data);
                            sync(level, data);
                        }

                        var log = {
                            // Write a debug message - 7
                            debug : function () {
                                logMe(7, arguments);
                            },
                            // Write a log message - 5
                            log : function () {
                                logMe(5, arguments);
                            },
                            // Write an information message - 4
                            info : function () {
                                logMe(4, arguments);
                            },
                            // Write a warning message - 2
                            warn : function () {
                                logMe(2, arguments);
                            },
                            // Write an error message - 1
                            error : function () {
                                logMe(1, arguments);
                            },
                            // Write a fatal error message - 0
                            fatal : function () {
                                logMe(0, arguments);
                            }
                        };

                        return log;
                    };
            }
        ]).service('log', [
        '$log', function log ($log) {
            $log.warn('You showld be using logger instead of log');
            return $log;
        }
    ]);
})(angular, localStorage, _LTracker);

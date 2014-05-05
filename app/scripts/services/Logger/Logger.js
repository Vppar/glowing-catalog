(function (scope) {
    'use strict';

    function Logger() {
        this.appenders = [];
    }

    Logger.prototype.levelMap = {
        '0': 'fatal',
        '1': 'error',
        '2': 'warn',
        '4': 'info',
        '5': 'log',
        '6': 'debug',
        '7': 'trace'
    };

    Logger.prototype.levelCheck = function (facility, level) {
        var configLevel;
        var search = facility;

        while (configLevel === undefined && search !== '') {
            configLevel = this.config.filters[search];
            search = search.split('.');
            search.pop();
            search = search.join('.');
        }

        if (configLevel === undefined) {
            configLevel = this.config.filters.default;
        }

        return configLevel >= level;
    };

    Logger.prototype.addAppender = function (appender) {
        this.appenders.push(appender);
    };

    Logger.prototype._log = function (facility, levelName, levelNumber, data) {

        var selected = [];

        this.appenders.forEach(function(appender){
            if (appender.levelCheck(facility, levelNumber)) {
                selected.push(appender);
            }
        });

        if(selected.length){
            var message;

            if(data && typeof data[0] === 'string'){
                message = data.shift();
            }

            if(data.length <= 1){
                data = data.pop();
            }

        }

        selected.forEach(function(appender){
            appender.log(facility, levelName, message, data || {});
        });
    };

    Logger.prototype.getLogger = function (facility) {
        var self = this;

        var log = {};

        for (var ix in this.levelMap) {
            (function(){
                var levelName = self.levelMap[ix];
                var number = Number(ix);

                log[levelName] = function () {
                    var args = Array.prototype.slice.call(arguments, 0);
                    self._log(facility, levelName, number, args);
                }
            })();
        }

        log.log = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            var levelName = args.shift();

            if(this.log[levelName]){
                this.log[levelName].apply(this, args);
            } else {
                self._log(facility, levelName, 5, args);
            }
        }

        return log;
    }

    var logger = new Logger();
    logger.Logger = Logger;
    var old = scope.logger;
    scope.logger = logger;

    if (old) {
        for (var ix in old) {
            old[ix]();
        }
    }

})(window || global);
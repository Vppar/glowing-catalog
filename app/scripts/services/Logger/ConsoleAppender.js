(function (ObjectUtils, scope, console) {
    'use strict';


    function init(){
        function ConsoleAppender(config) {
            this.config = {};
            this.config.filters = config.filters || {};

            if (!this.config.filters.default) {
                this.config.filters.default = 9;
            }
        }
        ObjectUtils.inherit(ConsoleAppender, scope.logger.Logger);

        ConsoleAppender.prototype.log = function (facility, levelName, message, data) {
            var _log;
            if (console[levelName] && levelName != 'trace') {
                _log = console[levelName];
            } else {
                _log = console.log;
            }
            _log.call(null, facility + '[' + levelName + ']:', message, data);
        };
        scope.logger.ConsoleAppender = ConsoleAppender;
    }

    if(scope.logger && scope.logger.Logger){
        init();
    } else {
        scope.logger = scope.logger || {};
        scope.logger.ConsoleAppender = init;
    }

})(ObjectUtils, window || global, console);

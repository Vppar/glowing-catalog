(function (ObjectUtils, scope) {
    'use strict';

    function init(){
        function OfflineAppender(config) {

            if (!scope.OfflineLogHandler) {
                throw "Where is OfflineLogHandler?";
            }

            this.config = {};
            this.config.filters = config.filters || {};

            if (!this.config.filters.default) {
                this.config.filters.default = 9;
            }

            this.handler = new (scope.OfflineLogHandler)(this.config.namespace || 'MyPrettyLogger', this.config.maxEntries);
        }

        ObjectUtils.inherit(OfflineAppender, scope.logger.Logger);

        OfflineAppender.prototype.log = function (facility, levelName, message, data) {

            var logEntry = {
                message: message,
                facility: facility,
                level: levelName,
                data: data
            };

            handler.append(logEntry);
        };
        scope.logger.OfflineAppender = OfflineAppender;
    }

    if(scope.logger && scope.logger.Logger){
        init();
    } else {
        scope.logger = scope.logger || {};
        scope.logger.OfflineAppender = init;
    }
})(ObjectUtils, window || global);

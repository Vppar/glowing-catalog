'use strict';

function FakeAppender(config, store) {
    this.config = config;

    this.store = store;
}
ObjectUtils.inherit(FakeAppender, logger.Logger);

FakeAppender.prototype.log = function (facility, levelName, message, data) {
    this.store.push(arguments);
};

describe('Service: LoggerSpec', function() {

    it('showld do something', function(){
        var localLogger = new logger.Logger();

        var config1 = {};
        config1.filters = {};
        config1.filters.default = 9;
        config1.filters['my.new.package'] = 0
        var appender1 = [];

        localLogger.addAppender(new FakeAppender(config1, appender1));

        var config2 = {};
        config2.filters = {};
        config2.filters.default = 9;
        var appender2 = [];

        localLogger.addAppender(new FakeAppender(config2, appender2));

        var log = localLogger.getLogger('my.new.package');

        var message = 'ich will';

        log.info(message);
        log.log('info', message);
        log.log('info', message, {hey: 'ho'});
        log.info(message, {hey: 'ho'});
        log.log('hehehe', message);

        console.log('appender1', appender1);
        console.log('appender2', appender2);
    });


    //is logging;
    //facility filter works(no log, log same level, log superior level)
    //multiple appenders
    //aliases
    //custom levels

});
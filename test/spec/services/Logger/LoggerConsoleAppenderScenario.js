'use strict';

describe('Service: LoggerConsoleAppenderScenario', function() {

    it('showld do something', function(){
        logger.addAppender(
            new logger.ConsoleAppender({
            filters: {
                'tnt.catalog.somePackage' : 6,
                'tnt.catalog.someOtherPackage' : 5
            }
        }));

    //    logger.addAppender(new logger.offlineAppender({
    //        filters: {
    //            default : 1
    //        },
    //        namespace: 'HeyHo',
    //        maxEntries: 500
    //    }));

        var log = logger.getLogger('my.new.package');

        var message = 'ich will';

        log.info(message);
        log.log('info', message);
        log.log('info', message, {hey: 'ho'});
        log.info(message, {hey: 'ho'});
        log.log('hehehe', message);
    })
});
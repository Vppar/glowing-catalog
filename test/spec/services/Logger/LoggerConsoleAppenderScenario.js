'use strict';

ddescribe('Service: LoggerConsoleAppenderScenario', function () {
  
    // default message
    var message = 'Houston we have a problem';
    var metadata = {
        mission : 'apollo 13',
        reporter : 'Jack Swigert',
        problem : 'Service module exploded',
    };
    var consoleAppender ={};
    beforeEach(function () {
        consoleAppender = new logger.ConsoleAppender({
            filters : {
                'tnt.catalog.somePackage' : 6,
                'tnt.catalog.someOtherPackage' : 5
            }
        });
        
        logger.addAppender(consoleAppender);
        
        spyOn(consoleAppender, 'log');
    });

    it('should log things on console', function () {
        var log = logger.getLogger('my.new.package');
        log.trace(message, metadata);
        expect(consoleAppender.log).toHaveBeenCalled();
    });
    
    it('should not log things on console', function () {
        var log = logger.getLogger('tnt.catalog.somePackage');
        log.trace(message, metadata);
        expect(consoleAppender.log).not.toHaveBeenCalled();
    });
    
    it('should not log things on console', function () {
        var log = logger.getLogger('tnt.catalog.otherPackage');
        log.trace(message, metadata);
        expect(consoleAppender.log).toHaveBeenCalled();
    });
});
'use strict';


// ************************
// MOCK APPENDER
// ************************
function FakeAppender(config, store) {
    this.config = config;

    this.store = store;
}
ObjectUtils.inherit(FakeAppender, logger.Logger);

FakeAppender.prototype.log = function (facility, levelName, message, data) {
    this.store.push(arguments);
};

describe('Service: LoggerSpec', function() {
    // mock logger
    var localLogger = {};
    
    // log storage
    var appender1 = [];
    var appender2 = [];
    // default message
    var message = 'Houston we have a problem';
    var metadata =  {
        mission : 'apollo 13',
        reporter : 'Jack Swigert',
        problem : 'Service module exploded',
    };
    
    // Filter level 9 = log everything.
    describe('simple logging - filter default level = 9', function(){
        var module = 'my.new.package';
        var log = {};

        beforeEach(function () {
            localLogger = new logger.Logger();
            appender1 = [];
            
            // Appender 1
            var config1 = {};
            config1.filters = {};
            config1.filters.default = 9;
            
            localLogger.addAppender(new FakeAppender(config1, appender1));
            log = localLogger.getLogger(module);
        });

        it('should log in all levels', function(){
            log.trace(message,metadata);
            log.debug(message,metadata);
            log.log(message,metadata);
            log.info(message,metadata);
            log.warn(message,metadata);
            log.error(message,metadata);
            log.fatal(message,metadata);
            
            expect(appender1.length).toBe(7);
        });
        
        it('should log in all levels passing level as argument', function(){
            log.log('trace', message,metadata);
            log.log('debug',message,metadata);
            log.log('log',message,metadata);
            log.log('info',message,metadata);
            log.log('warn',message,metadata);
            log.log('error',message,metadata);
            log.log('fatal',message,metadata);
            
            expect(appender1.length).toBe(7);
        });
        
        it('should log message in "fatal" level', function(){
            log.fatal(message,metadata);
            
            expect(appender1.length).toBe(1);
            
            // verify integrity of log level
            expect(appender1[0][0]).toBe(module);
            expect(appender1[0][1]).toBe('fatal');
            expect(appender1[0][2]).toBe(message);
            expect(appender1[0][3]).toBe(metadata);
        });
        
        it('should log message in "fatal" level passing level by argument', function(){
            log.log('fatal', message, metadata);
            
            expect(appender1.length).toBe(1);
            
            // verify integrity of log level
            expect(appender1[0][0]).toBe(module);
            expect(appender1[0][1]).toBe('fatal');
            expect(appender1[0][2]).toBe(message);
            expect(appender1[0][3]).toBe(metadata);
        });
        
        it('should log message in "fatal" level passing a not defined level by argument', function(){
            log.log('myNotDefinedAlias', message,metadata);
            
            expect(appender1.length).toBe(1);
            // verify integrity of log level
            expect(appender1[0][0]).toBe(module);
            expect(appender1[0][1]).toBe('myNotDefinedAlias');
            expect(appender1[0][2]).toBe(message);
            expect(appender1[0][3]).toBe(metadata);
        });
    });
    
    // log only wanted levels
    describe('simple logging - filter level = 4.', function(){
        var module = 'my.new.package';
        var log = {};
        beforeEach(function () {
            localLogger = new logger.Logger();
            appender1 = [];
            
            // Appender 1
            var config1 = {};
            config1.filters = {};
            config1.filters.default = 4;
            
            localLogger.addAppender(new FakeAppender(config1, appender1));
            log = localLogger.getLogger(module);
        });
        
        it('Should log only "info" up', function(){
            log.trace(message,metadata);// 7
            log.debug(message,metadata);// 6
            log.log(message,metadata);// 5
            log.info(message,metadata);// 4
            log.warn(message,metadata);// 2
            log.error(message,metadata);// 1
            log.fatal(message,metadata);// 0
            
            expect(appender1.length).toBe(4);
        });
        
        it('Should log message in "fatal" level (superior than set level)', function(){
            log.fatal(message,metadata);
            
            expect(appender1.length).toBe(1);
            
            // verify integrity of log level
            expect(appender1[0][0]).toBe(module);
            expect(appender1[0][1]).toBe('fatal');
            expect(appender1[0][2]).toBe(message);
            expect(appender1[0][3]).toBe(metadata);
        });
        
        it('Should log message in "info" level (equal than set level)', function(){
            log.info(message,metadata);
            
            expect(appender1.length).toBe(1);
            
            // verify integrity of log level
            expect(appender1[0][0]).toBe(module);
            expect(appender1[0][1]).toBe('info');
            expect(appender1[0][2]).toBe(message);
            expect(appender1[0][3]).toBe(metadata);
        });
        
        it('Should not log message in "log" level (less than set level)', function(){
            log.log(message,metadata);
            
            expect(appender1.length).toBe(0);
        });
    });
    
    describe('filter log by facility', function(){
        var module = 'my.new.package';
        var module2 = 'my.other.package';
        var module3 = 'my.other.new.package';
        var log = {};
        var log2 = {};
        var log3 = {};
        var log4 = {};
        
        beforeEach(function () {
            localLogger = new logger.Logger();
            appender1 = [];
            
            // Appender 1
            var config1 = {};
            config1.filters = {};
            config1.filters.default = 0;
            config1.filters['my.new.package'] = 5;
            config1.filters['my.other'] = 5;
            
            localLogger.addAppender(new FakeAppender(config1, appender1));
        });
        
        it('Should log "log" level and up', function(){
            log = localLogger.getLogger(module);
            
            log.trace(message,metadata);
            log.debug(message,metadata);
            log.log(message,metadata);
            log.info(message,metadata);
            log.warn(message,metadata);
            log.error(message,metadata);
            log.fatal(message,metadata);
            expect(appender1.length).toBe(5);
        });
        
        it('Should log "log" level and up', function(){
            log2 = localLogger.getLogger(module2);
            
            log2.trace(message,metadata);
            log2.debug(message,metadata);
            log2.log(message,metadata);
            log2.info(message,metadata);
            log2.warn(message,metadata);
            log2.error(message,metadata);
            log2.fatal(message,metadata);
            
            expect(appender1.length).toBe(5);
        });
        
        it('Should log "log" level and up', function(){
            log3 = localLogger.getLogger(module3);
            
            log3.trace(message,metadata);
            log3.debug(message,metadata);
            log3.log(message,metadata);
            log3.info(message,metadata);
            log3.warn(message,metadata);
            log3.error(message,metadata);
            log3.fatal(message,metadata);
            
            expect(appender1.length).toBe(5);
        });
        
        it('Should log only "fatal" level (default log level)', function(){
            log4 = localLogger.getLogger('my.old.package');
            
            log4.trace(message,metadata);
            log4.debug(message,metadata);
            log4.log(message,metadata);
            log4.info(message,metadata);
            log4.warn(message,metadata);
            log4.error(message,metadata);
            log4.fatal(message,metadata);
            
            expect(appender1.length).toBe(1);
        });
    });
    
    describe('Using two appenders both in same level log', function(){
        var module = 'my.new.package';
        var log = {};
        beforeEach(function () {
            localLogger = new logger.Logger();
            appender1 = [];
            appender2 = [];
            
            // Appender 1
            var config1 = {};
            config1.filters = {};
            config1.filters.default = 0;
            
            localLogger.addAppender(new FakeAppender(config1, appender1));
            localLogger.addAppender(new FakeAppender(config1, appender2));
            
            log = localLogger.getLogger(module);
        });
        
        it('Should log in both appenders', function(){
            log.fatal(message,metadata);
            
            expect(appender1.length).toBe(1);
            expect(appender2.length).toBe(1);
        });
        
        it('Should not log in both appenders', function(){
            log.warn(message,metadata);
            
            expect(appender1.length).toBe(0);
            expect(appender2.length).toBe(0);
        });
        
    });
    describe('Using two appenders in diferent log levels', function(){
        var module = 'my.new.package';
        var log = {};
        beforeEach(function () {
            localLogger = new logger.Logger();
            appender1 = [];
            appender2 = [];
            
            // Appender 1
            var config1 = {};
            config1.filters = {};
            config1.filters.default = 0;
            // Appender 2
            var config2 = {};
            config2.filters = {};
            config2.filters.default = 1;
            
            localLogger.addAppender(new FakeAppender(config1, appender1));
            localLogger.addAppender(new FakeAppender(config2, appender2));
            
            log = localLogger.getLogger(module);
        });
        
        it('Should log in both appenders', function(){
           
            log.fatal(message,metadata);
            
            expect(appender1.length).toBe(1);
            expect(appender2.length).toBe(1);
        });
        
        it('Should log only on appender2', function(){
            
            log.error(message,metadata);
            
            expect(appender1.length).toBe(0);
            expect(appender2.length).toBe(1);
        });
        
        it('Should not log in both appenders', function(){
            
            log.warn(message,metadata);
            
            expect(appender1.length).toBe(0);
            expect(appender2.length).toBe(0);
        });
    });
    
});

'use strict';
describe('Service: KeyboardService', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.keyboard.service'));

    // instantiate service
    var KeyboardService = undefined;
    beforeEach(inject(function(_KeyboardService_) {
        KeyboardService = _KeyboardService_;
    }));

    it('should do something', function() {
        expect(!!KeyboardService).toBe(true);
    });

    it('should\'t register an input without id', function() {

        var inputmock = {

        };

        expect(function() {
            KeyboardService.register(inputmock);
        }).toThrow();
    });

    it('should register a full valid input', function() {

        var inputmock = {
            id : 2,
            prev : 1,
            next : 3
        };

        expect(function() {
            KeyboardService.register(inputmock);
        }).not.toThrow();
    });

    it('should register the openKeyboard function in the input', function() {
        expect(!!KeyboardService).toBe(true);
    });

    it('should register an input with prev', function() {
        var inputmock = {
            id : 2,
            prev : 1,
        };

        expect(function() {
            KeyboardService.register(inputmock);
        }).not.toThrow();
    });

    it('should register an input with next', function() {
        var inputmock = {
            id : 2,
            next : 3,
        };

        expect(function() {
            KeyboardService.register(inputmock);
        }).not.toThrow();
    });

    it('should register an input withou prev or next', function() {
        var inputmock = {
            id : 2
        };

        expect(function() {
            KeyboardService.register(inputmock);
        }).not.toThrow();
    });
});

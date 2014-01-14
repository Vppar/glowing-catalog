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

    it('should remove a registred input', function() {

        var input = {
            id : 1
        };

        KeyboardService.register(input);

        expect(function() {
            KeyboardService.unregister(input);
        }).not.toThrow();

    });

    it('shouldn\'t remove a registred input with an inexistent id', function() {

        var input = {
            id : 0
        };

        expect(function() {
            KeyboardService.unregister(input);
        }).toThrow();
    });

    it('shouldn\'t remove nothing case the input has no id', function() {

        var input = {};

        expect(function() {
            KeyboardService.unregister(input);
        }).toThrow();
    });

});

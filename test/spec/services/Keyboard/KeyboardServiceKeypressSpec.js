'use strict';

describe('Service: KeyboardService', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.keyboard.service');
    });

    // instantiate service
    var KeyboardService = undefined;
    beforeEach(inject(function(_KeyboardService_) {
        KeyboardService = _KeyboardService_;
    }));

    it('should exists', function() {
        expect(!!KeyboardService).toBe(true);
    });

    it('should pass the call to the correct input destiny', function() {

        var inputmock = {
            id : 1,
            setActive : function setActive(arg) {

            },
            keypress : function keypress(arg) {

            }

        };

        var keyboardmock = {
            value : true,
            setActive : function setActive(arg) {

            }
        };

        KeyboardService.register(inputmock);
        KeyboardService.setKeyboard(keyboardmock);
        inputmock.setFocus();

        expect(function() {
            KeyboardService.keypress(inputmock);
        }).not.toThrow();
    });

    it('should not pass the call to an undefined input', function() {

        var inputmock = {
            id : 1,
            setActive : function setActive(arg) {

            },
            keypress : function keypress(arg) {

            }
        };

        expect(function() {
            KeyboardService.keypress(inputmock);
        }).toThrow();
    });

});

'use strict';

describe('Service: KeyboardService', function() {

    var inputmock1 = {
        id : 1,
        next : 2,

        keypress : function keypress(arg) {

        }
    };

    var inputmock2 = {
        id : 2,
        prev : 1,

        keypress : function keypress(arg) {

        }
    };

    var inputmock3 = {
        id : 3,
        keypress : function keypress(arg) {

        }
    };

    var keyboardmock = {
        value : true,
        setActive : function setActive(arg) {

        }
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.keyboard.service');
    });

    // instantiate service
    var KeyboardService = undefined;
    beforeEach(inject(function(_KeyboardService_) {
        KeyboardService = _KeyboardService_;
    }));

    beforeEach(function() {

        inputmock1.setActive = jasmine.createSpy('setActive');
        inputmock2.setActive = jasmine.createSpy('setActive');
        inputmock3.setActive = jasmine.createSpy('setActive');
    });

    it('should do something', function() {
        expect(!!KeyboardService).toBe(true);
    });

    it('should set the currentfield with next input', inject(function() {

        KeyboardService.register(inputmock1);
        KeyboardService.register(inputmock2);
        KeyboardService.setKeyboard(keyboardmock);
        inputmock1.setFocus();

        KeyboardService.next();
        expect(inputmock2.setActive).toHaveBeenCalledWith(true);

    }));

    it('should unset the currentfield', inject(function() {

        KeyboardService.register(inputmock3);
        KeyboardService.register(inputmock1);
        KeyboardService.setKeyboard(keyboardmock);
        inputmock3.setFocus();

        KeyboardService.next();
        expect(inputmock3.setActive).toHaveBeenCalledWith(false);

    }));
});

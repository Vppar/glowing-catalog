'use strict';

describe('Service: KeyboardService', function() {

    var inputmock1 = null;

    var inputmock2 = null;

    var inputmock3 = null;

    var keyboardmock = null;

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

        inputmock1 = {
            id : 1,
            next : 2,

            keypress : function keypress(arg) {

            }
        };

        inputmock2 = {
            id : 2,
            prev : 1,

            keypress : function keypress(arg) {

            }
        };

        inputmock3 = {
            id : 3,
            keypress : function keypress(arg) {

            }
        };

        keyboardmock = {
            value : true,
            setActive : function setActive(arg) {

            }
        };

        inputmock1.setActive = jasmine.createSpy('setActive1');
        inputmock2.setActive = jasmine.createSpy('setActive2');
        inputmock3.setActive = jasmine.createSpy('setActive3');
    });

    it('should do something', function() {
        expect(!!KeyboardService).toBe(true);
    });

    it('should set the currentfield with prev input', inject(function() {

        KeyboardService.register(inputmock2);
        KeyboardService.register(inputmock1);
        KeyboardService.setKeyboard(keyboardmock);
        inputmock2.setFocus();

        KeyboardService.prev();
        expect(inputmock1.setActive).toHaveBeenCalledWith(true);

    }));

    it('should keep the currentfield when prev is called and currentfield does not have a prev', inject(function() {

        KeyboardService.register(inputmock1);
        KeyboardService.register(inputmock2);
        KeyboardService.setKeyboard(keyboardmock);
        inputmock1.setFocus();

        KeyboardService.prev();
        expect(inputmock1.setActive.calls.length).toEqual(1);

    }));
});

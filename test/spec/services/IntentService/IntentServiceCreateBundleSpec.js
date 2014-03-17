'use strict';

describe('Service: IntentServiceCreateBundleSpec', function() {

    var log = {};

    // load the service's module
    beforeEach(module('tnt.catalog.service.intent'));

    beforeEach(function() {
        log.error = jasmine.createSpy('log.error');
        module(function($provide) {
            $provide.value('$log', log);
        });
    });
    // instantiate service
    var IntentService = undefined;
    beforeEach(inject(function(_IntentService_) {
        IntentService = _IntentService_;
    }));

    it('should create a Bundle', function() {
        // given
        var data = 'testData';
        var resp = null;

        //when
        IntentService.createBundle(data);
        resp = IntentService.getBundle(data);

        //expect
        expect(resp).toEqual(data);
        expect(log.error).not.toHaveBeenCalled();
    });

    it('should fire a overwriting warning ', function() {
        // given
        var data = 'testData';
        var data2 = 'second testData';
        var resp = null;

        // when
        IntentService.createBundle(data);

        IntentService.createBundle(data2);

        resp = IntentService.getBundle(data);

        // expect
        expect(log.error).toHaveBeenCalledWith('Overwriting a bundle... this showld not happen!', data);
        expect(resp).toEqual(data2);
    });

});

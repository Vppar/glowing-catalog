'use strict';

describe('Service: SMSService', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.service.sms'));

    // instantiate service
    var SMSService = undefined;
    beforeEach(inject(function(_SMSService_) {
        SMSService = _SMSService_;
    }));

    it('should send a sms', function() {
        
        SMSService.send = jasmine.createSpy('SMSService.send');

        var customer = {
            name : 'Bertina Pagudagua',
            phones : [
                {
                    number : '99887766'
                }
            ]
        };

        var orderAmount = 30;

        SMSService.sendPaymentConfirmation(customer, orderAmount);

        expect(SMSService.send).toHaveBeenCalledWith('5599887766', 'Ola Bertina, seu pedido no valor de R$30,00 reais foi confirmado. Maria Lima, sua consultora Mary Kay.');
    });
    
    it('should not send a sms', function() {
        
        SMSService.send = jasmine.createSpy('SMSService.send');

        var customer = {
            name : 'Bertina Pagudagua',
            phones : [
                {
                    number : '30325500'
                }
            ]
        };

        var orderAmount = 30;

        SMSService.sendPaymentConfirmation(customer, orderAmount);

        expect(SMSService.send).not.toHaveBeenCalled();
    });
});

'use strict';

describe('Service: SMSService', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.service.sms'));

    // instantiate service
    var SMSService = undefined;
    beforeEach(inject(function(_SMSService_) {
        SMSService = _SMSService_;
    }));

    it('should send a voucher sms', function() {
        
        SMSService.send = jasmine.createSpy('SMSService.send');

        var customer = {
            name : 'Bertina Pagudagua',
            phones : [
                {
                    number : '99887766'
                }
            ]
        };

        var voucherAmount = 30;

        SMSService.sendVoucherConfirmation(customer, voucherAmount);

        expect(SMSService.send).toHaveBeenCalledWith('5599887766', 'Voce recebeu um Vale Credito no valor de 30,00 reais a ser utilizado na sua proxima compra de produtos MK. Sua consultora Mary Kay.');
    });
});

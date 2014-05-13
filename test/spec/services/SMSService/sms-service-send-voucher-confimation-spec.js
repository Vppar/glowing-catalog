'use strict';

describe('Service: SMSService', function() {

    // load the service's module
    beforeEach(function () {
        module('tnt.catalog.service.sms'); 
    });

    // instantiate service
    var SMSService = undefined;
    var ConsultantServiceMock = {};
    var user = {
        name : 'Jurandir Cunha Agostino de Nobrega Filho',
        cellphone : '4112121212',
        formatedCellphone : '(41) 1212-1212'
    };
    
    beforeEach(function () {
        ConsultantServiceMock.get =
            jasmine.createSpy('ConsultantServiceMock.get').andReturn(user);
    });

    beforeEach(module(function ($provide) {
        $provide.value('ConsultantService', ConsultantServiceMock);
    }));
    
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

        expect(SMSService.send).toHaveBeenCalledWith('5599887766', 'Voce recebeu um Vale Credito no valor de 30,00 reais a ser utilizado na sua proxima compra de produtos Mary Kay. Jurandir (41) 1212-1212.');
    });
});

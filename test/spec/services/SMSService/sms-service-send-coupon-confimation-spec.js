'use strict';

describe(
    'Service: SMSService',
    function () {

        // load the service's module
        beforeEach(function () {
            module('tnt.catalog.service.sms');
        });

        // instantiate service
        var SMSService = {};
        var ConsultantServiceMock = {};
        var user = {name:'Jurandir Cunha Agostino de Nobrega Filho', cellphone:'4112121212', formatedCellphone : '(41) 1212-1212'};
        
        beforeEach(function(){
            ConsultantServiceMock.get = jasmine.createSpy('ConsultantServiceMock.get').andReturn(user);
        });
        
        beforeEach(module(function ($provide) {
            $provide.value('ConsultantService', ConsultantServiceMock);
        }));
        
        beforeEach(inject(function (_SMSService_) {
            SMSService = _SMSService_;
        }));

        it(
            'should send a coupon sms',
            function () {

                SMSService.send = jasmine.createSpy('SMSService.send');
                
                var customer = {
                    name : 'Bertina Pagudagua',
                    phones : [
                        {
                            number : '99887766'
                        }
                    ]
                };

                var coupons = {
                    10 : 3
                };

                for ( var i in coupons) {
                    SMSService.sendCouponConfirmation(customer, (i * coupons[i]), coupons[i]);
                }
                expect(SMSService.send)
                    .toHaveBeenCalledWith(
                        '5599887766',
                        'Voce recebeu 3 cupons promocionais no valor total de 30,00 reais a serem utilizados na compra de produtos Mary Kay. Jurandir (41) 1212-1212.');
            });
    });

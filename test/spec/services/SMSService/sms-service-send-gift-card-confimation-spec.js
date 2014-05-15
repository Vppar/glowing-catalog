'use strict';

describe(
    'Service: SMSService',
    function () {

        // load the service's module
        beforeEach(function () {
            module('tnt.catalog.service.sms'); 
        });

        // instantiate service
        var SMSService = undefined;
        var EntityService = {};
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
            $provide.value('EntityService', EntityService);
            $provide.value('ConsultantService', ConsultantServiceMock);
        }));

        beforeEach(inject(function (_SMSService_) {
            SMSService = _SMSService_;
        }));

        it(
            'should send a giftcard sms',
            function () {

                SMSService.send = jasmine.createSpy('SMSService.send');
                EntityService.read = jasmine.createSpy('EntityService.read').andReturn({
                    name : "Albert Einstein",
                    phones : [
                        {
                            number : '88887766'
                        }
                    ],
                });

                var customer = {
                    name : 'Bertina Pagudagua',
                    phones : [
                        {
                            number : '99887766'
                        }
                    ]
                };

                var giftCard = {
                    entity : 1,
                    amount : 30
                };

                SMSService.sendGiftCardConfirmation(customer, giftCard);

                expect(SMSService.send)
                    .toHaveBeenCalledWith(
                        '5588887766',
                        'Voce recebeu de Bertina um Vale Presente no valor de 30,00 reais a ser utilizado na compra de produtos. Jurandir (41) 1212-1212.');
            });
    });

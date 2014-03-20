'use strict';

describe(
        'Service: SMSService',
        function() {

            // load the service's module
            beforeEach(module('tnt.catalog.service.sms'));

            // instantiate service
            var SMSService = undefined;
            var EntityService = {};
            beforeEach(module(function($provide) {
                $provide.value('EntityService', EntityService);
            }));
            beforeEach(inject(function(_SMSService_) {
                SMSService = _SMSService_;
            }));

            it(
                    'should send a giftcard sms',
                    function() {

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
                                        'Voce recebeu de Bertina Pagudagua um Vale Presente no valor de 30,00 reais a ser utilizado na compra de produtos MK. Sua consultora Mary Kay.');
                    });
        });

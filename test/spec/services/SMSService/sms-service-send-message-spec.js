'use strict';

describe(
        'Service: SMSService',
        function() {

            // load the service's module
            beforeEach(function() {
                module('tnt.catalog.service.sms');
            });

            // instantiate service
            var SMSService = undefined;
            var $httpBackend = undefined;
            var $rootScope = {};
            var ConsultantServiceMock = {};
            var user = {
                name : 'Jurandir Cunha Agostino de Nobrega Filho',
                cellphone : '4112121212',
                formatedCellphone : '(41) 1212-1212'
            };

            beforeEach(function() {
                ConsultantServiceMock.get = jasmine.createSpy('ConsultantServiceMock.get').andReturn(user);
            });

            beforeEach(module(function($provide) {
                $provide.value('ConsultantService', ConsultantServiceMock);
            }));

            beforeEach(inject(function(_SMSService_, _$q_, _$httpBackend_, _$rootScope_) {
                SMSService = _SMSService_;
                $httpBackend = _$httpBackend_;
                $rootScope = _$rootScope_;
            }));

            it(
                    'should send a voucher sms',
                    function() {

                        var customer = {
                            name : 'Bertina Pagudagua',
                            phones : [
                                {
                                    number : '99887766'
                                }
                            ]
                        };

                        var voucherAmount = 30;

                        var url =
                                'https://vopp.com.br/api/sms/?to=5599887766&message=Voce recebeu um Vale Credito no valor de '
                            +'30,00 reais a ser utilizado na sua proxima compra de produtos. Jurandir Cunha Agostino de Nobrega Filho'
                            +' (41) 1212-1212.&token=8f934ur83rhq34r879hncfq9f4yq987nf4dh4fyn98hdmi44dz21x3gdju893d2';

                        ConsultantServiceMock.get = jasmine.createSpy('ConsultantServiceMock.get').andReturn(user);

                        $httpBackend.when('GET', url).respond(200);

                        var result = undefined;
                        runs(function() {
                            SMSService.sendVoucherConfirmation(customer, voucherAmount).then(function(_result_) {
                                result = _result_;
                            }, function(error) {
                                throw error;
                            });
                        });

                        waitsFor(function() {
                            $rootScope.$apply();
                            $httpBackend.flush();
                            return result;
                        });

                        runs(function() {
                            expect(result).toEqual('SMS enviado.');
                        });

                    });

        });
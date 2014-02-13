(function(angular) {
    'use strict';

    angular
            .module('tnt.catalog.service.sms', [
                'tnt.catalog.service.data'
            ])
            .service(
                    'SMSService',
                    function($http, $q, $interpolate) {

                        // ############################################################################################
                        // SMS related functions
                        // ############################################################################################
                        var baseUrl = 'http://mars.tunts.net/sms/vpsa.php';
                        var token = '8f934ur83rhq34r879hncfq9f4yq987nf4dh4fyn98hdmi44dz21x3gdju893d2';
                        var method = 'GET';

                        this.send = function send(to, message) {
                            var url = baseUrl + '?to=' + to;
                            url = url + '&message=' + message;
                            url = url + '&token=' + token;

                            var result = $http({
                                method : method,
                                url : url
                            }).success(function sucessLog(data, status) {
                                console.log('success');
                                console.log(status);
                            }).error(function errLog(data, status) {
                                console.log('error');
                                console.log(status);
                            }).then(function() {
                                return 'SMS enviado.';
                            }, function() {
                                return 'Erro ao enviar SMS.';
                            });
                            return result;
                        };
                        
                        // ############################################################################################
                        // Getters
                        // ############################################################################################
                        var getPhoneNumber = function(customer) {
                            var to = null;
                            for ( var idx in customer.phones) {
                                var phone = customer.phones[idx];
                                if (phone.number.charAt(2) >= 7) {
                                    to = '55'+phone.number;
                                    break;
                                }
                            }
                            return to;
                        };

                        var getYourConsultantGenderRelativePhrase = function(user) {
                            var phrase = null;
                            if (user.gender === 'Female') {
                                phrase = 'sua consultora';
                            } else {
                                phrase = 'seu consultor';
                            }
                            return phrase;
                        };

                        // ############################################################################################
                        // Payment functions
                        // ############################################################################################
                        /**
                         * Msgs template.
                         */
                        var paymentConfirmationSMS =
                                'Ola {{customerName}}, seu pedido no valor de {{orderAmount | currency}} reais foi confirmado. {{representativeName}}, {{yourConsultant}} Mary Kay.';
                        var cellMissingAlert =
                                'Não foi possível enviar o SMS, o cliente {{customerName}} não possui um número de celular em seu cadastro.';

                        this.sendPaymentConfirmation = function sendPaymentConfirmation(customer, orderAmount) {

                            var to = getPhoneNumber(customer);

                            // FIXME use UserService
                            var user = {
                                name : 'Maria Lima',
                                gender : 'Female'

                            };

                            var smsSent = null;
                            var data = {};

                            // complete data object
                            data.customerName = customer.name;
                            data.orderAmount = orderAmount;
                            data.representativeName = user.name;
                            data.yourConsultant = getYourConsultantGenderRelativePhrase(user);

                            if (to) {
                                var smsMessage = $interpolate(paymentConfirmationSMS)(data);
                                smsSent = this.send(to, smsMessage);
                            } else {
                                smsSent = $q.reject($interpolate(cellMissingAlert)(data));
                            }
                            return smsSent;
                        };

                    });
}(angular));
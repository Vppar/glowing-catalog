(function(angular) {
    angular
            .module('tnt.catalog.service.sms', [
                'tnt.catalog.service.data'
            ])
            .service(
                    'SMSService',
                    function($http, $q, DataProvider) {

                        // ############################################################################################
                        // SMS related functions
                        // ############################################################################################
                        var baseUrl = 'http://mars.tunts.net/sms/vpsa.php';
                        var token = '8f934ur83rhq34r879hncfq9f4yq987nf4dh4fyn98hdmi44dz21x3gdju893d2';
                        var method = 'GET';

                        var send = function send(to, message) {
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
                        // Payment functions
                        // ############################################################################################
                        /**
                         * Msgs template.
                         */
                        var paymentConfirmationSMS =
                                'Ola {{customerFirstName}}, seu pedido no valor de {{orderAmount}} reais foi confirmado. {{representativeName}} seu consultor Mary Kay.';
                        var cellMissingAlert =
                                'Não foi possível enviar o SMS, o cliente {{customerFirstName}} não possui um número de celular em seu cadastro.';

                        var sendPaymentConfirmation =
                                function sendPaymentConfirmation(customer, orderAmount) {
                                    // Find a cell number.
                                    var to = null;
                                    for ( var idx in customer.phones) {
                                        var phone = customer.phones[idx];
                                        if (phone.number.charAt(2) >= 7) {
                                            to = phone.number;
                                            break;
                                        }
                                    }

                                    // Send the sms.
                                    var smsSent = null;
                                    var customerFirstName = null;
                                    if (to) {
                                        // Get the customer first name.s
                                        customerFirstName = customer.name.split(' ')[0];

                                        var smsMessage =
                                                paymentConfirmationSMS.replace('{{customerFirstName}}', customerFirstName).replace(
                                                        '{{representativeName}}', DataProvider.representative.name).replace(
                                                        '{{orderAmount}}', orderAmount);
                                        smsSent = send('55' + to, smsMessage);
                                    } else {
                                        smsSent = $q.reject(cellMissingAlert.replace('{{customerFirstName}}', customerFirstName));
                                    }
                                    return smsSent;
                                };

                        this.send = send;
                        this.sendPaymentConfirmation = sendPaymentConfirmation;
                    });
}(angular));
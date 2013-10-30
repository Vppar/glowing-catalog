(function(angular) {
    angular.module('glowingCatalogApp').service('MessageService', function($http, $q) {

        var baseUrl = 'http://mars.tunts.net/sms/vpsa.php';
        var token = '8f934ur83rhq34r879hncfq9f4yq987nf4dh4fyn98hdmi44dz21x3gdju893d2';
        var method = 'GET';

        this.sendSMS = function sendSMS(to, message) {
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

        // var baseUrl = 'http://mars.tunts.net/sms/vpsa.php';
        // var token =
        // '8f934ur83rhq34r879hncfq9f4yq987nf4dh4fyn98hdmi44dz21x3gdju893d2';
        // var method = 'POST';
        //
        // this.sendSMS = function sendSMS(to, message) {
        // var url = baseUrl;
        // $http({
        // method: method,
        // url : url,
        // data : {
        // token : token,
        // to : to,
        // message : message
        // }
        // }).success(function sucessLog(data, status) {
        // console.log('success');
        // console.log(status);
        // }).error(function errLog(data, status) {
        // console.log('error');
        // console.log(status);
        // });
        // };
    });
}(angular));
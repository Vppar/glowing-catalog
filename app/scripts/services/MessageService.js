(function(angular) {
    angular.module('glowingCatalogApp').service('MessageService', function($http) {


        var baseUrl = 'http://mars.tunts.net/sms/vpsa.php';
        var token = '8f934ur83rhq34r879hncfq9f4yq987nf4dh4fyn98hdmi44dz21x3gdju893d2';
        var method = 'GET';

        this.sendSMS = function sendSMS(to, message) {
            var url = baseUrl + '?to=' + to;
            url = url + '&message=' + message;
            url = url + '&token=' + token;

            $http({
                method : method,
                url : url
            }).success(function sucessLog(data, status) {
                console.log('success');
                console.log(status);
            }).error(function errLog(data, status) {
                console.log('error');
                console.log(status);
            });
        };
    });
}(angular));
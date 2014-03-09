(function(angular) {
    'use strict';

    angular.module('tnt.utils.cpf', []).service('CpfService', [
        function CpfService() {

            this.validate = function(cpf) {
                var numbers, digits, sum, i, result, equalDigitis;
                equalDigitis = 1;
                
                if (cpf.length < 11) {
                    return false;
                }
                for (i = 0; i < cpf.length - 1; i++) {
                    if (cpf.charAt(i) !== cpf.charAt(i + 1)) {
                        equalDigitis = 0;
                        break;
                    }
                }
                if (!equalDigitis) {
                    numbers = cpf.substring(0, 9);
                    digits = cpf.substring(9);
                    sum = 0;
                    for (i = 10; i > 1; i--) {
                        sum += numbers.charAt(10 - i) * i;
                    }
                    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
                    if (String(result) !== digits.charAt(0)) {
                        return false;
                    }
                    numbers = cpf.substring(0, 10);
                    sum = 0;
                    for (i = 11; i > 1; i--) {
                        sum += numbers.charAt(11 - i) * i;
                    }
                    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
                    if (String(result) !== digits.charAt(1)) {
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            };
        }
    ]);
})(angular);

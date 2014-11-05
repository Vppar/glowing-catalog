(function (angular, unescape) {
    'use strict';
    angular
        .module('tnt.catalog.card.config.ctrl', [
            'tnt.catalog.card.config.service','tnt.catalog.card.config'
        ])
        .controller(
            'CardConfigCtrl',
            [
                '$scope', '$log', 'CardConfigService', 'CardConfig', 'UserService', 'DialogService', 'DataProvider',
                function ($scope, $log, CardConfigService, CardConfig, UserService, DialogService, DataProvider) {

                    // #############################################################################################################
                    // Security for this Controller
                    // #############################################################################################################
                    UserService.redirectIfInvalidUser();

                    // #############################################################################################################
                    // Initialize variables
                    // #############################################################################################################

                    $scope.cardConfig = {};
                    $scope.cardConfig.uuid = null;
                    $scope.cardConfig.ccDaysToExpire = null;
                    $scope.cardConfig.ccOpRate1Installment = null;
                    $scope.cardConfig.ccOpRate26Installment = null;
                    $scope.cardConfig.ccOpRate712Installment = null;
                    $scope.cardConfig.ccClosingDate = null;
                    $scope.cardConfig.ccExpirationDate = null;
                    $scope.cardConfig.dcDaysToExpire = null;
                    $scope.cardConfig.dcOpRate = null;
                    $scope.ccClosingDate = {};
                    $scope.ccExpirationDate = {};
                    $scope.ccClosingDateProvider = DataProvider.date;
                    $scope.ccExpirationDateProvider = DataProvider.date;

                    var cardConfigs = null;
                    var alertTitle = 'Configura' + unescape('%e7') + unescape('%e3') + 'o de Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito';
                    
                    loadCardConfigValues();

                    // #############################################################################################################
                    // Controller methods (sacred-card-config.html)
                    // #############################################################################################################
                    $scope.confirm = function () {
                        if ($scope.cardConfig && $scope.cardConfig.uuid && $scope.cardConfig.uuid !== null) {
                            $scope.update();
                        } else {
                            $scope.save();
                        }
                    };

                    $scope.save = function () {
                        if ($scope.validateFields()) {
                            CardConfigService.add(getCardConfig($scope.cardConfig)).then(function () {
                                loadCardConfigValues();
                                DialogService.messageDialog({
                                    title : alertTitle,
                                    message : alertTitle + ' cadastrada com sucesso.',
                                    btnYes : 'OK'
                                });
                            }, function (err) {
                                $log.error('Failed to add card config: ', err);
                                DialogService.messageDialog({
                                    title : alertTitle,
                                    message : 'Falha no cadastro da '+alertTitle,
                                    btnYes : 'OK'
                                });
                            });
                        }
                    };

                    $scope.update = function () {
                        if ($scope.validateFields()) {
                            CardConfigService.update(getCardConfig($scope.cardConfig)).then(function () {
                                loadCardConfigValues();
                                DialogService.messageDialog({
                                    title : alertTitle,
                                    message : alertTitle + ' atualizada com sucesso.',
                                    btnYes : 'OK'
                                });
                            }, function (err) {
                                $log.error('Failed to update card config: ', err);
                                DialogService.messageDialog({
                                    title : alertTitle,
                                    message : 'Falha na atualiza'+ unescape('%e7') + unescape('%e3') + 'o da '+alertTitle,
                                    btnYes : 'OK'
                                });
                            });
                        }
                    };

                    $scope.validateFields = function() {

                        removeInvalidValues($scope.cardConfig);

                        if($scope.cardConfig.ccDaysToExpire && !isInteger($scope.cardConfig.ccDaysToExpire)) {
                            return alertMessage('O Prazo de Vencimento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.');
                        }

                        if($scope.cardConfig.ccOpRate1Installment && !isNumeric($scope.cardConfig.ccOpRate1Installment)) {
                            return alertMessage('A Taxa da Operadora para pagamento a vista no Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.');
                        }

                        if($scope.cardConfig.ccOpRate26Installment && !isNumeric($scope.cardConfig.ccOpRate26Installment)) {
                            return alertMessage('A Taxa da Operadora para pagamento de 2 a 6 vezes no Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.');
                        }

                        if($scope.cardConfig.ccOpRate712Installment && !isNumeric($scope.cardConfig.ccOpRate712Installment)) {
                            return alertMessage('A Taxa da Operadora para pagamento de 7 a 12 vezes no Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.');
                        }

                        if($scope.cardConfig.dcDaysToExpire && !isInteger($scope.cardConfig.dcDaysToExpire)) {
                            return alertMessage('O Prazo de Vencimento do Cart'+ unescape('%e3') + 'o de D'+ unescape('%e9') +'bito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.');
                        }

                        if($scope.cardConfig.dcOpRate && !isNumeric($scope.cardConfig.dcOpRate)) {
                            return alertMessage('A Taxa da Operadora para pagamento no Cart'+ unescape('%e3') + 'o de D'+ unescape('%e9') +'bito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.');
                        }
                        
                        if($scope.ccClosingDate.day || $scope.ccClosingDate.month || $scope.ccClosingDate.year) {
                            if(!$scope.ccClosingDate.day || !$scope.ccClosingDate.month || !$scope.ccClosingDate.year) {
                                return alertMessage('O Dia de Fechamento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.');
                            } else {
                                $scope.cardConfig.ccClosingDate = new Date($scope.ccClosingDate.year, $scope.ccClosingDate.month-1, $scope.ccClosingDate.day, 0, 0, 0, 0);
                            }
                        }

                        if($scope.ccExpirationDate.day || $scope.ccExpirationDate.month || $scope.ccExpirationDate.year) {
                            if(!$scope.ccExpirationDate.day || !$scope.ccExpirationDate.month || !$scope.ccExpirationDate.year) {
                                return alertMessage('O Dia de Vencimento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.');
                            } else {
                                $scope.cardConfig.ccExpirationDate = new Date($scope.ccExpirationDate.year, $scope.ccExpirationDate.month-1, $scope.ccExpirationDate.day, 0, 0, 0, 0);
                            }
                        }
                        return true;
                    };

                    function getCardConfig(obj) {
                        if(obj) {
                            return new CardConfig(
                                obj.uuid,
                                obj.ccDaysToExpire,
                                obj.ccOpRate1Installment,
                                obj.ccOpRate26Installment,
                                obj.ccOpRate712Installment,
                                obj.ccClosingDate,
                                obj.ccExpirationDate,
                                obj.dcDaysToExpire,
                                obj.dcOpRate);
                        }
                        return null;
                    }

                    function alertMessage(message) {
                        DialogService.messageDialog({
                            title : alertTitle,
                            message : message,
                            btnYes : 'OK'
                        });
                        return false;
                    }

                    function isNumeric(value) {
                        return !isNaN(value);
                    }

                    function isInteger(value){
                        if((parseFloat(value) === parseInt(value)) && !isNaN(value)){
                            return true;
                        }
                        return false;
                    }

                    function removeInvalidValues(obj) {
                        if(obj) {
                            for(var key in obj) {
                                if(obj[key] && typeof obj[key] === 'string') {
                                    obj[key] = obj[key].replace(/ /g,'').replace(/,/g,'.');
                                }
                            }
                        }
                    }

                    function loadCardConfigValues() {
                        var cardConfigs = CardConfigService.list();

                        if(cardConfigs && cardConfigs.length > 0) {
                            $scope.cardConfig = cardConfigs[0];

                            if($scope.cardConfig.ccClosingDate) {
                                var ccClosingDate = new Date($scope.cardConfig.ccClosingDate);
                                $scope.ccClosingDate.day = ccClosingDate.getDate();
                                $scope.ccClosingDate.month = ccClosingDate.getMonth()+1;
                                $scope.ccClosingDate.year = ccClosingDate.getFullYear();
                            }
                            if($scope.cardConfig.ccExpirationDate) {
                                var ccExpirationDate = new Date($scope.cardConfig.ccExpirationDate);
                                $scope.ccExpirationDate.day = ccExpirationDate.getDate();
                                $scope.ccExpirationDate.month = ccExpirationDate.getMonth()+1;
                                $scope.ccExpirationDate.year = ccExpirationDate.getFullYear();
                            }
                        }
                    }
 
                }
            ]);
}(angular, window.unescape));
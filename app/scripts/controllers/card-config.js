(function (angular) {
    'use strict';
    angular
        .module('tnt.catalog.card.config.ctrl', [
            'tnt.catalog.card.config.service'
        ])
        .controller(
            'CardConfigCtrl',
            [
                '$scope', 'CardConfigService', 'UserService', 'DialogService', 'DataProvider',
                function ($scope, CardConfigService, UserService, DialogService, DataProvider) {

                    // #############################################################################################################
                    // Security for this Controller
                    // #############################################################################################################
                    //UserService.redirectIfIsNotLoggedIn();

                    // #############################################################################################################
                    // Initialize variables
                    // #############################################################################################################
                    $scope.cardConfig = undefined;
                    $scope.ccClosingDate = {};
                    $scope.ccExpirationDate = {};
                    $scope.dataProviderDate = DataProvider.date;

                    var alertTitle = 'Configura' + unescape('%e7') + unescape('%e3') + 'o de Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito';
                    var cardConfigs = CardConfigService.list();

                    if(cardConfigs && cardConfigs.lenght > 0) {
                       $scope.cardConfig = cardConfigs[0];
                       if($scope.cardConfig.ccClosingDate.day && $scope.cardConfig.ccClosingDate.month && $scope.cardConfig.ccClosingDate.year) {
                          $scope.ccClosingDate.day = $scope.cardConfig.ccClosingDate.day;
                          $scope.ccClosingDate.month = $scope.cardConfig.ccClosingDate.month;
                          $scope.ccClosingDate.year = $scope.cardConfig.ccClosingDate.year;
                       }
                       if($scope.cardConfig.ccExpirationDate.day && $scope.cardConfig.ccExpirationDate.month && $scope.cardConfig.ccExpirationDate.year) {
                          $scope.ccExpirationDate.day = $scope.cardConfig.ccExpirationDate.day;
                          $scope.ccExpirationDate.month = $scope.cardConfig.ccExpirationDate.month;
                          $scope.ccExpirationDate.year = $scope.cardConfig.ccExpirationDate.year;
                       }
                    }

                    // #############################################################################################################
                    // Controller methods (sacred-card-config.html)
                    // #############################################################################################################
                    $scope.confirm = function () {
                        if ($scope.cardConfig && $scope.cardConfig.uuid) {
                            $scope.update();
                        } else {
                            $scope.save();
                        }
                    };

                    $scope.save = function () {
                        if ($scope.validateFields()) { 
                            CardConfigService.create($scope.cardConfig).then(function () {
                                DialogService.messageDialog({
                                    title : alertTitle,
                                    message : alertTitle + ' cadastrada com sucesso.',
                                    btnYes : 'OK'
                                });
                            }, function (err) {
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
                            CardConfigService.update($scope.cardConfig).then(function () {
                                DialogService.messageDialog({
                                    title : alertTitle,
                                    message : alertTitle + ' atualizada com sucesso.',
                                    btnYes : 'OK'
                                });
                            }, function (err) {
                                DialogService.messageDialog({
                                    title : alertTitle,
                                    message : 'Falha na atualiza'+ unescape('%e7') + unescape('%e3') + 'o da '+alertTitle,
                                    btnYes : 'OK'
                                });
                            });
                        }
                    };

                    $scope.validateFields = function() {
                        if($scope.cardConfig) {
                            var messages = [];
                            if($scope.cardConfig.ccDaysToExpire && !isInteger($scope.cardConfig.ccDaysToExpire)) {
                                alertMessage('O Prazo de Vencimento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.');
                            }

                            if($scope.cardConfig.ccOpRate1Installment && !isNumeric($scope.cardConfig.ccOpRate1Installment)) {
                                alertMessage('A Taxa da Operadora para pagamento a vista no Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.');
                            }

                            if($scope.cardConfig.ccOpRate26Installment && !isNumeric($scope.cardConfig.ccOpRate26Installment)) {
                                alertMessage('A Taxa da Operadora para pagamento de 2 a 6 vezes no Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.');
                            }

                            if($scope.cardConfig.ccOpRate712Installment && !isNumeric($scope.cardConfig.ccOpRate712Installment)) {
                                alertMessage('A Taxa da Operadora para pagamento de 7 a 12 vezes no Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.');
                            }

                            if($scope.cardConfig.dcDaysToExpire && !isInteger($scope.cardConfig.dcDaysToExpire)) {
                                alertMessage('O Prazo de Vencimento do Cart'+ unescape('%e3') + 'o de D'+ unescape('%e9') +'bito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.');
                            }

                            if($scope.cardConfig.dcOpRate && !isNumeric($scope.cardConfig.dcOpRate)) {
                                alertMessage('A Taxa da Operadora para pagamento no Cart'+ unescape('%e3') + 'o de D'+ unescape('%e9') +'bito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.');
                            }

                            if($scope.cardConfig.ccClosingDate.day || $scope.cardConfig.ccClosingDate.month || $scope.cardConfig.ccClosingDate.year) {
                                if(!$scope.cardConfig.ccClosingDate.day || !$scope.cardConfig.ccClosingDate.month || !$scope.cardConfig.ccClosingDate.year) {
                                   alertMessage('O Dia de Fechamento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.');
                                } else {
                                   $scope.cardConfig.ccClosingDate = new Date($scope.ccClosingDate.year, $scope.ccClosingDate.month, $scope.ccClosingDate.day);
                                }
                            }
                            if($scope.cardConfig.ccExpirationDate.day || $scope.cardConfig.ccExpirationDate.month || $scope.cardConfig.ccExpirationDate.year) {
                                if(!$scope.cardConfig.ccExpirationDate.day || !$scope.cardConfig.ccExpirationDate.month || !$scope.cardConfig.ccExpirationDate.year) {
                                   alertMessage('O Dia de Vencimento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.');
                                } else {
                                   $scope.cardConfig.ccExpirationDate = new Date($scope.ccExpirationDate.year, $scope.ccExpirationDate.month, $scope.ccExpirationDate.day);
                                }
                            }                            
                        }
                        return true;
                    }

                    function alertMessage(message) {
                        DialogService.messageDialog({
                            title : alertTitle,
                            message : messages,
                            btnYes : 'OK'
                        });
                        return false;
                    }

                    function isNumeric(number){
                        var pattern = '/^\d*\.{0,1}\d+$/';
                        return pattern.test(number);
                    }

                    function isInteger(number){
                        var pattern = '/^\d*\.{0,1}\d+$/';
                        return pattern.test(number);
                    }
                }
            ]);
}(angular));
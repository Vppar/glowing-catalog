(function (angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.receive.ctrl', []).controller(
        'ReceivableReceiveCtrl',
        [
            '$scope',
            '$filter',
            'ReceivableService',
            'BookService',
            'DialogService',
            'ArrayUtils',
            function ($scope, $filter, ReceivableService, BookService, DialogService, ArrayUtils) {

                $scope.paymentSelected = {
                    id : 1
                };
                $scope.negotiate = false;
                $scope.extra = 0;
                $scope.discount = 0;
                $scope.aditionalInfo = {
                    discount : 0,
                    extra : 0
                };
                $scope.selectedClassification = 1;
                $scope.classifications = [
                    {
                        id : 1,
                        description : 'Venda'
                    }
                ];

                $scope.paymentsType = [
                    {
                        id : 0,
                        describe : 'Cheque',
                        type : 'check'

                    }, {
                        id : 1,
                        describe : 'A Receber',
                        type : 'onCuff'
                    }, {
                        id : 2,
                        describe : 'Cartão de Crédito',
                        type : 'creditCard'

                    }
                ];

                function setPaymentType () {
                    $scope.setNegotiation(false);
                    if ($scope.selectedReceivable) {
                        var receivable = $scope.selectedReceivable;
                        for ( var ix in $scope.paymentsType) {
                            var paymentType = $scope.paymentsType[ix];
                            if (receivable.typeTranslated == paymentType.describe) {
                                $scope.paymentSelected.id = paymentType.id;
                            }
                        }
                    }
                }

                $scope.openReceivable = function () {
                    DialogService.openDialogReceivable($scope.selectedReceivable).then(function () {
                        $scope.clearSelectedReceivable();
                    }, function (err) {
                        // err = type of receivable. 1 = check
                        if (err == '0') {
                            $scope.paymentSelected.id = 0;
                            $scope.setNegotiation(true);
                            $scope.showCheckFields = true;
                        }
                    });
                };

                $scope.setNegotiation = function (value) {
                    $scope.negotiate = value;
                    // fill the header description
                    if ($scope.negotiate === true) {
                        if($scope.header){
                            $scope.header.description = "> Edição";
                        }
                        // should enable check fields
                        if ($scope.paymentSelected.id == 0) {
                            $scope.showCheckFields = true;
                        } else {
                            $scope.showCheckFields = false;
                        }
                    } else {
                        $scope.header.description = "> Detalhe";
                    }

                };

                $scope.cancelNegotiate = function () {
                    $scope.setNegotiation(false);
                    $scope.showCheckFields = false;
                };

                $scope.confirmNegotiate = function () {
                    changedFields();
                    if (!isValidDiscountAndExtra()) {
                        DialogService.messageDialog({
                            title : 'Descontos e Acréscimos',
                            message : 'Não é possível preencher os dois campos.',
                            btnYes : 'OK'
                        });
                    }

                    if (!isPaymentTypeValid()) {
                        DialogService.messageDialog({
                            title : 'Tipo de Recebível',
                            message : 'Não é possível alterar recebiveis em cartão de crédito.',
                            btnYes : 'OK'
                        });
                    }
                };

                /**
                 * Verifies if a receivable is valid.
                 * 
                 * @returns boolean
                 */
                $scope.isValid = function isValid (receivable) {
                    var result = true;
                    if (angular.isDefined(receivable.amount) && receivable.amount <= 0) {
                        result = false;
                    }
                    return result;
                };

                function changedFields () {
                    var receivable = $scope.selectedReceivable;
                    var originalReceivable =
                        ArrayUtils.find($scope.receivables.list, 'uuid', receivable.uuid);

                    var changedFields = [];
                    if (receivable.amount != originalReceivable.amount) {
                        changedFields.push('amount');
                    }
                    ;
                    if (receivable.duedate != originalReceivable.duedate) {
                        changedFields.push('duedate');
                    }
                    ;
                    if (receivable.remarks != originalReceivable.remarks) {
                        changedFields.push('remarks');
                    }
                    ;
                    if (receivable.type != getPaymentType($scope.paymentSelected.id)) {
                        changedFields.push('type');
                    }
                    ;
                    console.log(changedFields);
                }

                function getPaymentType (id) {
                    for ( var ix in $scope.paymentsType) {
                        var paymentType = $scope.paymentsType[ix];
                        if (paymentType.id == id) {
                            return paymentType.type;
                        }
                    }
                }

                
                $scope.showDialogOfDeath = function(){
                    DialogService.messageDialog({
                        title : 'Opps',
                        message : 'Homems trablhando nesta funcionalidade.',
                        btnYes : 'OK'
                    });
                };
                
                $scope.$watch('selectedReceivable', setPaymentType);
                $scope.$watchCollection('paymentSelected', function (newVal, oldVal) {

                    if ($scope.paymentSelected.id == '0') {
                        $scope.showCheckFields = true;
                    } else {
                        $scope.showCheckFields = false;
                    }
                });

                function isValidDiscountAndExtra () {
                    if ($scope.aditionalInfo.discount > 0 && $scope.aditionalInfo.extra > 0) {
                        return false;
                    }
                    return true;
                }

                function isPaymentTypeValid () {
                    if ($scope.paymentSelected.id == 2) {
                        return false;
                    }
                    return true;
                }
            }
        ]);
}(angular));
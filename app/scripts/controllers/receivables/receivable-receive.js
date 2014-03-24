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
            'CheckPayment',
            'OnCuffPayment',
            function ($scope, $filter, ReceivableService, BookService, DialogService, ArrayUtils, CheckPayment, OnCuffPayment) {

                $scope.paymentSelected = {
                    id : 1
                };
                
                $scope.check ={};
                $scope.negotiate = false;
                $scope.extra = 0;
                $scope.discount = 0;
                $scope.total ={amount:0};
                
                $scope.select2Options = {
                    minimumResultsForSearch : -1
                };
                
                $scope.aditionalInfo = {
                    discount : 0,
                    extra : 0,
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
                        describe : 'Saldo a receber',
                        type : 'onCuff'
                    }, {
                        id : 2,
                        describe : 'Cartão de Crédito',
                        type : 'creditCard'

                    }
                ];
                
                function setReceivablesInfos () {
                    $scope.aditionalInfo.discount = 0;
                    $scope.aditionalInfo.extra = 0;
                    
                    if ($scope.selectedReceivable) {
                        $scope.total.amount = $scope.selectedReceivable.amount;
                        var receivable = $scope.selectedReceivable;
                        for ( var ix in $scope.paymentsType) {
                            var paymentType = $scope.paymentsType[ix];
                            if (receivable.typeTranslated == paymentType.describe) {
                                $scope.paymentSelected.id = paymentType.id;
                            }
                        }
                    }
                }

                $scope.liquidateReceivable = function () {
                    if (!isValidDiscountAndExtra()) {
                        DialogService.messageDialog({
                            title : 'Contas a receber',
                            message : 'Não é possível acréscimos e descontos ao mesmo tempo.',
                            btnYes : 'OK'
                        });
                        return
                    }
                    
                    var changedFields = verifyChangedFields();
                    if(changedFields.hasChange){
                        $scope.save(); 
                    }
                    $scope.selectedReceivable.totalAmount = $scope.total.amount;
                    DialogService.openDialogReceivable($scope.selectedReceivable).then(function () {
                        DialogService.messageDialog({
                            title : 'Contas a receber',
                            message : 'Baixa realizada com sucesso!',
                            btnYes : 'OK'
                        }).then(function(){
                            $scope.back();
                        });
                    }, function (err) {
                        // err = type of receivable. 1 = check
                        if (err == '0') {
                            $scope.paymentSelected.id = 0;
                            $scope.showCheckFields = true;
                        }
                    });
                    
                    
                };
                
                
                /**
                 * If some form field was changed we will save the receivable.
                 * 
                 * @argument isToShowDialog - if setted, at end of process we
                 *           will show a confirmation dialog.
                 * 
                 */
                $scope.save = function (isToShowDialog) {
                    var changedFields = verifyChangedFields();

                    // Verifica se houve alteração no receivable
                    if (!changedFields.hasChange && isToShowDialog) {
                        DialogService.messageDialog({
                            title : 'Contas a receber',
                            message : 'O vencimento não possui alterações.',
                            btnYes : 'OK'
                        });
                        return
                    }
                    // Valida os campos Discount e Extra
                    if (!isValidDiscountAndExtra() && isToShowDialog) {
                        DialogService.messageDialog({
                            title : 'Contas a receber',
                            message : 'Não é possível acréscimos e descontos ao mesmo tempo.',
                            btnYes : 'OK'
                        });
                        return
                    }
                    
                    
                    
                    // CALL SERVICE AND MAKE THINGS WORK
                    var amount = changedFields.amount?changedFields.amount.newVal:undefined ;
                    var duedate = changedFields.duedate? changedFields.duedate.newVal: undefined;
                    var remarks = changedFields.remarks? changedFields.remarks.newVal:undefined;
                    var typeNew = changedFields.type? changedFields.type.newVal : undefined;
                    var typeOld = changedFields.type? changedFields.type.oldVal : undefined;
                    var extra = $scope.aditionalInfo.extra > 0 ? $scope.aditionalInfo.extra : undefined;
                    var discount = $scope.aditionalInfo.discount > 0 ? $scope.aditionalInfo.discount : undefined;
                    
                    var totalAmount = extra ? ($scope.selectedReceivable.amount+extra) :($scope.selectedReceivable.amount - discount);
                    
                    
                    var newPayment = undefined;
                    if(typeNew && typeOld){
                        if(typeNew === 'check'){
                            newPayment = new CheckPayment($scope.selectedReceivable.uuid, $scope.check.bank, $scope.check.agency, $scope.check.account, $scope.check.number, $scope.selectedReceivable.duedate, totalAmount); 
                        }else if(typeNew === 'onCuff'){
                            newPayment = new OnCuffPayment($scope.selectedReceivable.amount, $scope.selectedReceivable.duedate);
                        }
                    }
                    var response = ReceivableService.update($scope.selectedReceivable.uuid, amount, duedate, remarks, newPayment, typeNew, typeOld, extra, discount);
                    
                    response.then(function(){
                        if(isToShowDialog){
                            DialogService.messageDialog({
                                title : 'Contas a receber.',
                                message : 'Vencimento alterado com sucesso!',
                                btnYes : 'OK'
                            }).then(function(){
                                $scope.back();
                            });
                        }
                    }, function(err){
                        console.log(err);
                    });
                    
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

                function verifyChangedFields () {
                    var receivable = $scope.selectedReceivable;
                    var originalReceivable =
                        ArrayUtils.find($scope.receivables.list, 'uuid', receivable.uuid);

                    var changedFields = {};
                    changedFields.hasChange = false;
                    if (receivable.amount != originalReceivable.amount) {
                        changedFields.amount={prop :'amount', oldVal:originalReceivable.amount, newVal:receivable.amount,};
                        changedFields.hasChange = true;
                    }
                    if (receivable.duedate != originalReceivable.duedate) {
                        changedFields.duedate = {prop :'duedate', oldVal:originalReceivable.duedate, newVal:receivable.duedate,};
                        changedFields.hasChange = true;
                    }
                    if (receivable.remarks != originalReceivable.remarks) {
                        changedFields.remarks = {prop :'remarks', oldVal:originalReceivable.remarks, newVal:receivable.remarks,};
                        changedFields.hasChange = true;
                    }
                    if (receivable.type != getPaymentType($scope.paymentSelected.id)) {
                        changedFields.type = {prop :'type', oldVal:originalReceivable.type, newVal:getPaymentType($scope.paymentSelected.id)};
                        changedFields.hasChange = true;
                    }
                    if ($scope.aditionalInfo.discount > 0) {
                        changedFields.discount = {prop :'discount', oldVal:0, newVal:$scope.aditionalInfo.discount};
                        changedFields.hasChange = true;
                    }
                    if ($scope.aditionalInfo.extra > 0) {
                        changedFields.discount = {prop :'discount', oldVal:0, newVal:$scope.aditionalInfo.extra};
                        changedFields.hasChange = true;
                    }
                    
                    return changedFields;
                }

                function getPaymentType (id) {
                    for ( var ix in $scope.paymentsType) {
                        var paymentType = $scope.paymentsType[ix];
                        if (paymentType.id == id) {
                            return paymentType.type;
                        }
                    }
                }

                $scope.$watch('selectedReceivable', setReceivablesInfos);
                $scope.$watchCollection('aditionalInfo', function(){
                    if($scope.aditionalInfo.discount>0){
                        $scope.total.amount = $scope.selectedReceivable.amount - $scope.aditionalInfo.discount;  
                    }else if($scope.aditionalInfo.extra > 0){
                        $scope.total.amount = $scope.selectedReceivable.amount + $scope.aditionalInfo.extra;
                    }else{
                        $scope.total.amount= 0;
                    }
                });
                
                $scope.$watchCollection('paymentSelected', function (newVal, oldVal) {
                    
                    if ($scope.paymentSelected.id == '0' && $scope.selectedReceivable.type != 'check') {
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
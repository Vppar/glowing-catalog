describe('Controller: AddCustomerPhonesDialogCtrl', function() {

    var scope = {};
    var dialog = {};
    var dp = {};
    var ds = {};
    var q = {};

    q.reject = function() {
        return 'rejected';
    };

    // load the controller's module
    beforeEach(module('tnt.catalog.customer.add.phones'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        ds.messageDialog = jasmine.createSpy();
        dp.phoneTypes = [
            'Residencial', 'Comercial', 'Celular'
        ];
        dialog.data = {
            phones : [
                {
                    number : '4191112222',
                    type : 'Celular'
                }, {
                    number : '4193334444',
                    type : 'Comercial'
                }, {
                    number : '4195556666',
                    type : 'Celular'
                }
            ]
        };
        dialog.close = jasmine.createSpy();
        scope = $rootScope.$new();
        scope.newPhoneForm = {
            $valid : false
        };
        $controller('AddCustomerPhonesDialogCtrl', {
            $scope : scope,
            $q: q,
            dialog : dialog,
            DataProvider : dp,
            DialogService : ds
        });
        $filter = _$filter_;
    }));

    /**
     * Should load the phoneTypes from DataProvider.
     */
    it('should load the phoneTypes', function() {
        expect(scope.phoneTypes).toEqual(dp.phoneTypes);
    });

    /**
     * Should load the phones in the scope if any is registered.
     */
    it('should load the phones', function() {
        expect(scope.phones).toEqual(dialog.data.phones);
    });

    /**
     * Should add phones to the local list.
     */
    it('should add phone', function() {
        var phone = {
            number : '4196667777',
            type : dp.phoneTypes[2]
        };
        scope.phone = angular.copy(phone);
        scope.newPhoneForm.$valid = true;

        scope.addPhone(scope.phone);

        // You should clear the currenct phone.
        expect(scope.phone.number).toBeUndefined();
        expect(scope.phone.type).toBe(dp.phoneTypes[0]);
        expect(phone).toEqual(scope.phones[scope.phones.length - 1]);
    });

    /**
     * Shouldn't add repeated phones.
     */
    it('shouldn\'t add phone', function() {
        var phone = {
            number : '4196667777',
            type : dp.phoneTypes[2]
        };
        scope.phone = angular.copy(phone);
        scope.newPhoneForm.$valid = true;

        // Add one phone
        scope.addPhone(scope.phone);

        var phonesSize = scope.phones.length;

        // Try to add the same phone again
        scope.phone = angular.copy(phone);
        scope.addPhone(scope.phone);

        var matchedPhones = $filter('filter')(scope.phones, {
            number : phone.number
        });

        // Test if the phones list size increased.
        expect(scope.phones.length).toBe(phonesSize);
        // There can be only one.
        expect(matchedPhones.length).toBe(1);
        // Warn the user that this number is already in the list
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Novo usuário',
            message : 'O telefone informado já pertence a lista.',
            btnYes : 'OK'
        });
    });

    /**
     * Shouldn't add phone if has a invalid form.
     */
    it('shouldn\'t add phone', function() {
        var phone = {
            number : '4196667777',
            type : dp.phoneTypes[2]
        };
        scope.phone = angular.copy(phone);

        scope.addPhone(scope.phone.number);

        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Novo usuário',
            message : 'O telefone informado é inválido.',
            btnYes : 'OK'
        });
    });

    /**
     * Should move a phone number up in the list.
     */
    it('should move phone number up', function() {
        // index of the number in the array.
        var index = 1;
        // Make a copy to test later
        var phones = angular.copy(scope.phones);
        scope.moveUp(index);
        expect(scope.phones[index - 1]).toEqual(phones[index]);
        expect(scope.phones[index]).toEqual(phones[index - 1]);
    });
    /**
     * Should move a phone number down in the list.
     */
    it('should move phone down down', function() {
        // index of the number in the array.
        var index = 1;
        // Make a copy to test later
        var phones = angular.copy(scope.phones);
        scope.moveDown(index);
        expect(scope.phones[index + 1]).toEqual(phones[index]);
        expect(scope.phones[index]).toEqual(phones[index + 1]);
    });
    
    /**
     * Should remove a phone number from the list.
     */
    it('should remove phone', function() {
        // index of the number in the array.
        var index = 1;
        var phone = angular.copy(scope.phones[index]);
        var phonesSize = scope.phones.length;
        
        // Make a copy to test later
        scope.remove(index);

        var matchedPhones = $filter('filter')(scope.phones, {
            number : phone.number
        });
        
        expect(scope.phones.length).toBe(phonesSize -1);
        expect(matchedPhones.length).toBe(0);
    });

    /**
     * Should just close the dialog doing nothing else.
     */
    it('should cancel add phones', function() {
        scope.cancel();
        expect(dialog.close).toHaveBeenCalledWith('rejected');
    });

    /**
     * Should close the dialog and pass the new phone list.
     */
    it('should confirm add phones', function() {
        scope.confirm();
        expect(dialog.close).toHaveBeenCalledWith(scope.phones);
    });

});
describe('Controller: AddCustomerEmailsDialogCtrl', function() {

    var scope = {};
    var dialog = {};
    var dp = {};
    var ds = {};
    var q = {};

    q.reject = function() {
        return 'rejected';
    };

    // load the controller's module
    beforeEach(module('tnt.catalog.customer.add.emails'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        ds.messageDialog = jasmine.createSpy();
        dialog.data = {
            emails : [
                {
                    address : 'email1@emailprovider.com',
                }, {
                    address : 'email2@emailprovider.com',
                }, {
                    address : 'email3@emailprovider.com',
                }
            ]
        };
        dialog.close = jasmine.createSpy();
        scope = $rootScope.$new();
        scope.newEmailForm = {
            $valid : false
        };
        $controller('AddCustomerEmailsDialogCtrl', {
            $scope : scope,
            $q : q,
            dialog : dialog,
            DataProvider : dp,
            DialogService : ds
        });
        $filter = _$filter_;
    }));

    /**
     * Should load the emails in the scope if any is registered.
     */
    it('should load the emails', function() {
        expect(scope.emails).toEqual(dialog.data.emails);
    });

    /**
     * Should add emails to the local list.
     */
    it('should add email', function() {
        var email = {
            address : 'email4@emailprovider.com',
        };
        scope.email = angular.copy(email);
        scope.newEmailForm.$valid = true;

        scope.addEmail(scope.email);

        // You should clear the current email.
        expect(scope.email.address).toBeUndefined();
        expect(email).toEqual(scope.emails[scope.emails.length - 1]);
    });

    /**
     * Shouldn't a add repeated email.
     */
    it('shouldn\'t add email', function() {
        var email = {
            address : 'email4@emailprovider.com',
        };
        scope.email = angular.copy(email);
        scope.newEmailForm.$valid = true;

        // Add one email
        scope.addEmail(scope.email);

        var lastItem = scope.emails.length;

        // Try to add the same email again
        scope.email = angular.copy(email);
        scope.addEmail(scope.email);

        var matchedEmails = $filter('filter')(scope.emails, {
            address : email.address
        });

        // Test if the emails list size increased.
        expect(scope.emails.length).toBe(lastItem);
        // There can be only one.
        expect(matchedEmails.length).toBe(1);
        // Warn the user that this number is already in the list
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Novo usuário',
            message : 'O e-mail informado já pertence a lista.',
            btnYes : 'OK'
        });
    });

    /**
     * Shouldn't add email if has a invalid form.
     */
    it('shouldn\'t add email', function() {
        var email = {
            address : 'email4@emailprovider.com',
        };
        scope.email = angular.copy(email);

        scope.addEmail(scope.email.address);

        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Novo usuário',
            message : 'O e-mail informado é inválido.',
            btnYes : 'OK'
        });
    });

    /**
     * Should move a email address up in the list.
     */
    it('should move email address up', function() {
        // index of the address in the array.
        var index = 1;
        // Make a copy to test later
        var emails = angular.copy(scope.emails);
        scope.moveUp(index);
        expect(scope.emails[index - 1]).toEqual(emails[index]);
        expect(scope.emails[index]).toEqual(emails[index - 1]);
    });
    /**
     * Should move a email address down in the list.
     */
    it('should move email address down down', function() {
        // index of the number in the array.
        var index = 1;
        // Make a copy to test later
        var emails = angular.copy(scope.emails);
        scope.moveDown(index);
        expect(scope.emails[index + 1]).toEqual(emails[index]);
        expect(scope.emails[index]).toEqual(emails[index + 1]);
    });

    /**
     * Should remove a email address from the list.
     */
    it('should remove email', function() {
        // index of the number in the array.
        var index = 1;
        var email = angular.copy(scope.emails[index]);
        var emailsSize = scope.emails.length;

        // Make a copy to test later
        scope.remove(index);

        var matchedEmails = $filter('filter')(scope.emails, {
            address : email.address
        });

        expect(scope.emails.length).toBe(emailsSize - 1);
        expect(matchedEmails.length).toBe(0);
    });

    /**
     * Should just close the dialog doing nothing else.
     */
    it('should cancel add emails', function() {
        scope.cancel();
        expect(dialog.close).toHaveBeenCalledWith('rejected');
    });

    /**
     * Should close the dialog and pass the new email list.
     */
    it('should confirm add emails', function() {
        scope.confirm();
        expect(dialog.close).toHaveBeenCalledWith(scope.emails);
    });

});
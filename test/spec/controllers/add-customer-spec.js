describe('Controller: AddCustomerCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.customer');
        module('tnt.catalog.filter.findBy');
        module('tnt.utils.cep');
        module('tnt.utils.cpf');
    });

    var scope = {};
    var dialog = {};
    var location = {};
    var dp = {};
    var ds = {};
    var os = {};
    var cs = {};
    var us = {};
    var es = {};
    var $q = {};
    var CpfService = {};
    var $rootScope = {};
    var IntentService = {};

    beforeEach(function() {
        module(function($provide) {
            $provide.value('UserService', us);
            $provide.value('EntityService', es);
            $provide.value('IntentService', IntentService);
        });
        IntentService.getBundle = jasmine.createSpy('IntentService.getBundle').andReturn({screen : undefined});
        us.redirectIfInvalidUser = jasmine.createSpy('redirectIfInvalidUser');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, _$filter_, _$q_, _$rootScope_, _CpfService_) {
        CpfService = _CpfService_;
        $q = _$q_;
        $rootScope = _$rootScope_;

        // $dialog mock
        dialog.close = jasmine.createSpy();

        // $location mock
        location.path = jasmine.createSpy();

        // DialogService mock
        ds.messageDialog = jasmine.createSpy();

        // DataProvider mock
        dp.date = angular.copy(sampleData.date);
        dp.customers = angular.copy(sampleData.customers);
        dp.products = angular.copy(sampleData.products);

        // scope mock;
        scope = $rootScope.$new();
        scope.newCustomerForm = {};

        $controller('AddCustomerCtrl', {
            $scope : scope,
            $location : location,
            dialog : dialog,
            OrderService : os,
            DataProvider : dp,
            DialogService : ds,
            CepService : cs

        });
        $filter = _$filter_;
    }));

    /**
     * Should have the birth date combos filled with the possible values.
     */
    it('should have days and months filled', function() {
        expect(scope.birthdate.days).toEqual(dp.date.days);
        expect(scope.birthdate.months).toEqual(dp.date.months);
    });

    /**
     * Should have the UF combo filled.
     */
    it('should have states filled', function() {
        expect(scope.states).toEqual(dp.states);
    });

    /**
     * Should add a new customer and when it's done, redirect to main screen.
     */
    it('should add a customer', function() {
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        es.create = jasmine.createSpy('EntityService.create').andCallFake(function() {
            var deffered = $q.defer();
            setTimeout(function() {
                deffered.resolve(uuid);
            }, 0);
            return deffered.promise;
        });

        scope.customer.name = 'Earl Hickey';
        scope.customer.phones.push({
            type : 'Residencial',
            number : '123456789'
        });
        scope.newCustomerForm.$valid = true;
        os.order = {};

        var result = null;
        runs(function() {
            scope.confirm().then(function(_result_) {
                result = _result_;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return !!result;
        });

        runs(function() {
            expect(location.path).toHaveBeenCalledWith('/');
            expect(es.create).toHaveBeenCalledWith(scope.customer);
            expect(result).toEqual(uuid);
            expect(os.order.customerId).toEqual(uuid);
        });
    });

    /**
     * When the form is not valid shouldn't redirect to the main screen and do
     * nothing.
     */
    it('shouldn\'t add a customer', function() {
        var customersSize = dp.customers.length;
        scope.customer.name = 'Earl Hickey';

        scope.confirm();

        expect(dp.customers.length).toBe(customersSize);
        expect(scope.customer).not.toEqual(dp.customers[customersSize]);
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Novo usuário',
            message : 'Os campos destacados são de preenchimento obrigatório.',
            btnYes : 'OK'
        });
        expect(location.path).not.toHaveBeenCalled();
    });

    /**
     * Should redirect to the main screen and do nothing.
     */
    it('should cancel add a customer', function() {
        scope.cancel();
        expect(location.path).toHaveBeenCalledWith('/');
    });

    it('should validate the cpf', function() {
        // given
        spyOn(CpfService, 'validate').andReturn(true);
        // assign a random number just to skip the input check
        var cpf = '123123';
        // when
        scope.validateCpf(cpf);
    });

    it('shouldn\'t try to validate the cpf', function() {
        // given
        spyOn(CpfService, 'validate');
        var cpf = '';
        // when
        scope.validateCpf(cpf);

        expect(CpfService.validate).not.toHaveBeenCalled();
    });

    it('shouldn\'t validate the cpf', function() {
        // given
        spyOn(CpfService, 'validate').andReturn(false);
        // assign a random number just to skip the input check
        var cpf = '123';
        // when
        scope.validateCpf(cpf);

        expect(CpfService.validate).toHaveBeenCalled();
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'CPF invalido.',
            message : 'Verifique se o CPF foi digitado corretamente.',
            btnYes : 'OK'
        });
    });

    it('should get the CEP', function() {
        // given
        var result = {
            logradouro : 'Rua',
            bairro : 'Bairro',
            uf : 'Estado',
            localidade : 'Cidade'
        };

        var expected = {
            street : 'Rua',
            neighborhood : 'Bairro',
            state : 'Estado',
            city : 'Cidade'
        };
        PromiseHelper.config($q, angular.noop);
        cs.search = jasmine.createSpy('CepService.search').andCallFake(PromiseHelper.resolved(result));
        // valid Cep
        scope.customer.cep = '81110-010';

        scope.cepValid = true;
        scope.$apply();

        // when
        var done = false;
        runs(function() {
            scope.getCep().then(function() {
                done = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return done;
        });
        runs(function() {
            expect(scope.customer.addresses).toEqual(expected);
        });
    });
});

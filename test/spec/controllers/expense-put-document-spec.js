describe('Controller: ExpenseCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.expense');
    });

    var scope = {};
    var document = {};
    var log = {};
    var rs = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();
        scope.expense = {
            stub : 'I\'m a stub'
        };

        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // ExpenseService mock
        rs.update = jasmine.createSpy('ExpenseService.update');

        $controller('ExpenseCtrl', {
            $scope : scope,
            $log : log,
            ExpenseService : rs
        });
    }));

    /**
     * <pre>
     * Given a valid document
     * when an attach is triggered
     * then the document must be attached
     * </pre>
     */
    it('should attach a document', function() {
        // given
        document = jasmine.createSpy('ExpenseDocument.isValid').andReturn(true);

        var expense = angular.copy(scope.expense);

        // when
        scope.attach(document);

        expense.payed = document;

        // then
        expect(document.isValid).toHaveBeenCalled();
        expect(rs.update).toHaveBeenCalledWith(expense);
    });

    /**
     * <pre>
     * Given an invalid document
     * when an attach is triggered
     * then the user must be warned: 'Invalid document: {{document}}'
     * </pre>
     */
    it('shouldn\'t fulfill a canceled expense', function() {
        // given
        document = jasmine.createSpy('ExpenseDocument.isValid').andReturn(true);

        // when
        scope.attach(document);

        // then
        expect(document.isValid).toHaveBeenCalled();
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ExpenseCtrl: -Invalid document: ' + JSON.stringify(document));
        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : 'Contas à Pagar',
            message : 'Documento Inválido',
            btnYes : 'OK'
        });
    });

});
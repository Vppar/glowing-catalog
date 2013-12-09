describe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable');
    });

    var scope = {};
    var document = {};
    var log = {};
    var rs = {};
    var dp = {};
    var ds = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();
        scope.receivable = {
            stub : 'I\'m a stub'
        };

        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // ReceivableService mock
        rs.update = jasmine.createSpy('ReceivableService.update').andReturn(true);
        
        // DialogService 
        ds.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log,
            ReceivableService : rs,
            DataProvider : dp,
            DialogService : ds
        });
    }));

    /**
     * <pre>
     * Givena valid document
     * when an attach is triggered
     * then the document must be attached
     * </pre>
     */
    it('should attach a document', function() {
        // given
        document.isValid = jasmine.createSpy('ReceivableDocument.isValid').andReturn(true);

        // when
        scope.putDocument(document);

        // then
        expect(document.isValid).toHaveBeenCalled();
        expect(rs.update).toHaveBeenCalledWith(scope.receivable);
    });

    /**
     * <pre>
     * Given an invalid document
     * when an attach is triggered
     * then the user must be warned: invalid document
     * </pre>
     */
    it('shouldn\'t fulfill a canceled receivable', function() {
        // given
        document.isValid = jasmine.createSpy('ReceivableDocument.isValid').andReturn(false);

        // when
        scope.putDocument(document);

        // then
        expect(document.isValid).toHaveBeenCalled();
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid document ' + JSON.stringify(document));
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Contas à Pagar',
            message : 'Documento Inválido',
            btnYes : 'OK'
        });
    });

});

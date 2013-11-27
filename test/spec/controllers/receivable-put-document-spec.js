describe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable');
    });

    var scope = {};
    var document = {};
    var log = {};
    var rs = {};
    

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();
        scope.receivable = {mock: 'I\'m a mock'};

        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        // ReceivableService mock
        rs.update = jasmine.createSpy('ReceivableService.update');
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log, 
            ReceivableService : rs
        });
    }));
    
    /**
     * Given a valid document
     * when an attach is triggered
     * then the document must be attached
     */
    it('should attach a document', function() {
        // given
        document = jasmine.createSpy('ReceivableDocument.isValid').andReturn(true);
        
        var receivable = angular.copy(scope.receivable);
        
        // when
        scope.attach(document);
        
        receivable.received = document;
        
        // then
        expect(document.isValid).toHaveBeenCalled();
        expect(rs.update).toHaveBeenCalledWith(receivable);
    });
    
    /**
     * Given an invalid document
     * when an attach is triggered
     * then the user must be warned: invalid document
     */
    it('shouldn\'t fulfill a canceled receivable', function() {
        // given
        document = jasmine.createSpy('ReceivableDocument.isValid').andReturn(true);
        
        // when
        scope.attach(document);
        
        // then
        expect(document.isValid).toHaveBeenCalled();
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid document '+JSON.stringify(document));
        expect(DialogService.messageDialog).toHaveBeenCalledWith({title: 'Contas à Pagar', message: 'Documento Inválido', btnYes: 'OK'});
    });
    
});
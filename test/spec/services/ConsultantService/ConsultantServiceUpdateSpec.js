describe('Service: ConsultantServiceUpdateSpec', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var ConsultantKeeper = {};

    // load the service's module
    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        log.debug = jasmine.createSpy('log.debug');

        module('tnt.catalog.consultant.service');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('ConsultantKeeper', ConsultantKeeper);
        });
    });
    beforeEach(inject(function(_Consultant_, _ConsultantService_,_$q_, _$rootScope_) {
        Consultant = _Consultant_;
        $q = _$q_;
        ConsultantService = _ConsultantService_;
        $rootScope = _$rootScope_;
    }));

    it('should update a consultant instance', function() {
        // given
        PromiseHelper.config($q, angular.noop);
        ConsultantKeeper.update = jasmine.createSpy('ConsultantKeeper.update').andCallFake(PromiseHelper.resolved(true));
        ConsultantService.isValid = jasmine.createSpy('ConsultantService.isValid').andReturn([]);
        
        var validConsultant = new Consultant({
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            name : 'cassiano',
            mkCode : 'mk-007',
            cep : 81110010,
            address : {street: 'rua', number: 555},
            cpf : '8157170',
            bank : '001',
            agency : 12345,
            account : 321,
            email : 'teste@tunts.com'
    });
        
        // when
        var result = null;
        runs(function(){
            ConsultantService.update(validConsultant).then(function(_result_){
                result = _result_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return result;
        });
        

        // then
        runs(function(){
            expect(ConsultantKeeper.update).toHaveBeenCalledWith(validConsultant);
        });
    });
  
    it('shouldn\'t update a consultant instance', function() {
        // given
        ConsultantService.isValid = jasmine.createSpy('ConsultantKeeper.isValid').andReturn([]);
        ConsultantKeeper.update = jasmine.createSpy('ConsultantKeeper.update').andCallFake(function() {
            throw 'my exception';
        });
        var validConsultant = new Consultant({
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            name : 'cassiano',
            mkCode : 'mk-007',
            cep : 81110010,
            address : {street: 'rua', number: 555},
            cpf : '8157170',
            bank : '001',
            agency : 12345,
            account : 321,
            email : 'teste@tunts.com'
    });
        // when
        var createCall = function() {
            ConsultantService.update(validConsultant);
        };

        // then
        expect(createCall).toThrow();
    });

});

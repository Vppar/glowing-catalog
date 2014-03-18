describe('Service: ConsultantServiceAddSpec', function() {

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
    beforeEach(inject(function(_Consultant_, _ConsultantService_) {
        Consultant = _Consultant_;
        ConsultantService = _ConsultantService_;
    }));

    it('should create a consultant instance', function() {
        // given
        ConsultantKeeper.create = jasmine.createSpy('ConsultantKeeper.create');
        ConsultantService.isValid = jasmine.createSpy('ConsultantService.isValid').andReturn([]);

        var validConsultant = new Consultant({
            uuid : null,
            name : 'cassiano',
            mkCode : 'mk-007',
            cep : 81110010,
            address : {
                street : 'rua',
                number : 555
            },
            cpf : '8157170',
            bank : '001',
            agency : 12345,
            account : 321,
            email : 'teste@tunts.com'
        });

        // when
        var result = ConsultantService.create(validConsultant);

        // then
        expect(ConsultantKeeper.create).toHaveBeenCalledWith(validConsultant);
        expect(result).toBe(undefined);
    });

    it('shouldn\'t create a consultant instance', function() {
        // given
        ConsultantService.isValid = jasmine.createSpy('ConsultantService.isValid').andReturn([]);
        ConsultantKeeper.create = jasmine.createSpy('ConsultantKeeper.create').andCallFake(function() {
            throw 'my exception';
        });
        var validConsultant = new Consultant({
            uuid : null,
            name : 'cassiano',
            mkCode : 'mk-007',
            cep : 81110010,
            address : {
                street : 'rua',
                number : 555
            },
            cpf : '8157170',
            bank : '001',
            agency : 12345,
            account : 321,
            email : 'teste@tunts.com'
        });
        // when
        var createCall = function() {
            ConsultantService.create(validConsultant);
        };

        // then
        expect(createCall).toThrow();
    });

});

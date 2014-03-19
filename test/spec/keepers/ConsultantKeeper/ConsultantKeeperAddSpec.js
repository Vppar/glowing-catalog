'use strict';

describe('Service: ConsultantKeeper', function() {

    var jKeeper = {};
    
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.consultant');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    var ConsultantKeeper = null;
    var Consultant = null;
    localStorage.deviceId = 1;
    var JournalEntry = null;
    var IdentityService = null;
    beforeEach(inject(function(_ConsultantKeeper_, _Consultant_, _JournalEntry_, _IdentityService_) {
        ConsultantKeeper = _ConsultantKeeper_;
        Consultant = _Consultant_;
        JournalEntry =_JournalEntry_;
        IdentityService = _IdentityService_;
    }));
    
    it('should handle an add consultant event', function() {
        // given
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
        ConsultantKeeper.handlers['consultantCreateV1'](validConsultant);
        var consultants = ConsultantKeeper.list();

        // then
        expect(consultants[0]).not.toBe(validConsultant);
        expect(consultants[0]).toEqual(validConsultant);
    });
    
    /**
     * <pre>
     * @spec EntityKeeper.add#1
     * Given a valid values
     * when and create is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('should add', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        spyOn(IdentityService, 'getUUID').andReturn('cc02b600-5d0b-11e3-96c3-010001000001');
        
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var name = 'cassiano';
        var mkCode = 'mk-007';
        var cep = 81110010;
        var address = {street: 'rua', number: 555};
        var cpf = '8157170';
        var bank = '001';
        var agency = 12345;
        var account = 321;
        var email = 'teste@tunts.com';
        
        var stp = fakeNow;

        var ev = new Consultant(uuid, name, mkCode, cep, address, cpf, bank,  agency, account, email);
        
        var entry = new JournalEntry(null, stp, 'consultantCreate', 1, ev); 
        
        expect(function() {
            ConsultantKeeper.create(ev);}).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
});

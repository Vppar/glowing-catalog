'use strict';

describe('Service: CheckEntity', function() {

    var Check = null;
    var IdentityService = {};
    
    var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
    var bank = 12;
    var agency = 123;
    var account = 1234;
    var number = 12345;
    var duedate = new Date(1386179100000);
    var amount = 280;
    var document = {teste : 'testing'};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.check.entity');
        module(function($provide) {
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Check_) {
        Check = _Check_;
    }));

    it('should create a new Check instance', function() {
        // given
        var checkTeste = {
                uuid : uuid,
                bank : bank,
                agency : agency,
                account : account,
                number : number,
                duedate : duedate,
                amount : amount,
                document : document
            };

        // when
        var check = new Check(checkTeste);

        // then
        expect(check.uuid).toBe(uuid);
        expect(check.bank).toBe(bank);
        expect(check.agency).toBe(agency);
        expect(check.account).toBe(account);
        expect(check.number).toBe(number);
        expect(check.duedate).toBe(duedate);
        expect(check.amount).toBe(amount);
        expect(check.document).toBe(document);

    });
    
    it('should create a new Check instance', function() {
        // given

        // when
        var check = new Check(uuid, bank, agency, account, number, duedate, amount);

        // then
        expect(check.uuid).toBe(uuid);
        expect(check.bank).toBe(bank);
        expect(check.agency).toBe(agency);
        expect(check.account).toBe(account);
        expect(check.number).toBe(number);
        expect(check.duedate).toBe(duedate);
        expect(check.amount).toBe(amount);

    });
    
    it('shouldn\'t create a new Check', function() {
        // given
        
        // when
        var result = function(){
            new Check();
        };
        // then
        expect(result).toThrow('Check must be initialized with uuid, bank, agency, account, number, duedate and amount');
    });
});

describe('Service: MisplacedserviceDistributeSpecificDiscount\n', function(){

    beforeEach(module('tnt.catalog.misplaced.service'));

    var Misplacedservice = null;

    beforeEach(inject(function(_Misplacedservice_) {
        Misplacedservice = _Misplacedservice_;
    }));

    it('is accessible', function () {
        expect(Misplacedservice).not.toBeUndefined();
    });

    it('is an object', function () {
        expect(typeof Misplacedservice).toBe('object');
    });

    describe('Test distributeSpecificDiscount method', function () {

        it('is accessible', function () {
            expect(Misplacedservice.distributeSpecificDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Misplacedservice.distributeSpecificDiscount).toBe('function');
        });

        it('Should distribute specific discount passing correct parameters', function(){
            var total = 0;
            var discount = 3.5;
            var items = [];

            expect(function () {
                Misplacedservice.distributeSpecificDiscount(total, discount, items);
            }).not.toThrow();
        });

        it('Should not throws exception passing null parameters', function(){
            var total = null;
            var discount = null;
            var items = null;

            expect(function () {
                Misplacedservice.distributeSpecificDiscount(total, discount, items);
            }).not.toThrow();
        });
    });
});
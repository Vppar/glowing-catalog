describe('Service: MisplacedserviceDistributeOrderDiscount\n', function(){

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

    describe('Test distributeOrderDiscount method', function () {

        it('is accessible', function () {
            expect(Misplacedservice.distributeOrderDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Misplacedservice.distributeOrderDiscount).toBe('function');
        });

        it('Should distribute order discount passing correct parameters', function(){
            var total = 0;
            var discount = 3.5;
            var items = [];

            expect(function () {
                Misplacedservice.distributeOrderDiscount(total, discount, items);
            }).not.toThrow();
        });

        it('Should not throws exception passing null parameters', function(){
            var total = null;
            var discount = null;
            var items = null;

            expect(function () {
                Misplacedservice.distributeOrderDiscount(total, discount, items);
            }).not.toThrow();
        });
    });
});
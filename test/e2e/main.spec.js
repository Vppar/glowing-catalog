describe("Hello MK", function() {
    it('should do something', function() {
        browser.get('#');
        expect($('.menu-black').findElements()).toBe(4);
    });
});
var CatalogPage = require('./pages/CatalogPage.js');

describe("Hello MK", function() {
  page = new CatalogPage();

  beforeEach(function() {
    page.get();
  });

  it('The title should be correct', function() {
    expect(page.getTitle()).toBe('VOPP Wishlist');
  });
});
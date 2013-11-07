(function(data) {
    data.products = [
        {
            'id' : 1,
            'title' : 'my blue product',
            'description' : 'something illegal',
            'image' : '/myproduct/blue.jpeg',
            'price' : 125,
            'inventory' : 1000
        },
        {
            'id' : 2,
            'title' : 'my regular product',
            'description' : 'something illegal',
            'image' : '/myproduct/normal.jpeg',
            'price' : 25,
            'inventory' : 10000
        }
    ];
    window.sampleData = data;
}(window.sampleData || {}));
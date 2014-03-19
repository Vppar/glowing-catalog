fs = require('fs');

var attemps = 0, success = 0, error = 0, images = {};

function getBase64Image (filename, exten) {
    if(exten){
        search = filename + 'b.' + exten;
    } else {
        search = filename;
    }
    fs.readFile('app/images/catalogOld/products/' + search, function (err, data) {
        
        if (err) {
            returnVar = null;
            console.log(err);
            error++;
            
            if(exten && exten !== 'png'){
                attemps++;
                getBase64Image (filename, 'png');
            }
        } else {
            var extension = search.split('.').pop();
            
            var mimeType = '';
            
            if(extension === 'gif'){
                mimeType = 'image/gif';
            } else if(extension === 'jpg' || extension === 'jpeg'){
                mimeType = 'image/jpeg';
            } else if(extension === 'png'){
                mimeType = 'image/png';
            } else {
                console.log('fuuuuuu');
            }
            
            images[filename] = 'data:' + mimeType + ';base64,' + data.toString('base64');
            success++;
        }
    });
}

function write(data){
    fs.writeFile('app/resources/images.json', data, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log('The file was saved!');
        }
    });
}

fs.readFile('app/resources/products.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    var products = JSON.parse(data.substr(data.indexOf('[')));

    for ( var ix in products) {
        var image = products[ix].image;
        var SKU = products[ix].SKU;
        if (image) {
            attemps++;
            getBase64Image(image);
        }
        if (SKU) {
            attemps++;
            getBase64Image(SKU, 'jpg');
        }
    }
    
    console.log(attemps, success, error);
});


function monitor(){
    if(attemps !== 0 && attemps === (success + error)){
        console.log(attemps, success, error);
        write(JSON.stringify(images));
    } else {
        setTimeout(monitor, 100);
    }
}
monitor();

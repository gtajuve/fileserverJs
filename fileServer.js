var formidable = require('formidable'),
    http = require('http'),
    util = require('util'),
    fs   = require('fs'),
    uuid = require('node-uuid');

// create server
http.createServer(function(req, res) {
    function showFiles() {
        fs.readdir('images', function(err, items) {

            for (var i=0; i<items.length; i++) {
                console.log(items[i]);
            }

        });

    }

    // Form uploading Process code
    //Upload route
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {

        // creates a new incoming form.
        var form = new formidable.IncomingForm();

        // parse a file upload
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/html'});
            res.write('Upload received :\n');
            res.write('<a href="show">'+'show File'+'</a>');
        });
        form.on('end', function(fields, files) {
            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
            /* Location where we want to copy the uploaded file */
            var new_location = 'images';
            if (!fs.existsSync(new_location)) {
                fs.mkdirSync(new_location);
            }
            fs.readFile(temp_path, function(error, original_data) {
                var id=uuid.v1();
                var base64Image = original_data.toString('base64');
                var decodedImage = new Buffer(base64Image, 'base64');
                fs.writeFile('images/' + id+'.jpg', decodedImage, function(error) {});

            });
            res.end(showFiles());
        });
        return;
    }
    if (req.url == '/show' && req.method.toLowerCase() == 'get') {
        res.writeHead(200, {'content-type': 'text/html'});
        res.write('Images :<br>');
        fs.readdir('images', function(err, items) {

            for (var i = 0; i < items.length; i++) {
                res.write('<a href="images/' + items[i] + '">' + items[i] + '</a><br>');
            }
        });


        return;
    }
    if (req.url.indexOf('/images') === 0) {
        var imageId = __dirname + req.url;

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        fs.readFile(imageId, function (error, data) {
            if (error) {
                console.log('Cannot read image...');
                return;
            }

            res.write('<html><body><img src="data:image/jpeg;base64,')
            res.write(new Buffer(data).toString('base64'));
            res.end('"/></body></html>');
        });

        return;
    }
    /* Displaying file upload form. */
    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<a href="show">'+'show File'+'</a>');
    res.end(
        '<form action="/upload" method="post" enctype="multipart/form-data">'+
        '<input type="file" name="upload" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
}).listen(1234);
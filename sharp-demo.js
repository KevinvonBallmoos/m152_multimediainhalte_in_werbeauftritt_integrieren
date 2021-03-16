"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sharp = require("sharp");
var express = require("express");
var multer = require("multer");
var app = express();
var sass = require('node-sass');
var fs = require("fs");
var less = require('less');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
/**
 * LB 1 / 1
 * Post request takes 'scss' Files and converts them to css files
 */
app.post('/api/css/scss', function (req, res) {
    sass.render({
        data: req.body.data.scss
    }, function (error, root) {
        if (!error) {
            res.json({
                data: {
                    css: root.css.toString()
                }
            });
        }
        else {
            res.status(400).send(error);
        }
    });
});
/**
 * LB 1 / 1
 * Post request takes 'less' files and converts them to css files
 */
app.post('/api/css/less', function (req, res) {
    less.Parser().parse(req.body.data.less, function (error, root) {
        if (!error) {
            res.json({
                data: {
                    css: root.toCSS()
                }
            });
        }
        else {
            res.status(400).send(error);
        }
    });
});
/**
 * LB 1 / 2
 * Take an Image per Post request and convert it to 5 images in different sizes,
 * returns a link to the image, which can be opened in a browser
 */
var store = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, cb) {
        if (file.mimetype.indexOf("image") > -1) {
            cb(null, Date.now() + "_" + file.originalname);
        }
        else {
            cb({
                error: 'Not a image file'
            }, null);
        }
    }
});
var upload = multer({ storage: store });
var fileSize;
var width;
var fileArray = new Array(5);
app.use('/files', express.static('files'));
/**
 * Post request takes an image and converts it to 5 images with different sizes
 * returns a link to the image, which can be opened in a browser
 */
app.post('/api/file', upload.single('file'), function (req, res, cb) {
    for (var i = 0; i < 5; i++) {
        switch (i) {
            case 0:
                width = 720;
                fileSize = "small_";
                break;
            case 1:
                width = 1280;
                fileSize = "medium_";
                break;
            case 2:
                width = 1920;
                fileSize = "large_";
                break;
            case 3:
                width = 360;
                fileSize = "thumbnail_";
                break;
            case 4:
                width = null;
                fileSize = "original_";
                break;
        }
        sharp(__dirname + '/uploads/' + req.file.filename)
            .resize(width, null, {
            fit: 'contain'
        })
            .toFile(__dirname + '/files/' + fileSize + req.file.filename);
        fileArray[i] = fileSize + req.file.filename;
    }
    res.json({
        data: {
            images: {
                small: "http://localhost:3000/files/" + fileArray[0],
                medium: "https://m152lb1.herokuapp.com/files/" + fileArray[1],
                large: "https://m152lb1.herokuapp.com/files/" + fileArray[2],
                thumbnail: "https://m152lb1.herokuapp.com/files/" + fileArray[3],
                original: "https://m152lb1.herokuapp.com/files/" + fileArray[4]
            }
        }
    });
});
/**
 * Web-Server Port
 */
var port = 3000;
app.listen(process.env.PORT || port);
//# sourceMappingURL=sharp-demo.js.map
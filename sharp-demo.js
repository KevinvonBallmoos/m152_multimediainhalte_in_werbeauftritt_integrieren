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
                medium: "http://localhost:3000/files/" + fileArray[1],
                large: "http://localhost:3000/files/" + fileArray[2],
                thumbnail: "http://localhost:3000/files/" + fileArray[3],
                original: "http://localhost:3000/files/" + fileArray[4]
            }
        }
    });
});
/**
 * For heroku testing
 */
// app.post('/api/file', upload.single('file'), (req, res) => {
//     res.json({
//         data: {
//             images: {
//                 small: "https://m152lb1.herokuapp.com/files/small_",
//                 medium: "https://m152lb1.herokuapp.com/files/medium ",
//                 large: "https://m152lb1.herokuapp.com/files/large ",
//                 thumbnail: "https://m152lb1.herokuapp.com/files/thumbnail ",
//                 original: "https://m152lb1.herokuapp.com0/files/original "
//             }
//         }
//     });
// });
var port = 3000;
app.listen(process.env.PORT || port);
//# sourceMappingURL=sharp-demo.js.map
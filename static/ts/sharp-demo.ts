import * as sharp from "sharp";
import express = require("express");
import multer = require("multer");

const app = express();
const sass = require('node-sass');
const fs = require("fs");
const less = require('less');

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.post('/api/css/scss', (req, res) => {
    sass.render({
        data: req.body.data.scss
    }, function (error, root) {
        if (!error) {
            res.json({
                data: {
                    css: root.css.toString()
                }
            });
        } else {
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
        } else {
            res.status(400).send(error);
        }
    });
});


let store = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + '/uploads')
    },
    filename: (req, file, cb) => {
        if (file.mimetype.indexOf("image") > -1) {
            cb(null, Date.now() + "_" + file.originalname)
        } else {
            cb({
                error: 'Not a image file'
            }, null)
        }
    }
});

let upload = multer({storage: store});
let fileSize;
let width;
let fileArray: string[] = new Array(5);

app.use('/files', express.static('files'));

app.post('/api/file', upload.single('file'), (req, res, cb) => {

    for (let i = 0; i < 5; i++) {

        switch (i) {
            case 0 :
                width = 720;
                fileSize = "small_";
                break;
            case 1 :
                width = 1280;
                fileSize = "medium_";
                break;
            case 2 :
                width = 1920;
                fileSize = "large_";
                break;
            case 3 :
                width = 360;
                fileSize = "thumbnail_";
                break;
            case 4 :
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
                    small: "https://m152lb1.herokuapp.com/files/" + fileArray[0],
                    medium: "https://m152lb1.herokuapp.com/files/" + fileArray[1],
                    large: "https://m152lb1.herokuapp.com/files/" + fileArray[2],
                    thumbnail: "https://m152lb1.herokuapp.com/files/" + fileArray[3],
                    original: "https://m152lb1.herokuapp.com/files/" + fileArray[4]
                }
            }
        }
    );
});


const port = 3000;
app.listen(process.env.PORT || port);
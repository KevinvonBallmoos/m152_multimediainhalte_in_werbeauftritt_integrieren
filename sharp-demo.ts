import * as sharp from "sharp";
import express = require("express");
import multer = require("multer");
import * as ffmpeg from "fluent-ffmpeg";


const app = express();
const sass = require('node-sass');
const fs = require("fs");
const less = require('less');
const ffmpeg = require('fluent-ffmpeg');

app.use(express.urlencoded({extended: true}));
app.use(express.json());

/**
 * LB 1 / 1
 * Post request takes 'scss' Files and converts them to css files
 */
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
        } else {
            res.status(400).send(error);
        }
    });
});

/**
 * LB 1 / 2
 * Take an Image per Post request and convert it to 5 images in different sizes,
 * returns a link to the image, which can be opened in a browser
 */
let store = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + '/uploads')
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname)
    }
});

let upload = multer({storage: store});
let fileSize;
let width;
let fileArray: string[] = new Array(5);

app.use('/files', express.static('files'));
app.use('/uploads', express.static('uploads'));

/**
 * Post request takes an image and converts it to 5 images with different sizes
 * returns a link to the image, which can be opened in a browser
 */
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

app.post('/api/videos', upload.array('file'), (req, res) => {

        // ffmpeg()
        //     .mergeAdd(__dirname + '/uploads/' + req.file.filename)
        //     .mergeAdd(__dirname + '/uploads/' + req.file.filename)
        //     .mergeToFile(process.cwd() + '/files/' +  + req.file.filename);

        // const videoBitrate = ffmpeg(__dirname + '/uploads/' + req.file.filename).videoBitrate('512k');
        // const height = ffmpeg(__dirname + '/uploads/' + req.file.filename).videoHeight('1080');
        // const width = ffmpeg(__dirname + '/uploads/' + req.file.filename).videoWidth('1920');
        // const fileName = ffmpeg(__dirname + '/uploads/' + req.file.filename).fileName;
        const turn = ffmpeg(__dirname + '/uploads/' + req.file.filename).rotate(90);


        res.json({
                data: {
                    video: {
                        location: "http://localhost:3000/uploads/" + "?turn" + turn
                        // + "&fileName" + fileName + "&width"
                        //     + width + "&height" + height + "&videoBitrate" + videoBitrate
                    }
                }
            }
        );
});


/**
 * Web-Server Port
 */
const port = 3000;
app.listen(process.env.PORT || port);
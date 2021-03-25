import * as sharp from "sharp";
import express = require("express");
import multer = require("multer");

const app = express();
const sass = require('node-sass');
const fs = require("fs");
const less = require('less');
let ffmpeg = require('fluent-ffmpeg');


app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/files', express.static('files'));


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
var fileName = '';
let store = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, process.cwd() + '/uploads')
    },
    filename: (req, file, cb) => {
        if (req.query.fileName) {
            if (req.files.length > 1) {
                cb(null, Date.now() + '_' + file.originalname);
            } else {
                file.filename = Date.now() + '_' + req.query.fileName.toString() + '.mp4';
                file.originalname = req.query.fileName.toString();

                cb(null, Date.now() + '_' + file.originalname + '.mp4');
            }
        } else {
            cb(null, Date.now() + '_' + file.originalname)
        }
    }
});

let upload = multer({storage: store});
let fileSize;
let width;
let fileArray: string[] = new Array(5);


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

/**
 * Post request takes a video or more
 * If there is more than 1 Video as Input, it merges them together and creates a new Video
 * Gives video back as a link, including Query Parameters
 */
app.post('/api/videos', upload.array('file'), (req, res) => {

    let inputFilePath;
    let outputFilePath = process.cwd() + '/uploads/';
    var mergedVideo = ffmpeg();
    var height = null;
    var width = null;
    var i = 0;
    var mergedVideoName = '';

    if (req.query.fileName) {
        if (req.files.length > 1) {
            mergedVideoName = Date.now() + '_' + req.query.fileName.toString() + '.mp4';
        } else {
            fileName = req.files[i].filename;
        }
    } else {
        fileName = req.files[i].filename;
        mergedVideoName = Date.now() + '_' + 'Your_merged_File.mp4';
    }

    /**
     * merges input
     */
    async function merge() {
        return new Promise((resolve, reject) => {
            mergedVideo.mergeToFile(outputFilePath + mergedVideoName)
                .on('error', function (err) {
                    reject(err);
                    console.log('Error' + err);
                }).on('end', () => {
                resolve(null);
            });
        });
    }

    /**
     * responds, when merging is successful and file is saved
     * adds query params
     */
    function respond() {
        inputFilePath = process.cwd() + '/uploads/' + mergedVideoName;
        var ffmpegCommand = ffmpeg(inputFilePath);

        if (req.query.videoBitrate) {
            var bitrate = req.query.videoBitrate;
            ffmpegCommand = ffmpegCommand.videoBitrate(bitrate + 'k');
        }
        if (req.query.width && req.query.height) {
            width = req.query.width;
            height = req.query.height;
            size = width + 'x' + height;
            ffmpegCommand = ffmpegCommand.withSize(size);
        } else if (req.query.width) {
            width = req.query.width;
            size = width + '?x';
            ffmpegCommand = ffmpegCommand.withSize(size);
        } else if (req.query.height) {
            height = req.query.height;
            size = '?x' + height;
            ffmpegCommand = ffmpegCommand.withSize(size);
        }

        if (req.query.turn) {
            if (req.query.turn === 'true') {
                ffmpegCommand = ffmpegCommand.withVideoFilter('transpose=1, transpose=1');
            }
        }

        fileName = mergedVideoName;

        saveFile(ffmpegCommand, fileName).then(() => jsonRespond()
        ).catch(error);

    }

    function error(err) {
        console.log(err);
        console.log('Error');
    }


    if (req.files.length > 1) {
        for (i = 0; i < req.files.length; i++) {
            mergedVideo = mergedVideo.mergeAdd(process.cwd() + '/uploads/' + req.files[i].filename);
        }
        merge().then(() => respond())
            .catch(error);

    } else {

        i = 0;
        inputFilePath = process.cwd() + '/uploads/' + req.files[i].filename;

        var ffmpegCommand = ffmpeg(inputFilePath);

        if (req.query.videoBitrate) {
            var bitrate = req.query.videoBitrate;
            console.log(bitrate);
            ffmpegCommand = ffmpegCommand.videoBitrate(bitrate + 'k');
        }
        var size = '';

        if (req.query.width && req.query.height) {
            width = req.query.width;
            height = req.query.height;
            size = width + 'x' + height;
            ffmpegCommand = ffmpegCommand.withSize(size);
        } else if (req.query.width) {
            width = req.query.width;
            size = width + '?x';
            ffmpegCommand = ffmpegCommand.withSize(size);
        } else if (req.query.height) {
            height = req.query.height;
            size = '?x' + height;
            ffmpegCommand = ffmpegCommand.withSize(size);
        }

        if (req.query.turn) {
            if (req.query.turn === 'true') {
                ffmpegCommand = ffmpegCommand.withVideoFilter('transpose=1, transpose=1');
            }
        }

        fileName = new Date().getTime() + "_" + req.files[0].filename.split("_").slice(1).join("_");
        
        saveFile(ffmpegCommand,fileName).then(() => jsonRespond()
        ).catch(error);

    }

    async function saveFile(ffmpegCommand, fileName) {
        return new Promise((resolve, reject) => {
            ffmpegCommand.save(process.cwd() + '/files/' + fileName)
                .on('error', function (err) {
                    console.log('Error' + err);
                    reject(err);
                }).on('end', () => {
                resolve(null);
            });
        })
    }

    function jsonRespond() {
        res.json({
                data: {
                    video: {
                        location: "https://m152lb1.herokuapp.com/files/" + fileName
                    }
                }
            }
        );
    }


});

/**
 * Web-Server Port
 */
const port = 3000;
app.listen(process.env.PORT || port);
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var sharp = require("sharp");
var express = require("express");
var multer = require("multer");
var app = express();
var sass = require('node-sass');
var fs = require("fs");
var less = require('less');
var ffmpeg = require('fluent-ffmpeg');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/files', express.static('files'));
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
var fileName = '';
var store = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, cb) {
        if (req.query.fileName) {
            if (req.files.length > 1) {
                cb(null, Date.now() + '_' + file.originalname);
            }
            else {
                file.filename = Date.now() + '_' + req.query.fileName.toString() + '.mp4';
                file.originalname = req.query.fileName.toString();
                cb(null, Date.now() + '_' + file.originalname + '.mp4');
            }
        }
        else {
            cb(null, Date.now() + '_' + file.originalname);
        }
    }
});
var upload = multer({ storage: store });
var fileSize;
var width;
var fileArray = new Array(5);
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
                small: "https://m152lb1.herokuapp.com/files/" + fileArray[0],
                medium: "https://m152lb1.herokuapp.com/files/" + fileArray[1],
                large: "https://m152lb1.herokuapp.com/files/" + fileArray[2],
                thumbnail: "https://m152lb1.herokuapp.com/files/" + fileArray[3],
                original: "https://m152lb1.herokuapp.com/files/" + fileArray[4]
            }
        }
    });
});
/**
 * Post request takes a video or more
 * If there is more than 1 Video as Input, it merges them together and creates a new Video
 * Gives video back as a link, including Query Parameters
 */
app.post('/api/videos', upload.array('file'), function (req, res) {
    var inputFilePath;
    var outputFilePath = __dirname + '/uploads/';
    var mergedVideo = ffmpeg();
    var height = null;
    var width = null;
    var i = 0;
    var mergedVideoName = '';
    if (req.query.fileName) {
        if (req.files.length > 1) {
            mergedVideoName = Date.now() + '_' + req.query.fileName.toString() + '.mp4';
        }
        else {
            fileName = req.files[i].filename;
        }
    }
    else {
        fileName = req.files[i].filename;
        mergedVideoName = Date.now() + '_' + 'Your_merged_File.mp4';
    }
    /**
     * merges input
     */
    function merge() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        mergedVideo.mergeToFile(outputFilePath + mergedVideoName)
                            .on('error', function (err) {
                            reject(err);
                            console.log('Error' + err);
                        }).on('end', function () {
                            resolve(null);
                        });
                    })];
            });
        });
    }
    /**
     * responds, when merging is successful and file is saved
     * adds query params
     */
    function respond() {
        inputFilePath = __dirname + '/uploads/' + mergedVideoName;
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
        }
        else if (req.query.width) {
            width = req.query.width;
            size = width + '?x';
            ffmpegCommand = ffmpegCommand.withSize(size);
        }
        else if (req.query.height) {
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
        saveFile(ffmpegCommand, fileName).then(function () { return jsonRespond(); }).catch(error);
    }
    function error(err) {
        console.log(err);
        console.log('Error');
    }
    if (req.files.length > 1) {
        for (i = 0; i < req.files.length; i++) {
            mergedVideo = mergedVideo.mergeAdd(__dirname + '/uploads/' + req.files[i].filename);
        }
        merge().then(function () { return respond(); })
            .catch(error);
    }
    else {
        i = 0;
        inputFilePath = __dirname + '/uploads/' + req.files[i].filename;
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
        }
        else if (req.query.width) {
            width = req.query.width;
            size = width + '?x';
            ffmpegCommand = ffmpegCommand.withSize(size);
        }
        else if (req.query.height) {
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
        saveFile(ffmpegCommand, fileName).then(function () { return jsonRespond(); }).catch(error);
    }
    function saveFile(ffmpegCommand, fileName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        ffmpegCommand.save(__dirname + '/files/' + fileName)
                            .on('error', function (err) {
                            console.log('Error' + err);
                            reject(err);
                        }).on('end', function () {
                            resolve(null);
                        });
                    })];
            });
        });
    }
    function jsonRespond() {
        res.json({
            data: {
                video: {
                    location: "https://m152lb1.herokuapp.com/files/" + fileName
                }
            }
        });
    }
});
/**
 * Web-Server Port
 */
var port = 3000;
app.listen(process.env.PORT || port);
//# sourceMappingURL=sharp-aufgabenstellung.js.map
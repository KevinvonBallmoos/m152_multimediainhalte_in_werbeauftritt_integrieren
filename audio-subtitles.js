"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var multer = require("multer");
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/files', express.static('files'));
var store = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/files');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
var upload = multer({ storage: store });
app.post('/api/audio', upload.fields([{
        name: 'vtt', maxCount: 1
    }, {
        name: 'audio', maxCount: 1
    }]), function (req, res) {
    var vttFile = req.files['vtt'][0].filename;
    var audioFile = req.files['audio'][0].filename;
    res.json({
        data: {
            audio: "https://m152lb1.herokuapp.com/files/" + audioFile,
            vtt: "https://m152lb1.herokuapp.com/files/" + vttFile
        }
    });
});
/**
 * Web-Server Port
 */
var port = 3000;
app.listen(process.env.PORT || port);
//# sourceMappingURL=audio-subtitles.js.map
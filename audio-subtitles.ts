import express = require("express");
import multer = require("multer");

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/files', express.static('files'));


let store = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + '/files')
    },
    filename: (req, file, cb) => {

        cb(null, Date.now() + '_' + file.originalname);

    }
});

let upload = multer({storage: store});


app.post('/api/audio', upload.fields([{
    name: 'vtt', maxCount: 1
}, {
    name: 'audio', maxCount: 1
}]), (req, res) => {

    const vttFile = req.files['vtt'][0].filename;
    const audioFile = req.files['audio'][0].filename;

    res.json({
            data: {
                audio: "http://localhost:3000/files/"  + audioFile ,
                vtt: "http://localhost:3000/files/" + vttFile
            }
        }
    );

});

/**
 * Web-Server Port
 */
const port = 3000;
app.listen(process.env.PORT || port);
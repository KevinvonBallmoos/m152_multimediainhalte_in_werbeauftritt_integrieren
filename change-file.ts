import {ffprobe} from "fluent-ffmpeg";

var ffmpeg = require('fluent-ffmpeg');



ffmpeg.ffprobe(__dirname + '/media/' + '/Apex_Win.mp4' , function (err, info) {
    if (err) {
        console.log(err);
        return;

    } else {
        ffmpeg()
            .mergeAdd(__dirname + '/media/' + '/Apex_Win.mp4')
            .mergeAdd( __dirname + '/media/' + '/Bunker_Fight.mp4')
            .mergeToFile(__dirname +'/Bunker_And_Win.mp4');
    }

});
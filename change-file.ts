import * as ffmpeg from "fluent-ffmpeg";

ffmpeg()
    .mergeAdd(process.cwd() + '/output.avi')
    .mergeAdd(process.cwd() + '/output2.avi')
    .mergeToFile(process.cwd() + '/merged.avi');

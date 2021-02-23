const express = require("express");
const app = express();
const port = 3000;
const sass = require('node-sass');
const fs = require("fs");

const less = require('node-less');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));
app.use('static', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.send("Hello")
});

app.post('/api/css/scss', function (req, res) {
    fs.writeFileSync('file.scss', req.body.data.scss, () => {
    });
    sass.render({
        file: "file.scss"
    }, function (err, result) {
        if (!err) {
            res.send("{\n" +
                "  \"data\": {\n" +
                "    \"css\": \"" + result.css.toString() + "\"" + "\n" +
                "  }\n" +
                "}");
        } else {
            res.status(400).send(err);
        }
    });
});

app.post('/api/css/less', function (req, res) {
    fs.writeFileSync('file.less', req.body.data.less, () => {
    });
    less.Parser({
        file: "file.less"
    }, function (err, result) {
        if (!err) {
            res.send("{\n" +
                "  \"data\": {\n" +
                "    \"css\": \"" + result.css.toString() + "\"" + "\n" +
                "  }\n" +
                "}");
        } else {
            res.status(400).send(err);
        }
    });
});

app.listen(process.env.PORT || port);

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

app.listen(process.env.PORT || port);

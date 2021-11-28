var express = require("express")
var app = express()
var path = require("path")
var hbs = require('express-handlebars');
const PORT = process.env.PORT || 3000;
var formidable = require('formidable');
const fs = require('fs');

var mainObj = {
    files: []
}
var idPliku = 1;

var obiektInfo;

app.use(express.static('static'))

app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));   // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');



app.get("", function (req, res) {
    res.render('upload.hbs');   // nie podajemy ścieżki tylko nazwę pliku
    // res.render('index.hbs', { layout: "main.hbs" }); // opcjonalnie podajemy konkretny layout dla tego widoku
})

app.get("/upload", function (req, res) {
    res.render('upload.hbs');   // nie podajemy ścieżki tylko nazwę pliku
    // res.render('index.hbs', { layout: "main.hbs" }); // opcjonalnie podajemy konkretny layout dla tego widoku
})
app.get("/fileManager", function (req, res) {
    // console.log(mainObj)
    res.render('fileManager.hbs', mainObj);
})

app.get("/info", function (req, res) {
    res.render('info.hbs', obiektInfo);
})

app.get("/deleteAll", function (req, res) {
    mainObj.files = []
    res.render('fileManager.hbs', mainObj);
})

app.get('/deleteOne/:id', function (req, res) {

    var id = req.params.id
    var iloscPlikow = (Object.keys(mainObj.files)).length
    var doUsuniecia;
    for (var i = 0; i < iloscPlikow; i++) {
        if (mainObj.files[i].id == id) {
            doUsuniecia = i;
        }
    }
    mainObj.files.splice(doUsuniecia, 1);
    res.redirect('/fileManager')
});


app.get('/informations/:id', function (req, res) {


    var id = req.params.id
    var iloscPlikow = (Object.keys(mainObj.files)).length
    var doInfo;

    for (var i = 0; i < iloscPlikow; i++) {
        if (mainObj.files[i].id == id) {
            doInfo = i;
        }
    }

    obiektInfo = mainObj.files[doInfo]
    // console.log(obiektInfo)
    res.redirect('/info')
});


app.get('/download/:id', function (req, res) {


    var id = req.params.id
    var iloscPlikow = (Object.keys(mainObj.files)).length
    var doInfo;

    for (var i = 0; i < iloscPlikow; i++) {
        if (mainObj.files[i].id == id) {
            doInfo = i;
        }
    }

    let sciezka = mainObj.files[doInfo].path

    // console.log(obiektInfo)
    res.download(sciezka)
    // res.redirect('/fileManager')
});

app.post("/handleUpload", function (req, res) {
    let form = formidable({});
    form.keepExtensions = true   // zapis z rozszerzeniem pliku
    form.multiples = true
    form.parse(req, function (err, fields, files) {

        try {
            let x = files.imageupload[1].name

            var iloscPlikow = (Object.keys(files.imageupload)).length
            for (var i = 0; i < iloscPlikow; i++) {
                let nazwa = files.imageupload[i].name
                nazwa = nazwa.split('.')
                let roz = nazwa.at(-1)

                if (!(roz == 'html' || roz == 'jpeg' || roz == 'jpg' || roz == 'pdf' || roz == 'png' || roz == 'txt')) {
                    roz = 'else'
                }

                let sciezka = files.imageupload[i].path
                sciezka=path.parse(sciezka).base
                

                var oldPath = files.imageupload[i].path;
                var newPath = path.join(__dirname, 'uploadFiles',sciezka)
                var rawData = fs.readFileSync(oldPath)

                fs.writeFile(newPath, rawData, function (err) {
                    if (err) console.log(err)
                })

                var fileObject = {
                    id: String(idPliku),
                    name: files.imageupload[i].name,
                    path: newPath,
                    size: files.imageupload[i].size,
                    type: files.imageupload[i].type,
                    savedate: Date.now(),
                    rozszerzenie: roz,
                }
                mainObj.files.push(fileObject)
                idPliku += 1;
            }
        } catch {
            let nazwa = files.imageupload.name
            nazwa = nazwa.split('.')
            let roz = nazwa.at(-1)

            if (!(roz == 'html' || roz == 'jpeg' || roz == 'jpg' || roz == 'pdf' || roz == 'png' || roz == 'txt')) {
                roz = 'else'
            }

            let sciezka = files.imageupload.path
            sciezka=path.parse(sciezka).base

            var oldPath = files.imageupload.path;
            var newPath = path.join(__dirname, 'uploadFiles',sciezka)
            var rawData = fs.readFileSync(oldPath)

            fs.writeFile(newPath, rawData, function (err) {
                if (err) console.log(err)
            })

            var fileObject = {
                id: String(idPliku),
                name: files.imageupload.name,
                path: newPath,
                size: files.imageupload.size,
                type: files.imageupload.type,
                savedate: Date.now(),
                rozszerzenie: roz,
            }
            mainObj.files.push(fileObject)
            idPliku += 1;

            // console.log(files.imageupload)
        }
        // console.log(mainObj)

        res.render('upload.hbs');
    });
})
app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})

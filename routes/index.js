var express = require('express');
var router = express.Router();
var phantom = require('phantom');
//var tmp = require('tmp');
var tmpfile = require('tempfile');
var fs = require('fs');
var pdfDocument = require('pdfkit');
//var nightmare = require('nightmare');
/* GET home page. */
router.get('/toPng', function(req, res) {
  var sitePage = null;
  var phInstance = null;
  var tmpFileName = null;
  var requestArray = [];
  phantom.create(['--ignore-ssl-errors=yes'])
    .then(function(instance) {
      phInstance = instance;
      return instance.createPage();
    })
    .then(function(page) {
      sitePage = page;
      console.log(req.query.url);
      console.log(req.query.token);
      //return page.open(req.query.url+'?token='+req.query.token+'&newsletter=true');
      //return sitePage.property('viewportSize', {width: 1920, height: 1600});
    })
    .then(function(property) {
      sitePage.on('onResourceRequested', function(requestData, networkRequest) {
        //console.log('requestData', requestData);
        //console.log('networkRequest', networkRequest);
        requestArray.push(requestData.id);
      });
      sitePage.on('onResourceReceived', function(response) {
        //console.log('response', response);
        var index = requestArray.indexOf(response.id);
        requestArray.splice(index, 1);
      });
      sitePage.on('onConsoleMessage', function(msg) {
        console.log('onConsoleMessage', msg);
      });
      sitePage.on('onError', function(err) {
        console.log('onError', err);
      });
      var reqUrl =req.query.url.indexOf('?') > -1 ? req.query.url+'&token='+req.query.token+'&newsletter=true' : req.query.url+'?token='+req.query.token+'&newsletter=true';
      console.log(reqUrl);
      return sitePage.open(req.query.url);
    })
    .then(function(status) {
      console.log(status);
      //var tmpFile = tmp.fileSync();
      tmpFileName = tmpfile('.png');
      tmpPdfName = tmpfile('.pdf');
      console.log(tmpFileName);
      setTimeout(function() {
        var interval = setInterval(function() {
          if(requestArray.length === 0) {
            clearInterval(interval);
            console.log('clearing interval');
            sitePage.render(tmpFileName)
              .then(function(render) {
                console.log('render result: ', render);
                phInstance.exit();
                // res.writeHead(200, {
                //     'Content-Type': 'application/pdf',
                //     'Access-Control-Allow-Origin': '*',
                //     'Content-Disposition': 'attachment; filename=Untitled.pdf'
                // });
                // return doc.pipe(res).image(tmpFileName).end();
                // var doc = new pdfDocument();
                // doc.pipe(fs.createWriteStream(tmpPdfName));
                // doc.image(tmpFileName, 0, 0, {width : 1920});
                // doc.end();
                // console.log('tmpPdfName', tmpPdfName);
                return res.download(tmpFileName);
                //return res.download(tmpPdfName);
              });

          }
        }, 500);
      }, 1000);


    })
    .catch(function(err) {
      console.log(err);
      phInstance.exit();
    });
});
// router.get('/', function(req, res) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;

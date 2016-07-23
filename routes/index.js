var express = require('express');
var router = express.Router();
var phantom = require('phantom');
var tmp = require('tmp');
var tmpfile = require('tempfile');
var fs = require('fs');

/* GET home page. */
router.post('/toPdf', function(req, res) {
  var sitePage = null;
  var phInstance = null;
  var tmpFileName = null;
  phantom.create()
    .then(function(instance) {
      phInstance = instance;
      return instance.createPage();
    })
    .then(function(page) {
      sitePage = page;
      console.log(req.body.url);
      console.log(req.body.token);
      return page.open(req.body.url+'?token='+req.body.token+'&newsletter=true');
    })
    .then(function(status) {
      console.log(status);
      var tmpFile = tmp.fileSync();
      tmpFileName = tmpfile('.pdf');
      console.log(tmpFileName);
      return sitePage.render(tmpFileName);
    })
    .then(function(render) {
      console.log(render);
      phInstance.exit();
      res.sendFile(tmpFileName, {}, function(err) {
        if(err) {
          console.log(err);
          fs.unlink(tmpFileName);
          return res.status(err.status).end();
        }
        fs.unlink(tmpFileName);
      });
    })
    .catch(function(err) {
      console.log(err);
      phInstance.exit();
    });
});
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

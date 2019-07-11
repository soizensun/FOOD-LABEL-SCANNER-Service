var express = require('express');
var jimp = require('jimp');
var ocr = require('node-tesseract-ocr');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require("fs");
var multer = require('multer')
var axios = require('axios')

const path = require('path');
const pic = 'finalPic.jpg' 

var formatTop = [ {id: 1, name: '', ex: '', weight: ''} ];
var formatTessco = [ {id: 1, name: '', ex: '', weight: ''} ];
var totalFormat = [];

const storage = multer.diskStorage({
  destination: '',
  filename: function(req, file, callback){
    callback(null, file.fieldname + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    checkFileType(file, callback)
  }
}).single('uploadImage');

function checkFileType(file, callback){
  const fileTypes = /jpg/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if(extname){
    return callback(null, true);
  } 
  else {
    callback('Error: Images Only!');
  }
}

const config = {
  lang: 'tha+eng', // 'eng'
  oem: 0, // tesseract --help-oem
  psm: 7
  // cmd: 'tesseract ./targetPic.jpg stdout -l tha --oem 0 --psm 3'
}

const config7 = {
  lang: 'tha+eng', // 'eng'
  oem: 0, // tesseract --help-oem
  psm: 7 // the pic is a line
  // cmd: 'tesseract ./targetPic.jpg stdout -l tha --oem 0 --psm 7'
}

const configEX = {
  lang: 'eng', // 'eng'
  oem: 0, // tesseract --help-oem
  psm: 3
  // cmd: 'tesseract ./targetPic.jpg stdout -l tha --oem 0 --psm 7'
}

app.post('/uploadPic', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      console.log('upload error')
    }
    else{
      console.log(req.file.originalname + " upload finish");
    }
  })
});

function cropImageTop(){
  return new Promise((resolve, reject) => {
    jimp.read('uploadImage.jpg', (err, image) => {
      if(err){
        reject(err)
      }
      else{
        resolve(image.resize(709, 608).quality(80).write('finalPic.jpg'))
      }
    })
  })
}

function cropImageTessco(){
  return new Promise((resolve, reject) => {
    jimp.read('uploadImage.jpg', (err, image) => {
      if(err){
        reject(err)
      }
      else{
        resolve(image.resize(483, 314).quality(80).write('finalPic.jpg'))
      }
    })
  })
}

function upToDBTop(){
  return new Promise((resolve, reject) => {
    axios.post('http://localhost:2403/good', {
      market: "Top",
      name: formatTop[0].name,
      exDate: formatTop[0].ex,
      netWeight: formatTop[0].weight,
    })
    .then( () => {
      resolve(console.log("top pic post to DB succese"));
    })
    .catch(() => {
      reject(console.log("post to DB error"))
    })
  })
}

function uptoDBTessco(){
  return new Promise((resolve, reject) => {
    axios.post('http://localhost:2403/good', {
      market: "Tessco",
      name: formatTessco[0].name,
      exDate: formatTessco[0].ex,
      netWeight: formatTessco[0].weight,
    })
    .then( () => {
      resolve(console.log("tessco pic post to DB succese"));
    })
    .catch(() => {
      reject(console.log("post to DB error"));
    })
  })
}

app.get('/loadTable', (req, res) => {
  axios.get('http://localhost:2403/good')
    .then((axiosRes) => {
      res.json(axiosRes.data)
    })
})

app.get('/topProcessFormat', async (req, res) => {
  await cropImageTop();
  formatTop[0].name = await topNameReader()
  formatTop[0].ex = await topExpiredDateReader();
  formatTop[0].weight = await topNetWeightReader();
  await upToDBTop();
  await axios.get('http://localhost:2403/good')
    .then((res) => {
      totalFormat = (res.data).filter((good) => {
        return good
      })
    })
  res.json(totalFormat);  
})

app.get('/tesscoProcessFormat', async (req, res) =>{
  await cropImageTessco();
  formatTessco[0].name =  await tesscoNameReader();
  formatTessco[0].ex = await tesscoExpiredDateReader();
  formatTessco[0].weight = await tesscoNetWeightReader();
  await uptoDBTessco();
  await axios.get('http://localhost:2403/good')
    .then((res) => {
      totalFormat = (res.data).filter((good) => {
        return good
      })
    })
  res.json(totalFormat);
})


function topNameReader(){
  return new Promise((resolve, reject) => {
    jimp.read(pic, function(err, image){
      if(err){
        console.log("name top error")
      }
      else{
        image.crop(0,15,710,100).quality(80).write('topSubPic/namePicTop.jpg')
      }
    })
    ocr.recognize('./topSubPic/namePicTop.jpg', config7)
    .then(text => {
      resolve(text)
    })
    .catch(err => {
      reject(err)
    })
  });

}

function topExpiredDateReader(){
  return new Promise((resolve, reject) => {
    jimp.read(pic, function(err, image){
      if(err){ 
        console.log("ex error") 
      }
      else{
          image.crop(350,230,360,60).quality(100).write('topSubPic/expiredDatePicTop.jpg')
        }
      })
      ocr.recognize('./topSubPic/expiredDatePicTop.jpg', configEX )
      .then(text => {
        resolve(text)
      })
      .catch(err => {
        reject(err)
      })
  });
}

function topNetWeightReader(){
  return new Promise((resolve, reject) => {
    jimp.read(pic, function(err, image){
      if(err){
        console.log("weight error")
      }
      else{
        image.crop(300,480,410,100).quality(80).write('topSubPic/netWeightPicTop.jpg')
      }
    })
    ocr.recognize('./topSubPic/netWeightPicTop.jpg', config)
    .then(text => {
      resolve(text)
    })
    .catch(err => {
      reject(err)
    })
  })
}

function tesscoNameReader(){
  return new Promise((resolve, reject) => {
    jimp.read(pic, function(err, image){
      if(err){
        console.log("name error")
      }
      else{
        image.crop(0,4,470,90).quality(80).write('tesscoSubPic/namePicTessco.jpg')
      }
    })
    ocr.recognize('./tesscoSubPic/namePicTessco.jpg', config7)
    .then(text => {
      resolve(text)
    })
    .catch(err => {
      reject(err)
    })
  });
}

function tesscoExpiredDateReader(){
    return new Promise((resolve, reject) => {
      jimp.read(pic, function(err, image){
        if(err){
          console.log("ex date error")
        }
        else{
          image.crop(320,170,170,50).quality(100).write('tesscoSubPic/expiredDatePicTessco.jpg')
        }
      })
      ocr.recognize('./tesscoSubPic/expiredDatePicTessco.jpg', config)
      .then(text => {
        resolve(text)
      })
      .catch(err => {
        reject(err)
      })
    }); 
}

function tesscoNetWeightReader(){
  return new Promise((resolve, reject) => {
    jimp.read(pic, function(err, image){
      if(err){
        console.log("weight error")
      }
      else{
        image.crop(280,210,210,100).quality(80).write('tesscoSubPic/netWeightPicTessco.jpg')
      }
    })
    ocr.recognize('./tesscoSubPic/netWeightPicTessco.jpg', config)
    .then(text => {
      resolve(text)
    })
    .catch(err => {
      reject(err)
    })
  });
}

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
    
  });
});

const PORT = 8081
server.listen(PORT, function() {
  console.log( "---------------- port " + PORT + " -----------------");
});
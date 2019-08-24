/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

// modified by : Kumar shubham( 28-07-2019) 

'use strict';

/* globals MediaRecorder */

const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;
let questionReader=[];
let counter=0;
let allVideoList = [];
let allUrlList = [];
var zip = new JSZip();
var fileIdName;
// var zipFilename = "Y12UC133-Data";
const errorMsgElement = document.querySelector('span#errorMsg');
const quesMsgElement = document.querySelector('span#quesMssg');
const progressTextSel =document.getElementById('progressText');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');
const userId =    document.getElementById('file_name');
// const gifVisible = document.getElementById('gifLoad');

const password = document.getElementById('auth_pass');

function showButton(){
        // gifVisible.style.display = "block";
        recordButton.style.display ="none";
        setTimeout(hideButton, 3000); // 5 seconds
      }

function hideButton(){
      // gifVisible.style.display = "none";
      recordButton.style.display = "block";
      };

document.querySelector('#download').addEventListener('click', () => {
 if (password.value== "iiit"){
  errorMsgElement.innerHTML = "";
  // BUG : FOR SOME REASON SECOND VIDEOS HAVE AN EXTRA BLOB FROM LAST VIDEO FILE
  for(var i =0;i<allVideoList.length;i++){
     // SOLVING THE BUG, pushing the missing bug back in the list
     if (i+1<allVideoList.length) allVideoList[i].push(allVideoList[i+1][0]);

     if(i==0){
      console.log("created first link.");
      allUrlList.push([generateUrlList(allVideoList[i]),i]);
      }else{
        // downloadVideoFile(allVideoList[i].slice(1),"vid"+i);
        console.log("created subsequent link.");
        allVideoList[i-1].push(allVideoList[i][0]);
        // console.log(allVideoList[i][0]);
        allUrlList.push([generateUrlList(allVideoList[i].slice(1)),i]);
      }
  }
  let count=0;
  allUrlList.forEach(function(url){
  
  // loading a file and add it in a zip file
  //data[0] is the URL
  // data[1] is the index to save the given file with 
  JSZipUtils.getBinaryContent(url[0], function (err, data) {
     if(err) {
        throw err; // or handle the error
     }
     var filename = processTextName(questionReader[url[1]]);
     console.log("created zip.");
     console.log("filename. "+ filename);
     zip.file(fileIdName+"-"+filename+".webm", data, {binary:true});
     count++;
     console.log(count);
     if (count == allUrlList.length) {
      updatePercent(1|0);
       zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
        updatePercent(metadata.percent|0);
      })

        .then(function callback(content) {
       saveAs(content, fileIdName+"-Data");
        }, function (err) {
          console.log(err);
        });
     }
  });
});
   allVideoList=[];
 }
  else{
    errorMsgElement.innerHTML = "wrong password. Please try again.";
    console.log(password.value);
  }
});

recordButton.addEventListener('click', () => {
  if (recordButton.textContent === 'Start Record') {
    // startRecording();
    recordButton.textContent="Next";
    quesMsgElement.innerHTML ="<h2>" +questionReader[counter]+"</h2>";
    console.log("started recording");
    showButton();

    startRecording();
  } else if (recordButton.textContent==="Next") {
    console.log("stopped recording");
    showButton();
    sleep(500);
    stopRecording();
    
    allVideoList.push(recordedBlobs);
    console.log("total video file recorded." + allVideoList.length);
    if (counter<questionReader.length-1){      
      counter+=1;
       quesMsgElement.innerHTML ="<h2>" +questionReader[counter]+"</h2>";
       // for some reason recordblobs list is not starting with meta blob list. 
       startRecording();
       console.log("started recording");
      console.log("counter : "+ counter);
    }else{
      quesMsgElement.innerHTML ="<h2>" +"<p>Thank you for your answer.</p>The interview is now over. Please call the supervisor of the session to continue the study"+"</h2>";
      recordButton.textContent="Next.";
    }
    
  }else if (recordButton.textContent==="Next."){
    document.getElementById('authentication').style.display ="inline-block";
    document.getElementById('gum').style.display ="none";
    quesMsgElement.style.display="none"
    document.getElementById('checkButton').style.display ="none";

    console.log("leng of final recor blobs"+ recordedBlobs.length);
  
   
  }
});

function processTextName(text){
  // function for removing special character and creating readable video name
  text = text.replace(/[&\/\\#,+()$~%.'":*?<>{}.]/g, ' ');
  console.log("text out : "+text);
return text;
}

function generateUrlList(indvBlob){
  const blob = new Blob(indvBlob, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  return url;

};


function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  recordedBlobs = [];
  let options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not Supported`);
    errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`);
      errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
        options = {mimeType: ''};
      }
    }
  }

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
}

function handleSuccess(stream) {
  // recordButton.disabled = false;
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  const gumVideo = document.querySelector('video#gum');
  gumVideo.srcObject = stream;
  
}

async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
   errorMsgElement.innerHTML="";
    document.getElementById('suggestions').style.display = "none";
   document.getElementById('checkButton').style.display ="inline-block";
   quesMsgElement.innerHTML ="<h2>" +"Hello.The job interview will be conducted via this platform. Press “Start Record” to get started" +"</h2>";
   
   // setting up the question list to ask
   // var compReader = JSON.parse(compQues);
   // var randQuesReader = JSON.parse(randomQues);
   var compReader = compQues;
   var randQuesReader = randomQues; 
   questionReader.push(...compReader);
   var shufQues = shuffle(randQuesReader);// shuffle the random question
   var newRandQues = shufQues.slice(0,randomQuesToAsk);
   console.log("rand ques list: "+ newRandQues.length);
   questionReader.push(...newRandQues);

   // console.log(questionReader.length); 
    handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

document.querySelector('#start').addEventListener('click', async () => {

  const hasEchoCancellation = true;
  const constraints = {
    audio: {
      echoCancellation: {exact: hasEchoCancellation}
    },
    video: {
      width: 1280, height: 720
    }
  };
  console.log('Using media constraints:', constraints);
  if (userId.value !=""){
    fileIdName = userId.value;
  await init(constraints);
  }else{
    errorMsgElement.innerHTML = "please enter a valid User Id";
    userId.value="";
  }
});

function updatePercent(percent) {
        $("#progress_bar").removeClass("hide")
        .find(".progress-bar")
        .attr("aria-valuenow", percent)
        .css({
            width : percent + "%"
        });
        progressTextSel.innerHTML = "Zipping file : " + percent + "%";
    };
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
import "core-js/stable";
import "regenerator-runtime/runtime";

import {
  Observable, of, from
} from 'rxjs'
import { ajax, AjaxResponse } from "rxjs/ajax";

import { switchMap, mergeMap, map, tap, toPromise, filter, flatMap, scan } from 'rxjs/operators';

import express, { response } from 'express';
import bodyparser from 'body-parser'
import path from 'path'
import dotenv from 'dotenv'

import nodefetch from 'node-fetch'
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

dotenv.config()
console.log(process.env.API_KEY)
const app = express();
const port = 3000

app.use(bodyparser.urlencoded({
  extended: false
}))

app.use(bodyparser.json())

console.log(path.join(__dirname, '../src/public'))

app.use('/', express.static(path.join(__dirname, '../public')))

app.use("/test", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    images: ["test", "test1", "test3"]
  }));
});

// Observer from fetch
function getObservableFromFetch(url) {
  return Observable.create(observer => {
    //Make use of Fetch API to get data from URL                              
    nodefetch(url)
      .then(res => {
        /*The response.json() doesn't return json, it returns a "readable stream" which is a promise which needs to be resolved to get the actual data.*/
        return res.json();
      })
      .then(body => {
        observer.next(body);
        /*Complete the Observable as it won't produce any more event */
        observer.complete();
      })
      //Handle error
      .catch(err => observer.error(err));
  })
}

const testObserver$ = getObservableFromFetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)

app.get('/apod', async (req, res) => {
  console.log("pod")
  testObserver$.subscribe(image => {
    res.send({
      image
    })
  })
})

const roverObserver$ = getObservableFromFetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=${process.env.API_KEY}`)

app.get('/rover', async (req, res) => {
  roverObserver$.subscribe(image => {
    res.send({
      image
    })
  })
})

app.get('/roverInfo/:rover_name', async (req, res) => {
  console.log(req.params.rover_name)
  const roverInfoObserver$ =
    getObservableFromFetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.rover_name}?api_key=${process.env.API_KEY}`
    );

  roverInfoObserver$.subscribe(info => {
    res.send({
      info
    })
  })
})

function createXHR() {
    return new XMLHttpRequest();
}


app.get('/roverRecent', async (req, res) => {
  const max_date = req.query['date']
  const rover_name = req.query['rover']
 
  const ajaxRequestCOnfigurations = {
    createXHR,
    url: `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover_name}/photos?earth_date=${max_date}&api_key=${process.env.API_KEY}`,
    crossDomain: true,
    withCredentials: false,
    method: 'GET',
  }

  const roverInfoObserver$ = ajax(ajaxRequestCOnfigurations)
      .pipe(
        switchMap(AjaxResponse => AjaxResponse.response.photos),
        map(photo => photo.img_src),
        scan((acc, value) => [...acc, value], []),
        tap(photo => console.log(photo))
      );
  
  const roverInfoPromise = roverInfoObserver$.toPromise()

  roverInfoPromise.then(data => {
    console.log(data)
    res.send({
      data
    })
  });

})

// app.get('/roverRecent', async (req, res) => {
//   const max_date = req.query['date']
//   const rover_name = req.query['rover']
//   console.log("/roverRecent route", max_date, rover_name)
//   //console.log(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover_name}/photos?earth_date=${max_date}&api_key=${process.env.API_KEY}`)
//   const roverInfoObserver$ =
//     getObservableFromFetch(
//       `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover_name}/photos?earth_date=${max_date}&api_key=${process.env.API_KEY}`
//     ).pipe(tap(data => console.log(data)))

//   roverInfoObserver$.subscribe(data => {
//     res.send({
//       data
//     })
//   })
// })


//Rovers names are
// Curiosity, Opportunity, and Spirit 

// To get the rover max date, landing and launch date
// https://api.nasa.gov/mars-photos/api/v1//manifests/Curiosity?api_key=DEMO_KEY

// To get the recent photos taken on the max_date
//https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2019-09-28&api_key=DEMO_KEY

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
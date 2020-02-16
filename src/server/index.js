import "core-js/stable";
import "regenerator-runtime/runtime";

import {
  Observable
} from 'rxjs'
import {
  ajax
} from "rxjs/ajax";

import {
  switchMap,
  map,
  tap,
  reduce
} from 'rxjs/operators';

import express from 'express';
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

app.get('/roverInfo/:rover_name', async (req, res) => {
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

// Returns list of strings of recent images for a given rover
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
      reduce((acc, value) => [...acc, value], []),
      // for debugging
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
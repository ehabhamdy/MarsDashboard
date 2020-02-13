import "core-js/stable";
import "regenerator-runtime/runtime";

import { Observable } from 'rxjs'
import express from 'express';
import bodyparser from 'body-parser'
import path from 'path'
import dotenv from 'dotenv'

import nodefetch from 'node-fetch'

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

app.use("/images", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    images: ["asdf", "asdfasd f", "ehab work on thesis "]
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

const requestObserver$ = getObservableFromFetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)

app.get('/apod', async (req, res) => {
  requestObserver$.subscribe(image => {
    res.send({
      image
    })
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))



// const Rx = require('rxjs');

// const RxOp = require('rxjs/operators');
// const RxAjax = require('rxjs/ajax');
// const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// const Immu = require('immutable')

// require('dotenv').config()
// const express = require('express')
// const bodyParser = require('body-parser')
// const fetch = require('node-fetch')
// const path = require('path')

// const app = express()
// const port = 3000

// app.use(bodyParser.urlencoded({
//     extended: false
// }))
// app.use(bodyParser.json())

// app.use('/', express.static(path.join(__dirname, '../public')))

// app.use("/images", function(req,res){
//   res.setHeader('Content-Type', 'application/json');
//   res.end(JSON.stringify({ images: ["asdf", "asdfasd f"] }));
// });

// // your API calls

// //#region Create a request using rxjs ajax

// // function createXHR() {
// //     return new XMLHttpRequest();
// // }


// // const ajaxRequestCOnfigurations = {
// //     createXHR,
// //     url: ``https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}``,
// //     crossDomain: true,
// //     withCredentials: false,
// //     method: 'GET',
// // }

// // const obs$ = RxAjax.ajax(ajaxRequestCOnfigurations).pipe(
// //     RxOp.map(result => {
// //         return result.response
// //     }),
// //     RxOp.catchError(error => {
// //         console.log('error: ', error);
// //         return Rx.of(error);
// //     })
// // );

// // app.get('/apod', async (req, res) => {
// //     obs$.subscribe(image => {
// //         res.send({image})
// //     })
// // })

// //#endregion


// // Observer from fetch
// function getObservableFromFetch(url) {
//     return Rx.Observable.create(observer => {
//         //Make use of Fetch API to get data from URL                              
//         fetch(url)
//           .then(res => {
//             /*The response.json() doesn't return json, it returns a "readable stream" which is a promise which needs to be resolved to get the actual data.*/
//             return res.json();
//           })
//           .then(body => {
//             observer.next(body);
//             /*Complete the Observable as it won't produce any more event */
//             observer.complete();
//           })
//           //Handle error
//           .catch(err => observer.error(err));
//       })
// }

// const requestObserver$ = getObservableFromFetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)

// app.get('/apod', async (req, res) => {
//     requestObserver$.subscribe(image => {
//         res.send({image})
//     })
// })

// // example API call

// // app.get('/apod', async (req, res) => {
// //     try {
// //         let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
// //             .then(res => res.json())
// //         console.log(image)
// //         res.send({
// //             image
// //         })
// //     } catch (err) {
// //         console.log('error:', err);
// //     }
// // })

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))
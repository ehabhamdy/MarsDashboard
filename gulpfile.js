const gulp = require('gulp');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon')
var cache = require("gulp-cached");
var plumber = require("gulp-plumber");
var eslint = require("gulp-eslint");

var path = require("path");

var SOURCES = ["src/server/*.js"];
var DEST_DIR = "dist";
var MAIN = path.join(DEST_DIR+"/server/", "index.js");


gulp.task("babelify", () =>
  gulp.src(SOURCES)
  .pipe(plumber())
  .pipe(cache("babelify"))
  .pipe(babel({
    presets: ["@babel/env"]
  }))
  .pipe(gulp.dest(DEST_DIR+"/server/")));


gulp.task("watch", () =>
  gulp.watch(SOURCES, gulp.series("babelify"))
);

gulp.task("watchClient", () =>
  gulp.watch("src/public/*js", gulp.series("client"))
);

gulp.task("nodemon", () =>
  nodemon({
    script: MAIN,
    args: process.argv.splice(3, process.argv.length)
  })
);

gulp.task("client", () =>
  gulp.src(['src/public/**/*']).pipe(gulp.dest(DEST_DIR+"/public/"))
);

//gulp.task("default", ["babelify", "lint"]);
gulp.task("dev", gulp.parallel(["client", "babelify","nodemon", "watch", "watchClient"]));
"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var svgstore = require("gulp-svgstore");
var imagemin = require("gulp-imagemin");
var server = require("browser-sync").create();
var browserSync = require("browser-sync").create();
var del = require("del");
var csso = require("gulp-csso");

gulp.task("clean", function () {
  return del("docs");
});

gulp.task("css", function () {
  return gulp.src([
    "node_modules/bootstrap/scss/bootstrap.scss",
    "source/scss/style.scss"
    ])
    .pipe(plumber())
    .pipe(sass({
      includePaths: require("node-normalize-scss").includePaths
    }))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("source/css"))
    .pipe(csso())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("source/css"))
    .pipe(gulp.dest("docs/css"))
    .pipe(server.stream());
});

gulp.task("sprite", function () {
  return gulp.src("source/img/inline/*.svg")
    .pipe(imagemin(imagemin.svgo()))
    .pipe(gulp.dest("source/img/inline"))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("source/img"));
});

gulp.task("js", function() {
  return gulp.src([
    "node_modules/bootstrap/dist/js/bootstrap.min.js",
    "node_modules/jquery/dist/jquery.min.js",
    "node_modules/popper.js/dist/umd/popper.min.js",
    "source/js/*.js"
    ])
    .pipe(gulp.dest("source/js"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("source/img/*.{png,jpg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("copy", function () {
  return gulp.src([
    "source/*.html",
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("docs"));
});


gulp.task("server", function () {
  server.init({
    server: "docs/",
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/scss/*.scss", gulp.series("css"));
  gulp.watch("source/img/inline/*.svg", gulp.series("sprite", "refresh"));
  gulp.watch("source/*.html", gulp.series("refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("start", gulp.series("clean", "css", "sprite", "js", "images", "copy", "server"));



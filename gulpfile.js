const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const sourcemap = require("gulp-sourcemaps");
const svgstore = require("gulp-svgstore");
const webp = require("gulp-webp");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const del = require("del");

// Clean

const clean = () => {
  return del("build");
}

exports.clean = clean;

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
}

exports.images = images;

// Copy images

const copyImages = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg,webp}")
    .pipe(gulp.dest("build/img"));
}

exports.copyImages = copyImages;

// Webp

const wepb = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img/"));
}

exports.wepb = wepb;

// Html

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build/"));
}

exports.html = html;

// Fonts

const fonts = () => {
  return gulp.src("source/fonts/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts/"));
}

exports.fonts = fonts;

// Svg Sprite

const svgSprite = () => {
  return gulp.src(["source/img/**/*.svg", "!source/img/sprite.svg"])
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/"));
}

exports.svgSprite = svgSprite;

// Build

const buildCommon = gulp.series (
  gulp.parallel(
    copyImages,
    svgSprite,
    styles,
    html,
    fonts
  )
)

const build = gulp.series (
  clean,
  wepb,
  buildCommon,
  gulp.parallel(
    images
  )
)

exports.build = build;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/sass/**/*.svg", gulp.series("svgSprite"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  clean,
  buildCommon,
  server,
  watcher
);

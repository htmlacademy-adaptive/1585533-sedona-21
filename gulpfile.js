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
const merge = require("merge-stream");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream()); // https://browsersync.io/docs/gulp "Because Browsersync only cares about your CSS when it's finished compiling - make sure you call .stream() after gulp.dest"
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
    .pipe(gulp.dest("test/img"));
}

exports.images = images;

// Svg Sprite

const svgSprite = () => {
  return gulp.src("source/img/**/*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("source/img/"));
}

exports.svgSprite = svgSprite;

// Webp

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img/"));
}

exports.createWebp = createWebp;

// Build

const build_clean = () => {
  return del("build");
}

const build_styles = () => {
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

const build_images = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
}

const build_wepb = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img/"));
}

const build_html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build/"));
}

const build_fonts = () => {
  return gulp.src("source/fonts/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts/"));
}

const build_svg_sprite = () => {
  return gulp.src(["source/img/**/*.svg", "!source/img/sprite.svg"])
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/"));
}

const build = gulp.series (
  build_clean,
  gulp.parallel(
    build_styles,
    build_images,
    build_wepb,
    build_html,
    build_fonts,
    build_svg_sprite
  )
)

exports.build = build;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source'
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
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  build,
  gulp.series(
    styles, server, watcher
  )
);

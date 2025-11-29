// Gulp setup
import { src, dest, watch, series, parallel, lastRun } from 'gulp';
import dartSass from 'sass';
import gulpLoadPlugins from 'gulp-load-plugins';
import autoprefixer from 'autoprefixer';
import cssnanoPlugin from 'cssnano';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackConfig from './webpack.config.js';
import del from 'del';
import imagemin from 'gulp-imagemin';

const $ = gulpLoadPlugins({
  config: process.env.npm_package_json,
  postRequireTransforms: {
    sass: function(sass) {
      return sass(dartSass);
    }
  }
});

// Build SCSS
function styles() {
  return src('src/styles/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer(),
      cssnanoPlugin({ safe: true, autoprefixer: false })
    ]))
    .pipe($.sourcemaps.write('.'))
    .pipe(dest('public/dist/styles'));
};

// Build JS (using Webpack)
function scripts() {
  return src([
    'src/index.js'
  ])
    .pipe($.plumber())
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(dest('public/dist/scripts'));
};

// Lint JS files
const lintBase = files => {
  return src(files)
    .pipe($.eslint({ parser: '@babel/eslint-parser', fix: true }))
    .pipe($.eslint.format())
};
function lint() {
  return lintBase('src/scripts/**/*.js')
    .pipe(dest('src/scripts'));
}

// Build SVG sprite for icons
function svgIcons() {
  return src('src/svg-icons/**/*.svg')
    .pipe($.svgSprite({
      mode: {
        symbol: {
          render: {
            css: false,
            scss: false
          },
          dest: '.',
          sprite: 'icons.svg',
          example: true
        }
      }
    }))
    .pipe(dest('public/dist/svg-icons'));
}

// Minify images
function images() {
  return src('src/images/**/*', { encoding: false })
    .pipe(imagemin())
    .pipe(dest('public/dist/images'));
}

// Deploy font files
function fonts() {
  return src(['src/fonts/**/*.{eot,svg,ttf,woff,woff2,otf}', 'node_modules/bootstrap-icons/font/**/*.{woff,woff2}'], { encoding: false })
    .pipe(dest('public/dist/fonts'));
}


// Clean the build directory
function clean() {
  return del(['public/dist']);
}

// Watches frontend files and rebuilds when they're updated
async function watchFrontendFiles() {
  watch('src/styles/**/*.scss', styles);
  watch('src/index.js', scripts);
  watch('src/scripts/**/*.js', scripts);
  watch('src/vue/vue.js', scripts);
  watch('src/vue/api.js', scripts);
  watch('src/vue/**/*.vue', scripts);
  watch('src/vue/**/*.js', scripts);
  watch('src/images/**/*', images);
  watch('src/fonts/**/*', fonts);
}


async function runServer() {
  $.express.run(['server.js']);
}

// Task "build": Build the frontend (only the files used by the web project)
export const build = series(
  clean,
  lint,
  parallel(styles, scripts, images, fonts)
);

// Task "watch": Build the frontend, and rebuild frontend whenever source files are updated
export const buildWatch = series(
  build,
  watchFrontendFiles
);

export const develop = parallel(
  buildWatch,
  runServer
);

export default build;

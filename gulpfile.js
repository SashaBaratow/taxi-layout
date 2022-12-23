const {src, dest, watch, parallel, series}  = require('gulp')
const scss                          = require('gulp-sass')(require('sass'))
const concat                        = require('gulp-concat')
const browserSync                   = require('browser-sync').create()
const uglify                        = require('gulp-uglify-es').default
const autoprefixer                  = require('gulp-autoprefixer')
const imagemin                      = require('gulp-imagemin')
const del                      = require('del')

function brwsrSync() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}


function imagesMin() {
    return src('app/img/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('prod/images'))
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function stylesToCss (){
    return src('app/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist:['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function cleanProd() {
    return del('prod')
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/js/main.min.js',
        'app/fonts/**/*',
        'app/*.html'
    ],{base:'app'})
    .pipe(dest('prod'))
}

function watching() {
    watch(['app/scss/**/*.scss'],stylesToCss)
    watch(['app/js/**/*.js', '!app/js/main.min.js'],scripts)
    watch("app/*.html").on('change', browserSync.reload);
}


exports.stylesToCss = stylesToCss
exports.brwsrSync = brwsrSync
exports.watching = watching
exports.scripts = scripts
exports.imagesMin = imagesMin
exports.cleanProd = cleanProd

exports.build = series(cleanProd, imagesMin, build)
exports.stylesToCss = stylesToCss
exports.default = parallel(stylesToCss, scripts, brwsrSync, watching)
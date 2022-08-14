const { src, dest, parallel, series, watch } = require('gulp');

const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const pngquant = require('imagemin-pngquant');
const pug = require('gulp-pug');
const rigger = require('gulp-rigger');
const svgstore = require("gulp-svgstore");
const rename = require("gulp-rename");

function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: 'public/' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true, // Режим работы: true или false
		host: 'localhost',
		port: 9000,
		browser: 'chrome',
	});
}

function startwatch() {
	watch(['src/**/*.js', '!src/**/*.min.js'], scripts);
	watch('src/**/styles/**/*', styles);
	watch('src/**/*.html').on('change', browserSync.reload);
	watch('src/images/**/*', images);
	watch('src/pug/**/*.pug', pugHtml);
	watch('src/sprite/**/*.svg', icons);
}

function pugHtml() {
	return src('src/pug/pages/*.pug')
		.pipe(plumber())
		.pipe(pug({ pretty: true}))
		.pipe(dest('public/'))
		.pipe(browserSync.stream())
}

function scripts() {
	return src([
		//'node_modules/jquery/dist/jquery.min.js',
		'src/js/main.js',
	])
		.pipe(plumber())
		.pipe(rigger())
		.pipe(sourcemaps.init())
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./maps'))
		.pipe(dest('public/js/'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('src/styles/main.scss')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(concat('main.min.css'))
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
		.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } ))
		.pipe(sourcemaps.write('./maps'))
		.pipe(dest('public/css/'))
		.pipe(browserSync.stream())
}

function apiIndex() {
	return src('src/api/index.php')
		.pipe(dest('public/api/'))
}

function fonts() {
	return src('src/fonts/**/*.{eot,svg,ttf,woff,woff2}')
		.pipe(plumber())
		.pipe(dest('public/fonts/'))
}

function images() {
	return src('src/images/**/*')
		.pipe(plumber())
		.pipe(newer('public/images/'))
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.mozjpeg({quality: 75, progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: false},
					{cleanupIDs: false}
				]
			})
		]))
		.pipe(dest('public/images/'))
		.pipe(browserSync.stream())
}

function icons() {
	return src('src/sprite/**/*.svg')
			.pipe(plumber())
			.pipe(imagemin([
				imagemin.gifsicle({interlaced: true}),
				imagemin.mozjpeg({quality: 75, progressive: true}),
				imagemin.optipng({optimizationLevel: 5}),
				imagemin.svgo({
					plugins: [
						{removeViewBox: false},
						{cleanupIDs: false}
					]
				})
			]))
			.pipe(svgstore({
				inlineSvg: true
			}))
			.pipe(rename('sprite.svg'))
			.pipe(dest('public/images/'))
			.pipe(browserSync.stream())
}

function cleanimg() {
	return del('public/images/**/*', { force: true })
}

function cleandist() {
	return del('public/**/*', { force: true })
}


exports.browsersync = browsersync;
exports.startwatch = startwatch;
exports.pugHtml = pugHtml;
exports.scripts = scripts;
exports.styles = styles;
exports.fonts = fonts;
exports.apiIndex = apiIndex;
exports.images = images;
exports.icons = icons;

exports.build = series(cleandist, pugHtml, fonts, apiIndex, styles, scripts, images, icons);

exports.default = parallel(pugHtml, fonts, styles, apiIndex, scripts, images, icons, browsersync, startwatch);
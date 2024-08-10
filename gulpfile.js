const { src, dest, series, watch } = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify-es").default;
const svgSprite = require("gulp-svg-sprite");
const notify = require("gulp-notify");
const image = require("gulp-image");
const concat = require("gulp-concat");
const htmlMin = require("gulp-htmlmin");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const browserSync = require("browser-sync").create();
const gulpif = require("gulp-if");
const sass = require("gulp-sass")(require("sass"))

let prod = false;

const isProd = (done) => {
	prod = true;
	done();
}

const clean = () => {
	return del(["dist"]);
};

const resources = () => {
	return src("src/resources/**").pipe(dest("dist"));
};

const cssNormalize = () => {
	return src(["src/styles/**/normalize.css"])
		.pipe(dest("./dist/css"))
		.pipe(gulpif(!prod, browserSync.stream()));
};

const styles = () => {
	return src("src/styles/**/style.scss")
		.pipe(gulpif(!prod, sourcemaps.init()))
		.pipe(sass({ outputStyle: 'compressed' }).on("error", sass.logError))
		.pipe(
			gulpif(prod,
				autoprefixer({
					cascade: false,
				})
			)
		)
		.pipe(gulpif(prod, cleanCSS({ level: 2 })))
		.pipe(concat("main.css"))
		.pipe(gulpif(!prod, sourcemaps.write()))
		.pipe(dest("./dist/css"))
		.pipe(gulpif(!prod, browserSync.stream()));
};

const stylesCatalog = () => {
	return src("src/styles-catalog/**/style.scss")
		.pipe(gulpif(!prod, sourcemaps.init()))
		.pipe(sass({ outputStyle: 'compressed' }).on("error", sass.logError))
		.pipe(
			gulpif(prod,
				autoprefixer({
					cascade: false,
				})
			)
		)
		.pipe(gulpif(prod, cleanCSS({ level: 2 })))
		.pipe(concat("catalog.css"))
		.pipe(gulpif(!prod, sourcemaps.write()))
		.pipe(dest("./dist/css"))
		.pipe(gulpif(!prod, browserSync.stream()));
};

const stylesProduct = () => {
	return src("src/styles-product/**/style.scss")
		.pipe(gulpif(!prod, sourcemaps.init()))
		.pipe(sass({ outputStyle: 'compressed' }).on("error", sass.logError))
		.pipe(
			gulpif(prod,
				autoprefixer({
					cascade: false,
				})
			)
		)
		.pipe(gulpif(prod, cleanCSS({ level: 2 })))
		.pipe(concat("product.css"))
		.pipe(gulpif(!prod, sourcemaps.write()))
		.pipe(dest("./dist/css"))
		.pipe(gulpif(!prod, browserSync.stream()));
};

const fonts =()=> {
	return src("src/fonts/*.*")
	.pipe(dest("dist/fonts"));
};

const htmlMinify = () => {
	return src("src/**/*.html")
		.pipe(
			gulpif(
				prod,
				htmlMin({
					collapseWhitespace: true,
				})
			)
		)
		.pipe(dest("dist"))
		.pipe(gulpif(!prod, browserSync.stream()));
};

// svg sprite
const svgSprites = () => {
	return src("src/img/svg/**.svg")
		.pipe(
			svgSprite({
				mode: {
					stack: {
						sprite: '../sprite.svg',
					},
				},
			})
		)
		.pipe(dest("dist/images/svg"));
};

const images = () => {
	return src([
		"src/img/**.jpg",
		"src/img/**.png",
		"src/img/**.jpeg",
		"src/img/**.svg",
		"src/img/*.webp",
		"src/img/**/*.jpg",
		"src/img/**/*.png",
		"src/img/**/*.jpeg",
		"src/img/**/*.svg",
	])
		// .pipe(gulpif(prod, image()))
		.pipe(dest("dist/images"));
};

// return src(["src/js/components/**/*.js", "src/js/main.js"])

const libs = () => {
	return src(["src/libs/**/*.js"])
		.pipe(dest("./dist/libs"))
		.pipe(gulpif(!prod, browserSync.stream()));
};

const scripts = () => {
	return src(["src/js/**/*.js"])
		.pipe(gulpif(!prod, sourcemaps.init()))
		.pipe(
			gulpif(
				prod,
				babel({
					presets: ["@babel/env"],
				})
			)
		)
		.pipe(concat("main.js"))
		.pipe(gulpif(prod, uglify().on("error", notify.onError())))
		.pipe(gulpif(!prod, sourcemaps.write()))
		.pipe(dest("./dist/js"))
		.pipe(gulpif(!prod, browserSync.stream()));
};

const watchFiles = () => {
	browserSync.init({
		server: {
			baseDir: "dist",
		},
	});
}

watch("src/styles/**/normalize.scss", cssNormalize).on("change", browserSync.reload);
watch("src/styles/**/*.scss", styles).on("change", browserSync.reload);
watch("src/styles-catalog/**/*.scss", stylesCatalog).on("change", browserSync.reload);
//watch("src/styles-product/**/*.scss", stylesProduct).on("change", browserSync.reload);
watch("src/*.html", htmlMinify).on("change", browserSync.reload);
// watch("src/img/svg/**.svg", svgSprites);
watch("src/libs/**/*.js", libs).on("change", browserSync.reload);
watch("src/js/**/*.js", scripts).on("change", browserSync.reload);
watch("src/resources/**", resources);

exports.cssNormalize = cssNormalize;
exports.styles = styles;
exports.libs = libs;
exports.scripts = scripts;
exports.htmlMinify = htmlMinify;
exports.dev = series(
	clean,
	resources,
	htmlMinify,
	cssNormalize,
	styles,
	stylesCatalog,
	//stylesProduct,
	fonts,
	libs,
	scripts,
	images,
	svgSprites,
	watchFiles
);
exports.build = series(
	isProd,
	clean,
	resources,
	htmlMinify,
	cssNormalize,
	styles,
	stylesCatalog,
	//stylesProduct,
	fonts,
	libs,
	scripts,
	images,
	svgSprites
);

exports.default = series(
	clean,
	resources,
	htmlMinify,
	styles,
	stylesCatalog,
	stylesProduct,
	fonts,
	scripts,
	images,
	svgSprites,
	watchFiles
);


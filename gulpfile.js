/* ===== Start of configurable variables ===== */

var localProjectBaseDir = 'gulp-starter',
    remoteProjectBaseDir = ''; //in case sub-directories are used within the remote /public_html

var webAccount = '', //for development - use same one specified in .ftppass as user
    symbolicLink = ''; //for production

var protocol = 'http', //https doesn't work with (local) browserSync
    remoteBaseDevUrl = 'homepages.abdn.ac.uk',
    remoteBaseProdUrl = 'www.abdn.ac.uk',
    sftpHost = 'ftpweb.abdn.ac.uk';

var src = 'app',
        images = 'images',
        scripts = 'scripts',
        styles = 'styles',
    bowerComponents = 'bower_components',
    dist = 'public_html';

var concatJsFile = 'all.min.js'; //see 'File Config' section in repo README.md for more info

/* ===== End of configurable variables ===== */




'use strict';

var base = 'C:/Users/' + process.env.USERNAME + '/AppData/Roaming/',
    node_modules = base + 'npm/node_modules/',
    composer_modules = base + 'Composer/vendor/bin/';

var gulp = require(node_modules + 'gulp');

module.exports = gulp; //for Chrome plugin + gulp-devtools

var autoprefixer = require(node_modules + 'gulp-autoprefixer'),
    changed = require(node_modules + 'gulp-changed'),
    complexity = require(node_modules + 'gulp-complexity'),
    csslint = require(node_modules + 'gulp-csslint'),
    csso = require(node_modules + 'gulp-csso'),
    cssUrlAdjuster = require(node_modules + 'gulp-css-url-adjuster'),
    htmlhint = require(node_modules + 'gulp-htmlhint'),
    imagemin = require(node_modules + 'gulp-imagemin'),
    jscs = require(node_modules + 'gulp-jscs'),
    jshint = require(node_modules + 'gulp-jshint'),
    plumber = require(node_modules + 'gulp-plumber'),
    removelogs = require(node_modules + 'gulp-removelogs'),
    rimraf = require(node_modules + 'gulp-rimraf'),
    sftp = require(node_modules + 'gulp-sftp'),
    shell = require(node_modules + 'gulp-shell'),
    size = require(node_modules + 'gulp-size'),
    soften = require(node_modules + 'gulp-soften'),
    uglify = require(node_modules + 'gulp-uglify'),
    util = require(node_modules + 'gulp-util'),
    browserSync = require(node_modules + 'browser-sync'),
    stylish = require(node_modules + 'jshint-stylish'),
    open = require(node_modules + 'opn'),
    pagespeed = require(node_modules + 'psi'),
    runSequence = require(node_modules + 'run-sequence'),
    order = require(node_modules + 'gulp-order'),
    concat = require(node_modules + 'gulp-concat'),
    iff = require(node_modules + 'gulp-if'),
    argv = require(node_modules + 'yargs').argv,
    Pageres = require(node_modules + 'pageres'),
    mainBowerFiles = require(node_modules + 'main-bower-files')
;

var webBrowser = 'chrome',
    reload = browserSync.reload;

var currentLevel = './',
    upOneLevel = '../';

var stylesheetFileTypeArray = ['css'],
    scriptFileTypeArray = ['js'],
    imageFileTypeArray = ['gif', 'png'],
    pageFileTypeArray = ['html', 'php'],
    fontFileTypeArray = ['eot', 'svg', 'ttf', 'woff'];

var imageFileTypes = imageFileTypeArray.join(','),
    pageFileTypes = pageFileTypeArray.join(','),
    otherFileTypes = pageFileTypeArray.concat(fontFileTypeArray).join(','), //html,php,eot,svg,ttf,woff
    allValidFileTypes = stylesheetFileTypeArray.concat(scriptFileTypeArray, imageFileTypeArray, pageFileTypeArray, fontFileTypeArray).join(','); //css,js,gif,png,html,php,eot,svg,ttf,woff

src = currentLevel + src + '/',
dist = currentLevel + dist + '/';

var htmlPhpFiles = dist + '**/*.{' + pageFileTypes + '}',
    phpFiles = dist + '**/*.php';

var srcScripts = src + scripts,
    distScripts = dist + scripts,
    srcStyles = src + styles,
    distStyles = dist + styles;

var srcCss = src + '**/*.css',
    srcJs = src + '**/*.js',
    srcImages = src + '**/*.{' + imageFileTypes + '}';

var distCss = dist + '**/*.css',
    distJs = dist + '**/*.js',
    distImages = dist + '**/*.{' + imageFileTypes + '}';

var remoteBaseCssDevPrependUrl = '/' + webAccount + '/' + remoteProjectBaseDir,
    remoteBaseCssProdPrependUrl = '/' + symbolicLink + '/' + remoteProjectBaseDir;

//prepend URL is based on location of CSS files
var remoteCssDevPrependUrl = remoteBaseCssDevPrependUrl + '/',
    remoteCssProdPrependUrl = remoteBaseCssProdPrependUrl + '/';

remoteBaseDevUrl = protocol + '://' + remoteBaseDevUrl + remoteBaseCssDevPrependUrl,
remoteBaseProdUrl = protocol + '://' + remoteBaseProdUrl + remoteBaseCssProdPrependUrl;

var authDev = 'development', //defined in .ftppass
    authProd = 'production', //defined in .ftppass
    remotePath = 'public_html/' + remoteProjectBaseDir,
    browserSyncProxyUrl = protocol + '://' + 'localhost' + '/' + localProjectBaseDir + '/' + dist;

var SCREEN_RESOLUTIONS = [
    '320x480',
    '320x568',
    '768x1024',
    '1024x768',
    '1280x1024',
    '1280x800',
    '1366x768',
    '1440x900',
    '1600x900',
    '1920x1080'
];

var AUTOPREFIXER_BROWSERS = [
    'ie >= 7', //10
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

/*------------------------------------------------*/

var onError = function(error){
    //cause the terminal to play a beep sound to get your attention should an error occur
    util.beep();
    console.log(error);
};

/*------------------------------------------------*/

gulp.task('csslint', function(){
    return gulp.src(srcCss)
        .pipe(csslint())
        .pipe(csslint.reporter())
    ;
});

gulp.task('jshint', function(){
    return gulp.src(srcJs)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
    ;
});

gulp.task('stats', function(){
    return gulp.src(srcJs)
        .pipe(complexity())
    ;
});

gulp.task('jscs', function(){
    return gulp.src(srcScripts + '/custom.js') //only run against single file - memory intensive
        .pipe(jscs(currentLevel + '.jscsrc'))
    ;
});

gulp.task('htmlhint', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe(htmlhint({'htmlhintrc': currentLevel + '.htmlhintrc'}))
        .pipe(htmlhint.reporter(stylish))
    ;
});

gulp.task('phpcs', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe(shell([
            'echo phpcs -n --standard="' + composer_modules + 'phpcs-ruleset.xml" "<%= file.path %>"',
            'phpcs -n --standard="' + composer_modules + 'phpcs-ruleset.xml" "<%= file.path %>"'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('phpmd', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe(shell([
            'echo phpmd "<%= file.path %>" text codesize,design,naming,unusedcode',
            'phpmd "<%= file.path %>" text codesize,design,naming,unusedcode'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('screenshots', function(){
    var pageres = new Pageres({crop: true})
        .src(remoteBaseDevUrl, SCREEN_RESOLUTIONS)
        .dest(__dirname);

    pageres.run(function(error){
        if(error)
            throw error;

        console.log('Successfully generated 10 screenshots');
    });
});

gulp.task('pagespeed', pagespeed.bind(null, {
    //You can use a Google Developer API key: http://goo.gl/RkN0vE
    url: remoteBaseDevUrl,
    //key: 'YOUR_API_KEY',
    strategy: 'mobile',
    threshold: 65
}));

gulp.task('bower:install', shell.task([
    'bower install'
]))

gulp.task('bower:copy', function(){
    console.log('');
    console.log('If your package doesn\'t appear in ' + srcScripts + ' then the main property in that packages bower.json hasn\'t been set. You will therefore need to create an override in your bower.json file to specifiy the main files of that package.');
    console.log('');
    console.log('See: https://github.com/ck86/main-bower-files#overrides-options');
    console.log('');
    return gulp.src(mainBowerFiles())
        .pipe(iff('*.css', gulp.dest(srcStyles)))
        .pipe(iff('*.js', gulp.dest(srcScripts)))
    ;
});

gulp.task('bower', function(callback){
    runSequence('bower:install', 'bower:copy', callback);
});

/*------------------------------------------------*/

gulp.task('clean:css', function(){
    return gulp.src([dist + '**/*.css'], {read: false})
        .pipe(rimraf())
    ;
});

gulp.task('clean:js', function(){
    return gulp.src([dist + '**/*.js'], {read: false})
        .pipe(rimraf())
    ;
});

gulp.task('clean:images', function(){
    return gulp.src([dist + '**/*.{' + imageFileTypes + '}'], {read: false})
        .pipe(rimraf())
    ;
});

gulp.task('tabsto4spaces', function(){
    return gulp.src(htmlPhpFiles)
        .pipe(soften(4)) //4 spaces
        .pipe(gulp.dest(dist))
    ;
});

gulp.task('clean:all', function(){
    return gulp.start('tabsto4spaces', 'clean:css', 'clean:js', 'clean:images');
});

/*------------------------------------------------*/

function calculateAdjustedUrl(url){
    var r = 'r=' + Math.random().toString().substr(2, 5); //prevent caching
    r = url.indexOf('?') == -1 ? '?' + r : '&' + r;

    if(url.charAt(0) == '/') //absolute URL, leave alone
        return url + r;

    if(url.indexOf('/') == -1)
        return upOneLevel + images + '/' + url + r;

    return upOneLevel + url.replace(/^(?:\.\.\/)+/, '') + r;
}

gulp.task('compile:css:local', function(){
    return gulp.src(srcCss)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(dist)) //must be dist
        .pipe(cssUrlAdjuster({
            append: function(url){
                return calculateAdjustedUrl(url);
            }
        }))
        .pipe(csso())
        .pipe(autoprefixer(AUTOPREFIXER_BROWSERS, {cascade: true}))
        .pipe(gulp.dest(dist))
        .pipe(reload({stream: true}))
        .pipe(size({title: 'compile:css:local'}))
    ;
});

gulp.task('compile:js:local', function(){
    return gulp.src(srcJs, {base: src})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(uglify({
            mangle: false,
            output: {
                beautify: true
            }
        }))
        .pipe(order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/*.js'
        ]))
        .pipe(concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe(reload({stream: true, once: true}))
        .pipe(size({title: 'compile:js:local'}))
    ;
});

gulp.task('reloadhtmlphp', function(){
    return gulp.src(htmlPhpFiles)
        .pipe(changed(htmlPhpFiles))
        .pipe(reload({stream: true}))
    ;
});

/*------------------------------------------------*/

gulp.task('compile:css:remote', function(){
    return gulp.src(srcCss)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(dist)) //must be dist
        .pipe(iff(
            !argv.production,
            cssUrlAdjuster({
                append: function(url){
                    return calculateAdjustedUrl(url);
                }
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            cssUrlAdjuster({
                append: function(url){
                    return calculateAdjustedUrl(url);
                }
            })
        ))
        .pipe(csso())
        .pipe(autoprefixer(AUTOPREFIXER_BROWSERS, {cascade: true}))
        .pipe(gulp.dest(dist))
        .pipe(size({title: 'compile:css:remote'}))
    ;
});

gulp.task('compile:js:remote', function(){
    return gulp.src(srcJs, {base: src})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(iff(
            argv.production, // --production flag
            removelogs()
        ))
        .pipe(iff(
            !argv.production,
            uglify({
                mangle: false,
                output: {
                    beautify: true
                }
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            uglify({preserveComments: 'some'})
        ))
        .pipe(order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/*.js'
        ]))
        .pipe(concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe(size({title: 'compile:js:remote'}))
    ;
});

gulp.task('prepare:css:remote', function(){
    return gulp.src(srcCss, {base: src})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(dist)) //must be dist
        .pipe(iff(
            !argv.production,
            cssUrlAdjuster({
                append: function(url){
                    return calculateAdjustedUrl(url);
                }
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            cssUrlAdjuster({
                append: function(url){
                    return calculateAdjustedUrl(url);
                }
            })
        ))
        .pipe(csso())
        .pipe(autoprefixer(AUTOPREFIXER_BROWSERS, {cascade: true}))
        .pipe(gulp.dest(dist))
        .pipe(size({title: 'prepare:css:remote'}))
        .pipe(iff(
            !argv.production,
            sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath
            })
        ))
    ;
});

gulp.task('prepare:js:remote', function(){
    return gulp.src(srcJs, {base: src})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(iff(
            argv.production, // --production flag
            removelogs()
        ))
        .pipe(iff(
            !argv.production,
            uglify({
                mangle: false,
                output: {
                    beautify: true
                }
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            uglify({preserveComments: 'some'})
        ))
        .pipe(order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/*.js'
        ]))
        .pipe(concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe(size({title: 'prepare:js:remote'}))
        .pipe(iff(
            !argv.production,
            sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath + '/' + scripts
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath + '/' + scripts
            })
        ))
    ;
});

gulp.task('reloadhtmlphpandupload', function(){
    return gulp.src(htmlPhpFiles, {base: dist})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(htmlPhpFiles))
        .pipe(iff(
            !argv.production,
            sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath
            })
        ))
    ;
});

/*------------------------------------------------*/

gulp.task('optimise:images', function(){
    return gulp.src(srcImages)
        .pipe(imagemin({
            optimizationLevel: 5, //0-7
            progressive: true, //jpg
            interlaced: true //gif
        }))
        .pipe(gulp.dest(dist))
    ;
});

gulp.task('moveotherfiles', function(){
    return gulp.src([src + '**/*.{' + otherFileTypes + '}'])
        .pipe(gulp.dest(dist))
    ;
});

/*------------------------------------------------*/

gulp.task('sftp', function(){
    return gulp.src([dist + '**/*.{' + allValidFileTypes + '}', '!' + currentLevel + 'gulpfile.js'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(iff(
            !argv.production,
            sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath
            })
        ))
    ;
});

gulp.task('serve:local', function(){
    browserSync({
        proxy: browserSyncProxyUrl,
        notify: false
    });

    gulp.watch(htmlPhpFiles, ['reloadhtmlphp']);
    gulp.watch(srcCss, ['compile:css:local']);
    gulp.watch(srcJs, ['compile:js:local']);
});

gulp.task('serve:remote', function(){
    gulp.watch(htmlPhpFiles, ['reloadhtmlphpandupload']);
    gulp.watch(srcCss, ['prepare:css:remote']);
    gulp.watch(srcJs, ['prepare:js:remote']);
});

gulp.task('openurl:remote', function(){
    return argv.production ? open(remoteBaseProdUrl, webBrowser) : open(remoteBaseDevUrl, webBrowser);
});

/*------------------------------------------------*/

gulp.task('build:local', function(callback){
    runSequence('clean:all', ['compile:css:local', 'compile:js:local', 'optimise:images', 'moveotherfiles'], callback);
});

gulp.task('build:remote', function(callback){
    runSequence('clean:all', ['compile:css:remote', 'compile:js:remote', 'optimise:images', 'moveotherfiles'], callback);
});

gulp.task('default', function(callback){
    runSequence('build:local', 'serve:local', callback);
});

gulp.task('upload', function(callback){
    runSequence('build:remote', 'sftp', 'serve:remote', 'openurl:remote', callback);
});

//Load custom tasks from the `tasks` directory (if it exists)
try { require(node_modules + 'require-dir')('tasks'); } catch (error) {}
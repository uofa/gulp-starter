/* ===== Start of configurable variables ===== */

var localProjectBaseDir = 'gulp-starter',
    remoteProjectBaseDir = ''; //in case sub-folder(s) is used within /public_html

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
    composerModules = 'composer_plugins',
    dist = 'public_html';

var concatJsFile = 'all.min.js'; //see 'File Config' section in repo README.md for more info

/* ===== End of configurable variables ===== */




'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

module.exports = gulp; //for Chrome plugin + gulp-devtools

var browserSync = require('browser-sync'),
    stylish = require('jshint-stylish'),
    open = require('opn'),
    pagespeed = require('psi'),
    runSequence = require('run-sequence'),
    argv = require('yargs').argv,
    Pageres = require('pageres'),
    mainBowerFiles = require('main-bower-files')
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
        .pipe($.csslint())
        .pipe($.csslint.reporter())
    ;
});

gulp.task('jshint', function(){
    return gulp.src(srcJs)
        .pipe($.jshint())
        .pipe($.jshint.reporter(stylish))
        .pipe($.jshint.reporter('fail'))
    ;
});

gulp.task('stats', function(){
    return gulp.src(srcJs)
        .pipe($.complexity())
    ;
});

gulp.task('jscs', function(){
    return gulp.src(srcScripts + '/custom.js') //only run against single file - memory intensive
        .pipe($.jscs())
    ;
});

gulp.task('htmlhint', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe($.htmlhint({'htmlhintrc': './.htmlhintrc'}))
        .pipe($.htmlhint.reporter(stylish))
    ;
});

gulp.task('phpcs', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe($.shell([
            'echo "' + composerModules + '/bin/phpcs" -n --standard="' + composerModules + '/phpcs-ruleset.xml" "<%= file.path %>"',
            '"' + composerModules + '/bin/phpcs" -n --standard="' + composerModules + '/phpcs-ruleset.xml" "<%= file.path %>"'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('phpmd', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe($.shell([
            'echo "' + composerModules + '/bin/phpmd" "<%= file.path %>" text codesize,design,naming,unusedcode',
            '"' + composerModules + '/bin/phpmd" "<%= file.path %>" text codesize,design,naming,unusedcode'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('screenshots', function(){
    var pageres = new Pageres({crop: true})
        .src(remoteBaseDevUrl, ['320x480', '320x568', '768x1024', '1024x768', '1280x1024', '1280x800', '1366x768', '1440x900', '1600x900', '1920x1080'])
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

gulp.task('bower:install', $.shell.task([
    'bower install'
]))

gulp.task('bower:copy', function(){
    console.log('');
    console.log('If your package doesn\'t appear in ' + srcScripts + ' then the main property in that packages bower.json hasn\'t been set. You will therefore need to create an override in your bower.json file to specifiy the main files of that package.');
    console.log('');
    console.log('See: https://github.com/ck86/main-bower-files#overrides-options');
    console.log('');
    return gulp.src(mainBowerFiles())
        .pipe($.if('*.css', gulp.dest(srcStyles)))
        .pipe($.if('*.js', gulp.dest(srcScripts)))
    ;
});

gulp.task('bower', function(callback){
    runSequence('bower:install', 'bower:copy', callback);
});

/*------------------------------------------------*/

gulp.task('clean:css', function(){
    return gulp.src([dist + '**/*.css'], {read: false})
        .pipe($.rimraf())
    ;
});

gulp.task('clean:js', function(){
    return gulp.src([dist + '**/*.js'], {read: false})
        .pipe($.rimraf())
    ;
});

gulp.task('clean:images', function(){
    return gulp.src([dist + '**/*.{' + imageFileTypes + '}'], {read: false})
        .pipe($.rimraf())
    ;
});

gulp.task('tabsto4spaces', function(){
    return gulp.src(htmlPhpFiles)
        .pipe($.soften(4)) //4 spaces
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
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.changed(dist)) //must be dist
        .pipe($.cssUrlAdjuster({
            append: function(url){
                return calculateAdjustedUrl(url);
            }
        }))
        .pipe($.csso())
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS, {cascade: true}))
        .pipe(gulp.dest(dist))
        .pipe(reload({stream: true}))
        .pipe($.size({title: 'compile:css:local'}))
    ;
});

gulp.task('compile:js:local', function(){
    return gulp.src(srcJs, {base: src})
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.uglify({
            mangle: false,
            output: {
                beautify: true
            }
        }))
        .pipe($.order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/*.js'
        ]))
        .pipe($.concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe(reload({stream: true}))
    ;
});

gulp.task('reloadhtmlphp', function(){
    return gulp.src(htmlPhpFiles)
        .pipe($.changed(htmlPhpFiles))
        .pipe(reload({stream: true}))
    ;
});

/*------------------------------------------------*/

gulp.task('compile:css:remote', function(){
    return gulp.src(srcCss)
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.changed(dist)) //must be dist
        .pipe($.if(
            !argv.production,
            $.cssUrlAdjuster({
                append: function(url){
                    return calculateAdjustedUrl(url);
                }
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.cssUrlAdjuster({
                append: function(url){
                    return calculateAdjustedUrl(url);
                }
            })
        ))
        .pipe($.csso())
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS, {cascade: true}))
        .pipe(gulp.dest(dist))
        .pipe(reload({stream: true}))
        .pipe($.size({title: 'compile:css:remote'}))
    ;
});

gulp.task('compile:js:remote', function(){
    return gulp.src(srcJs, {base: src})
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.if(
            argv.production, // --production flag
            $.removelogs()
        ))
        .pipe($.if(
            !argv.production,
            $.uglify({
                mangle: false,
                output: {
                    beautify: true
                }
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.uglify({preserveComments: 'some'})
        ))
        .pipe($.order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/*.js'
        ]))
        .pipe($.concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
    ;
});

gulp.task('prepare:css:remote', function(){
    return gulp.src(srcCss, {base: src})
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.changed(dist)) //must be dist
        .pipe($.if(
            !argv.production,
            $.cssUrlAdjuster({
                append: function(url){
                    return calculateAdjustedUrl(url);
                }
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.cssUrlAdjuster({
                append: function(url){
                    return calculateAdjustedUrl(url);
                }
            })
        ))
        .pipe($.csso())
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS, {cascade: true}))
        .pipe(gulp.dest(dist))
        .pipe($.size({title: 'prepare:css:remote'}))
        .pipe($.if(
            !argv.production,
            $.sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath
            })
        ))
    ;
});

gulp.task('prepare:js:remote', function(){
    return gulp.src(srcJs, {base: src})
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.if(
            argv.production, // --production flag
            $.removelogs()
        ))
        .pipe($.if(
            !argv.production,
            $.uglify({
                mangle: false,
                output: {
                    beautify: true
                }
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.uglify({preserveComments: 'some'})
        ))
        .pipe($.order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/*.js'
        ]))
        .pipe($.concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe($.size({title: 'prepare:js:remote'}))
        .pipe($.if(
            !argv.production,
            $.sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath + '/' + scripts
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath + '/' + scripts
            })
        ))
    ;
});

gulp.task('reloadhtmlphpandupload', function(){
    return gulp.src(htmlPhpFiles, {base: dist})
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.changed(htmlPhpFiles))
        .pipe($.if(
            !argv.production,
            $.sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.sftp({
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
        .pipe($.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
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
    return gulp.src([dist + '**/*.{' + allValidFileTypes + '}', '!./gulpfile.js'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe($.if(
            !argv.production,
            $.sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath
            })
        ))
    ;
});

gulp.task('serve:local', function(){
    browserSync.init(null, {
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
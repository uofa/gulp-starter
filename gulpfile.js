/**
 * @code --skipMinify     Skip obfuscation of JavaScript code (supersedes --skipBeautify)
 * @code --skipBeautify   Skip beautifying JavaScript code. Requires skipMinify to be set to false
 * @code --skipWatch      Skip all watch tasks (supersedes --skipBowerWatch)
 * @code --skipBowerWatch Skip watching Bower resources. Requires skipWatch to be set to false
 * @code --skipImageMin   Skip image minification
 * @code --skipPageOpen   Skip BrowserSync opening a web page on completion of Gulp tasks
 *
 * @code --loadConfig     Sets the config for a specific target (e.g. `gulp --load-config custom_target` makes Gulp use `config_custom_target.json`)
 *
 * @code --production     Run tasks as production ready (e.g. force minification, remove logs, etc.)
 * @code --verbose        Per task, output each file that is processed in the stream
 */
'use strict';

var paths = {};

paths.currentLevel = './';
paths.upOneLevel   = '../';
paths.baseDir      = __dirname + '/';

// Check if the '--load-config' flag is supplied
// This cannot be done via the node module argv because the config needs to be loaded before the node_modules are loaded
var loadConfig = process.argv.indexOf('--load-config'),
    configFilename;

if(loadConfig === -1){
    configFilename = 'config.json';
} else {
    var loadConfigValueIndex = loadConfig + 1;
    var configFilename = (!!process.argv[loadConfigValueIndex]) ? 'config_' + process.argv[loadConfigValueIndex] + '.json' : 'config.json';
}

var config = require(paths.currentLevel + configFilename);

var node_modules     = '',
    composer_bin     = '';

paths.composer_plugins = 'composer_plugins/';

if(config.gulpSettings.skipLocalInstall === true){
    var isWin   = /^win/.test(process.platform);
    var isMacOS = /^darwin/.test(process.platform);

    if(isWin){
        var base         = process.env.USERPROFILE + '/AppData/Roaming/';
        node_modules     = base + 'npm/node_modules/',
        composer_bin     = base + 'Composer/vendor/bin/';
    } else if(isMacOS){
        node_modules     = '/usr/local/lib/node_modules/',
        composer_bin     = '/usr/local/bin/';
    } else { // Generic Linux / Unix
        node_modules     = '/usr/lib/local/node_modules/',
        composer_bin     = '/usr/local/bin/';
    }

    var $ = {
        apidoc        : require(node_modules + 'gulp-apidoc'),
        autoprefixer  : require(node_modules + 'gulp-autoprefixer'),
        changed       : require(node_modules + 'gulp-changed'),
        complexity    : require(node_modules + 'gulp-complexity'),
        concat        : require(node_modules + 'gulp-concat'),
        cond          : require(node_modules + 'gulp-cond'),
        csslint       : require(node_modules + 'gulp-csslint'),
        csso          : require(node_modules + 'gulp-csso'),
        debug         : require(node_modules + 'gulp-debug'),
        eol           : require(node_modules + 'gulp-eol'),
        htmlhint      : require(node_modules + 'gulp-htmlhint'),
        iff           : require(node_modules + 'gulp-if'),
        imagemin      : require(node_modules + 'gulp-imagemin'),
        jscs          : require(node_modules + 'gulp-jscs'),
        jshint        : require(node_modules + 'gulp-jshint'),
        order         : require(node_modules + 'gulp-order'),
        plumber       : require(node_modules + 'gulp-plumber'),
        removelogs    : require(node_modules + 'gulp-removelogs'),
        rename        : require(node_modules + 'gulp-rename'),
        rework        : require(node_modules + 'gulp-rework'),
        sass          : require(node_modules + 'gulp-sass'),
        sftp          : require(node_modules + 'gulp-sftp'),
        shell         : require(node_modules + 'gulp-shell'),
        size          : require(node_modules + 'gulp-size'),
        soften        : require(node_modules + 'gulp-soften'),
        tap           : require(node_modules + 'gulp-tap'),
        uglify        : require(node_modules + 'gulp-uglify'),
        util          : require(node_modules + 'gulp-util'),
    };
} else {
    var $ = require(node_modules + 'gulp-load-plugins')({ rename: { 'gulp-if': 'iff' } });
}

var gulp = require(node_modules + 'gulp');
module.exports = gulp; // For Chrome plugin + gulp-devtools

$.Pageres        = require(node_modules + 'pageres');
$.argv           = require(node_modules + 'yargs').argv;
$.beep           = require(node_modules + 'beepbeep');
$.bower          = require(node_modules + 'bower');
$.browserSync    = require(node_modules + 'browser-sync');
$.del            = require(node_modules + 'del');
$.fs             = require('fs'); // Part of Node
$.mainBowerFiles = require(node_modules + 'main-bower-files');
$.open           = require(node_modules + 'opn');
$.penthouse      = require(node_modules + 'penthouse');
$.psi            = require(node_modules + 'psi');
$.reworkUrl      = require(node_modules + 'rework-plugin-url');
$.runSequence    = require(node_modules + 'run-sequence');
$.stylish        = require(node_modules + 'jshint-stylish');

config.webBrowser = 'chrome';

var stylesheetFileTypeArray = ['css', 'scss'],
    scriptFileTypeArray     = ['js'],
    imageFileTypeArray      = ['gif', 'jpg', 'png', 'svg'],
    pageFileTypeArray       = ['html', 'php'],
    fontFileTypeArray       = ['eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'],
    serverFileTypeArray     = ['htaccess'];

var imageFileTypes = imageFileTypeArray.join(',');

paths.pageFileTypes     = pageFileTypeArray.join(',');
paths.otherFileTypes    = pageFileTypeArray.concat(fontFileTypeArray, serverFileTypeArray).join(','); // html,php,eot,svg,ttf,woff,woff2,htaccess
paths.allValidFileTypes = stylesheetFileTypeArray.concat(scriptFileTypeArray, imageFileTypeArray, pageFileTypeArray, fontFileTypeArray, serverFileTypeArray).join(','); // css,scss,js,gif,png,html,php,eot,svg,ttf,woff,woff2,htaccess

paths.src  = paths.currentLevel + config.folderSettings.src + '/';
paths.dist = paths.currentLevel + config.folderSettings.dist + '/';

paths.htmlPhpFiles = paths.dist + '**/*.{' + paths.pageFileTypes + '}';
paths.phpFiles     = paths.dist + '**/*.php';

paths.srcScripts  = paths.src + config.folderSettings.scripts;
paths.srcStyles   = paths.src + config.folderSettings.styles;
paths.distScripts = paths.dist + config.folderSettings.scripts;
paths.distStyles  = paths.dist + config.folderSettings.styles;

paths.srcCss    = paths.src + '**/*.css';
paths.srcSass   = paths.src + '**/*.scss';
paths.srcJs     = paths.src + '**/*.js';
paths.srcImages = paths.src + '**/*.{' + imageFileTypes + '}';

paths.distCss    = paths.dist + '**/*.css'; // No *.scss as compiled to *.css in dist
paths.distJs     = paths.dist + '**/*.js';
paths.distImages = paths.dist + '**/*.{' + imageFileTypes + '}';

paths.bowerComponentsJs = paths.currentLevel + config.folderSettings.bowerComponents + '/' + '**/*.js';

var remoteBaseCssDevPrependUrl  = '/' + config.environmentalSettings.webAccount + '/' + config.projectSettings.remoteProjectBaseDir,
    remoteBaseCssProdPrependUrl = '/' + config.environmentalSettings.symbolicLink + '/' + config.projectSettings.remoteProjectBaseDir;

// Prepend URL is based on location of CSS files
var remoteCssDevPrependUrl  = remoteBaseCssDevPrependUrl + '/',
    remoteCssProdPrependUrl = remoteBaseCssProdPrependUrl + '/';

config.urlSettings.remoteBaseDevUrl  = config.urlSettings.protocol + '://' + config.urlSettings.remoteBaseDevUrl + remoteBaseCssDevPrependUrl;
config.urlSettings.remoteBaseProdUrl = config.urlSettings.protocol + '://' + config.urlSettings.remoteBaseProdUrl + remoteBaseCssProdPrependUrl;

config.authDev        = 'development'; // Details defined in .ftppass
config.authProd       = 'production'; // Details defined in .ftppass
config.remotePlatform = 'unix';

paths.remotePath          = 'public_html/' + config.projectSettings.remoteProjectBaseDir;
paths.browserSyncProxyUrl = config.urlSettings.protocol + '://' + 'localhost' + '/' + config.projectSettings.localProjectBaseDir + '/';

paths.docsBuildFile = 'compose.js';
paths.docsSrc       = 'docs/';
paths.docsDest      = paths.docsSrc + 'build/';
paths.docsTemplate  = paths.docsSrc + 'template/';

config.SCREEN_RESOLUTIONS = [
    '320x480',
    '320x568',
    '768x1024',
    '1024x768',
    '1280x1024',
    '1280x800',
    '1366x768',
    '1440x900',
    '1600x900',
    '1920x1080',
];

config.AUTOPREFIXER_BROWSERS = [
    'ie >= 7', // 10
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 5', // box-shadow > -webkit-box-shadow
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10',
];

paths.currentFile = ''; // Used with tap plugin to know what file is currently within the pipe

var flags = [];
for(var key in config.flagSettings){
    if(config.flagSettings.hasOwnProperty(key)){
        if(key.substr(0, 1) !== '_'){
            flags[key] = $.argv[key] || config.flagSettings[key];
        }
    }
}

config.sassSettings = { precision: 10 };
if (!flags.skipMinify) {
    config.sassSettings['outputStyle'] = 'compressed';
}

/*------------------------------------------------*/

String.prototype.replaceLast = function(find, replace){
    var index = this.lastIndexOf(find);

    if(index >= 0){
        return this.substring(0, index) + replace + this.substring(index + find.length);
    }

    return this.toString();
};

var functions = {};

functions.buildScriptsConcatenationOrder = function(scriptsConcatenationOrder){
    scriptsConcatenationOrder.unshift('jquery.js');
    scriptsConcatenationOrder = scriptsConcatenationOrder.map(function(val){ return '**/**/' + val });
    scriptsConcatenationOrder.push('*.js');

    return scriptsConcatenationOrder;
}

functions.calculateAdjustedUrl = function(url){
    var output = ''; // var to hold result

    paths.currentFile = paths.currentFile.replace(/\\/g, '/'); // Convert all back-slashes to forward-slashes
    var dirname = paths.currentFile.replace(/\/[^\/]*\/?$/, '') + '/';
    var url_without_params = url.replace(/(\?.*)|(#.*)/g, '');

    if($.fs.existsSync(dirname + url_without_params)){ // If path already exists, leave alone
        output = url;
    } else if(url.charAt(0) == '/'){ // Absolute URL, leave alone
        output = url;
    } else if(url.indexOf('/') == -1){
        output = paths.upOneLevel + config.folderSettings.images + '/' + url;
    } else {
        output = paths.upOneLevel + url.replace(/^(?:\.\.\/)+/, '');
    }

    var output_without_params = output.replace(/(\?.*)|(#.*)/g, '');

    if($.fs.existsSync(dirname + output_without_params)){
        var stats = $.fs.statSync(dirname + output_without_params);
        var filemtime = Math.round(stats.mtime.getTime() / 1000); // Convert to Unix timestamp
        output = output.replaceLast('.', '.' + filemtime + '.');
    } else {
        functions.onWarning('File not found: ' + (dirname + output_without_params) + "\n" + 'Defined in: ' + paths.currentFile.split('/').reverse()[0]);
    }

    return output;
}

functions.loadBowerFiles = function(){
    var files = [];

    if(!config.customBowerFiles){
        files = $.mainBowerFiles({ filter: /\.(js)$/i });
    } else {
        files = config.customBowerFiles.map(function(bowerFile){
            return config.folderSettings.bowerComponents + '/' + bowerFile;
        });
    }

    return files;
}

functions.onWarning = function(error){
    var displayError = $.util.colors.yellow(error);
    handleError.call(this, 'warning', error, displayError);
}

functions.onError = function(error){
    try { this.emit('end') } catch(error){ /* this.emit('end') not called */ }
    var displayError = $.util.colors.red(error);
    handleError.call(this, 'error', error, displayError);
}

function handleError(level, error, displayError){
    $.util.log(displayError);

    if(level == 'error'){
        $.beep();
        process.exit(1);
    }
}

/*------------------------------------------------*/

require(node_modules + 'gulp-require-tasks')({
    path: paths.baseDir + 'tasks',
    gulp: gulp,
    arguments: [ functions, $, paths, config, flags, ],
});

gulp.task('__app:clean:all', function(callback){
    $.runSequence('__app:clean:files', '__app:process:src:tabs', '__app:process:src:eol', callback);
});

gulp.task('app:install:scripts:src:local', function(callback){
    $.runSequence('bower:install', 'app:build:scripts:src:local', callback);
});

gulp.task('app:install:scripts:src:remote', function(callback){
    $.runSequence(['bower:install', 'app:build:scripts:src:remote'], callback);
});

gulp.task('app:build:local', function(callback){
    $.runSequence('__app:clean:all', ['app:build:styles:src:local', 'app:build:scripts:src:local'], 'app:build:images:src', '__app:copy:files', callback);
});

gulp.task('app:build:remote', function(callback){
    $.runSequence('__app:clean:all', ['app:build:styles:src:remote', 'app:build:scripts:src:remote'], 'app:build:images:src', '__app:copy:files', callback);
});

gulp.task('default', function(callback){
    $.runSequence('app:build:local', 'app:serve:local', callback);
});

gulp.task('app:upload:dist', function(callback){
    $.runSequence('app:build:remote', '__app:sftp:dist', 'app:serve:remote', 'app:open:dist:remote', callback);
});
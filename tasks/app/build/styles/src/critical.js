module.exports = function(gulp, functions, $, paths, config, flags){
    return $.penthouse({
        url: paths.browserSyncProxyUrl, // localhost
        css: paths.srcStyles + '/screen.scss', // Main CSS file
        width: 400,
        height: 240,
    }, function(error, criticalCss){
        if(error){
            functions.onError(error);
        } else {
            functions.onWarning(criticalCss);
        }
    });
};
module.exports = function(gulp, functions, $, paths, config, flags){
    if(!flags.skipPageOpen){
        return flags.production ? $.open(config.urlSettings.remoteBaseProdUrl, config.webBrowser) : $.open(config.urlSettings.remoteBaseDevUrl, config.webBrowser);
    }

    return true;
};
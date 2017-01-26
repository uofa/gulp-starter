module.exports = function(gulp, functions, $, paths, config, flags){
    return new $.Pageres({ crop: true })
                .src(config.urlSettings.remoteBaseDevUrl, config.SCREEN_RESOLUTIONS)
                .dest(paths.baseDir)
                .run()
                .then(() => console.log("Successfully generated 10 screenshots for:\n" + config.urlSettings.remoteBaseDevUrl));
};
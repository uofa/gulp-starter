module.exports = function(gulp, functions, $, paths, config, flags){
    return $.del([paths.distCss,
                  paths.distJs,
                  paths.distImages,
                  paths.distScripts + '/tinymce']
    , { force: true });
};
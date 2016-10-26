module.exports = function(gulp, functions, $, paths, config, flags, done){
    console.log('Documentation can be found at: ' + paths.baseDir + paths.docsDest);

    $.apidoc({
        src: paths.docsSrc,
        dest: paths.docsDest,
        template: paths.docsTemplate,
        includeFilters: [paths.docsBuildFile],
    }, done);
};
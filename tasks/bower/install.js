module.exports = function(gulp, functions, $, paths, config, flags){
    return $.bower
            .commands
            .install([/* custom libs */], { save: true }, [ paths.baseDir + 'bower.json' ])
            .on('end', function(installed){
                if(Object.keys(installed).length !== 0){
                    functions.onWarning('Installed: ' + Object.keys(installed));
                } else {
                    console.log('Nothing to install');
                }
            });
};
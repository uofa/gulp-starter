module.exports = function(gulp, functions, $, paths, config, flags){
    return $.psi(config.urlSettings.remoteBaseDevUrl, { nokey: 'true', strategy: 'mobile', threshold: 65 }).then(data => {
        console.log('Speed Score: ' + data.ruleGroups.SPEED.score);
        console.log('Usability Score: ' + data.ruleGroups.USABILITY.score);
    });
};
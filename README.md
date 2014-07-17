# Setup

## Pre-requisite

* [WAMP](http://www.wampserver.com/en/#download-wrapper) is recommended but the minimum requirement is [PHP 5.4](http://windows.php.net/download/) for Composer

---

## Code Installation

* Download and unzip to your WAMP's `www` folder placing all code within a `gulp-starter` directory
  * Or change `localProjectBaseDir` var in `gulpfile.js` to whatever folder name you choose to use
  * Other path variables exist at the beginning of `gulpfile.js` but take care when modifying these
* If instead you choose to clone this repo using the GitHub client, copy the contents of this repo to your WAMP's `www` folder (placing all code within a `gulp-starter` directory)
  * This way your cloned copy can remain clean
    * Should you choose to use this repo for other projects simply repeat the process of copying the cloned repo to a new location
* Drop all code that requires pre-processing (so fonts, images, JavaScript and CSS) into the `/app` directory adhering to the following structure
  * Everything else can go into `/public_html`
    * So `*.html`, `*.php`, etc.

### Folder Structure

```
/gulp-starter
    /app
        /fonts
        /images
        /scripts
        /styles
    /bower_components
    /public_html
        *.html
        *.php
    /secure
        private
```

---

## File Config

* All script tags linking to a local source should be removed - from your footer where they should be - and replaced with one, single call
  * `/public_html/scripts/all.min.js` is all JavaScript stored in `/app/scripts` concatenated into one file
```html
<script src="scripts/all.min.js"></script>
```

### Optional tasks if you wish to setup for working remotely

* Assuming you have configured your remote web server for [SSH access](http://kb.site5.com/shell-access-ssh/how-to-generate-ssh-keys-and-connect-to-your-account-with-putty/)
  * Add your private SSH key file to `/secure` and name the file `private` (without any extension)
    * Remember it must be in the OpenSSH format
        * [puttygen](http://the.earth.li/~sgtatham/putty/latest/x86/puttygen.exe) can export into this format
* Change the `webAccount` var in `gulpfile.js` to that of your remote `development` web account
  * e.g. `wdu999`
* Amend `.ftppass` to contain the passphrase linked to your SSH details and the user/web account you want to SFTP into
    * The web account set for `development` should be the same as that set for the `webAccount` var ^above^
    * Define the details of your `production` environment in the same way you have done for `development`
    * For info, by default uploads are transferred to `public_html` on the remote web server no matter what environment is used
* Change the `symbolicLink` var in `gulpfile.js` to that set for your `production` environment
  * e.g. `medi-cal` (which corresponds to http://www.abdn.ac.uk/medi-cal/)

---

## Node.js Installation

* Install Node.js - http://nodejs.org/download/ (Windows Installer)

---

## Composer Installation

* Install Composer - https://getcomposer.org/Composer-Setup.exe
  * You may need to enable OpenSSL in your PHP installation by going directly to `./wamp/bin/php/php-5.4.x/php.ini` and enabling the OpenSSL extension
* Double-click `composer-installs.bat` to run
  * Ensure that setup completes successfully
* Add `C:\Users\%USERNAME%\AppData\Roaming\Composer\vendor\bin` to `PATH` System Variable
    * Start > Run > `control sysdm.cpl,,3`
* Copy `phpcs-ruleset.xml` to `C:\Users\%USERNAME%\AppData\Roaming\Composer\vendor\bin`

---

## Gulp Installation

* Double-click `npm-installs.bat` to run
  * Ensure that setup completes successfully

### Modify `gulp` to run globally

* Start > Run > `C:\Users\%USERNAME%\AppData\Roaming\npm\node_modules\gulp\bin\gulp.js`
   * @ Line ~76
```
if (!env.modulePath) {
    env.modulePath = 'C:/Users/' + process.env.USERNAME + '/AppData/Roaming/npm/node_modules/gulp/';
    env.modulePackage.version = cliPackage.version;

    /*
    gutil.log(
      chalk.red('Local gulp not found in'),
      chalk.magenta(tildify(env.cwd))
    );
    gutil.log(chalk.red('Try running: npm install gulp'));
    process.exit(1);
    */
}
```

---

## Ready to run `gulp`

* To check your installation is configured properly, open a command prompt from within your root folder and type in `gulp --version`
  * This should output the version of `gulp` you have installed

### Choose how you want to work

* Working **locally**
    * Open a command prompt from within your root folder and type in `gulp` - leave this prompt open
    * This will build everything and push it to `/public_html`
      * `gulp` will open up Chrome to this page - keep this open
    * Begin coding as you normally would and any changes to your code will be mimicked in your browser without having to reload the page

* Working **remotely** with your `development` environment
    * Open a command prompt from within your root folder and type in `gulp upload` - leave this prompt open
      * This command uses the `development` environmental details specified in `.ftppass`
      * To form a URL it combines the `remoteBaseDevUrl` var ("homepages") with the `webAccount` var
    * This will build everything and push the code in `/public_html` to your development web server following the same folder structure
      * `gulp` will open up Chrome to this page - keep this open
    * Begin coding as you normally would pressing `Ctrl + F5` to see any file changes

* Working **remotely** with your `production` environment
    * Open a command prompt from within your root folder and type in `gulp upload --production` - leave this prompt open
      * This command uses the `production` environmental details specified in `.ftppass`
      * To form a URL it changes to use `remoteBaseProdUrl` var ("www") combined with the `symbolicLink` var
      * It also fully minifies and obfuscates JavaScript and removes all console logging
    * This will build everything and push the code in `/public_html` to your production web server following the same folder structure
      * `gulp` will open up Chrome to this page - keep this open
    * Begin coding as you normally would pressing `Ctrl + F5` to see any file changes

---

## Other Config Files within Repo

* `.htmlhintrc`
  * Contains [rules](https://github.com/yaniswang/HTMLHint/wiki/Rules) (in JSON format) for checking HTML files
  * Open a command prompt from within your root folder and type in `gulp htmlhint` to run the associated task
* `.jscsrc`
  * Contains [rules](https://github.com/mdevils/node-jscs#rules) (in JSON format) for checking JavaScript files
  * You will need to amend the `jscs` task in `gulpfile.js` to run against a JavaScript file of your choosing that resides within `/app/scripts`
  * Open a command prompt from within your root folder and type in `gulp jscs` to run the associated task

---

## Chrome and Gulp (Optional)

* Download the [Gulp Devtools extension for Chrome Developer Tools](https://chrome.google.com/webstore/detail/gulp-devtools/ojpmgjhofceebfifeajnjojpokebkkji) from the Chrome Web Store
* Type `gulp-devtools` into a command prompt in the root of your directory
* Open Chrome Developer tools and find the Gulp tab
  * Your `gulp` tasks should now be accessible to run from within Chrome

---

## `gulp` Tasks Workflow

* [View diagram](https://www.lucidchart.com/documents/embeddedchart/4ff39dc5-3ddf-418a-a96b-f5e1460dd77e/0)

---

## License

[MIT](http://opensource.org/licenses/MIT) © [Jonathan Goode](http://jonathangoode.co.uk)
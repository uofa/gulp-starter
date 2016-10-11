# Setup

## Pre-requisite Software

- [WAMP](http://www.wampserver.com/en/#download-wrapper) is recommended but the minimum requirement is [PHP 5.4](http://windows.php.net/download/) for running Composer

---

## Code Installation

- Download and unzip to your WAMP's `www` directory placing all code within a `gulp-starter` directory
  - Or change `localProjectBaseDir` in `config.json` to whatever directory name you have chosen to use
  - Other path variables exist in `config.json` but take care when modifying these
- If instead you choose to clone this repo using the GitHub client, copy the contents of this repo to your WAMP's `www` directory (placing all code within a `gulp-starter` directory)
  - This way your cloned copy can remain clean
    - Should you choose to use this repo for other projects simply repeat the process of copying the cloned repo to a new location
- Drop all code that requires pre-processing (so fonts, images, JavaScript and CSS) into the `/app` directory adhering to the following structure
  - Everything else can go into `/public_html`
    - So `*.html`, `*.php`, etc.

### Directory Structure

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

## File Configuration

- All script tags linking to a local source should be removed - from your footer where they should be - and replaced with one, single call
  - `/public_html/scripts/all.min.js` is all JavaScript stored in `/app/scripts` concatenated into one file
```html
<script src="scripts/all.min.js"></script>
```

### Optional tasks if you wish to setup for working remotely

- Assuming you have configured your remote web server for [SSH access](http://kb.site5.com/shell-access-ssh/how-to-generate-ssh-keys-and-connect-to-your-account-with-putty/)
  - Add your private SSH key file to `/secure` and name the file `private` (without any extension)
    - Remember it must be in the OpenSSH format
        - [puttygen](http://the.earth.li/~sgtatham/putty/latest/x86/puttygen.exe) can export into this format
- Change `webAccount` in `config.json` to that of your remote `development` web account
  - e.g. `wdu999`
- Amend `.ftppass` to contain the passphrase linked to your SSH details and the user/web account you want to SFTP into
    - The web account set for `development` should be the same as that set for `webAccount` in `config.json` (as ^above^)
    - Define the details of your `production` environment in the same way you have done for `development`
    - For info, by default uploads are transferred to `public_html` on the remote web server no matter what environment is used
- Change `symbolicLink` in `config.json` to that set for your `production` environment
  - e.g. `medi-cal` (which corresponds to http://www.abdn.ac.uk/medi-cal/)

---

## Node.js Installation

- Install Node.js - http://nodejs.org/download/ (Windows Installer)
- To check your installation is configured properly, open a terminal and type in `node --version`
  - This should return a version number at or above `0.12.x`

---

## Composer Installation

- Install Composer - https://getcomposer.org/Composer-Setup.exe
  - You may need to enable OpenSSL in your PHP installation by going directly to `./wamp/bin/php/php-5.4.x/php.ini` and enabling the OpenSSL extension
- Double-click `global-installs-composer.cmd` to run the installation
  - The prompt window will close itself when setup has finished successfully
- Add `%USERPROFILE%\AppData\Roaming\Composer\vendor\bin` to the `PATH` **System Variable**
    - Start → Run → `control sysdm.cpl,,3`
- To check your installation is configured properly, open a terminal and type in `composer --version`
  - This should return a long hash similar to `a309e1d89ded6919935a842faeaed8e888fbfe37`
- Copy the directory `./gulp-starter/composer_plugins/vendor/squizlabs/`and paste at `%USERPROFILE%\AppData\Roaming\Composer\vendor\`
  - Click 'Yes' when the 'Confirm Folder Replace' dialog appears
  - Click 'Copy and Replace' when the 'Copy File' dialog appears

---

## Gulp Installation (incl. Bower)

### Pre-requisite command:

```csh
$ npm install --global gulp
```

### Running Gulp and its dependencies _locally_

- Ensure `config.json` has `skipLocalInstall` set to `false`

--

#### Commands:

```csh
$ npm update --save-dev
$ gulp
```

--

### Running Gulp and its dependencies _globally_

- Ensure `config.json` has `skipLocalInstall` set to `true`
- Ensure `./node_modules` is deleted or empty

--

#### First command:

```csh
$ global-installs-npm.cmd
```

#### Modify `gulp` to run _globally_

##### Windows

- Start → Run → `%USERPROFILE%\AppData\Roaming\npm\node_modules\gulp\bin\gulp.js`
   - @ Line ~84
```
if (!env.modulePath) {
    env.modulePath = process.env.USERPROFILE + '/AppData/Roaming/npm/node_modules/gulp/';
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

##### Mac OS X

- Terminal → `nano /usr/local/lib/node_modules/gulp/bin/gulp.js`
   - @ Line ~84
```
if (!env.modulePath) {
    env.modulePath = '/usr/local/lib/node_modules/gulp/';
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

--

#### Final command:

```csh
$ gulp
```

---

## Choose how you want to work

Working **locally**

```sh
$ gulp
```

  - Open the terminal within your project directory - leave this prompt open after execution
  - This task will build everything and push it to `/public_html`
    - `gulp` will open up Chrome to this page - keep this page open
  - Begin coding as you normally would and any changes to your code will be mimicked in your browser without having to reload the page

Working **remotely** in your `development` environment

```sh
$ gulp app:upload:dist
```

  - Open the terminal within your project directory - leave this prompt open after execution
    - This command uses the `development` environmental details specified in `.ftppass`
    - To form a URL it combines `remoteBaseDevUrl` ('homepages') with `webAccount` as set in `config.json`
  - This will build everything and push the code in `/public_html` to your development web server following the same directory structure
    - `gulp` will open up Chrome to this page - keep this page open
  - Begin coding as you normally would pressing `Ctrl + F5` to view your file changes

Working **remotely** in your `production` environment

```sh
$ gulp app:upload:dist --production
```

  - Open the terminal within your project directory - leave this prompt open after execution
    - This command uses the `production` environmental details specified in `.ftppass`
    - To form a URL it changes to use `remoteBaseProdUrl` ('www') combined with `symbolicLink` as set in `config.json`
    - It also fully minifies and obfuscates JavaScript and removes all console logging whilst preserving license comment blocks
  - This will build everything and push the code in `/public_html` to your production web server following the same directory structure
    - `gulp` will open up Chrome to this page - keep this page open
  - Begin coding as you normally would pressing `Ctrl + F5` to view your file changes

---

## Other `gulp` Tasks

- [View workflow diagram](https://www.lucidchart.com/documents/embeddedchart/4ff39dc5-3ddf-418a-a96b-f5e1460dd77e)

```sh
$ gulp app:build:documentation
$ gulp app:build:styles:src:critical
$ gulp app:generate:dist:pagespeed
$ gulp app:generate:dist:screenshots
$ gulp app:generate:src:stats
$ gulp app:lint:dist:htmlhint
$ gulp app:lint:dist:phpcpd
$ gulp app:lint:dist:phpcs
$ gulp app:lint:dist:phpmd
$ gulp app:lint:src:csslint
$ gulp app:lint:src:jscs
$ gulp app:lint:src:jshint
$ gulp app:process:path --folder public_html
$ gulp bower:install
```

- You can also create separate task files within the `/tasks` directory (e.g. `/tasks/example.js`) which will be read in automatically and available to run on the command line
- Note for bower users: if your package doesn't appear in the `dist` directory then the main property for that packages `bower.json` hasn't been set.
   - You will therefore need to [create an override in your `bower.json`](https://github.com/uofa/gulp-starter/blob/global-version/bower.json#L6-10) file to specify the main files of that package.
   - See [https://github.com/ck86/main-bower-files#overrides-options](https://github.com/ck86/main-bower-files#overrides-options) for more

---

## Rule Configuration Files

- `.htmlhintrc`
  - Contains [rules](https://github.com/yaniswang/HTMLHint/wiki/Rules) (in JSON format) for checking HTML files
  - Open a terminal within your project directory and type in `gulp htmlhint` to run the associated task
- `.jscsrc`
  - Contains [rules](https://github.com/mdevils/node-jscs#rules) (in JSON format) for checking JavaScript files
  - You will need to amend the `jscs` task in `gulpfile.js` to run against a JavaScript file of your choosing that resides within `/app/scripts`
  - Open a terminal within your project directory and type in `gulp jscs` to run the associated task

---

## Rulesets

- [PHP Codesniffer (phpcs)](https://github.com/u01jmg3/gulp-starter/blob/master/composer_plugins/CustomPHPCS/ruleset.xml)
- [PHP Mess Detector (phpmd)](https://github.com/u01jmg3/gulp-starter/blob/master/composer_plugins/phpmd-ruleset.xml)

---

## BrowserStack

- If you're doing any cross-browser testing with BrowserStack's local setup, you can edit when running `$ gulp` and live-reload directly inside of a BrowserStack VM.
  - Use `3000` as the port number and untick HTTPS

---

## Chrome and Gulp (Optional)

```csh
$ npm install --global gulp-devtools
```

--

- Download the [Gulp Devtools extension for Chrome Developer Tools](https://chrome.google.com/webstore/detail/gulp-devtools/ojpmgjhofceebfifeajnjojpokebkkji) from the Chrome Web Store
- Open a terminal within your project directory and type in `gulp-devtools`
- Open Chrome Developer tools and find the Gulp tab
  - Your `gulp` tasks should now be accessible to run within Chrome

---

## Creating Multiple Build Targets

A custom build target should have a separate `config_custom_target.json` file.

Usage example:

```sh
$ gulp --load-config custom_target
```

Makes Gulp use the values from `config_custom_target.json` in order to create a custom build target.

---

## License

[MIT](http://opensource.org/licenses/MIT) © [Jonathan Goode](http://jonathangoode.co.uk)
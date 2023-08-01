# Storefront Reference Architecture (SFRA)

This is a repository for the Storefront Reference Architecture reference application.

Storefront Reference Architecture has a base cartridge (`app_storefront_base`) provided by Commerce Cloud that is never directly customized or edited. Instead, customization cartridges are layered on top of the base cartridge. This change is intended to allow for easier adoption of new features and bug fixes.
Storefront Reference Architecture supplies an [plugin_applepay](https://github.com/SalesforceCommerceCloud/plugin-applepay) plugin cartridge to demonstrate how to layer customizations for the reference application.

Your feedback on the ease-of-use and limitations of this new architecture is invaluable during the developer preview. Particularly, feedback on any issues you encounter or workarounds you develop for efficiently customizing the base cartridge without editing it directly.


# The latest version

The latest version of SFRA is 6.0.0

# Getting Started

1 Clone this repository.

2 Run npm install to install all of the local dependencies (SFRA has been tested with v12+ and v14.19.0 and is recommended)

3 Run `npm run compile:js` from the command line that would compile all client-side JS files. Run `npm run compile:scss` and `npm run compile:fonts` that would do the same for css and fonts.

4 Create `dw.json` file in the root of the project:
```json
{
    "hostname": "your-sandbox-hostname.demandware.net",
    "username": "yourlogin",
    "password": "yourpwd",
    "code-version": "version_to_upload_to"
}
```

5 Run `npm run uploadCartridge` command that would upload `app_storefront_base` and `modules` cartridges to the sandbox you specified in dw.json file.

6 Use https://github.com/SalesforceCommerceCloud/storefrontdata to zip and import site date on your sandbox.

7 Add the `app_storefront_base` cartridge to your cartridge path in _Administration >  Sites >  Manage Sites > RefArch - Settings_ (Note: This should already be populated by the sample data in Step 6).

8 You should now be ready to navigate to and use your site.


# NPM scripts
Use the provided NPM scripts to compile and upload changes to your Sandbox.

## Compiling your application
### NPM

* `npm run compile:fonts` - Copies all needed font files. Usually, this only has to be run once.
* `npm run webpack:watch` - Compiles all static files & watches files with the defined cartridges in webpack.config.js
* `npm run webpack:dev` - Compiles all static files for development
* `npm run webpack:prd` - Compiles all static files for production
## Linting your code
### NPM
`npm run lint` - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

#### Line-break warnings on Windows
If the linter outputs line-break warnings on Windows, you need to set git's `autocrlf` option to false as follows;

* Open your console and run `git config --global  core.autocrlf false`
* Remove current project folder and checkout again.
* When you run linter, there shouldn't be any line-break warnings.

## Watching for changes and uploading

`npm run watch` - Watches everything and recompiles (if necessary) and uploads to the sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

## Uploading

`npm run uploadCartridge` - Will upload both `app_storefront_base` and `modules` to the server. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

`npm run upload <filepath>` - Will upload a given file to the server. Requires a valid dw.json file.

#Testing
## Running unit tests

You can run `npm test` to execute all unit tests in the project. Run `npm run cover` to get coverage information. Coverage will be available in `coverage` folder under root directory.

* UNIT test code coverage:
1. Open a terminal and navigate to the root directory of the mfsg repository.
2. Enter the command: `npm run cover`.
3. Examine the report that is generated. For example: `Writing coverage reports at [/Users/yourusername/SCC/sfra/coverage]`
3. Navigate to this directory on your local machine, open up the index.html file. This file contains a detailed report.

## Running integration tests
Integration tests are located in the `storefront-reference-architecture/test/integration` directory.

To run integration tests you can use the following command:

```
npm run test:integration
```

**Note:** Please note that short form of this command will try to locate URL of your sandbox by reading `dw.json` file in the root directory of your project. If you don't have `dw.json` file, integration tests will fail.
sample dw.json file (this file needs to be in the root of your project)
{
    "hostname": "devxx-sitegenesis-dw.demandware.net"
}

You can also supply URL of the sandbox on the command line:

```
npm run test:integration -- --baseUrl devxx-sitegenesis-dw.demandware.net
```

To run tests in a subsuite, such as the storeLocator subsuite:

```
npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-RefArch-Site/en_US test/integration/storeLocator
```

# GIT LFS
The repository has been configured to make use of GIT LFS for file storage of assets contained in the sites directory and {png,jpg,jpeg,gif,mp4,ogg,mov} file types:
* sites/**/*.{png,jpg,jpeg,gif,mp4,ogg,mov}

Any files added to the sites folder with specified file types will automatically be added to LFS. You can see the configuration for this in the following file: `.gitattributes`

If you plan to add any files to there with specified file types, you should execute the following command to add GIT LFS, to your local repository:
```
git lfs install
```
> This adds LFS filters to the .gitconfig file in your home directory, so they are available for all your repos. You could run git lfs install --local if you only want to use LFS with a particular repo. https://confluence.atlassian.com/bitbucket/use-git-lfs-with-bitbucket-828781636.html

## Extracting page or content from library file

Extract individual Page or Content with all linked content assets from Library to separate file:
 
1. Export Library from BM, rename to "expLibrary.xml" and copy to site's lib folder (near library.xml)
2. Use one of the following commands in console (depending on lib type private\shared)
 
`npm run library:page -- --<siteid|lib>=<site-id|libraryid> --page=<page-id>`
 
Samples For Shared library:

`npm run library:page -- --lib=MouawadSharedLibrary --page="homepage"`
`npm run library:page -- --lib=MouawadSharedLibrary --page="homepage" --remove`
`npm run library:page -- --lib=MouawadSharedLibrary --content=07939eee95931ed1f5c1c110c9`
 
Sample For Private library:

`npm run library:page -- --siteid=RefArchGlobal --page="homepage"`
`npm run library:page -- --siteid=RefArchGlobal --content=07939eee95931ed1f5c1c110c9`
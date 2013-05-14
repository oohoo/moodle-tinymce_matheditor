### Prerequisites:

NodeJS and Node Package Manager, follow instructions stated here:

* https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint

**NOTE:** The Ubuntu repositories do not have the latest version of node, using `sudo apt-get` to retrieve these dependencies will not work!

### Installation instructions:

1. Clone the repository
2. Within the main repository directory, fetch the submodule
    `git submodule init`
3. Update the submodule
    `git submodule update`
4. `cd` into the MathQuill directory
    `cd vendor/mathquill_custom`
5. Update the dependencies within the submodule
    `npm install`
6. Navigate back up to the project root
    `cd ../../`
7. Build the project
    * **FOR DEVELOPMENT** `make`
    * **FOR DEPLOYMENT** `make deploy` (NOT WORKING YET)

// directoryFinder.js

// #region required packages
const fs = require("fs");
const path = require("path");
const events = require("events");
// #endregion required packages

// #region directory-finding "class"
/**
 * Find specific directory names.
 */
const DirectoryFinder = {
	/**
	 * Set up this object.
	 * @param {Object} args object with fields
	 * @returns this
	 */
	init: function (args) {
		this._args = args ? args : {};

		if (!Object.prototype.hasOwnProperty.call(this._args, "debug")) this.debug = false;
		else this.debug = this._args.debug;

		if (!Object.prototype.hasOwnProperty.call(this._args, "verbose")) this.verbose = false;
		else this.verbose = this._args.verbose;

		this.results = [];
		this.eventEmitter = new events.EventEmitter();
		this.eventEmitter.on("dirFound", this.foundDir.bind(this));
		return this;
	},
	/**
	 * Target of the internal emitted event.
	 * @param {string} directoryFound the full path to the directory found.
	 */
	foundDir: function foundDir(directoryFound) {
		if (this.verbose) console.log(`found: ${directoryFound}`);
		this.results.push(directoryFound);
	},
	/**
	 * Set the name of the directory to seek.
	 * @param {string} findDir the directory-name to find.
	 * @returns this
	 */
	directoryToFind: function (findDir) {
		if (!findDir) throw new Error("null find-directory");
		this._findDir = findDir;
		if (this.debug||this.verbose)
			console.debug(`_findDir=${this._findDir}`);
		return this;
	},
	/**
	 * Establish the starting-point for recursively find a specific folder.
	 * @param {string} adir the base-directory for this search
	 * @returns this
	 */
	initialDirectory: function (adir) {
		var tmp;

		if (!adir) throw new Error("null directory");
		if (!fs.existsSync(tmp = path.resolve(adir))) throw new Error("ack, non-existent dir!");
		this.results = [];
		this._initialDirectory = tmp;
		if (this.debug||this.verbose)
			console.debug(`_initialDirectory=${this._initialDirectory}`);
		return this;
	},

	/**
	 * main entry-point.
	 * @returns a sorted {Array} of found-folders, if any
	 */
	findDirectories: function () {
		if (this.debug||this.verbose)
			console.debug(`_findDir=${this._findDir}, _initialDirectory=${this._initialDirectory}`);

		this.findSubdirs(this._findDir, this._initialDirectory);
		if (this.results.length > 1) this.results.sort();
		return this.results;
	},
	/**
	 * Find the named directory, starting from the initial-path.
	 * @param {string} dirName the name of the folder to find
	 * @param {string} initialPath the starting location for the search
	 */
	findSubdirs: function findSubdirs(dirName, initialPath) {
		var stuff, subdirs, sdFound;

		stuff = fs.readdirSync(initialPath, { withFileTypes: true });

		sdFound = stuff.filter((anitem) => anitem.isDirectory() && anitem.name === dirName);
		sdFound.forEach((aDir) => this.eventEmitter.emit("dirFound", path.resolve(path.join(initialPath, aDir.name))));

		subdirs = stuff.filter((anitem) => anitem.isDirectory() && (anitem.name !== dirName && anitem.name !== ".git"));

		if (subdirs.length > 0)
			subdirs.forEach((asubdir) => this.findSubdirs(dirName, path.join(initialPath, asubdir.name)));
	}
};
// #endregion directory-finding "class"

module.exports.DirectoryFinder=DirectoryFinder;

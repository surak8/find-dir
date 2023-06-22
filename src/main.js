"use strict";
const yargs = require("yargs");
const {DirectoryFinder}=require("./directoryFinder");

//// #region required packages
//const fs = require("fs");
//const path = require("path");
//const events = require("events");
//// #endregion required packages


/**
 * Search for "node_modules" folders, in the directory-list.
 * @param {Array} dirs an array of paths to search
 */
function doProcess( zzz) {
	var v2, dirsFound, results = [], n,dirs,opts;

	opts=zzz||{_:[],debug:false,D:false,v:false,verbose:false};
	dirs=opts._;
	v2 = DirectoryFinder
		.init({ debug: opts.debug||false, verbose: opts.verbose||false })
		.directoryToFind(opts.dir||"node_modules");

	dirs.forEach((adir) => {
		dirsFound = v2
			.initialDirectory(adir)
			.findDirectories();
		results.push(...dirsFound);
	});
	if ((n = results.length) > 0) {
		if (n > 1) results.sort();
		console.log(`found ${n} results:`);
		results.forEach((afile) => { console.log(`\t${afile}`); });
	} else
		console.log("no directories found");
}

console.debug=function(msg){
	console.log(`[DEBUG] ${msg}`);
};

yargs
	.scriptName("riktest")
	.usage("usage-here")
	.option("dir", {
		alias: "d",
		type: "string",
		description: "Directory-name to find.",
		default: "node_modules"
	})
	.option("debug", {
		alias: "D",
		type: "boolean",
		description: "Debug-processing.",
		default: false
	})
	.option("verbose", {
		alias: "v",
		type: "boolean",
		description: "Verbose-processing.",
		default: false
	})
	.help();
doProcess(yargs.parse());
//doProcess();

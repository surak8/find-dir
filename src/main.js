"use strict";
const fs=require("fs");
const path=require("path");
const events = require("events");

const DirectoryFinder={
	init:function(args){
		this._args=args?args:{};

		if (! Object.prototype.hasOwnProperty.call(this._args, "debug"))
			this.debug=false;
		else
			this.debug=this._args.debug;
		if (! Object.prototype.hasOwnProperty.call(this._args, "verbose"))
			this.verbose=false;
		else
			this.verbose=this._args.verbose;
		this.results=[];
		this.eventEmitter=new events.EventEmitter();
		this.eventEmitter.on("dirFound", this.foundDir.bind(this));
		return this;
	},
	foundDir:function(blah){
		this.results.push(blah);
	},
	directoryToFind:function(findDir){
		if (!findDir) throw new Error("null find-directory");
		this._findDir=findDir;
		return this;
	},
	initialDirectory:function(adir){
		var tmp;

		if (!adir) throw new Error("null directory");
		if (!fs.existsSync(tmp=path.resolve(adir))) throw new Error("ack, non-existent dir!");
		this._initialDirectory=tmp;
		return this;
	},

	doFindFiles:function(){
		this.findSubdirs(this._findDir,this._initialDirectory);
		if (this.results.length>1)
			this.results.sort();
		return this.results;
	},
	findSubdirs:function(dirName,initialPath){
		var stuff,subdirs,sdFound;

		if (this.verbose)
			console.log(`${initialPath}`);

		stuff=fs.readdirSync( initialPath, {withFileTypes:true} );

		sdFound=stuff.filter((anitem)=> anitem.isDirectory()&&anitem.name===dirName);
		sdFound.forEach((aDir)=>this.eventEmitter.emit("dirFound",path.resolve(path.join(dirName,aDir.name))));

		subdirs=stuff.filter((anitem)=>anitem.isDirectory()&&(anitem.name!==dirName&&anitem.name!==".git"));

		if (subdirs.length>0)
			subdirs.forEach((asubdir)=> this.findSubdirs(dirName,path.join(initialPath,asubdir.name)) );
	}
};

var v2=DirectoryFinder
	.init({debug:true,verbose:false})
	.directoryToFind("node_modules")
	.initialDirectory("/js/rik_dev")
	.doFindFiles();
if (v2&&v2.length>0){
	console.log(`found ${v2.length} results:`);
	v2.forEach((afile)=>{console.log(`\t${afile}`);});
}

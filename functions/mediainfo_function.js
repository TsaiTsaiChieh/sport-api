'use strict';
const MediaInfo = require( './MediaInfo/MediaInfo' );
const Xml2json = require( 'xml2json' );
const fs = require( 'fs' );

let mi;

function init() {
	patchFsForMediaInfo();
	let mediaInfoLib = MediaInfo();
	mi = new mediaInfoLib.MediaInfo();
}

function patchFsForMediaInfo() {
	// some weird bug in the mediainfo.js library
	var oldReadFileSync = fs.readFileSync;
	fs.readFileSync = function ( filename ) {
		if ( filename === 'mediainfo.js.mem' ) {
			return oldReadFileSync.call( this, require.resolve( 'mediainfo.js' ) + '.mem' );
		} else {
			return oldReadFileSync.apply( fs, arguments );
		}
	};
}

function getMediaInfo( s3FileData ) {
	var fileSize = parseInt( s3FileData.ContentLength );
	var offset = 0;

	mi.open_buffer_init( fileSize, offset );
	mi.open_buffer_continue( s3FileData.Body, fileSize ); // s3FileData.Body is a buffer
	var xmlResult = mi.inform();
	mi.close();

	var result = Xml2json.toJson( xmlResult, {
		object: true
	} );
	return result;
}

module.exports = {
	init,
	getMediaInfo
};
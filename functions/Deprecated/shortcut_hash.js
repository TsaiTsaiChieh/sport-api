/* eslint-disable no-unused-vars */
//const longsingShortcutFunction = require( './myfunc' );
const longsingShortcutFunction = require('./shortcut_function');
//const envValues = require( '././env_values' );
const Buffer = require('buffer');
//"@enonic/fnv-plus": "^1.3.0",

const farmhash = require('farmhash'); //https://www.npmjs.com/package/farmhash
//const fnvp = require('fnv-plus'); //https://www.npmjs.com/package/@enonic/fnv-plus
const siphash = require('siphash');

const crypto = require('crypto');

exports.farmHashToInt = function(stringOrBuffer) {
  //, seedInt
  //if (Number.isInteger(seedInt)) {
  //	farmhash.hash32WithSeed(str.toString(), seedInt);
  //}

  return farmhash.fingerprint32(stringOrBuffer);
};

exports.BufferToSipHashHex =
  /**
   * @param {{ toString: (arg0: string) => { replace: (arg0: RegExp, arg1: string) => void; }; }} buffer
   */
  function(buffer, intKey1 = 0, intKey2 = 0, intKey3 = 0, intKey4 = 0) {
    //replace( / /g, "+" ); //避免存入資料庫的問題;
    return this.sipHashToHex(buffer.toString('base64').replace(/ /g, '+'));

    /*
			buffer.toString();
			if ( longsingShortcutFunction.haveValue( key ) ) {
				return siphash.hash_hex( siphash.string16_to_key( key.toString() ), str.toString() );
			}

			return siphash.hash_uint( siphash.string16_to_key( new Date().getTime().toString() ), str.toString() );
			*/
  };

exports.sipHashToInt =
  /**
   * @param {{ toString: () => void; }} key
   */
  function(str = '', key) {
    if (longsingShortcutFunction.haveValue(key)) {
      return siphash.hash_uint(
        siphash.string16_to_key(key.toString()),
        str.toString()
      );
    }

    return siphash.hash_uint(
      siphash.string16_to_key(new Date().getTime().toString()),
      str.toString()
    );
  };

exports.sipHashToHex = function(
  str = '',
  intKey1 = 0,
  intKey2 = 0,
  intKey3 = 0,
  intKey4 = 0
) {
  if (longsingShortcutFunction.haveValue(intKey1)) {
    return siphash.hash_hex(
      [intKey1, intKey2, intKey3, intKey4],
      str.toString()
    );
  }

  return siphash.hash_hex(
    siphash.string16_to_key(new Date().getTime().toString()),
    str.toString()
  );
};

/*
	sha3_384: function(str = '') {
		//crypto.getHashes()
		return crypto
			.createHash('sha3-384')
			.update(str, 'binary')
			.digest('hex'); //'hex'，'latin1'或者 'base64'
	},
	blake2s_256: function(str='') {
		//blake2s256
		//crypto.getHashes()
		return crypto
			.createHash('blake2s256')
			.update(str, 'binary')
			.digest('hex'); //'hex'，'latin1'或者 'base64'
	},
	*/

//,
//'fnv1a': function (str) {
//	return farmhash.hash32(str);
//}

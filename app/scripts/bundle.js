/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	x = __webpack_require__(1);
	uniq = __webpack_require__(2);
	console.log(uniq([1,2,2,3]));
	bm = __webpack_require__(3);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  'use strict';
	  document.addEventListener('DOMContentLoaded', function() {
	    var h1;
	    h1 = document.getElementsByTagName('h1');
	    if (h1.length > 0) {
	      return h1[0].innerText = h1[0].innerText + ' \'Allo';
	    }
	  }, false);

	}).call(this);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict"

	function unique_pred(list, compare) {
	  var ptr = 1
	    , len = list.length
	    , a=list[0], b=list[0]
	  for(var i=1; i<len; ++i) {
	    b = a
	    a = list[i]
	    if(compare(a, b)) {
	      if(i === ptr) {
	        ptr++
	        continue
	      }
	      list[ptr++] = a
	    }
	  }
	  list.length = ptr
	  return list
	}

	function unique_eq(list) {
	  var ptr = 1
	    , len = list.length
	    , a=list[0], b = list[0]
	  for(var i=1; i<len; ++i, b=a) {
	    b = a
	    a = list[i]
	    if(a !== b) {
	      if(i === ptr) {
	        ptr++
	        continue
	      }
	      list[ptr++] = a
	    }
	  }
	  list.length = ptr
	  return list
	}

	function unique(list, compare, sorted) {
	  if(list.length === 0) {
	    return list
	  }
	  if(compare) {
	    if(!sorted) {
	      list.sort(compare)
	    }
	    return unique_pred(list, compare)
	  }
	  if(!sorted) {
	    list.sort()
	  }
	  return unique_eq(list)
	}

	module.exports = unique


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var messages = __webpack_require__(4).messages;
	var TcpTransport = __webpack_require__(73).TcpTransport;

	var tcp = new TcpTransport({
	  //seeds: [["118.169.41.196", 8444]],
	  //seeds: [["75.167.159.54", 8444]],
	  seeds: [["127.0.0.1", 8444]],
	});

	tcp.bootstrap().then(function(nodes) {
	  var remoteHost = nodes[0][0];
	  var remotePort = nodes[0][1];
	  console.log("Connecting to", nodes[0]);
	  tcp.connect(remotePort, remoteHost);
	});

	tcp.on("established", function(version) {
	  console.log("Connection established to", version.userAgent);

	  tcp.on("message", function(command, payload) {
	    console.log("Got new", command, "message");
	    var decoded;
	    if (command === "addr") {
	      decoded = messages.addr.decodePayload(payload);
	      console.log("Got", decoded.addrs.length, "node addresses");
	    }
	  });
	});

	module.exports = {
	    messages: messages,
	    tcp: TcpTransport
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Bitmessage library entry point. Just reexports common submodules.
	 * @module bitmessage
	 */

	"use strict";

	/**
	 * Current protocol version.
	 * @constant {number}
	 */
	exports.PROTOCOL_VERSION = __webpack_require__(12).PROTOCOL_VERSION;

	/** [Common structures.]{@link module:bitmessage/structs} */
	exports.structs = __webpack_require__(65);
	/** [Messages.]{@link module:bitmessage/messages} */
	exports.messages = __webpack_require__(68);
	/** [Objects.]{@link module:bitmessage/objects} */
	exports.objects = __webpack_require__(71);

	/** [Working with WIF.]{@link module:bitmessage/wif} */
	exports.WIF = __webpack_require__(5);
	/** [Proof of work.]{@link module:bitmessage/pow} */
	exports.POW = __webpack_require__(67);

	/** [Working with addresses.]{@link module:bitmessage/address} */
	exports.Address = __webpack_require__(72);
	/** [User agent.]{@link module:bitmessage/user-agent} */
	exports.UserAgent = __webpack_require__(69);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Implements WIF encoding/decoding.
	 * @see {@link https://en.bitcoin.it/wiki/Wallet_import_format}
	 * @module bitmessage/wif
	 */

	"use strict";

	var bufferEqual = __webpack_require__(10);
	var bs58 = __webpack_require__(11);
	var assert = __webpack_require__(12).assert;
	var bmcrypto = __webpack_require__(13);

	// Compute the WIF checksum for the given data.
	function getwifchecksum(data) {
	  return bmcrypto.sha256(bmcrypto.sha256(data)).slice(0, 4);
	}

	/**
	 * Decode WIF-encoded private key (corresponded to a uncompressed public
	 * key).
	 * @param {string} wif - Encoded key
	 * @return {Buffer} Private key.
	 */
	exports.decode = function(wif) {
	  var bytes = bs58.decode(wif);
	  assert(bytes[0] === 0x80, "Bad WIF");
	  var data = new Buffer(bytes.slice(0, -4));
	  var checksum = new Buffer(bytes.slice(-4));
	  assert(bufferEqual(checksum, getwifchecksum(data)), "Bad checkum");
	  return data.slice(1);
	};

	/**
	 * Convert private key to a WIF (corresponded to a uncompressed public
	 * key).
	 * @param {Buffer} privateKey - A private key to encode
	 * @return {string} WIF-encoded private key.
	 */
	exports.encode = function(privateKey) {
	  var data = Buffer.concat([new Buffer([0x80]), privateKey]);
	  var checksum = getwifchecksum(data);
	  var bytes = Buffer.concat([data, checksum]);
	  return bs58.encode(bytes);
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */

	var base64 = __webpack_require__(7)
	var ieee754 = __webpack_require__(8)
	var isArray = __webpack_require__(9)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var kMaxLength = 0x3fffffff
	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Note:
	 *
	 * - Implementation must support adding new properties to `Uint8Array` instances.
	 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
	 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *    incorrect length in some situations.
	 *
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
	 * get the Object implementation, which is slower but will work correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = (function () {
	  try {
	    var buf = new ArrayBuffer(0)
	    var arr = new Uint8Array(buf)
	    arr.foo = function () { return 42 }
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	})()

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  this.length = 0
	  this.parent = undefined

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && object.buffer instanceof ArrayBuffer) {
	    return fromTypedArray(that, object)
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength.toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  } else if (list.length === 1) {
	    return list[0]
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = String(string)

	  if (string.length === 0) return 0

	  switch (encoding || 'utf8') {
	    case 'ascii':
	    case 'binary':
	    case 'raw':
	      return string.length
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return string.length * 2
	    case 'hex':
	      return string.length >>> 1
	    case 'utf8':
	    case 'utf-8':
	      return utf8ToBytes(string).length
	    case 'base64':
	      return base64ToBytes(string).length
	    default:
	      return string.length
	  }
	}
	Buffer.byteLength = byteLength

	// pre-set for values that may exist in the future
	Buffer.prototype.length = undefined
	Buffer.prototype.parent = undefined

	// toString(encoding, start=0, end=buffer.length)
	Buffer.prototype.toString = function toString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` will be removed in Node 0.13+
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` will be removed in Node 0.13+
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  var res = ''
	  var tmp = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    if (buf[i] <= 0x7F) {
	      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
	      tmp = ''
	    } else {
	      tmp += '%' + buf[i].toString(16)
	    }
	  }

	  return res + decodeUtf8Char(tmp)
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = value
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = value
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = value
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start

	  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated, will be removed in node 0.13+
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	  var i = 0

	  for (; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (leadSurrogate) {
	        // 2 leads in a row
	        if (codePoint < 0xDC00) {
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          leadSurrogate = codePoint
	          continue
	        } else {
	          // valid surrogate pair
	          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
	          leadSurrogate = null
	        }
	      } else {
	        // no lead yet

	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else {
	          // valid lead
	          leadSurrogate = codePoint
	          continue
	        }
	      }
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	      leadSurrogate = null
	    }

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x200000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	function decodeUtf8Char (str) {
	  try {
	    return decodeURIComponent(str)
	  } catch (err) {
	    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}(false ? (this.base64js = {}) : exports))


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      nBits = -7,
	      i = isLE ? (nBytes - 1) : 0,
	      d = isLE ? -1 : 1,
	      s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
	      i = isLE ? 0 : (nBytes - 1),
	      d = isLE ? 1 : -1,
	      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * isArray
	 */

	var isArray = Array.isArray;

	/**
	 * toString
	 */

	var str = Object.prototype.toString;

	/**
	 * Whether or not the given `val`
	 * is an array.
	 *
	 * example:
	 *
	 *        isArray([]);
	 *        // > true
	 *        isArray(arguments);
	 *        // > false
	 *        isArray('');
	 *        // > false
	 *
	 * @param {mixed} val
	 * @return {bool}
	 */

	module.exports = isArray || function (val) {
	  return !! val && '[object Array]' == str.call(val);
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var Buffer = __webpack_require__(6).Buffer; // for use with browserify

	module.exports = function (a, b) {
	    if (!Buffer.isBuffer(a)) return undefined;
	    if (!Buffer.isBuffer(b)) return undefined;
	    if (typeof a.equals === 'function') return a.equals(b);
	    if (a.length !== b.length) return false;
	    
	    for (var i = 0; i < a.length; i++) {
	        if (a[i] !== b[i]) return false;
	    }
	    
	    return true;
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// Base58 encoding/decoding
	// Originally written by Mike Hearn for BitcoinJ
	// Copyright (c) 2011 Google Inc
	// Ported to JavaScript by Stefan Thomas
	// Merged Buffer refactorings from base58-native by Stephen Pair
	// Copyright (c) 2013 BitPay Inc

	var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
	var ALPHABET_MAP = {}
	for(var i = 0; i < ALPHABET.length; i++) {
	  ALPHABET_MAP[ALPHABET.charAt(i)] = i
	}
	var BASE = 58

	function encode(buffer) {
	  if (buffer.length === 0) return ''

	  var i, j, digits = [0]
	  for (i = 0; i < buffer.length; i++) {
	    for (j = 0; j < digits.length; j++) digits[j] <<= 8

	    digits[0] += buffer[i]

	    var carry = 0
	    for (j = 0; j < digits.length; ++j) {
	      digits[j] += carry

	      carry = (digits[j] / BASE) | 0
	      digits[j] %= BASE
	    }

	    while (carry) {
	      digits.push(carry % BASE)

	      carry = (carry / BASE) | 0
	    }
	  }

	  // deal with leading zeros
	  for (i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0)

	  // convert digits to a string
	  var stringOutput = ""
	  for (var i = digits.length - 1; i >= 0; i--) {
	    stringOutput = stringOutput + ALPHABET[digits[i]]
	  }
	  return stringOutput
	}

	function decode(string) {
	  if (string.length === 0) return []

	  var i, j, bytes = [0]
	  for (i = 0; i < string.length; i++) {
	    var c = string[i]
	    if (!(c in ALPHABET_MAP)) throw new Error('Non-base58 character')

	    for (j = 0; j < bytes.length; j++) bytes[j] *= BASE
	    bytes[0] += ALPHABET_MAP[c]

	    var carry = 0
	    for (j = 0; j < bytes.length; ++j) {
	      bytes[j] += carry

	      carry = bytes[j] >> 8
	      bytes[j] &= 0xff
	    }

	    while (carry) {
	      bytes.push(carry & 0xff)

	      carry >>= 8
	    }
	  }

	  // deal with leading zeros
	  for (i = 0; string[i] === '1' && i < string.length - 1; i++) bytes.push(0)

	  return bytes.reverse()
	}

	module.exports = {
	  encode: encode,
	  decode: decode
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// NOTE(Kagami): End-users shouldn't import this module. While it
	// exports some helper routines, its API is _not_ stable.

	"use strict";

	var assert = exports.assert = function(condition, message) {
	  if (!condition) {
	    throw new Error(message || "Assertion failed");
	  }
	};

	exports.PROTOCOL_VERSION = 3;

	// Missing methods to read/write 64 bits integers from/to buffers.
	// TODO(Kagami): Use this helpers in structs, pow, platform.

	var MAX_SAFE_INTEGER = exports.MAX_SAFE_INTEGER = 9007199254740991;

	exports.readUInt64BE = function(buf, offset, noAssert) {
	  offset = offset || 0;
	  var hi = buf.readUInt32BE(offset, noAssert);
	  var lo = buf.readUInt32BE(offset + 4, noAssert);
	  // Max safe number = 2^53 - 1 =
	  // 0b0000000000011111111111111111111111111111111111111111111111111111
	  // = 2097151*(2^32) + (2^32 - 1).
	  // So it's safe until hi <= 2097151. See
	  // <http://mdn.io/issafeinteger>, <https://stackoverflow.com/q/307179>
	  // for details.
	  assert(noAssert || hi <= 2097151, "Unsafe integer");
	  return hi * 4294967296 + lo;
	};

	var readTimestamp64BE = exports.readTimestamp64BE = function(buf, offset) {
	  offset = offset || 0;
	  var timeHi = buf.readUInt32BE(offset);
	  var timeLo = buf.readUInt32BE(offset + 4);
	  // JavaScript's Date object can't work with timestamps higher than
	  // 8640000000000 (~2^43, ~275760 year). Hope JavaScript will support
	  // 64-bit numbers up to this date.
	  assert(timeHi <= 2011, "Time is too high");
	  assert(timeHi !== 2011 || timeLo <= 2820767744, "Time is too high");
	  return timeHi * 4294967296 + timeLo;
	};

	exports.readTime64BE = function(buf, offset) {
	  var timestamp = readTimestamp64BE(buf, offset);
	  return new Date(timestamp * 1000);
	};

	function writeUInt64BE(buf, value, offset, noAssert) {
	  buf = buf || new Buffer(8);
	  offset = offset || 0;
	  assert(noAssert || value <= MAX_SAFE_INTEGER, "Unsafe integer");
	  buf.writeUInt32BE(Math.floor(value / 4294967296), offset, noAssert);
	  buf.writeUInt32BE(value % 4294967296, offset + 4, noAssert);
	  return buf;
	}
	exports.writeUInt64BE = writeUInt64BE;

	exports.writeTime64BE = function(buf, time, offset, noAssert) {
	  var timestamp = Math.floor(time.getTime() / 1000);
	  return writeUInt64BE(buf, timestamp, offset, noAssert);
	};

	exports.tnow = function() {
	  var time = new Date();
	  return Math.floor(time.getTime() / 1000);
	};

	var DEFAULT_TRIALS_PER_BYTE = exports.DEFAULT_TRIALS_PER_BYTE = 1000;
	var DEFAULT_EXTRA_BYTES = exports.DEFAULT_EXTRA_BYTES = 1000;

	exports.getTrials = function(opts) {
	  var nonceTrialsPerByte = opts.nonceTrialsPerByte;
	  // Automatically raise lower values per spec.
	  if (!nonceTrialsPerByte || nonceTrialsPerByte < DEFAULT_TRIALS_PER_BYTE) {
	    nonceTrialsPerByte = DEFAULT_TRIALS_PER_BYTE;
	  }
	  return nonceTrialsPerByte;
	};

	exports.getExtraBytes = function(opts) {
	  var payloadLengthExtraBytes = opts.payloadLengthExtraBytes;
	  // Automatically raise lower values per spec.
	  if (!payloadLengthExtraBytes ||
	      payloadLengthExtraBytes < DEFAULT_EXTRA_BYTES) {
	    payloadLengthExtraBytes = DEFAULT_EXTRA_BYTES;
	  }
	  return payloadLengthExtraBytes;
	};

	exports.popkey = function(obj, key) {
	  var value = obj[key];
	  delete obj[key];
	  return value;
	};

	// See https://en.wikipedia.org/wiki/IPv6#IPv4-mapped_IPv6_addresses
	var IPv4_MAPPING = new Buffer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255]);
	exports.IPv4_MAPPING = IPv4_MAPPING;

	// Very simple inet_pton(3) equivalent.
	exports.inet_pton = function(str) {
	  var buf = new Buffer(16);
	  buf.fill(0);
	  // IPv4-mapped IPv6.
	  if (str.slice(0, 7) === "::ffff:") {
	    str = str.slice(7);
	  }
	  // IPv4.
	  if (str.indexOf(":") === -1) {
	    IPv4_MAPPING.copy(buf);
	    var octets = str.split(/\./g).map(function(o) {
	      assert(/^\d+$/.test(o), "Bad octet");
	      return parseInt(o, 10);
	    });
	    // Support short form from inet_aton(3) man page.
	    if (octets.length === 1) {
	      buf.writeUInt32BE(octets[0], 12);
	    } else {
	      // Check against 1000.bad.addr
	      octets.forEach(function(octet) {
	        assert(octet >= 0, "Bad IPv4 address");
	        assert(octet <= 255, "Bad IPv4 address");
	      });
	      if (octets.length === 2) {
	        buf[12] = octets[0];
	        buf[15] = octets[1];
	      } else if (octets.length === 3) {
	        buf[12] = octets[0];
	        buf[13] = octets[1];
	        buf[15] = octets[2];
	      } else if (octets.length === 4) {
	        buf[12] = octets[0];
	        buf[13] = octets[1];
	        buf[14] = octets[2];
	        buf[15] = octets[3];
	      } else {
	        throw new Error("Bad IPv4 address");
	      }
	    }
	  // IPv6.
	  } else {
	    var dgroups = str.split(/::/g);
	    // Check against 1::1::1
	    assert(dgroups.length <= 2, "Bad IPv6 address");
	    var groups = [];
	    var i;
	    if (dgroups[0]) {
	      groups.push.apply(groups, dgroups[0].split(/:/g));
	    }
	    if (dgroups.length === 2) {
	      if (dgroups[1]) {
	        var splitted = dgroups[1].split(/:/g);
	        var fill = 8 - (groups.length + splitted.length);
	        // Check against 1:1:1:1::1:1:1:1
	        assert(fill > 0, "Bad IPv6 address");
	        for (i = 0; i < fill; i++) {
	          groups.push(0);
	        }
	        groups.push.apply(groups, splitted);
	      } else {
	        // Check against 1:1:1:1:1:1:1:1::
	        assert(groups.length <= 7, "Bad IPv6 address");
	      }
	    } else {
	      // Check against 1:1:1
	      assert(groups.length === 8, "Bad IPv6 address");
	    }
	    for (i = 0; i < Math.min(groups.length, 8); i++) {
	      // Check against parseInt("127.0.0.1", 16) -> 295
	      assert(/^[0-9a-f]+$/.test(groups[i]), "Bad group");
	      buf.writeUInt16BE(parseInt(groups[i], 16), i * 2);
	    }
	  }
	  return buf;
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Isomorphic Bitmessage crypto module. Reexports platform-dependent
	 * implementations and also some common routines.
	 * @module bitmessage/crypto
	 */

	"use strict";

	var eccrypto = __webpack_require__(14);
	var assert = __webpack_require__(12).assert;
	var platform = __webpack_require__(59);

	var PPromise = platform.Promise;

	/**
	 * Calculate SHA-1 hash.
	 * @param {Buffer} buf - Input data
	 * @return {Buffer} Resulting hash.
	 * @function
	 * @static
	 */
	var sha1 = exports.sha1 = platform.sha1;

	/**
	 * Calculate SHA-256 hash.
	 * @param {Buffer} buf - Input data
	 * @return {Buffer} Resulting hash.
	 * @function
	 */
	exports.sha256 = platform.sha256;

	/**
	 * Calculate SHA-512 hash.
	 * @param {Buffer} buf - Input data
	 * @return {Buffer} Resulting hash.
	 * @function
	 */
	exports.sha512 = platform.sha512;

	/**
	 * Calculate RIPEMD-160 hash.
	 * @param {Buffer} buf - Input data
	 * @return {Buffer} Resulting hash.
	 * @function
	 */
	exports.ripemd160 = platform.ripemd160;

	/**
	 * Generate cryptographically strong pseudo-random data.
	 * @param {number} size - Number of bytes
	 * @return {Buffer} Buffer with random data.
	 * @function
	 */
	exports.randomBytes = platform.randomBytes;

	/**
	 * Generate a new random private key.
	 * @return {Buffer} New private key.
	 */
	exports.getPrivate = function() {
	  return platform.randomBytes(32);
	};

	/**
	 * Generate public key for the given private key.
	 * @param {Buffer} privateKey - A 32-byte private key
	 * @return {Buffer} A 65-byte (uncompressed) public key.
	 * @function
	 */
	exports.getPublic = eccrypto.getPublic;

	/**
	 * Sign message using ecdsa-with-sha1 scheme.
	 * @param {Buffer} privateKey - A 32-byte private key
	 * @param {Buffer} msg - The message being signed
	 * @return {Promise.<Buffer>} A promise that contains signature in DER
	 * format when fulfilled.
	 */
	exports.sign = function(privateKey, msg) {
	  var hash = sha1(msg);
	  return eccrypto.sign(privateKey, hash);
	};

	/**
	 * Verify signature using ecdsa-with-sha1 scheme.
	 * @param {Buffer} publicKey - A 65-byte public key
	 * @param {Buffer} msg - The message being verified
	 * @param {Buffer} sig - The signature in DER format
	 * @return {Promise.<null>} A promise that resolves on correct signature
	 * and rejects on bad key or signature.
	 */
	exports.verify = function(publicKey, msg, sig) {
	  var hash = sha1(msg);
	  return eccrypto.verify(publicKey, hash, sig);
	};

	var SECP256K1_TYPE = 714;

	// We define this structure here to avoid circular imports. However we
	// rexport and document it in `structs` module for consistency.
	var encrypted = exports.encrypted = {
	  decode: function(buf) {
	    assert(buf.length >= 118, "Buffer is too small");
	    assert(buf.readUInt16BE(16, true) === SECP256K1_TYPE, "Bad curve type");
	    assert(buf.readUInt16BE(18, true) === 32, "Bad Rx length");
	    assert(buf.readUInt16BE(52, true) === 32, "Bad Ry length");
	    var iv = new Buffer(16);
	    buf.copy(iv, 0, 0, 16);
	    var ephemPublicKey = new Buffer(65);
	    ephemPublicKey[0] = 0x04;
	    buf.copy(ephemPublicKey, 1, 20, 52);
	    buf.copy(ephemPublicKey, 33, 54, 86);
	    // NOTE(Kagami): We do copy instead of slice to protect against
	    // possible source buffer modification by user.
	    var ciphertext = new Buffer(buf.length - 118);
	    buf.copy(ciphertext, 0, 86, buf.length - 32);
	    var mac = new Buffer(32);
	    buf.copy(mac, 0, buf.length - 32);
	    return {
	      iv: iv,
	      ephemPublicKey: ephemPublicKey,
	      ciphertext: ciphertext,
	      mac: mac,
	    };
	  },

	  encode: function(opts) {
	    assert(opts.iv.length === 16, "Bad IV");
	    assert(opts.ephemPublicKey.length === 65, "Bad public key");
	    assert(opts.mac.length === 32, "Bad MAC");
	    // 16 + 2 + 2 + 32 + 2 + 32 + ? + 32
	    var buf = new Buffer(118 + opts.ciphertext.length);
	    opts.iv.copy(buf);
	    buf.writeUInt16BE(SECP256K1_TYPE, 16, true);  // Curve type
	    buf.writeUInt16BE(32, 18, true);  // Rx length
	    opts.ephemPublicKey.copy(buf, 20, 1, 33);  // Rx
	    buf.writeUInt16BE(32, 52, true);  // Ry length
	    opts.ephemPublicKey.copy(buf, 54, 33);  // Ry
	    opts.ciphertext.copy(buf, 86);
	    opts.mac.copy(buf, 86 + opts.ciphertext.length);
	    return buf;
	  },
	};

	/**
	 * Encrypt message for given recepient's public key.
	 * @param {Buffer} publicKeyTo - Recipient's public key (65 bytes)
	 * @param {Buffer} msg - The message being encrypted
	 * @param {Object=} opts - You may also specify initialization vector
	 * and ephemeral private key to get deterministic results
	 * @param {Buffer} opts.iv - Initialization vector (16 bytes)
	 * @param {Buffer} opts.ephemPrivateKey - Ephemeral private key (32
	 * bytes)
	 * @return {Promise.<Buffer>} A promise that resolves with the buffer in
	 * `encrypted` format successful encryption and rejects on failure.
	 */
	exports.encrypt = function(publicKeyTo, msg, opts) {
	  return eccrypto.encrypt(publicKeyTo, msg, opts).then(function(encObj) {
	    return encrypted.encode(encObj);
	  });
	};

	/**
	 * Decrypt message using given private key.
	 * @param {Buffer} privateKey - A 32-byte private key of recepient of
	 * the mesage
	 * @param {Buffer} buf - Encrypted data
	 * @return {Promise.<Buffer>} A promise that resolves with the plaintext
	 * on successful decryption and rejects on failure.
	 */
	exports.decrypt = function(privateKey, buf) {
	  return new PPromise(function(resolve) {
	    var encObj = encrypted.decode(buf);
	    resolve(eccrypto.decrypt(privateKey, encObj));
	  });
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer) {/**
	 * Browser eccrypto implementation.
	 */

	"use strict";

	var EC = __webpack_require__(15).ec;

	var ec = new EC("secp256k1");
	var cryptoObj = global.crypto || global.msCrypto || {};
	var subtle = cryptoObj.subtle || cryptoObj.webkitSubtle;

	function assert(condition, message) {
	  if (!condition) {
	    throw new Error(message || "Assertion failed");
	  }
	}

	function randomBytes(size) {
	  var arr = new Uint8Array(size);
	  global.crypto.getRandomValues(arr);
	  return new Buffer(arr);
	}

	function sha512(msg) {
	  return subtle.digest({name: "SHA-512"}, msg).then(function(hash) {
	    return new Buffer(new Uint8Array(hash));
	  });
	}

	function getAes(op) {
	  return function(iv, key, data) {
	    var importAlgorithm = {name: "AES-CBC"};
	    var keyp = subtle.importKey("raw", key, importAlgorithm, false, [op]);
	    return keyp.then(function(cryptoKey) {
	      var encAlgorithm = {name: "AES-CBC", iv: iv};
	      return subtle[op](encAlgorithm, cryptoKey, data);
	    }).then(function(result) {
	      return new Buffer(new Uint8Array(result));
	    });
	  };
	}

	var aesCbcEncrypt = getAes("encrypt");
	var aesCbcDecrypt = getAes("decrypt");

	function hmacSha256Sign(key, msg) {
	  var algorithm = {name: "HMAC", hash: {name: "SHA-256"}};
	  var keyp = subtle.importKey("raw", key, algorithm, false, ["sign"]);
	  return keyp.then(function(cryptoKey) {
	    return subtle.sign(algorithm, cryptoKey, msg);
	  }).then(function(sig) {
	    return new Buffer(new Uint8Array(sig));
	  });
	}

	function hmacSha256Verify(key, msg, sig) {
	  var algorithm = {name: "HMAC", hash: {name: "SHA-256"}};
	  var keyp = subtle.importKey("raw", key, algorithm, false, ["verify"]);
	  return keyp.then(function(cryptoKey) {
	    return subtle.verify(algorithm, cryptoKey, sig, msg);
	  });
	}

	var getPublic = exports.getPublic = function(privateKey) {
	  // This function has sync API so we throw an error immediately.
	  assert(privateKey.length === 32, "Bad private key");
	  // XXX(Kagami): `elliptic.utils.encode` returns array for every
	  // encoding except `hex`.
	  return new Buffer(ec.keyFromPrivate(privateKey).getPublic("arr"));
	};

	// NOTE(Kagami): We don't use promise shim in Browser implementation
	// because it's supported natively in new browsers (see
	// <http://caniuse.com/#feat=promises>) and we can use only new browsers
	// because of the WebCryptoAPI (see
	// <http://caniuse.com/#feat=cryptography>).
	exports.sign = function(privateKey, msg) {
	  return new Promise(function(resolve) {
	    assert(privateKey.length === 32, "Bad private key");
	    assert(msg.length > 0, "Message should not be empty");
	    assert(msg.length <= 32, "Message is too long");
	    resolve(new Buffer(ec.sign(msg, privateKey, {canonical: true}).toDER()));
	  });
	};

	exports.verify = function(publicKey, msg, sig) {
	  return new Promise(function(resolve, reject) {
	    assert(publicKey.length === 65, "Bad public key");
	    assert(publicKey[0] === 4, "Bad public key");
	    assert(msg.length > 0, "Message should not be empty");
	    assert(msg.length <= 32, "Message is too long");
	    if (ec.verify(msg, sig, publicKey)) {
	      resolve(null);
	    } else {
	      reject(new Error("Bad signature"));
	    }
	  });
	};

	var derive = exports.derive = function(privateKeyA, publicKeyB) {
	  return new Promise(function(resolve) {
	    assert(privateKeyA.length === 32, "Bad private key");
	    assert(publicKeyB.length === 65, "Bad public key");
	    assert(publicKeyB[0] === 4, "Bad public key");
	    var keyA = ec.keyFromPrivate(privateKeyA);
	    var keyB = ec.keyFromPublic(publicKeyB);
	    var Px = keyA.derive(keyB.getPublic());  // BN instance
	    resolve(new Buffer(Px.toArray()));
	  });
	};

	exports.encrypt = function(publicKeyTo, msg, opts) {
	  assert(subtle, "WebCryptoAPI is not available");
	  opts = opts || {};
	  // Tmp variables to save context from flat promises;
	  var iv, ephemPublicKey, ciphertext, macKey;
	  return new Promise(function(resolve) {
	    var ephemPrivateKey = opts.ephemPrivateKey || randomBytes(32);
	    ephemPublicKey = getPublic(ephemPrivateKey);
	    resolve(derive(ephemPrivateKey, publicKeyTo));
	  }).then(function(Px) {
	    return sha512(Px);
	  }).then(function(hash) {
	    iv = opts.iv || randomBytes(16);
	    var encryptionKey = hash.slice(0, 32);
	    macKey = hash.slice(32);
	    return aesCbcEncrypt(iv, encryptionKey, msg);
	  }).then(function(data) {
	    ciphertext = data;
	    var dataToMac = Buffer.concat([iv, ephemPublicKey, ciphertext]);
	    return hmacSha256Sign(macKey, dataToMac);
	  }).then(function(mac) {
	    return {
	      iv: iv,
	      ephemPublicKey: ephemPublicKey,
	      ciphertext: ciphertext,
	      mac: mac,
	    };
	  });
	};

	exports.decrypt = function(privateKey, opts) {
	  assert(subtle, "WebCryptoAPI is not available");
	  // Tmp variable to save context from flat promises;
	  var encryptionKey;
	  return derive(privateKey, opts.ephemPublicKey).then(function(Px) {
	    return sha512(Px);
	  }).then(function(hash) {
	    encryptionKey = hash.slice(0, 32);
	    var macKey = hash.slice(32);
	    var dataToMac = Buffer.concat([
	      opts.iv,
	      opts.ephemPublicKey,
	      opts.ciphertext
	    ]);
	    return hmacSha256Verify(macKey, dataToMac, opts.mac);
	  }).then(function(macGood) {
	    assert(macGood, "Bad MAC");
	    return aesCbcDecrypt(opts.iv, encryptionKey, opts.ciphertext);
	  }).then(function(msg) {
	    return new Buffer(new Uint8Array(msg));
	  });
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(6).Buffer))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var elliptic = exports;

	elliptic.version = __webpack_require__(16).version;
	elliptic.utils = __webpack_require__(17);
	elliptic.rand = __webpack_require__(18);
	elliptic.hmacDRBG = __webpack_require__(38);
	elliptic.curve = __webpack_require__(46);
	elliptic.curves = __webpack_require__(54);

	// Protocols
	elliptic.ec = __webpack_require__(56);


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		"name": "elliptic",
		"version": "3.0.3",
		"description": "EC cryptography",
		"main": "lib/elliptic.js",
		"scripts": {
			"test": "make lint && mocha --reporter=spec test/*-test.js"
		},
		"repository": {
			"type": "git",
			"url": "git+ssh://git@github.com/indutny/elliptic.git"
		},
		"keywords": [
			"EC",
			"Elliptic",
			"curve",
			"Cryptography"
		],
		"author": {
			"name": "Fedor Indutny",
			"email": "fedor@indutny.com"
		},
		"license": "MIT",
		"bugs": {
			"url": "https://github.com/indutny/elliptic/issues"
		},
		"homepage": "https://github.com/indutny/elliptic",
		"devDependencies": {
			"browserify": "^3.44.2",
			"jscs": "^1.11.3",
			"jshint": "^2.6.0",
			"mocha": "^2.1.0",
			"uglify-js": "^2.4.13"
		},
		"dependencies": {
			"bn.js": "^2.0.0",
			"brorand": "^1.0.1",
			"hash.js": "^1.0.0",
			"inherits": "^2.0.1"
		},
		"gitHead": "c8d7cf551fdf2ce3ecc5264b29084244ae6aa2b2",
		"_id": "elliptic@3.0.3",
		"_shasum": "865c9b420bfbe55006b9f969f97a0d2c44966595",
		"_from": "elliptic@>=3.0.1 <4.0.0",
		"_npmVersion": "2.5.1",
		"_nodeVersion": "1.3.0",
		"_npmUser": {
			"name": "indutny",
			"email": "fedor@indutny.com"
		},
		"maintainers": [
			{
				"name": "indutny",
				"email": "fedor@indutny.com"
			}
		],
		"dist": {
			"shasum": "865c9b420bfbe55006b9f969f97a0d2c44966595",
			"tarball": "http://registry.npmjs.org/elliptic/-/elliptic-3.0.3.tgz"
		},
		"directories": {},
		"_resolved": "https://registry.npmjs.org/elliptic/-/elliptic-3.0.3.tgz",
		"readme": "ERROR: No README data found!"
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = exports;

	utils.assert = function assert(val, msg) {
	  if (!val)
	    throw new Error(msg || 'Assertion failed');
	};

	function toArray(msg, enc) {
	  if (Array.isArray(msg))
	    return msg.slice();
	  if (!msg)
	    return [];
	  var res = [];
	  if (typeof msg !== 'string') {
	    for (var i = 0; i < msg.length; i++)
	      res[i] = msg[i] | 0;
	    return res;
	  }
	  if (!enc) {
	    for (var i = 0; i < msg.length; i++) {
	      var c = msg.charCodeAt(i);
	      var hi = c >> 8;
	      var lo = c & 0xff;
	      if (hi)
	        res.push(hi, lo);
	      else
	        res.push(lo);
	    }
	  } else if (enc === 'hex') {
	    msg = msg.replace(/[^a-z0-9]+/ig, '');
	    if (msg.length % 2 !== 0)
	      msg = '0' + msg;
	    for (var i = 0; i < msg.length; i += 2)
	      res.push(parseInt(msg[i] + msg[i + 1], 16));
	  }
	  return res;
	}
	utils.toArray = toArray;

	function zero2(word) {
	  if (word.length === 1)
	    return '0' + word;
	  else
	    return word;
	}
	utils.zero2 = zero2;

	function toHex(msg) {
	  var res = '';
	  for (var i = 0; i < msg.length; i++)
	    res += zero2(msg[i].toString(16));
	  return res;
	}
	utils.toHex = toHex;

	utils.encode = function encode(arr, enc) {
	  if (enc === 'hex')
	    return toHex(arr);
	  else
	    return arr;
	};

	// Represent num in a w-NAF form
	function getNAF(num, w) {
	  var naf = [];
	  var ws = 1 << (w + 1);
	  var k = num.clone();
	  while (k.cmpn(1) >= 0) {
	    var z;
	    if (k.isOdd()) {
	      var mod = k.andln(ws - 1);
	      if (mod > (ws >> 1) - 1)
	        z = (ws >> 1) - mod;
	      else
	        z = mod;
	      k.isubn(z);
	    } else {
	      z = 0;
	    }
	    naf.push(z);

	    // Optimization, shift by word if possible
	    var shift = (k.cmpn(0) !== 0 && k.andln(ws - 1) === 0) ? (w + 1) : 1;
	    for (var i = 1; i < shift; i++)
	      naf.push(0);
	    k.ishrn(shift);
	  }

	  return naf;
	}
	utils.getNAF = getNAF;

	// Represent k1, k2 in a Joint Sparse Form
	function getJSF(k1, k2) {
	  var jsf = [
	    [],
	    []
	  ];

	  k1 = k1.clone();
	  k2 = k2.clone();
	  var d1 = 0;
	  var d2 = 0;
	  while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {

	    // First phase
	    var m14 = (k1.andln(3) + d1) & 3;
	    var m24 = (k2.andln(3) + d2) & 3;
	    if (m14 === 3)
	      m14 = -1;
	    if (m24 === 3)
	      m24 = -1;
	    var u1;
	    if ((m14 & 1) === 0) {
	      u1 = 0;
	    } else {
	      var m8 = (k1.andln(7) + d1) & 7;
	      if ((m8 === 3 || m8 === 5) && m24 === 2)
	        u1 = -m14;
	      else
	        u1 = m14;
	    }
	    jsf[0].push(u1);

	    var u2;
	    if ((m24 & 1) === 0) {
	      u2 = 0;
	    } else {
	      var m8 = (k2.andln(7) + d2) & 7;
	      if ((m8 === 3 || m8 === 5) && m14 === 2)
	        u2 = -m24;
	      else
	        u2 = m24;
	    }
	    jsf[1].push(u2);

	    // Second phase
	    if (2 * d1 === u1 + 1)
	      d1 = 1 - d1;
	    if (2 * d2 === u2 + 1)
	      d2 = 1 - d2;
	    k1.ishrn(1);
	    k2.ishrn(1);
	  }

	  return jsf;
	}
	utils.getJSF = getJSF;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var r;

	module.exports = function rand(len) {
	  if (!r)
	    r = new Rand(null);

	  return r.generate(len);
	};

	function Rand(rand) {
	  this.rand = rand;
	}
	module.exports.Rand = Rand;

	Rand.prototype.generate = function generate(len) {
	  return this._rand(len);
	};

	if (typeof window === 'object') {
	  if (window.crypto && window.crypto.getRandomValues) {
	    // Modern browsers
	    Rand.prototype._rand = function _rand(n) {
	      var arr = new Uint8Array(n);
	      window.crypto.getRandomValues(arr);
	      return arr;
	    };
	  } else if (window.msCrypto && window.msCrypto.getRandomValues) {
	    // IE
	    Rand.prototype._rand = function _rand(n) {
	      var arr = new Uint8Array(n);
	      window.msCrypto.getRandomValues(arr);
	      return arr;
	    };
	  } else {
	    // Old junk
	    Rand.prototype._rand = function() {
	      throw new Error('Not implemented yet');
	    };
	  }
	} else {
	  // Node.js or Web worker
	  try {
	    var crypto = __webpack_require__(19);

	    Rand.prototype._rand = function _rand(n) {
	      return crypto.randomBytes(n);
	    };
	  } catch (e) {
	    // Emulate crypto API using randy
	    Rand.prototype._rand = function _rand(n) {
	      var res = new Uint8Array(n);
	      for (var i = 0; i < res.length; i++)
	        res[i] = this.rand.getByte();
	      return res;
	    };
	  }
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var rng = __webpack_require__(20)

	function error () {
	  var m = [].slice.call(arguments).join(' ')
	  throw new Error([
	    m,
	    'we accept pull requests',
	    'http://github.com/dominictarr/crypto-browserify'
	    ].join('\n'))
	}

	exports.createHash = __webpack_require__(22)

	exports.createHmac = __webpack_require__(35)

	exports.randomBytes = function(size, callback) {
	  if (callback && callback.call) {
	    try {
	      callback.call(this, undefined, new Buffer(rng(size)))
	    } catch (err) { callback(err) }
	  } else {
	    return new Buffer(rng(size))
	  }
	}

	function each(a, f) {
	  for(var i in a)
	    f(a[i], i)
	}

	exports.getHashes = function () {
	  return ['sha1', 'sha256', 'sha512', 'md5', 'rmd160']
	}

	var p = __webpack_require__(36)(exports)
	exports.pbkdf2 = p.pbkdf2
	exports.pbkdf2Sync = p.pbkdf2Sync


	// the least I can do is make error messages for the rest of the node.js/crypto api.
	each(['createCredentials'
	, 'createCipher'
	, 'createCipheriv'
	, 'createDecipher'
	, 'createDecipheriv'
	, 'createSign'
	, 'createVerify'
	, 'createDiffieHellman'
	], function (name) {
	  exports[name] = function () {
	    error('sorry,', name, 'is not implemented yet')
	  }
	})

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer) {(function() {
	  var g = ('undefined' === typeof window ? global : window) || {}
	  _crypto = (
	    g.crypto || g.msCrypto || __webpack_require__(21)
	  )
	  module.exports = function(size) {
	    // Modern Browsers
	    if(_crypto.getRandomValues) {
	      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
	      /* This will not work in older browsers.
	       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
	       */
	    
	      _crypto.getRandomValues(bytes);
	      return bytes;
	    }
	    else if (_crypto.randomBytes) {
	      return _crypto.randomBytes(size)
	    }
	    else
	      throw new Error(
	        'secure random number generation not supported by this browser\n'+
	        'use chrome, FireFox or Internet Explorer 11'
	      )
	  }
	}())

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(6).Buffer))

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* (ignored) */

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(23)

	var md5 = toConstructor(__webpack_require__(32))
	var rmd160 = toConstructor(__webpack_require__(34))

	function toConstructor (fn) {
	  return function () {
	    var buffers = []
	    var m= {
	      update: function (data, enc) {
	        if(!Buffer.isBuffer(data)) data = new Buffer(data, enc)
	        buffers.push(data)
	        return this
	      },
	      digest: function (enc) {
	        var buf = Buffer.concat(buffers)
	        var r = fn(buf)
	        buffers = null
	        return enc ? r.toString(enc) : r
	      }
	    }
	    return m
	  }
	}

	module.exports = function (alg) {
	  if('md5' === alg) return new md5()
	  if('rmd160' === alg) return new rmd160()
	  return createHash(alg)
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var exports = module.exports = function (alg) {
	  var Alg = exports[alg]
	  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
	  return new Alg()
	}

	var Buffer = __webpack_require__(6).Buffer
	var Hash   = __webpack_require__(24)(Buffer)

	exports.sha1 = __webpack_require__(25)(Buffer, Hash)
	exports.sha256 = __webpack_require__(30)(Buffer, Hash)
	exports.sha512 = __webpack_require__(31)(Buffer, Hash)


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (Buffer) {

	  //prototype class for hash functions
	  function Hash (blockSize, finalSize) {
	    this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
	    this._finalSize = finalSize
	    this._blockSize = blockSize
	    this._len = 0
	    this._s = 0
	  }

	  Hash.prototype.init = function () {
	    this._s = 0
	    this._len = 0
	  }

	  Hash.prototype.update = function (data, enc) {
	    if ("string" === typeof data) {
	      enc = enc || "utf8"
	      data = new Buffer(data, enc)
	    }

	    var l = this._len += data.length
	    var s = this._s = (this._s || 0)
	    var f = 0
	    var buffer = this._block

	    while (s < l) {
	      var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
	      var ch = (t - f)

	      for (var i = 0; i < ch; i++) {
	        buffer[(s % this._blockSize) + i] = data[i + f]
	      }

	      s += ch
	      f += ch

	      if ((s % this._blockSize) === 0) {
	        this._update(buffer)
	      }
	    }
	    this._s = s

	    return this
	  }

	  Hash.prototype.digest = function (enc) {
	    // Suppose the length of the message M, in bits, is l
	    var l = this._len * 8

	    // Append the bit 1 to the end of the message
	    this._block[this._len % this._blockSize] = 0x80

	    // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
	    this._block.fill(0, this._len % this._blockSize + 1)

	    if (l % (this._blockSize * 8) >= this._finalSize * 8) {
	      this._update(this._block)
	      this._block.fill(0)
	    }

	    // to this append the block which is equal to the number l written in binary
	    // TODO: handle case where l is > Math.pow(2, 29)
	    this._block.writeInt32BE(l, this._blockSize - 4)

	    var hash = this._update(this._block) || this._hash()

	    return enc ? hash.toString(enc) : hash
	  }

	  Hash.prototype._update = function () {
	    throw new Error('_update must be implemented by subclass')
	  }

	  return Hash
	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	var inherits = __webpack_require__(26).inherits

	module.exports = function (Buffer, Hash) {

	  var A = 0|0
	  var B = 4|0
	  var C = 8|0
	  var D = 12|0
	  var E = 16|0

	  var W = new (typeof Int32Array === 'undefined' ? Array : Int32Array)(80)

	  var POOL = []

	  function Sha1 () {
	    if(POOL.length)
	      return POOL.pop().init()

	    if(!(this instanceof Sha1)) return new Sha1()
	    this._w = W
	    Hash.call(this, 16*4, 14*4)

	    this._h = null
	    this.init()
	  }

	  inherits(Sha1, Hash)

	  Sha1.prototype.init = function () {
	    this._a = 0x67452301
	    this._b = 0xefcdab89
	    this._c = 0x98badcfe
	    this._d = 0x10325476
	    this._e = 0xc3d2e1f0

	    Hash.prototype.init.call(this)
	    return this
	  }

	  Sha1.prototype._POOL = POOL
	  Sha1.prototype._update = function (X) {

	    var a, b, c, d, e, _a, _b, _c, _d, _e

	    a = _a = this._a
	    b = _b = this._b
	    c = _c = this._c
	    d = _d = this._d
	    e = _e = this._e

	    var w = this._w

	    for(var j = 0; j < 80; j++) {
	      var W = w[j] = j < 16 ? X.readInt32BE(j*4)
	        : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)

	      var t = add(
	        add(rol(a, 5), sha1_ft(j, b, c, d)),
	        add(add(e, W), sha1_kt(j))
	      )

	      e = d
	      d = c
	      c = rol(b, 30)
	      b = a
	      a = t
	    }

	    this._a = add(a, _a)
	    this._b = add(b, _b)
	    this._c = add(c, _c)
	    this._d = add(d, _d)
	    this._e = add(e, _e)
	  }

	  Sha1.prototype._hash = function () {
	    if(POOL.length < 100) POOL.push(this)
	    var H = new Buffer(20)
	    //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
	    H.writeInt32BE(this._a|0, A)
	    H.writeInt32BE(this._b|0, B)
	    H.writeInt32BE(this._c|0, C)
	    H.writeInt32BE(this._d|0, D)
	    H.writeInt32BE(this._e|0, E)
	    return H
	  }

	  /*
	   * Perform the appropriate triplet combination function for the current
	   * iteration
	   */
	  function sha1_ft(t, b, c, d) {
	    if(t < 20) return (b & c) | ((~b) & d);
	    if(t < 40) return b ^ c ^ d;
	    if(t < 60) return (b & c) | (b & d) | (c & d);
	    return b ^ c ^ d;
	  }

	  /*
	   * Determine the appropriate additive constant for the current iteration
	   */
	  function sha1_kt(t) {
	    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	           (t < 60) ? -1894007588 : -899497514;
	  }

	  /*
	   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	   * to work around bugs in some JS interpreters.
	   * //dominictarr: this is 10 years old, so maybe this can be dropped?)
	   *
	   */
	  function add(x, y) {
	    return (x + y ) | 0
	  //lets see how this goes on testling.
	  //  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  //  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  //  return (msw << 16) | (lsw & 0xFFFF);
	  }

	  /*
	   * Bitwise rotate a 32-bit number to the left.
	   */
	  function rol(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt));
	  }

	  return Sha1
	}


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(28);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(29);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(27)))

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            currentQueue[queueIndex].run();
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */

	var inherits = __webpack_require__(26).inherits

	module.exports = function (Buffer, Hash) {

	  var K = [
	      0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
	      0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
	      0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
	      0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
	      0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
	      0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
	      0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
	      0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
	      0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
	      0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
	      0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
	      0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
	      0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
	      0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
	      0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
	      0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
	    ]

	  var W = new Array(64)

	  function Sha256() {
	    this.init()

	    this._w = W //new Array(64)

	    Hash.call(this, 16*4, 14*4)
	  }

	  inherits(Sha256, Hash)

	  Sha256.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, n) {
	    return (X >>> n) | (X << (32 - n));
	  }

	  function R (X, n) {
	    return (X >>> n);
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  function Sigma0256 (x) {
	    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
	  }

	  function Sigma1256 (x) {
	    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
	  }

	  function Gamma0256 (x) {
	    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
	  }

	  function Gamma1256 (x) {
	    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
	  }

	  Sha256.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var T1, T2

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    for (var j = 0; j < 64; j++) {
	      var w = W[j] = j < 16
	        ? M.readInt32BE(j * 4)
	        : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]

	      T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w

	      T2 = Sigma0256(a) + Maj(a, b, c);
	      h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
	    }

	    this._a = (a + this._a) | 0
	    this._b = (b + this._b) | 0
	    this._c = (c + this._c) | 0
	    this._d = (d + this._d) | 0
	    this._e = (e + this._e) | 0
	    this._f = (f + this._f) | 0
	    this._g = (g + this._g) | 0
	    this._h = (h + this._h) | 0

	  };

	  Sha256.prototype._hash = function () {
	    var H = new Buffer(32)

	    H.writeInt32BE(this._a,  0)
	    H.writeInt32BE(this._b,  4)
	    H.writeInt32BE(this._c,  8)
	    H.writeInt32BE(this._d, 12)
	    H.writeInt32BE(this._e, 16)
	    H.writeInt32BE(this._f, 20)
	    H.writeInt32BE(this._g, 24)
	    H.writeInt32BE(this._h, 28)

	    return H
	  }

	  return Sha256

	}


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(26).inherits

	module.exports = function (Buffer, Hash) {
	  var K = [
	    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	  ]

	  var W = new Array(160)

	  function Sha512() {
	    this.init()
	    this._w = W

	    Hash.call(this, 128, 112)
	  }

	  inherits(Sha512, Hash)

	  Sha512.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._al = 0xf3bcc908|0
	    this._bl = 0x84caa73b|0
	    this._cl = 0xfe94f82b|0
	    this._dl = 0x5f1d36f1|0
	    this._el = 0xade682d1|0
	    this._fl = 0x2b3e6c1f|0
	    this._gl = 0xfb41bd6b|0
	    this._hl = 0x137e2179|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, Xl, n) {
	    return (X >>> n) | (Xl << (32 - n))
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  Sha512.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var al, bl, cl, dl, el, fl, gl, hl

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    al = this._al | 0
	    bl = this._bl | 0
	    cl = this._cl | 0
	    dl = this._dl | 0
	    el = this._el | 0
	    fl = this._fl | 0
	    gl = this._gl | 0
	    hl = this._hl | 0

	    for (var i = 0; i < 80; i++) {
	      var j = i * 2

	      var Wi, Wil

	      if (i < 16) {
	        Wi = W[j] = M.readInt32BE(j * 4)
	        Wil = W[j + 1] = M.readInt32BE(j * 4 + 4)

	      } else {
	        var x  = W[j - 15*2]
	        var xl = W[j - 15*2 + 1]
	        var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
	        var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)

	        x  = W[j - 2*2]
	        xl = W[j - 2*2 + 1]
	        var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
	        var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)

	        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	        var Wi7  = W[j - 7*2]
	        var Wi7l = W[j - 7*2 + 1]

	        var Wi16  = W[j - 16*2]
	        var Wi16l = W[j - 16*2 + 1]

	        Wil = gamma0l + Wi7l
	        Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
	        Wil = Wil + gamma1l
	        Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
	        Wil = Wil + Wi16l
	        Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)

	        W[j] = Wi
	        W[j + 1] = Wil
	      }

	      var maj = Maj(a, b, c)
	      var majl = Maj(al, bl, cl)

	      var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
	      var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
	      var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
	      var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)

	      // t1 = h + sigma1 + ch + K[i] + W[i]
	      var Ki = K[j]
	      var Kil = K[j + 1]

	      var ch = Ch(e, f, g)
	      var chl = Ch(el, fl, gl)

	      var t1l = hl + sigma1l
	      var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
	      t1l = t1l + chl
	      t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
	      t1l = t1l + Kil
	      t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
	      t1l = t1l + Wil
	      t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)

	      // t2 = sigma0 + maj
	      var t2l = sigma0l + majl
	      var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)

	      h  = g
	      hl = gl
	      g  = f
	      gl = fl
	      f  = e
	      fl = el
	      el = (dl + t1l) | 0
	      e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	      d  = c
	      dl = cl
	      c  = b
	      cl = bl
	      b  = a
	      bl = al
	      al = (t1l + t2l) | 0
	      a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0
	    }

	    this._al = (this._al + al) | 0
	    this._bl = (this._bl + bl) | 0
	    this._cl = (this._cl + cl) | 0
	    this._dl = (this._dl + dl) | 0
	    this._el = (this._el + el) | 0
	    this._fl = (this._fl + fl) | 0
	    this._gl = (this._gl + gl) | 0
	    this._hl = (this._hl + hl) | 0

	    this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
	    this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
	    this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
	    this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	    this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
	    this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
	    this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
	    this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
	  }

	  Sha512.prototype._hash = function () {
	    var H = new Buffer(64)

	    function writeInt64BE(h, l, offset) {
	      H.writeInt32BE(h, offset)
	      H.writeInt32BE(l, offset + 4)
	    }

	    writeInt64BE(this._a, this._al, 0)
	    writeInt64BE(this._b, this._bl, 8)
	    writeInt64BE(this._c, this._cl, 16)
	    writeInt64BE(this._d, this._dl, 24)
	    writeInt64BE(this._e, this._el, 32)
	    writeInt64BE(this._f, this._fl, 40)
	    writeInt64BE(this._g, this._gl, 48)
	    writeInt64BE(this._h, this._hl, 56)

	    return H
	  }

	  return Sha512

	}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	var helpers = __webpack_require__(33);

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	module.exports = function md5(buf) {
	  return helpers.hash(buf, core_md5, 16);
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var intSize = 4;
	var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
	var chrsz = 8;

	function toArray(buf, bigEndian) {
	  if ((buf.length % intSize) !== 0) {
	    var len = buf.length + (intSize - (buf.length % intSize));
	    buf = Buffer.concat([buf, zeroBuffer], len);
	  }

	  var arr = [];
	  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
	  for (var i = 0; i < buf.length; i += intSize) {
	    arr.push(fn.call(buf, i));
	  }
	  return arr;
	}

	function toBuffer(arr, size, bigEndian) {
	  var buf = new Buffer(size);
	  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
	  for (var i = 0; i < arr.length; i++) {
	    fn.call(buf, arr[i], i * 4, true);
	  }
	  return buf;
	}

	function hash(buf, fn, hashSize, bigEndian) {
	  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
	  return toBuffer(arr, hashSize, bigEndian);
	}

	module.exports = { hash: hash };

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {
	module.exports = ripemd160



	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/** @preserve
	(c) 2012 by Cédric Mesnil. All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	// Constants table
	var zl = [
	    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
	    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
	    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
	    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
	    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
	var zr = [
	    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
	    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
	    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
	    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
	    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
	var sl = [
	     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
	    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
	    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
	      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
	    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
	var sr = [
	    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
	    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
	    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
	    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
	    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

	var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
	var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

	var bytesToWords = function (bytes) {
	  var words = [];
	  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
	    words[b >>> 5] |= bytes[i] << (24 - b % 32);
	  }
	  return words;
	};

	var wordsToBytes = function (words) {
	  var bytes = [];
	  for (var b = 0; b < words.length * 32; b += 8) {
	    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	  }
	  return bytes;
	};

	var processBlock = function (H, M, offset) {

	  // Swap endian
	  for (var i = 0; i < 16; i++) {
	    var offset_i = offset + i;
	    var M_offset_i = M[offset_i];

	    // Swap
	    M[offset_i] = (
	        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
	        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
	    );
	  }

	  // Working variables
	  var al, bl, cl, dl, el;
	  var ar, br, cr, dr, er;

	  ar = al = H[0];
	  br = bl = H[1];
	  cr = cl = H[2];
	  dr = dl = H[3];
	  er = el = H[4];
	  // Computation
	  var t;
	  for (var i = 0; i < 80; i += 1) {
	    t = (al +  M[offset+zl[i]])|0;
	    if (i<16){
	        t +=  f1(bl,cl,dl) + hl[0];
	    } else if (i<32) {
	        t +=  f2(bl,cl,dl) + hl[1];
	    } else if (i<48) {
	        t +=  f3(bl,cl,dl) + hl[2];
	    } else if (i<64) {
	        t +=  f4(bl,cl,dl) + hl[3];
	    } else {// if (i<80) {
	        t +=  f5(bl,cl,dl) + hl[4];
	    }
	    t = t|0;
	    t =  rotl(t,sl[i]);
	    t = (t+el)|0;
	    al = el;
	    el = dl;
	    dl = rotl(cl, 10);
	    cl = bl;
	    bl = t;

	    t = (ar + M[offset+zr[i]])|0;
	    if (i<16){
	        t +=  f5(br,cr,dr) + hr[0];
	    } else if (i<32) {
	        t +=  f4(br,cr,dr) + hr[1];
	    } else if (i<48) {
	        t +=  f3(br,cr,dr) + hr[2];
	    } else if (i<64) {
	        t +=  f2(br,cr,dr) + hr[3];
	    } else {// if (i<80) {
	        t +=  f1(br,cr,dr) + hr[4];
	    }
	    t = t|0;
	    t =  rotl(t,sr[i]) ;
	    t = (t+er)|0;
	    ar = er;
	    er = dr;
	    dr = rotl(cr, 10);
	    cr = br;
	    br = t;
	  }
	  // Intermediate hash value
	  t    = (H[1] + cl + dr)|0;
	  H[1] = (H[2] + dl + er)|0;
	  H[2] = (H[3] + el + ar)|0;
	  H[3] = (H[4] + al + br)|0;
	  H[4] = (H[0] + bl + cr)|0;
	  H[0] =  t;
	};

	function f1(x, y, z) {
	  return ((x) ^ (y) ^ (z));
	}

	function f2(x, y, z) {
	  return (((x)&(y)) | ((~x)&(z)));
	}

	function f3(x, y, z) {
	  return (((x) | (~(y))) ^ (z));
	}

	function f4(x, y, z) {
	  return (((x) & (z)) | ((y)&(~(z))));
	}

	function f5(x, y, z) {
	  return ((x) ^ ((y) |(~(z))));
	}

	function rotl(x,n) {
	  return (x<<n) | (x>>>(32-n));
	}

	function ripemd160(message) {
	  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

	  if (typeof message == 'string')
	    message = new Buffer(message, 'utf8');

	  var m = bytesToWords(message);

	  var nBitsLeft = message.length * 8;
	  var nBitsTotal = message.length * 8;

	  // Add padding
	  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
	      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
	      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
	  );

	  for (var i=0 ; i<m.length; i += 16) {
	    processBlock(H, m, i);
	  }

	  // Swap endian
	  for (var i = 0; i < 5; i++) {
	      // Shortcut
	    var H_i = H[i];

	    // Swap
	    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
	          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
	  }

	  var digestbytes = wordsToBytes(H);
	  return new Buffer(digestbytes);
	}



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(22)

	var zeroBuffer = new Buffer(128)
	zeroBuffer.fill(0)

	module.exports = Hmac

	function Hmac (alg, key) {
	  if(!(this instanceof Hmac)) return new Hmac(alg, key)
	  this._opad = opad
	  this._alg = alg

	  var blocksize = (alg === 'sha512') ? 128 : 64

	  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key

	  if(key.length > blocksize) {
	    key = createHash(alg).update(key).digest()
	  } else if(key.length < blocksize) {
	    key = Buffer.concat([key, zeroBuffer], blocksize)
	  }

	  var ipad = this._ipad = new Buffer(blocksize)
	  var opad = this._opad = new Buffer(blocksize)

	  for(var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }

	  this._hash = createHash(alg).update(ipad)
	}

	Hmac.prototype.update = function (data, enc) {
	  this._hash.update(data, enc)
	  return this
	}

	Hmac.prototype.digest = function (enc) {
	  var h = this._hash.digest()
	  return createHash(this._alg).update(this._opad).update(h).digest(enc)
	}


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var pbkdf2Export = __webpack_require__(37)

	module.exports = function (crypto, exports) {
	  exports = exports || {}

	  var exported = pbkdf2Export(crypto)

	  exports.pbkdf2 = exported.pbkdf2
	  exports.pbkdf2Sync = exported.pbkdf2Sync

	  return exports
	}


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {module.exports = function(crypto) {
	  function pbkdf2(password, salt, iterations, keylen, digest, callback) {
	    if ('function' === typeof digest) {
	      callback = digest
	      digest = undefined
	    }

	    if ('function' !== typeof callback)
	      throw new Error('No callback provided to pbkdf2')

	    setTimeout(function() {
	      var result

	      try {
	        result = pbkdf2Sync(password, salt, iterations, keylen, digest)
	      } catch (e) {
	        return callback(e)
	      }

	      callback(undefined, result)
	    })
	  }

	  function pbkdf2Sync(password, salt, iterations, keylen, digest) {
	    if ('number' !== typeof iterations)
	      throw new TypeError('Iterations not a number')

	    if (iterations < 0)
	      throw new TypeError('Bad iterations')

	    if ('number' !== typeof keylen)
	      throw new TypeError('Key length not a number')

	    if (keylen < 0)
	      throw new TypeError('Bad key length')

	    digest = digest || 'sha1'

	    if (!Buffer.isBuffer(password)) password = new Buffer(password)
	    if (!Buffer.isBuffer(salt)) salt = new Buffer(salt)

	    var hLen, l = 1, r, T
	    var DK = new Buffer(keylen)
	    var block1 = new Buffer(salt.length + 4)
	    salt.copy(block1, 0, 0, salt.length)

	    for (var i = 1; i <= l; i++) {
	      block1.writeUInt32BE(i, salt.length)

	      var U = crypto.createHmac(digest, password).update(block1).digest()

	      if (!hLen) {
	        hLen = U.length
	        T = new Buffer(hLen)
	        l = Math.ceil(keylen / hLen)
	        r = keylen - (l - 1) * hLen

	        if (keylen > (Math.pow(2, 32) - 1) * hLen)
	          throw new TypeError('keylen exceeds maximum length')
	      }

	      U.copy(T, 0, 0, hLen)

	      for (var j = 1; j < iterations; j++) {
	        U = crypto.createHmac(digest, password).update(U).digest()

	        for (var k = 0; k < hLen; k++) {
	          T[k] ^= U[k]
	        }
	      }

	      var destPos = (i - 1) * hLen
	      var len = (i == l ? r : hLen)
	      T.copy(DK, destPos, 0, len)
	    }

	    return DK
	  }

	  return {
	    pbkdf2: pbkdf2,
	    pbkdf2Sync: pbkdf2Sync
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var hash = __webpack_require__(39);
	var elliptic = __webpack_require__(15);
	var utils = elliptic.utils;
	var assert = utils.assert;

	function HmacDRBG(options) {
	  if (!(this instanceof HmacDRBG))
	    return new HmacDRBG(options);
	  this.hash = options.hash;
	  this.predResist = !!options.predResist;

	  this.outLen = this.hash.outSize;
	  this.minEntropy = options.minEntropy || this.hash.hmacStrength;

	  this.reseed = null;
	  this.reseedInterval = null;
	  this.K = null;
	  this.V = null;

	  var entropy = utils.toArray(options.entropy, options.entropyEnc);
	  var nonce = utils.toArray(options.nonce, options.nonceEnc);
	  var pers = utils.toArray(options.pers, options.persEnc);
	  assert(entropy.length >= (this.minEntropy / 8),
	         'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');
	  this._init(entropy, nonce, pers);
	}
	module.exports = HmacDRBG;

	HmacDRBG.prototype._init = function init(entropy, nonce, pers) {
	  var seed = entropy.concat(nonce).concat(pers);

	  this.K = new Array(this.outLen / 8);
	  this.V = new Array(this.outLen / 8);
	  for (var i = 0; i < this.V.length; i++) {
	    this.K[i] = 0x00;
	    this.V[i] = 0x01;
	  }

	  this._update(seed);
	  this.reseed = 1;
	  this.reseedInterval = 0x1000000000000;  // 2^48
	};

	HmacDRBG.prototype._hmac = function hmac() {
	  return new hash.hmac(this.hash, this.K);
	};

	HmacDRBG.prototype._update = function update(seed) {
	  var kmac = this._hmac()
	                 .update(this.V)
	                 .update([ 0x00 ]);
	  if (seed)
	    kmac = kmac.update(seed);
	  this.K = kmac.digest();
	  this.V = this._hmac().update(this.V).digest();
	  if (!seed)
	    return;

	  this.K = this._hmac()
	               .update(this.V)
	               .update([ 0x01 ])
	               .update(seed)
	               .digest();
	  this.V = this._hmac().update(this.V).digest();
	};

	HmacDRBG.prototype.reseed = function reseed(entropy, entropyEnc, add, addEnc) {
	  // Optional entropy enc
	  if (typeof entropyEnc !== 'string') {
	    addEnc = add;
	    add = entropyEnc;
	    entropyEnc = null;
	  }

	  entropy = utils.toBuffer(entropy, entropyEnc);
	  add = utils.toBuffer(add, addEnc);

	  assert(entropy.length >= (this.minEntropy / 8),
	         'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');

	  this._update(entropy.concat(add || []));
	  this.reseed = 1;
	};

	HmacDRBG.prototype.generate = function generate(len, enc, add, addEnc) {
	  if (this.reseed > this.reseedInterval)
	    throw new Error('Reseed is required');

	  // Optional encoding
	  if (typeof enc !== 'string') {
	    addEnc = add;
	    add = enc;
	    enc = null;
	  }

	  // Optional additional data
	  if (add) {
	    add = utils.toArray(add, addEnc);
	    this._update(add);
	  }

	  var temp = [];
	  while (temp.length < len) {
	    this.V = this._hmac().update(this.V).digest();
	    temp = temp.concat(this.V);
	  }

	  var res = temp.slice(0, len);
	  this._update(add);
	  this.reseed++;
	  return utils.encode(res, enc);
	};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var hash = exports;

	hash.utils = __webpack_require__(40);
	hash.common = __webpack_require__(42);
	hash.sha = __webpack_require__(43);
	hash.ripemd = __webpack_require__(44);
	hash.hmac = __webpack_require__(45);

	// Proxy hash functions to the main object
	hash.sha1 = hash.sha.sha1;
	hash.sha256 = hash.sha.sha256;
	hash.sha224 = hash.sha.sha224;
	hash.sha384 = hash.sha.sha384;
	hash.sha512 = hash.sha.sha512;
	hash.ripemd160 = hash.ripemd.ripemd160;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var utils = exports;
	var inherits = __webpack_require__(41);

	function toArray(msg, enc) {
	  if (Array.isArray(msg))
	    return msg.slice();
	  if (!msg)
	    return [];
	  var res = [];
	  if (typeof msg === 'string') {
	    if (!enc) {
	      for (var i = 0; i < msg.length; i++) {
	        var c = msg.charCodeAt(i);
	        var hi = c >> 8;
	        var lo = c & 0xff;
	        if (hi)
	          res.push(hi, lo);
	        else
	          res.push(lo);
	      }
	    } else if (enc === 'hex') {
	      msg = msg.replace(/[^a-z0-9]+/ig, '');
	      if (msg.length % 2 !== 0)
	        msg = '0' + msg;
	      for (var i = 0; i < msg.length; i += 2)
	        res.push(parseInt(msg[i] + msg[i + 1], 16));
	    }
	  } else {
	    for (var i = 0; i < msg.length; i++)
	      res[i] = msg[i] | 0;
	  }
	  return res;
	}
	utils.toArray = toArray;

	function toHex(msg) {
	  var res = '';
	  for (var i = 0; i < msg.length; i++)
	    res += zero2(msg[i].toString(16));
	  return res;
	}
	utils.toHex = toHex;

	function htonl(w) {
	  var res = (w >>> 24) |
	            ((w >>> 8) & 0xff00) |
	            ((w << 8) & 0xff0000) |
	            ((w & 0xff) << 24);
	  return res >>> 0;
	}
	utils.htonl = htonl;

	function toHex32(msg, endian) {
	  var res = '';
	  for (var i = 0; i < msg.length; i++) {
	    var w = msg[i];
	    if (endian === 'little')
	      w = htonl(w);
	    res += zero8(w.toString(16));
	  }
	  return res;
	}
	utils.toHex32 = toHex32;

	function zero2(word) {
	  if (word.length === 1)
	    return '0' + word;
	  else
	    return word;
	}
	utils.zero2 = zero2;

	function zero8(word) {
	  if (word.length === 7)
	    return '0' + word;
	  else if (word.length === 6)
	    return '00' + word;
	  else if (word.length === 5)
	    return '000' + word;
	  else if (word.length === 4)
	    return '0000' + word;
	  else if (word.length === 3)
	    return '00000' + word;
	  else if (word.length === 2)
	    return '000000' + word;
	  else if (word.length === 1)
	    return '0000000' + word;
	  else
	    return word;
	}
	utils.zero8 = zero8;

	function join32(msg, start, end, endian) {
	  var len = end - start;
	  assert(len % 4 === 0);
	  var res = new Array(len / 4);
	  for (var i = 0, k = start; i < res.length; i++, k += 4) {
	    var w;
	    if (endian === 'big')
	      w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
	    else
	      w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
	    res[i] = w >>> 0;
	  }
	  return res;
	}
	utils.join32 = join32;

	function split32(msg, endian) {
	  var res = new Array(msg.length * 4);
	  for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
	    var m = msg[i];
	    if (endian === 'big') {
	      res[k] = m >>> 24;
	      res[k + 1] = (m >>> 16) & 0xff;
	      res[k + 2] = (m >>> 8) & 0xff;
	      res[k + 3] = m & 0xff;
	    } else {
	      res[k + 3] = m >>> 24;
	      res[k + 2] = (m >>> 16) & 0xff;
	      res[k + 1] = (m >>> 8) & 0xff;
	      res[k] = m & 0xff;
	    }
	  }
	  return res;
	}
	utils.split32 = split32;

	function rotr32(w, b) {
	  return (w >>> b) | (w << (32 - b));
	}
	utils.rotr32 = rotr32;

	function rotl32(w, b) {
	  return (w << b) | (w >>> (32 - b));
	}
	utils.rotl32 = rotl32;

	function sum32(a, b) {
	  return (a + b) >>> 0;
	}
	utils.sum32 = sum32;

	function sum32_3(a, b, c) {
	  return (a + b + c) >>> 0;
	}
	utils.sum32_3 = sum32_3;

	function sum32_4(a, b, c, d) {
	  return (a + b + c + d) >>> 0;
	}
	utils.sum32_4 = sum32_4;

	function sum32_5(a, b, c, d, e) {
	  return (a + b + c + d + e) >>> 0;
	}
	utils.sum32_5 = sum32_5;

	function assert(cond, msg) {
	  if (!cond)
	    throw new Error(msg || 'Assertion failed');
	}
	utils.assert = assert;

	utils.inherits = inherits;

	function sum64(buf, pos, ah, al) {
	  var bh = buf[pos];
	  var bl = buf[pos + 1];

	  var lo = (al + bl) >>> 0;
	  var hi = (lo < al ? 1 : 0) + ah + bh;
	  buf[pos] = hi >>> 0;
	  buf[pos + 1] = lo;
	}
	exports.sum64 = sum64;

	function sum64_hi(ah, al, bh, bl) {
	  var lo = (al + bl) >>> 0;
	  var hi = (lo < al ? 1 : 0) + ah + bh;
	  return hi >>> 0;
	};
	exports.sum64_hi = sum64_hi;

	function sum64_lo(ah, al, bh, bl) {
	  var lo = al + bl;
	  return lo >>> 0;
	};
	exports.sum64_lo = sum64_lo;

	function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
	  var carry = 0;
	  var lo = al;
	  lo = (lo + bl) >>> 0;
	  carry += lo < al ? 1 : 0;
	  lo = (lo + cl) >>> 0;
	  carry += lo < cl ? 1 : 0;
	  lo = (lo + dl) >>> 0;
	  carry += lo < dl ? 1 : 0;

	  var hi = ah + bh + ch + dh + carry;
	  return hi >>> 0;
	};
	exports.sum64_4_hi = sum64_4_hi;

	function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
	  var lo = al + bl + cl + dl;
	  return lo >>> 0;
	};
	exports.sum64_4_lo = sum64_4_lo;

	function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
	  var carry = 0;
	  var lo = al;
	  lo = (lo + bl) >>> 0;
	  carry += lo < al ? 1 : 0;
	  lo = (lo + cl) >>> 0;
	  carry += lo < cl ? 1 : 0;
	  lo = (lo + dl) >>> 0;
	  carry += lo < dl ? 1 : 0;
	  lo = (lo + el) >>> 0;
	  carry += lo < el ? 1 : 0;

	  var hi = ah + bh + ch + dh + eh + carry;
	  return hi >>> 0;
	};
	exports.sum64_5_hi = sum64_5_hi;

	function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
	  var lo = al + bl + cl + dl + el;

	  return lo >>> 0;
	};
	exports.sum64_5_lo = sum64_5_lo;

	function rotr64_hi(ah, al, num) {
	  var r = (al << (32 - num)) | (ah >>> num);
	  return r >>> 0;
	};
	exports.rotr64_hi = rotr64_hi;

	function rotr64_lo(ah, al, num) {
	  var r = (ah << (32 - num)) | (al >>> num);
	  return r >>> 0;
	};
	exports.rotr64_lo = rotr64_lo;

	function shr64_hi(ah, al, num) {
	  return ah >>> num;
	};
	exports.shr64_hi = shr64_hi;

	function shr64_lo(ah, al, num) {
	  var r = (ah << (32 - num)) | (al >>> num);
	  return r >>> 0;
	};
	exports.shr64_lo = shr64_lo;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var hash = __webpack_require__(39);
	var utils = hash.utils;
	var assert = utils.assert;

	function BlockHash() {
	  this.pending = null;
	  this.pendingTotal = 0;
	  this.blockSize = this.constructor.blockSize;
	  this.outSize = this.constructor.outSize;
	  this.hmacStrength = this.constructor.hmacStrength;
	  this.padLength = this.constructor.padLength / 8;
	  this.endian = 'big';

	  this._delta8 = this.blockSize / 8;
	  this._delta32 = this.blockSize / 32;
	}
	exports.BlockHash = BlockHash;

	BlockHash.prototype.update = function update(msg, enc) {
	  // Convert message to array, pad it, and join into 32bit blocks
	  msg = utils.toArray(msg, enc);
	  if (!this.pending)
	    this.pending = msg;
	  else
	    this.pending = this.pending.concat(msg);
	  this.pendingTotal += msg.length;

	  // Enough data, try updating
	  if (this.pending.length >= this._delta8) {
	    msg = this.pending;

	    // Process pending data in blocks
	    var r = msg.length % this._delta8;
	    this.pending = msg.slice(msg.length - r, msg.length);
	    if (this.pending.length === 0)
	      this.pending = null;

	    msg = utils.join32(msg, 0, msg.length - r, this.endian);
	    for (var i = 0; i < msg.length; i += this._delta32)
	      this._update(msg, i, i + this._delta32);
	  }

	  return this;
	};

	BlockHash.prototype.digest = function digest(enc) {
	  this.update(this._pad());
	  assert(this.pending === null);

	  return this._digest(enc);
	};

	BlockHash.prototype._pad = function pad() {
	  var len = this.pendingTotal;
	  var bytes = this._delta8;
	  var k = bytes - ((len + this.padLength) % bytes);
	  var res = new Array(k + this.padLength);
	  res[0] = 0x80;
	  for (var i = 1; i < k; i++)
	    res[i] = 0;

	  // Append length
	  len <<= 3;
	  if (this.endian === 'big') {
	    for (var t = 8; t < this.padLength; t++)
	      res[i++] = 0;

	    res[i++] = 0;
	    res[i++] = 0;
	    res[i++] = 0;
	    res[i++] = 0;
	    res[i++] = (len >>> 24) & 0xff;
	    res[i++] = (len >>> 16) & 0xff;
	    res[i++] = (len >>> 8) & 0xff;
	    res[i++] = len & 0xff;
	  } else {
	    res[i++] = len & 0xff;
	    res[i++] = (len >>> 8) & 0xff;
	    res[i++] = (len >>> 16) & 0xff;
	    res[i++] = (len >>> 24) & 0xff;
	    res[i++] = 0;
	    res[i++] = 0;
	    res[i++] = 0;
	    res[i++] = 0;

	    for (var t = 8; t < this.padLength; t++)
	      res[i++] = 0;
	  }

	  return res;
	};


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var hash = __webpack_require__(39);
	var utils = hash.utils;
	var assert = utils.assert;

	var rotr32 = utils.rotr32;
	var rotl32 = utils.rotl32;
	var sum32 = utils.sum32;
	var sum32_4 = utils.sum32_4;
	var sum32_5 = utils.sum32_5;
	var rotr64_hi = utils.rotr64_hi;
	var rotr64_lo = utils.rotr64_lo;
	var shr64_hi = utils.shr64_hi;
	var shr64_lo = utils.shr64_lo;
	var sum64 = utils.sum64;
	var sum64_hi = utils.sum64_hi;
	var sum64_lo = utils.sum64_lo;
	var sum64_4_hi = utils.sum64_4_hi;
	var sum64_4_lo = utils.sum64_4_lo;
	var sum64_5_hi = utils.sum64_5_hi;
	var sum64_5_lo = utils.sum64_5_lo;
	var BlockHash = hash.common.BlockHash;

	var sha256_K = [
	  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
	  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
	  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
	  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
	  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
	  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
	  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
	  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
	  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
	  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
	  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
	  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
	  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
	  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
	  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
	  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
	];

	var sha512_K = [
	  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	];

	var sha1_K = [
	  0x5A827999, 0x6ED9EBA1,
	  0x8F1BBCDC, 0xCA62C1D6
	];

	function SHA256() {
	  if (!(this instanceof SHA256))
	    return new SHA256();

	  BlockHash.call(this);
	  this.h = [ 0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
	             0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 ];
	  this.k = sha256_K;
	  this.W = new Array(64);
	}
	utils.inherits(SHA256, BlockHash);
	exports.sha256 = SHA256;

	SHA256.blockSize = 512;
	SHA256.outSize = 256;
	SHA256.hmacStrength = 192;
	SHA256.padLength = 64;

	SHA256.prototype._update = function _update(msg, start) {
	  var W = this.W;

	  for (var i = 0; i < 16; i++)
	    W[i] = msg[start + i];
	  for (; i < W.length; i++)
	    W[i] = sum32_4(g1_256(W[i - 2]), W[i - 7], g0_256(W[i - 15]), W[i - 16]);

	  var a = this.h[0];
	  var b = this.h[1];
	  var c = this.h[2];
	  var d = this.h[3];
	  var e = this.h[4];
	  var f = this.h[5];
	  var g = this.h[6];
	  var h = this.h[7];

	  assert(this.k.length === W.length);
	  for (var i = 0; i < W.length; i++) {
	    var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i], W[i]);
	    var T2 = sum32(s0_256(a), maj32(a, b, c));
	    h = g;
	    g = f;
	    f = e;
	    e = sum32(d, T1);
	    d = c;
	    c = b;
	    b = a;
	    a = sum32(T1, T2);
	  }

	  this.h[0] = sum32(this.h[0], a);
	  this.h[1] = sum32(this.h[1], b);
	  this.h[2] = sum32(this.h[2], c);
	  this.h[3] = sum32(this.h[3], d);
	  this.h[4] = sum32(this.h[4], e);
	  this.h[5] = sum32(this.h[5], f);
	  this.h[6] = sum32(this.h[6], g);
	  this.h[7] = sum32(this.h[7], h);
	};

	SHA256.prototype._digest = function digest(enc) {
	  if (enc === 'hex')
	    return utils.toHex32(this.h, 'big');
	  else
	    return utils.split32(this.h, 'big');
	};

	function SHA224() {
	  if (!(this instanceof SHA224))
	    return new SHA224();

	  SHA256.call(this);
	  this.h = [ 0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
	             0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4 ];
	}
	utils.inherits(SHA224, SHA256);
	exports.sha224 = SHA224;

	SHA224.blockSize = 512;
	SHA224.outSize = 224;
	SHA224.hmacStrength = 192;
	SHA224.padLength = 64;

	SHA224.prototype._digest = function digest(enc) {
	  // Just truncate output
	  if (enc === 'hex')
	    return utils.toHex32(this.h.slice(0, 7), 'big');
	  else
	    return utils.split32(this.h.slice(0, 7), 'big');
	};

	function SHA512() {
	  if (!(this instanceof SHA512))
	    return new SHA512();

	  BlockHash.call(this);
	  this.h = [ 0x6a09e667, 0xf3bcc908,
	             0xbb67ae85, 0x84caa73b,
	             0x3c6ef372, 0xfe94f82b,
	             0xa54ff53a, 0x5f1d36f1,
	             0x510e527f, 0xade682d1,
	             0x9b05688c, 0x2b3e6c1f,
	             0x1f83d9ab, 0xfb41bd6b,
	             0x5be0cd19, 0x137e2179 ];
	  this.k = sha512_K;
	  this.W = new Array(160);
	}
	utils.inherits(SHA512, BlockHash);
	exports.sha512 = SHA512;

	SHA512.blockSize = 1024;
	SHA512.outSize = 512;
	SHA512.hmacStrength = 192;
	SHA512.padLength = 128;

	SHA512.prototype._prepareBlock = function _prepareBlock(msg, start) {
	  var W = this.W;

	  // 32 x 32bit words
	  for (var i = 0; i < 32; i++)
	    W[i] = msg[start + i];
	  for (; i < W.length; i += 2) {
	    var c0_hi = g1_512_hi(W[i - 4], W[i - 3]);  // i - 2
	    var c0_lo = g1_512_lo(W[i - 4], W[i - 3]);
	    var c1_hi = W[i - 14];  // i - 7
	    var c1_lo = W[i - 13];
	    var c2_hi = g0_512_hi(W[i - 30], W[i - 29]);  // i - 15
	    var c2_lo = g0_512_lo(W[i - 30], W[i - 29]);
	    var c3_hi = W[i - 32];  // i - 16
	    var c3_lo = W[i - 31];

	    W[i] = sum64_4_hi(c0_hi, c0_lo,
	                      c1_hi, c1_lo,
	                      c2_hi, c2_lo,
	                      c3_hi, c3_lo);
	    W[i + 1] = sum64_4_lo(c0_hi, c0_lo,
	                          c1_hi, c1_lo,
	                          c2_hi, c2_lo,
	                          c3_hi, c3_lo);
	  }
	};

	SHA512.prototype._update = function _update(msg, start) {
	  this._prepareBlock(msg, start);

	  var W = this.W;

	  var ah = this.h[0];
	  var al = this.h[1];
	  var bh = this.h[2];
	  var bl = this.h[3];
	  var ch = this.h[4];
	  var cl = this.h[5];
	  var dh = this.h[6];
	  var dl = this.h[7];
	  var eh = this.h[8];
	  var el = this.h[9];
	  var fh = this.h[10];
	  var fl = this.h[11];
	  var gh = this.h[12];
	  var gl = this.h[13];
	  var hh = this.h[14];
	  var hl = this.h[15];

	  assert(this.k.length === W.length);
	  for (var i = 0; i < W.length; i += 2) {
	    var c0_hi = hh;
	    var c0_lo = hl;
	    var c1_hi = s1_512_hi(eh, el);
	    var c1_lo = s1_512_lo(eh, el);
	    var c2_hi = ch64_hi(eh, el, fh, fl, gh, gl);
	    var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
	    var c3_hi = this.k[i];
	    var c3_lo = this.k[i + 1];
	    var c4_hi = W[i];
	    var c4_lo = W[i + 1];

	    var T1_hi = sum64_5_hi(c0_hi, c0_lo,
	                           c1_hi, c1_lo,
	                           c2_hi, c2_lo,
	                           c3_hi, c3_lo,
	                           c4_hi, c4_lo);
	    var T1_lo = sum64_5_lo(c0_hi, c0_lo,
	                           c1_hi, c1_lo,
	                           c2_hi, c2_lo,
	                           c3_hi, c3_lo,
	                           c4_hi, c4_lo);

	    var c0_hi = s0_512_hi(ah, al);
	    var c0_lo = s0_512_lo(ah, al);
	    var c1_hi = maj64_hi(ah, al, bh, bl, ch, cl);
	    var c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);

	    var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo);
	    var T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);

	    hh = gh;
	    hl = gl;

	    gh = fh;
	    gl = fl;

	    fh = eh;
	    fl = el;

	    eh = sum64_hi(dh, dl, T1_hi, T1_lo);
	    el = sum64_lo(dl, dl, T1_hi, T1_lo);

	    dh = ch;
	    dl = cl;

	    ch = bh;
	    cl = bl;

	    bh = ah;
	    bl = al;

	    ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo);
	    al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
	  }

	  sum64(this.h, 0, ah, al);
	  sum64(this.h, 2, bh, bl);
	  sum64(this.h, 4, ch, cl);
	  sum64(this.h, 6, dh, dl);
	  sum64(this.h, 8, eh, el);
	  sum64(this.h, 10, fh, fl);
	  sum64(this.h, 12, gh, gl);
	  sum64(this.h, 14, hh, hl);
	};

	SHA512.prototype._digest = function digest(enc) {
	  if (enc === 'hex')
	    return utils.toHex32(this.h, 'big');
	  else
	    return utils.split32(this.h, 'big');
	};

	function SHA384() {
	  if (!(this instanceof SHA384))
	    return new SHA384();

	  SHA512.call(this);
	  this.h = [ 0xcbbb9d5d, 0xc1059ed8,
	             0x629a292a, 0x367cd507,
	             0x9159015a, 0x3070dd17,
	             0x152fecd8, 0xf70e5939,
	             0x67332667, 0xffc00b31,
	             0x8eb44a87, 0x68581511,
	             0xdb0c2e0d, 0x64f98fa7,
	             0x47b5481d, 0xbefa4fa4 ];
	}
	utils.inherits(SHA384, SHA512);
	exports.sha384 = SHA384;

	SHA384.blockSize = 1024;
	SHA384.outSize = 384;
	SHA384.hmacStrength = 192;
	SHA384.padLength = 128;

	SHA384.prototype._digest = function digest(enc) {
	  if (enc === 'hex')
	    return utils.toHex32(this.h.slice(0, 12), 'big');
	  else
	    return utils.split32(this.h.slice(0, 12), 'big');
	};

	function SHA1() {
	  if (!(this instanceof SHA1))
	    return new SHA1();

	  BlockHash.call(this);
	  this.h = [ 0x67452301, 0xefcdab89, 0x98badcfe,
	             0x10325476, 0xc3d2e1f0 ];
	  this.W = new Array(80);
	}

	utils.inherits(SHA1, BlockHash);
	exports.sha1 = SHA1;

	SHA1.blockSize = 512;
	SHA1.outSize = 160;
	SHA1.hmacStrength = 80;
	SHA1.padLength = 64;

	SHA1.prototype._update = function _update(msg, start) {
	  var W = this.W;

	  for (var i = 0; i < 16; i++)
	    W[i] = msg[start + i];

	  for(; i < W.length; i++)
	    W[i] = rotl32(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

	  var a = this.h[0];
	  var b = this.h[1];
	  var c = this.h[2];
	  var d = this.h[3];
	  var e = this.h[4];

	  for (var i = 0; i < W.length; i++) {
	    var s = ~~(i / 20);
	    var t = sum32_5(rotl32(a, 5), ft_1(s, b, c, d), e, W[i], sha1_K[s]);
	    e = d;
	    d = c;
	    c = rotl32(b, 30);
	    b = a;
	    a = t;
	  }

	  this.h[0] = sum32(this.h[0], a);
	  this.h[1] = sum32(this.h[1], b);
	  this.h[2] = sum32(this.h[2], c);
	  this.h[3] = sum32(this.h[3], d);
	  this.h[4] = sum32(this.h[4], e);
	};

	SHA1.prototype._digest = function digest(enc) {
	  if (enc === 'hex')
	    return utils.toHex32(this.h, 'big');
	  else
	    return utils.split32(this.h, 'big');
	};

	function ch32(x, y, z) {
	  return (x & y) ^ ((~x) & z);
	}

	function maj32(x, y, z) {
	  return (x & y) ^ (x & z) ^ (y & z);
	}

	function p32(x, y, z) {
	  return x ^ y ^ z;
	}

	function s0_256(x) {
	  return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
	}

	function s1_256(x) {
	  return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
	}

	function g0_256(x) {
	  return rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
	}

	function g1_256(x) {
	  return rotr32(x, 17) ^ rotr32(x, 19) ^ (x >>> 10);
	}

	function ft_1(s, x, y, z) {
	  if (s === 0)
	    return ch32(x, y, z);
	  if (s === 1 || s === 3)
	    return p32(x, y, z);
	  if (s === 2)
	    return maj32(x, y, z);
	}

	function ch64_hi(xh, xl, yh, yl, zh, zl) {
	  var r = (xh & yh) ^ ((~xh) & zh);
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function ch64_lo(xh, xl, yh, yl, zh, zl) {
	  var r = (xl & yl) ^ ((~xl) & zl);
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function maj64_hi(xh, xl, yh, yl, zh, zl) {
	  var r = (xh & yh) ^ (xh & zh) ^ (yh & zh);
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function maj64_lo(xh, xl, yh, yl, zh, zl) {
	  var r = (xl & yl) ^ (xl & zl) ^ (yl & zl);
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function s0_512_hi(xh, xl) {
	  var c0_hi = rotr64_hi(xh, xl, 28);
	  var c1_hi = rotr64_hi(xl, xh, 2);  // 34
	  var c2_hi = rotr64_hi(xl, xh, 7);  // 39

	  var r = c0_hi ^ c1_hi ^ c2_hi;
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function s0_512_lo(xh, xl) {
	  var c0_lo = rotr64_lo(xh, xl, 28);
	  var c1_lo = rotr64_lo(xl, xh, 2);  // 34
	  var c2_lo = rotr64_lo(xl, xh, 7);  // 39

	  var r = c0_lo ^ c1_lo ^ c2_lo;
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function s1_512_hi(xh, xl) {
	  var c0_hi = rotr64_hi(xh, xl, 14);
	  var c1_hi = rotr64_hi(xh, xl, 18);
	  var c2_hi = rotr64_hi(xl, xh, 9);  // 41

	  var r = c0_hi ^ c1_hi ^ c2_hi;
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function s1_512_lo(xh, xl) {
	  var c0_lo = rotr64_lo(xh, xl, 14);
	  var c1_lo = rotr64_lo(xh, xl, 18);
	  var c2_lo = rotr64_lo(xl, xh, 9);  // 41

	  var r = c0_lo ^ c1_lo ^ c2_lo;
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function g0_512_hi(xh, xl) {
	  var c0_hi = rotr64_hi(xh, xl, 1);
	  var c1_hi = rotr64_hi(xh, xl, 8);
	  var c2_hi = shr64_hi(xh, xl, 7);

	  var r = c0_hi ^ c1_hi ^ c2_hi;
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function g0_512_lo(xh, xl) {
	  var c0_lo = rotr64_lo(xh, xl, 1);
	  var c1_lo = rotr64_lo(xh, xl, 8);
	  var c2_lo = shr64_lo(xh, xl, 7);

	  var r = c0_lo ^ c1_lo ^ c2_lo;
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function g1_512_hi(xh, xl) {
	  var c0_hi = rotr64_hi(xh, xl, 19);
	  var c1_hi = rotr64_hi(xl, xh, 29);  // 61
	  var c2_hi = shr64_hi(xh, xl, 6);

	  var r = c0_hi ^ c1_hi ^ c2_hi;
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}

	function g1_512_lo(xh, xl) {
	  var c0_lo = rotr64_lo(xh, xl, 19);
	  var c1_lo = rotr64_lo(xl, xh, 29);  // 61
	  var c2_lo = shr64_lo(xh, xl, 6);

	  var r = c0_lo ^ c1_lo ^ c2_lo;
	  if (r < 0)
	    r += 0x100000000;
	  return r;
	}


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var hash = __webpack_require__(39);
	var utils = hash.utils;

	var rotl32 = utils.rotl32;
	var sum32 = utils.sum32;
	var sum32_3 = utils.sum32_3;
	var sum32_4 = utils.sum32_4;
	var BlockHash = hash.common.BlockHash;

	function RIPEMD160() {
	  if (!(this instanceof RIPEMD160))
	    return new RIPEMD160();

	  BlockHash.call(this);

	  this.h = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];
	  this.endian = 'little';
	}
	utils.inherits(RIPEMD160, BlockHash);
	exports.ripemd160 = RIPEMD160;

	RIPEMD160.blockSize = 512;
	RIPEMD160.outSize = 160;
	RIPEMD160.hmacStrength = 192;
	RIPEMD160.padLength = 64;

	RIPEMD160.prototype._update = function update(msg, start) {
	  var A = this.h[0];
	  var B = this.h[1];
	  var C = this.h[2];
	  var D = this.h[3];
	  var E = this.h[4];
	  var Ah = A;
	  var Bh = B;
	  var Ch = C;
	  var Dh = D;
	  var Eh = E;
	  for (var j = 0; j < 80; j++) {
	    var T = sum32(
	      rotl32(
	        sum32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)),
	        s[j]),
	      E);
	    A = E;
	    E = D;
	    D = rotl32(C, 10);
	    C = B;
	    B = T;
	    T = sum32(
	      rotl32(
	        sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)),
	        sh[j]),
	      Eh);
	    Ah = Eh;
	    Eh = Dh;
	    Dh = rotl32(Ch, 10);
	    Ch = Bh;
	    Bh = T;
	  }
	  T = sum32_3(this.h[1], C, Dh);
	  this.h[1] = sum32_3(this.h[2], D, Eh);
	  this.h[2] = sum32_3(this.h[3], E, Ah);
	  this.h[3] = sum32_3(this.h[4], A, Bh);
	  this.h[4] = sum32_3(this.h[0], B, Ch);
	  this.h[0] = T;
	};

	RIPEMD160.prototype._digest = function digest(enc) {
	  if (enc === 'hex')
	    return utils.toHex32(this.h, 'little');
	  else
	    return utils.split32(this.h, 'little');
	};

	function f(j, x, y, z) {
	  if (j <= 15)
	    return x ^ y ^ z;
	  else if (j <= 31)
	    return (x & y) | ((~x) & z);
	  else if (j <= 47)
	    return (x | (~y)) ^ z;
	  else if (j <= 63)
	    return (x & z) | (y & (~z));
	  else
	    return x ^ (y | (~z));
	}

	function K(j) {
	  if (j <= 15)
	    return 0x00000000;
	  else if (j <= 31)
	    return 0x5a827999;
	  else if (j <= 47)
	    return 0x6ed9eba1;
	  else if (j <= 63)
	    return 0x8f1bbcdc;
	  else
	    return 0xa953fd4e;
	}

	function Kh(j) {
	  if (j <= 15)
	    return 0x50a28be6;
	  else if (j <= 31)
	    return 0x5c4dd124;
	  else if (j <= 47)
	    return 0x6d703ef3;
	  else if (j <= 63)
	    return 0x7a6d76e9;
	  else
	    return 0x00000000;
	}

	var r = [
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
	  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
	  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
	  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
	  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
	];

	var rh = [
	  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
	  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
	  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
	  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
	  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
	];

	var s = [
	  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
	  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
	  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
	  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
	  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
	];

	var sh = [
	  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
	  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
	  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
	  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
	  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
	];


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var hmac = exports;

	var hash = __webpack_require__(39);
	var utils = hash.utils;
	var assert = utils.assert;

	function Hmac(hash, key, enc) {
	  if (!(this instanceof Hmac))
	    return new Hmac(hash, key, enc);
	  this.Hash = hash;
	  this.blockSize = hash.blockSize / 8;
	  this.outSize = hash.outSize / 8;
	  this.inner = null;
	  this.outer = null;

	  this._init(utils.toArray(key, enc));
	}
	module.exports = Hmac;

	Hmac.prototype._init = function init(key) {
	  // Shorten key, if needed
	  if (key.length > this.blockSize)
	    key = new this.Hash().update(key).digest();
	  assert(key.length <= this.blockSize);

	  // Add padding to key
	  for (var i = key.length; i < this.blockSize; i++)
	    key.push(0);

	  for (var i = 0; i < key.length; i++)
	    key[i] ^= 0x36;
	  this.inner = new this.Hash().update(key);

	  // 0x36 ^ 0x5c = 0x6a
	  for (var i = 0; i < key.length; i++)
	    key[i] ^= 0x6a;
	  this.outer = new this.Hash().update(key);
	};

	Hmac.prototype.update = function update(msg, enc) {
	  this.inner.update(msg, enc);
	  return this;
	};

	Hmac.prototype.digest = function digest(enc) {
	  this.outer.update(this.inner.digest());
	  return this.outer.digest(enc);
	};


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var curve = exports;

	curve.base = __webpack_require__(47);
	curve.short = __webpack_require__(50);
	curve.mont = __webpack_require__(52);
	curve.edwards = __webpack_require__(53);


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bn = __webpack_require__(48);
	var elliptic = __webpack_require__(15);

	var getNAF = elliptic.utils.getNAF;
	var getJSF = elliptic.utils.getJSF;
	var assert = elliptic.utils.assert;

	function BaseCurve(type, conf) {
	  this.type = type;
	  this.p = new bn(conf.p, 16);

	  // Use Montgomery, when there is no fast reduction for the prime
	  this.red = conf.prime ? bn.red(conf.prime) : bn.mont(this.p);

	  // Useful for many curves
	  this.zero = new bn(0).toRed(this.red);
	  this.one = new bn(1).toRed(this.red);
	  this.two = new bn(2).toRed(this.red);

	  // Curve configuration, optional
	  this.n = conf.n && new bn(conf.n, 16);
	  this.g = conf.g && this.pointFromJSON(conf.g, conf.gRed);

	  // Temporary arrays
	  this._wnafT1 = new Array(4);
	  this._wnafT2 = new Array(4);
	  this._wnafT3 = new Array(4);
	  this._wnafT4 = new Array(4);
	}
	module.exports = BaseCurve;

	BaseCurve.prototype.point = function point() {
	  throw new Error('Not implemented');
	};

	BaseCurve.prototype.validate = function validate() {
	  throw new Error('Not implemented');
	};

	BaseCurve.prototype._fixedNafMul = function _fixedNafMul(p, k) {
	  var doubles = p._getDoubles();

	  var naf = getNAF(k, 1);
	  var I = (1 << (doubles.step + 1)) - (doubles.step % 2 === 0 ? 2 : 1);
	  I /= 3;

	  // Translate into more windowed form
	  var repr = [];
	  for (var j = 0; j < naf.length; j += doubles.step) {
	    var nafW = 0;
	    for (var k = j + doubles.step - 1; k >= j; k--)
	      nafW = (nafW << 1) + naf[k];
	    repr.push(nafW);
	  }

	  var a = this.jpoint(null, null, null);
	  var b = this.jpoint(null, null, null);
	  for (var i = I; i > 0; i--) {
	    for (var j = 0; j < repr.length; j++) {
	      var nafW = repr[j];
	      if (nafW === i)
	        b = b.mixedAdd(doubles.points[j]);
	      else if (nafW === -i)
	        b = b.mixedAdd(doubles.points[j].neg());
	    }
	    a = a.add(b);
	  }
	  return a.toP();
	};

	BaseCurve.prototype._wnafMul = function _wnafMul(p, k) {
	  var w = 4;

	  // Precompute window
	  var nafPoints = p._getNAFPoints(w);
	  w = nafPoints.wnd;
	  var wnd = nafPoints.points;

	  // Get NAF form
	  var naf = getNAF(k, w);

	  // Add `this`*(N+1) for every w-NAF index
	  var acc = this.jpoint(null, null, null);
	  for (var i = naf.length - 1; i >= 0; i--) {
	    // Count zeroes
	    for (var k = 0; i >= 0 && naf[i] === 0; i--)
	      k++;
	    if (i >= 0)
	      k++;
	    acc = acc.dblp(k);

	    if (i < 0)
	      break;
	    var z = naf[i];
	    assert(z !== 0);
	    if (p.type === 'affine') {
	      // J +- P
	      if (z > 0)
	        acc = acc.mixedAdd(wnd[(z - 1) >> 1]);
	      else
	        acc = acc.mixedAdd(wnd[(-z - 1) >> 1].neg());
	    } else {
	      // J +- J
	      if (z > 0)
	        acc = acc.add(wnd[(z - 1) >> 1]);
	      else
	        acc = acc.add(wnd[(-z - 1) >> 1].neg());
	    }
	  }
	  return p.type === 'affine' ? acc.toP() : acc;
	};

	BaseCurve.prototype._wnafMulAdd = function _wnafMulAdd(defW,
	                                                       points,
	                                                       coeffs,
	                                                       len) {
	  var wndWidth = this._wnafT1;
	  var wnd = this._wnafT2;
	  var naf = this._wnafT3;

	  // Fill all arrays
	  var max = 0;
	  for (var i = 0; i < len; i++) {
	    var p = points[i];
	    var nafPoints = p._getNAFPoints(defW);
	    wndWidth[i] = nafPoints.wnd;
	    wnd[i] = nafPoints.points;
	  }

	  // Comb small window NAFs
	  for (var i = len - 1; i >= 1; i -= 2) {
	    var a = i - 1;
	    var b = i;
	    if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
	      naf[a] = getNAF(coeffs[a], wndWidth[a]);
	      naf[b] = getNAF(coeffs[b], wndWidth[b]);
	      max = Math.max(naf[a].length, max);
	      max = Math.max(naf[b].length, max);
	      continue;
	    }

	    var comb = [
	      points[a], /* 1 */
	      null, /* 3 */
	      null, /* 5 */
	      points[b] /* 7 */
	    ];

	    // Try to avoid Projective points, if possible
	    if (points[a].y.cmp(points[b].y) === 0) {
	      comb[1] = points[a].add(points[b]);
	      comb[2] = points[a].toJ().mixedAdd(points[b].neg());
	    } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
	      comb[1] = points[a].toJ().mixedAdd(points[b]);
	      comb[2] = points[a].add(points[b].neg());
	    } else {
	      comb[1] = points[a].toJ().mixedAdd(points[b]);
	      comb[2] = points[a].toJ().mixedAdd(points[b].neg());
	    }

	    var index = [
	      -3, /* -1 -1 */
	      -1, /* -1 0 */
	      -5, /* -1 1 */
	      -7, /* 0 -1 */
	      0, /* 0 0 */
	      7, /* 0 1 */
	      5, /* 1 -1 */
	      1, /* 1 0 */
	      3  /* 1 1 */
	    ];

	    var jsf = getJSF(coeffs[a], coeffs[b]);
	    max = Math.max(jsf[0].length, max);
	    naf[a] = new Array(max);
	    naf[b] = new Array(max);
	    for (var j = 0; j < max; j++) {
	      var ja = jsf[0][j] | 0;
	      var jb = jsf[1][j] | 0;

	      naf[a][j] = index[(ja + 1) * 3 + (jb + 1)];
	      naf[b][j] = 0;
	      wnd[a] = comb;
	    }
	  }

	  var acc = this.jpoint(null, null, null);
	  var tmp = this._wnafT4;
	  for (var i = max; i >= 0; i--) {
	    var k = 0;

	    while (i >= 0) {
	      var zero = true;
	      for (var j = 0; j < len; j++) {
	        tmp[j] = naf[j][i] | 0;
	        if (tmp[j] !== 0)
	          zero = false;
	      }
	      if (!zero)
	        break;
	      k++;
	      i--;
	    }
	    if (i >= 0)
	      k++;
	    acc = acc.dblp(k);
	    if (i < 0)
	      break;

	    for (var j = 0; j < len; j++) {
	      var z = tmp[j];
	      var p;
	      if (z === 0)
	        continue;
	      else if (z > 0)
	        p = wnd[j][(z - 1) >> 1];
	      else if (z < 0)
	        p = wnd[j][(-z - 1) >> 1].neg();

	      if (p.type === 'affine')
	        acc = acc.mixedAdd(p);
	      else
	        acc = acc.add(p);
	    }
	  }
	  // Zeroify references
	  for (var i = 0; i < len; i++)
	    wnd[i] = null;
	  return acc.toP();
	};

	function BasePoint(curve, type) {
	  this.curve = curve;
	  this.type = type;
	  this.precomputed = null;
	}
	BaseCurve.BasePoint = BasePoint;

	BasePoint.prototype.validate = function validate() {
	  return this.curve.validate(this);
	};

	BasePoint.prototype.precompute = function precompute(power) {
	  if (this.precomputed)
	    return this;

	  var precomputed = {
	    doubles: null,
	    naf: null,
	    beta: null
	  };
	  precomputed.naf = this._getNAFPoints(8);
	  precomputed.doubles = this._getDoubles(4, power);
	  precomputed.beta = this._getBeta();
	  this.precomputed = precomputed;

	  return this;
	};

	BasePoint.prototype._getDoubles = function _getDoubles(step, power) {
	  if (this.precomputed && this.precomputed.doubles)
	    return this.precomputed.doubles;

	  var doubles = [ this ];
	  var acc = this;
	  for (var i = 0; i < power; i += step) {
	    for (var j = 0; j < step; j++)
	      acc = acc.dbl();
	    doubles.push(acc);
	  }
	  return {
	    step: step,
	    points: doubles
	  };
	};

	BasePoint.prototype._getNAFPoints = function _getNAFPoints(wnd) {
	  if (this.precomputed && this.precomputed.naf)
	    return this.precomputed.naf;

	  var res = [ this ];
	  var max = (1 << wnd) - 1;
	  var dbl = max === 1 ? null : this.dbl();
	  for (var i = 1; i < max; i++)
	    res[i] = res[i - 1].add(dbl);
	  return {
	    wnd: wnd,
	    points: res
	  };
	};

	BasePoint.prototype._getBeta = function _getBeta() {
	  return null;
	};

	BasePoint.prototype.dblp = function dblp(k) {
	  var r = this;
	  for (var i = 0; i < k; i++)
	    r = r.dbl();
	  return r;
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {(function (module, exports) {

	'use strict';

	// Utils

	function assert(val, msg) {
	  if (!val)
	    throw new Error(msg || 'Assertion failed');
	}

	// Could use `inherits` module, but don't want to move from single file
	// architecture yet.
	function inherits(ctor, superCtor) {
	  ctor.super_ = superCtor;
	  var TempCtor = function () {};
	  TempCtor.prototype = superCtor.prototype;
	  ctor.prototype = new TempCtor();
	  ctor.prototype.constructor = ctor;
	}

	// BN

	function BN(number, base, endian) {
	  // May be `new BN(bn)` ?
	  if (number !== null &&
	      typeof number === 'object' &&
	      Array.isArray(number.words)) {
	    return number;
	  }

	  this.sign = false;
	  this.words = null;
	  this.length = 0;

	  // Reduction context
	  this.red = null;

	  if (base === 'le' || base === 'be') {
	    endian = base;
	    base = 10;
	  }

	  if (number !== null)
	    this._init(number || 0, base || 10, endian || 'be');
	}
	if (typeof module === 'object')
	  module.exports = BN;
	else
	  exports.BN = BN;

	BN.BN = BN;
	BN.wordSize = 26;

	BN.prototype._init = function init(number, base, endian) {
	  if (typeof number === 'number') {
	    if (number < 0) {
	      this.sign = true;
	      number = -number;
	    }
	    if (number < 0x4000000) {
	      this.words = [ number & 0x3ffffff ];
	      this.length = 1;
	    } else if (number < 0x10000000000000) {
	      this.words = [
	        number & 0x3ffffff,
	        (number / 0x4000000) & 0x3ffffff
	      ];
	      this.length = 2;
	    } else {
	      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
	      this.words = [
	        number & 0x3ffffff,
	        (number / 0x4000000) & 0x3ffffff,
	        1
	      ];
	      this.length = 3;
	    }
	    return;
	  } else if (typeof number === 'object') {
	    return this._initArray(number, base, endian);
	  }
	  if (base === 'hex')
	    base = 16;
	  assert(base === (base | 0) && base >= 2 && base <= 36);

	  number = number.toString().replace(/\s+/g, '');
	  var start = 0;
	  if (number[0] === '-')
	    start++;

	  if (base === 16)
	    this._parseHex(number, start);
	  else
	    this._parseBase(number, base, start);

	  if (number[0] === '-')
	    this.sign = true;

	  this.strip();
	};

	BN.prototype._initArray = function _initArray(number, base, endian) {
	  // Perhaps a Uint8Array
	  assert(typeof number.length === 'number');
	  if (number.length <= 0) {
	    this.words = [ 0 ];
	    this.length = 1;
	    return this;
	  }

	  this.length = Math.ceil(number.length / 3);
	  this.words = new Array(this.length);
	  for (var i = 0; i < this.length; i++)
	    this.words[i] = 0;

	  var off = 0;
	  if (endian === 'be') {
	    for (var i = number.length - 1, j = 0; i >= 0; i -= 3) {
	      var w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
	      this.words[j] |= (w << off) & 0x3ffffff;
	      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
	      off += 24;
	      if (off >= 26) {
	        off -= 26;
	        j++;
	      }
	    }
	  } else if (endian === 'le') {
	    for (var i = 0, j = 0; i < number.length; i += 3) {
	      var w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
	      this.words[j] |= (w << off) & 0x3ffffff;
	      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
	      off += 24;
	      if (off >= 26) {
	        off -= 26;
	        j++;
	      }
	    }
	  }
	  return this.strip();
	};

	function parseHex(str, start, end) {
	  var r = 0;
	  var len = Math.min(str.length, end);
	  for (var i = start; i < len; i++) {
	    var c = str.charCodeAt(i) - 48;

	    r <<= 4;

	    // 'a' - 'f'
	    if (c >= 49 && c <= 54)
	      r |= c - 49 + 0xa;

	    // 'A' - 'F'
	    else if (c >= 17 && c <= 22)
	      r |= c - 17 + 0xa;

	    // '0' - '9'
	    else
	      r |= c & 0xf;
	  }
	  return r;
	}

	BN.prototype._parseHex = function _parseHex(number, start) {
	  // Create possibly bigger array to ensure that it fits the number
	  this.length = Math.ceil((number.length - start) / 6);
	  this.words = new Array(this.length);
	  for (var i = 0; i < this.length; i++)
	    this.words[i] = 0;

	  // Scan 24-bit chunks and add them to the number
	  var off = 0;
	  for (var i = number.length - 6, j = 0; i >= start; i -= 6) {
	    var w = parseHex(number, i, i + 6);
	    this.words[j] |= (w << off) & 0x3ffffff;
	    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
	    off += 24;
	    if (off >= 26) {
	      off -= 26;
	      j++;
	    }
	  }
	  if (i + 6 !== start) {
	    var w = parseHex(number, start, i + 6);
	    this.words[j] |= (w << off) & 0x3ffffff;
	    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
	  }
	  this.strip();
	};

	function parseBase(str, start, end, mul) {
	  var r = 0;
	  var len = Math.min(str.length, end);
	  for (var i = start; i < len; i++) {
	    var c = str.charCodeAt(i) - 48;

	    r *= mul;

	    // 'a'
	    if (c >= 49)
	      r += c - 49 + 0xa;

	    // 'A'
	    else if (c >= 17)
	      r += c - 17 + 0xa;

	    // '0' - '9'
	    else
	      r += c;
	  }
	  return r;
	}

	BN.prototype._parseBase = function _parseBase(number, base, start) {
	  // Initialize as zero
	  this.words = [ 0 ];
	  this.length = 1;

	  // Find length of limb in base
	  for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base)
	    limbLen++;
	  limbLen--;
	  limbPow = (limbPow / base) | 0;

	  var total = number.length - start;
	  var mod = total % limbLen;
	  var end = Math.min(total, total - mod) + start;

	  var word = 0;
	  for (var i = start; i < end; i += limbLen) {
	    word = parseBase(number, i, i + limbLen, base);

	    this.imuln(limbPow);
	    if (this.words[0] + word < 0x4000000)
	      this.words[0] += word;
	    else
	      this._iaddn(word);
	  }

	  if (mod !== 0) {
	    var pow = 1;
	    var word = parseBase(number, i, number.length, base);

	    for (var i = 0; i < mod; i++)
	      pow *= base;
	    this.imuln(pow);
	    if (this.words[0] + word < 0x4000000)
	      this.words[0] += word;
	    else
	      this._iaddn(word);
	  }
	};

	BN.prototype.copy = function copy(dest) {
	  dest.words = new Array(this.length);
	  for (var i = 0; i < this.length; i++)
	    dest.words[i] = this.words[i];
	  dest.length = this.length;
	  dest.sign = this.sign;
	  dest.red = this.red;
	};

	BN.prototype.clone = function clone() {
	  var r = new BN(null);
	  this.copy(r);
	  return r;
	};

	// Remove leading `0` from `this`
	BN.prototype.strip = function strip() {
	  while (this.length > 1 && this.words[this.length - 1] === 0)
	    this.length--;
	  return this._normSign();
	};

	BN.prototype._normSign = function _normSign() {
	  // -0 = 0
	  if (this.length === 1 && this.words[0] === 0)
	    this.sign = false;
	  return this;
	};

	BN.prototype.inspect = function inspect() {
	  return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
	};

	/*

	var zeros = [];
	var groupSizes = [];
	var groupBases = [];

	var s = '';
	var i = -1;
	while (++i < BN.wordSize) {
	  zeros[i] = s;
	  s += '0';
	}
	groupSizes[0] = 0;
	groupSizes[1] = 0;
	groupBases[0] = 0;
	groupBases[1] = 0;
	var base = 2 - 1;
	while (++base < 36 + 1) {
	  var groupSize = 0;
	  var groupBase = 1;
	  while (groupBase < (1 << BN.wordSize) / base) {
	    groupBase *= base;
	    groupSize += 1;
	  }
	  groupSizes[base] = groupSize;
	  groupBases[base] = groupBase;
	}

	*/

	var zeros = [
	  '',
	  '0',
	  '00',
	  '000',
	  '0000',
	  '00000',
	  '000000',
	  '0000000',
	  '00000000',
	  '000000000',
	  '0000000000',
	  '00000000000',
	  '000000000000',
	  '0000000000000',
	  '00000000000000',
	  '000000000000000',
	  '0000000000000000',
	  '00000000000000000',
	  '000000000000000000',
	  '0000000000000000000',
	  '00000000000000000000',
	  '000000000000000000000',
	  '0000000000000000000000',
	  '00000000000000000000000',
	  '000000000000000000000000',
	  '0000000000000000000000000'
	];

	var groupSizes = [
	  0, 0,
	  25, 16, 12, 11, 10, 9, 8,
	  8, 7, 7, 7, 7, 6, 6,
	  6, 6, 6, 6, 6, 5, 5,
	  5, 5, 5, 5, 5, 5, 5,
	  5, 5, 5, 5, 5, 5, 5
	];

	var groupBases = [
	  0, 0,
	  33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
	  43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
	  16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
	  6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
	  24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
	];

	BN.prototype.toString = function toString(base, padding) {
	  base = base || 10;
	  if (base === 16 || base === 'hex') {
	    var out = '';
	    var off = 0;
	    var padding = padding | 0 || 1;
	    var carry = 0;
	    for (var i = 0; i < this.length; i++) {
	      var w = this.words[i];
	      var word = (((w << off) | carry) & 0xffffff).toString(16);
	      carry = (w >>> (24 - off)) & 0xffffff;
	      if (carry !== 0 || i !== this.length - 1)
	        out = zeros[6 - word.length] + word + out;
	      else
	        out = word + out;
	      off += 2;
	      if (off >= 26) {
	        off -= 26;
	        i--;
	      }
	    }
	    if (carry !== 0)
	      out = carry.toString(16) + out;
	    while (out.length % padding !== 0)
	      out = '0' + out;
	    if (this.sign)
	      out = '-' + out;
	    return out;
	  } else if (base === (base | 0) && base >= 2 && base <= 36) {
	    // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
	    var groupSize = groupSizes[base];
	    // var groupBase = Math.pow(base, groupSize);
	    var groupBase = groupBases[base];
	    var out = '';
	    var c = this.clone();
	    c.sign = false;
	    while (c.cmpn(0) !== 0) {
	      var r = c.modn(groupBase).toString(base);
	      c = c.idivn(groupBase);

	      if (c.cmpn(0) !== 0)
	        out = zeros[groupSize - r.length] + r + out;
	      else
	        out = r + out;
	    }
	    if (this.cmpn(0) === 0)
	      out = '0' + out;
	    if (this.sign)
	      out = '-' + out;
	    return out;
	  } else {
	    assert(false, 'Base should be between 2 and 36');
	  }
	};

	BN.prototype.toJSON = function toJSON() {
	  return this.toString(16);
	};

	BN.prototype.toArray = function toArray() {
	  this.strip();
	  var res = new Array(this.byteLength());
	  res[0] = 0;

	  var q = this.clone();
	  for (var i = 0; q.cmpn(0) !== 0; i++) {
	    var b = q.andln(0xff);
	    q.ishrn(8);

	    // Assume big-endian
	    res[res.length - i - 1] = b;
	  }

	  return res;
	};

	if (Math.clz32) {
	  BN.prototype._countBits = function _countBits(w) {
	    return 32 - Math.clz32(w);
	  };
	} else {
	  BN.prototype._countBits = function _countBits(w) {
	    var t = w;
	    var r = 0;
	    if (t >= 0x1000) {
	      r += 13;
	      t >>>= 13;
	    }
	    if (t >= 0x40) {
	      r += 7;
	      t >>>= 7;
	    }
	    if (t >= 0x8) {
	      r += 4;
	      t >>>= 4;
	    }
	    if (t >= 0x02) {
	      r += 2;
	      t >>>= 2;
	    }
	    return r + t;
	  };
	}

	BN.prototype._zeroBits = function _zeroBits(w) {
	  // Short-cut
	  if (w === 0)
	    return 26;

	  var t = w;
	  var r = 0;
	  if ((t & 0x1fff) === 0) {
	    r += 13;
	    t >>>= 13;
	  }
	  if ((t & 0x7f) === 0) {
	    r += 7;
	    t >>>= 7;
	  }
	  if ((t & 0xf) === 0) {
	    r += 4;
	    t >>>= 4;
	  }
	  if ((t & 0x3) === 0) {
	    r += 2;
	    t >>>= 2;
	  }
	  if ((t & 0x1) === 0)
	    r++;
	  return r;
	};

	// Return number of used bits in a BN
	BN.prototype.bitLength = function bitLength() {
	  var hi = 0;
	  var w = this.words[this.length - 1];
	  var hi = this._countBits(w);
	  return (this.length - 1) * 26 + hi;
	};

	// Number of trailing zero bits
	BN.prototype.zeroBits = function zeroBits() {
	  if (this.cmpn(0) === 0)
	    return 0;

	  var r = 0;
	  for (var i = 0; i < this.length; i++) {
	    var b = this._zeroBits(this.words[i]);
	    r += b;
	    if (b !== 26)
	      break;
	  }
	  return r;
	};

	BN.prototype.byteLength = function byteLength() {
	  return Math.ceil(this.bitLength() / 8);
	};

	// Return negative clone of `this`
	BN.prototype.neg = function neg() {
	  if (this.cmpn(0) === 0)
	    return this.clone();

	  var r = this.clone();
	  r.sign = !this.sign;
	  return r;
	};


	// Or `num` with `this` in-place
	BN.prototype.ior = function ior(num) {
	  this.sign = this.sign || num.sign;

	  while (this.length < num.length)
	    this.words[this.length++] = 0;

	  for (var i = 0; i < num.length; i++)
	    this.words[i] = this.words[i] | num.words[i];

	  return this.strip();
	};


	// Or `num` with `this`
	BN.prototype.or = function or(num) {
	  if (this.length > num.length)
	    return this.clone().ior(num);
	  else
	    return num.clone().ior(this);
	};


	// And `num` with `this` in-place
	BN.prototype.iand = function iand(num) {
	  this.sign = this.sign && num.sign;

	  // b = min-length(num, this)
	  var b;
	  if (this.length > num.length)
	    b = num;
	  else
	    b = this;

	  for (var i = 0; i < b.length; i++)
	    this.words[i] = this.words[i] & num.words[i];

	  this.length = b.length;

	  return this.strip();
	};


	// And `num` with `this`
	BN.prototype.and = function and(num) {
	  if (this.length > num.length)
	    return this.clone().iand(num);
	  else
	    return num.clone().iand(this);
	};


	// Xor `num` with `this` in-place
	BN.prototype.ixor = function ixor(num) {
	  this.sign = this.sign || num.sign;

	  // a.length > b.length
	  var a;
	  var b;
	  if (this.length > num.length) {
	    a = this;
	    b = num;
	  } else {
	    a = num;
	    b = this;
	  }

	  for (var i = 0; i < b.length; i++)
	    this.words[i] = a.words[i] ^ b.words[i];

	  if (this !== a)
	    for (; i < a.length; i++)
	      this.words[i] = a.words[i];

	  this.length = a.length;

	  return this.strip();
	};


	// Xor `num` with `this`
	BN.prototype.xor = function xor(num) {
	  if (this.length > num.length)
	    return this.clone().ixor(num);
	  else
	    return num.clone().ixor(this);
	};


	// Set `bit` of `this`
	BN.prototype.setn = function setn(bit, val) {
	  assert(typeof bit === 'number' && bit >= 0);

	  var off = (bit / 26) | 0;
	  var wbit = bit % 26;

	  while (this.length <= off)
	    this.words[this.length++] = 0;

	  if (val)
	    this.words[off] = this.words[off] | (1 << wbit);
	  else
	    this.words[off] = this.words[off] & ~(1 << wbit);

	  return this.strip();
	};


	// Add `num` to `this` in-place
	BN.prototype.iadd = function iadd(num) {
	  // negative + positive
	  if (this.sign && !num.sign) {
	    this.sign = false;
	    var r = this.isub(num);
	    this.sign = !this.sign;
	    return this._normSign();

	  // positive + negative
	  } else if (!this.sign && num.sign) {
	    num.sign = false;
	    var r = this.isub(num);
	    num.sign = true;
	    return r._normSign();
	  }

	  // a.length > b.length
	  var a;
	  var b;
	  if (this.length > num.length) {
	    a = this;
	    b = num;
	  } else {
	    a = num;
	    b = this;
	  }

	  var carry = 0;
	  for (var i = 0; i < b.length; i++) {
	    var r = a.words[i] + b.words[i] + carry;
	    this.words[i] = r & 0x3ffffff;
	    carry = r >>> 26;
	  }
	  for (; carry !== 0 && i < a.length; i++) {
	    var r = a.words[i] + carry;
	    this.words[i] = r & 0x3ffffff;
	    carry = r >>> 26;
	  }

	  this.length = a.length;
	  if (carry !== 0) {
	    this.words[this.length] = carry;
	    this.length++;
	  // Copy the rest of the words
	  } else if (a !== this) {
	    for (; i < a.length; i++)
	      this.words[i] = a.words[i];
	  }

	  return this;
	};

	// Add `num` to `this`
	BN.prototype.add = function add(num) {
	  if (num.sign && !this.sign) {
	    num.sign = false;
	    var res = this.sub(num);
	    num.sign = true;
	    return res;
	  } else if (!num.sign && this.sign) {
	    this.sign = false;
	    var res = num.sub(this);
	    this.sign = true;
	    return res;
	  }

	  if (this.length > num.length)
	    return this.clone().iadd(num);
	  else
	    return num.clone().iadd(this);
	};

	// Subtract `num` from `this` in-place
	BN.prototype.isub = function isub(num) {
	  // this - (-num) = this + num
	  if (num.sign) {
	    num.sign = false;
	    var r = this.iadd(num);
	    num.sign = true;
	    return r._normSign();

	  // -this - num = -(this + num)
	  } else if (this.sign) {
	    this.sign = false;
	    this.iadd(num);
	    this.sign = true;
	    return this._normSign();
	  }

	  // At this point both numbers are positive
	  var cmp = this.cmp(num);

	  // Optimization - zeroify
	  if (cmp === 0) {
	    this.sign = false;
	    this.length = 1;
	    this.words[0] = 0;
	    return this;
	  }

	  // a > b
	  var a;
	  var b;
	  if (cmp > 0) {
	    a = this;
	    b = num;
	  } else {
	    a = num;
	    b = this;
	  }

	  var carry = 0;
	  for (var i = 0; i < b.length; i++) {
	    var r = a.words[i] - b.words[i] + carry;
	    carry = r >> 26;
	    this.words[i] = r & 0x3ffffff;
	  }
	  for (; carry !== 0 && i < a.length; i++) {
	    var r = a.words[i] + carry;
	    carry = r >> 26;
	    this.words[i] = r & 0x3ffffff;
	  }

	  // Copy rest of the words
	  if (carry === 0 && i < a.length && a !== this)
	    for (; i < a.length; i++)
	      this.words[i] = a.words[i];
	  this.length = Math.max(this.length, i);

	  if (a !== this)
	    this.sign = true;

	  return this.strip();
	};

	// Subtract `num` from `this`
	BN.prototype.sub = function sub(num) {
	  return this.clone().isub(num);
	};

	/*
	// NOTE: This could be potentionally used to generate loop-less multiplications
	function _genCombMulTo(alen, blen) {
	  var len = alen + blen - 1;
	  var src = [
	    'var a = this.words, b = num.words, o = out.words, c = 0, w, ' +
	        'mask = 0x3ffffff, shift = 0x4000000;',
	    'out.length = ' + len + ';'
	  ];
	  for (var k = 0; k < len; k++) {
	    var minJ = Math.max(0, k - alen + 1);
	    var maxJ = Math.min(k, blen - 1);

	    for (var j = minJ; j <= maxJ; j++) {
	      var i = k - j;
	      var mul = 'a[' + i + '] * b[' + j + ']';

	      if (j === minJ) {
	        src.push('w = ' + mul + ' + c;');
	        src.push('c = (w / shift) | 0;');
	      } else {
	        src.push('w += ' + mul + ';');
	        src.push('c += (w / shift) | 0;');
	      }
	      src.push('w &= mask;');
	    }
	    src.push('o[' + k + '] = w;');
	  }
	  src.push('if (c !== 0) {',
	           '  o[' + k + '] = c;',
	           '  out.length++;',
	           '}',
	           'return out;');

	  return src.join('\n');
	}
	*/

	BN.prototype._smallMulTo = function _smallMulTo(num, out) {
	  out.sign = num.sign !== this.sign;
	  out.length = this.length + num.length;

	  var carry = 0;
	  for (var k = 0; k < out.length - 1; k++) {
	    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	    // note that ncarry could be >= 0x3ffffff
	    var ncarry = carry >>> 26;
	    var rword = carry & 0x3ffffff;
	    var maxJ = Math.min(k, num.length - 1);
	    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
	      var i = k - j;
	      var a = this.words[i] | 0;
	      var b = num.words[j] | 0;
	      var r = a * b;

	      var lo = r & 0x3ffffff;
	      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
	      lo = (lo + rword) | 0;
	      rword = lo & 0x3ffffff;
	      ncarry = (ncarry + (lo >>> 26)) | 0;
	    }
	    out.words[k] = rword;
	    carry = ncarry;
	  }
	  if (carry !== 0) {
	    out.words[k] = carry;
	  } else {
	    out.length--;
	  }

	  return out.strip();
	};

	BN.prototype._bigMulTo = function _bigMulTo(num, out) {
	  out.sign = num.sign !== this.sign;
	  out.length = this.length + num.length;

	  var carry = 0;
	  var hncarry = 0;
	  for (var k = 0; k < out.length - 1; k++) {
	    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	    // note that ncarry could be >= 0x3ffffff
	    var ncarry = hncarry;
	    hncarry = 0;
	    var rword = carry & 0x3ffffff;
	    var maxJ = Math.min(k, num.length - 1);
	    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
	      var i = k - j;
	      var a = this.words[i] | 0;
	      var b = num.words[j] | 0;
	      var r = a * b;

	      var lo = r & 0x3ffffff;
	      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
	      lo = (lo + rword) | 0;
	      rword = lo & 0x3ffffff;
	      ncarry = (ncarry + (lo >>> 26)) | 0;

	      hncarry += ncarry >>> 26;
	      ncarry &= 0x3ffffff;
	    }
	    out.words[k] = rword;
	    carry = ncarry;
	    ncarry = hncarry;
	  }
	  if (carry !== 0) {
	    out.words[k] = carry;
	  } else {
	    out.length--;
	  }

	  return out.strip();
	};

	BN.prototype.mulTo = function mulTo(num, out) {
	  var res;
	  if (this.length + num.length < 63)
	    res = this._smallMulTo(num, out);
	  else
	    res = this._bigMulTo(num, out);
	  return res;
	};

	// Multiply `this` by `num`
	BN.prototype.mul = function mul(num) {
	  var out = new BN(null);
	  out.words = new Array(this.length + num.length);
	  return this.mulTo(num, out);
	};

	// In-place Multiplication
	BN.prototype.imul = function imul(num) {
	  if (this.cmpn(0) === 0 || num.cmpn(0) === 0) {
	    this.words[0] = 0;
	    this.length = 1;
	    return this;
	  }

	  var tlen = this.length;
	  var nlen = num.length;

	  this.sign = num.sign !== this.sign;
	  this.length = this.length + num.length;
	  this.words[this.length - 1] = 0;

	  for (var k = this.length - 2; k >= 0; k--) {
	    // Sum all words with the same `i + j = k` and accumulate `carry`,
	    // note that carry could be >= 0x3ffffff
	    var carry = 0;
	    var rword = 0;
	    var maxJ = Math.min(k, nlen - 1);
	    for (var j = Math.max(0, k - tlen + 1); j <= maxJ; j++) {
	      var i = k - j;
	      var a = this.words[i];
	      var b = num.words[j];
	      var r = a * b;

	      var lo = r & 0x3ffffff;
	      carry += (r / 0x4000000) | 0;
	      lo += rword;
	      rword = lo & 0x3ffffff;
	      carry += lo >>> 26;
	    }
	    this.words[k] = rword;
	    this.words[k + 1] += carry;
	    carry = 0;
	  }

	  // Propagate overflows
	  var carry = 0;
	  for (var i = 1; i < this.length; i++) {
	    var w = this.words[i] + carry;
	    this.words[i] = w & 0x3ffffff;
	    carry = w >>> 26;
	  }

	  return this.strip();
	};

	BN.prototype.imuln = function imuln(num) {
	  assert(typeof num === 'number');

	  // Carry
	  var carry = 0;
	  for (var i = 0; i < this.length; i++) {
	    var w = this.words[i] * num;
	    var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
	    carry >>= 26;
	    carry += (w / 0x4000000) | 0;
	    // NOTE: lo is 27bit maximum
	    carry += lo >>> 26;
	    this.words[i] = lo & 0x3ffffff;
	  }

	  if (carry !== 0) {
	    this.words[i] = carry;
	    this.length++;
	  }

	  return this;
	};

	// `this` * `this`
	BN.prototype.sqr = function sqr() {
	  return this.mul(this);
	};

	// `this` * `this` in-place
	BN.prototype.isqr = function isqr() {
	  return this.mul(this);
	};

	// Shift-left in-place
	BN.prototype.ishln = function ishln(bits) {
	  assert(typeof bits === 'number' && bits >= 0);
	  var r = bits % 26;
	  var s = (bits - r) / 26;
	  var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);

	  if (r !== 0) {
	    var carry = 0;
	    for (var i = 0; i < this.length; i++) {
	      var newCarry = this.words[i] & carryMask;
	      var c = (this.words[i] - newCarry) << r;
	      this.words[i] = c | carry;
	      carry = newCarry >>> (26 - r);
	    }
	    if (carry) {
	      this.words[i] = carry;
	      this.length++;
	    }
	  }

	  if (s !== 0) {
	    for (var i = this.length - 1; i >= 0; i--)
	      this.words[i + s] = this.words[i];
	    for (var i = 0; i < s; i++)
	      this.words[i] = 0;
	    this.length += s;
	  }

	  return this.strip();
	};

	// Shift-right in-place
	// NOTE: `hint` is a lowest bit before trailing zeroes
	// NOTE: if `extended` is present - it will be filled with destroyed bits
	BN.prototype.ishrn = function ishrn(bits, hint, extended) {
	  assert(typeof bits === 'number' && bits >= 0);
	  var h;
	  if (hint)
	    h = (hint - (hint % 26)) / 26;
	  else
	    h = 0;

	  var r = bits % 26;
	  var s = Math.min((bits - r) / 26, this.length);
	  var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
	  var maskedWords = extended;

	  h -= s;
	  h = Math.max(0, h);

	  // Extended mode, copy masked part
	  if (maskedWords) {
	    for (var i = 0; i < s; i++)
	      maskedWords.words[i] = this.words[i];
	    maskedWords.length = s;
	  }

	  if (s === 0) {
	    // No-op, we should not move anything at all
	  } else if (this.length > s) {
	    this.length -= s;
	    for (var i = 0; i < this.length; i++)
	      this.words[i] = this.words[i + s];
	  } else {
	    this.words[0] = 0;
	    this.length = 1;
	  }

	  var carry = 0;
	  for (var i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
	    var word = this.words[i];
	    this.words[i] = (carry << (26 - r)) | (word >>> r);
	    carry = word & mask;
	  }

	  // Push carried bits as a mask
	  if (maskedWords && carry !== 0)
	    maskedWords.words[maskedWords.length++] = carry;

	  if (this.length === 0) {
	    this.words[0] = 0;
	    this.length = 1;
	  }

	  this.strip();

	  return this;
	};

	// Shift-left
	BN.prototype.shln = function shln(bits) {
	  return this.clone().ishln(bits);
	};

	// Shift-right
	BN.prototype.shrn = function shrn(bits) {
	  return this.clone().ishrn(bits);
	};

	// Test if n bit is set
	BN.prototype.testn = function testn(bit) {
	  assert(typeof bit === 'number' && bit >= 0);
	  var r = bit % 26;
	  var s = (bit - r) / 26;
	  var q = 1 << r;

	  // Fast case: bit is much higher than all existing words
	  if (this.length <= s) {
	    return false;
	  }

	  // Check bit and return
	  var w = this.words[s];

	  return !!(w & q);
	};

	// Return only lowers bits of number (in-place)
	BN.prototype.imaskn = function imaskn(bits) {
	  assert(typeof bits === 'number' && bits >= 0);
	  var r = bits % 26;
	  var s = (bits - r) / 26;

	  assert(!this.sign, 'imaskn works only with positive numbers');

	  if (r !== 0)
	    s++;
	  this.length = Math.min(s, this.length);

	  if (r !== 0) {
	    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
	    this.words[this.length - 1] &= mask;
	  }

	  return this.strip();
	};

	// Return only lowers bits of number
	BN.prototype.maskn = function maskn(bits) {
	  return this.clone().imaskn(bits);
	};

	// Add plain number `num` to `this`
	BN.prototype.iaddn = function iaddn(num) {
	  assert(typeof num === 'number');
	  if (num < 0)
	    return this.isubn(-num);

	  // Possible sign change
	  if (this.sign) {
	    if (this.length === 1 && this.words[0] < num) {
	      this.words[0] = num - this.words[0];
	      this.sign = false;
	      return this;
	    }

	    this.sign = false;
	    this.isubn(num);
	    this.sign = true;
	    return this;
	  }

	  // Add without checks
	  return this._iaddn(num);
	};

	BN.prototype._iaddn = function _iaddn(num) {
	  this.words[0] += num;

	  // Carry
	  for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
	    this.words[i] -= 0x4000000;
	    if (i === this.length - 1)
	      this.words[i + 1] = 1;
	    else
	      this.words[i + 1]++;
	  }
	  this.length = Math.max(this.length, i + 1);

	  return this;
	};

	// Subtract plain number `num` from `this`
	BN.prototype.isubn = function isubn(num) {
	  assert(typeof num === 'number');
	  if (num < 0)
	    return this.iaddn(-num);

	  if (this.sign) {
	    this.sign = false;
	    this.iaddn(num);
	    this.sign = true;
	    return this;
	  }

	  this.words[0] -= num;

	  // Carry
	  for (var i = 0; i < this.length && this.words[i] < 0; i++) {
	    this.words[i] += 0x4000000;
	    this.words[i + 1] -= 1;
	  }

	  return this.strip();
	};

	BN.prototype.addn = function addn(num) {
	  return this.clone().iaddn(num);
	};

	BN.prototype.subn = function subn(num) {
	  return this.clone().isubn(num);
	};

	BN.prototype.iabs = function iabs() {
	  this.sign = false;

	  return this;
	};

	BN.prototype.abs = function abs() {
	  return this.clone().iabs();
	};

	BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
	  // Bigger storage is needed
	  var len = num.length + shift;
	  var i;
	  if (this.words.length < len) {
	    var t = new Array(len);
	    for (var i = 0; i < this.length; i++)
	      t[i] = this.words[i];
	    this.words = t;
	  } else {
	    i = this.length;
	  }

	  // Zeroify rest
	  this.length = Math.max(this.length, len);
	  for (; i < this.length; i++)
	    this.words[i] = 0;

	  var carry = 0;
	  for (var i = 0; i < num.length; i++) {
	    var w = this.words[i + shift] + carry;
	    var right = num.words[i] * mul;
	    w -= right & 0x3ffffff;
	    carry = (w >> 26) - ((right / 0x4000000) | 0);
	    this.words[i + shift] = w & 0x3ffffff;
	  }
	  for (; i < this.length - shift; i++) {
	    var w = this.words[i + shift] + carry;
	    carry = w >> 26;
	    this.words[i + shift] = w & 0x3ffffff;
	  }

	  if (carry === 0)
	    return this.strip();

	  // Subtraction overflow
	  assert(carry === -1);
	  carry = 0;
	  for (var i = 0; i < this.length; i++) {
	    var w = -this.words[i] + carry;
	    carry = w >> 26;
	    this.words[i] = w & 0x3ffffff;
	  }
	  this.sign = true;

	  return this.strip();
	};

	BN.prototype._wordDiv = function _wordDiv(num, mode) {
	  var shift = this.length - num.length;

	  var a = this.clone();
	  var b = num;

	  // Normalize
	  var bhi = b.words[b.length - 1];
	  var bhiBits = this._countBits(bhi);
	  shift = 26 - bhiBits;
	  if (shift !== 0) {
	    b = b.shln(shift);
	    a.ishln(shift);
	    bhi = b.words[b.length - 1];
	  }

	  // Initialize quotient
	  var m = a.length - b.length;
	  var q;

	  if (mode !== 'mod') {
	    q = new BN(null);
	    q.length = m + 1;
	    q.words = new Array(q.length);
	    for (var i = 0; i < q.length; i++)
	      q.words[i] = 0;
	  }

	  var diff = a.clone()._ishlnsubmul(b, 1, m);
	  if (!diff.sign) {
	    a = diff;
	    if (q)
	      q.words[m] = 1;
	  }

	  for (var j = m - 1; j >= 0; j--) {
	    var qj = a.words[b.length + j] * 0x4000000 + a.words[b.length + j - 1];

	    // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
	    // (0x7ffffff)
	    qj = Math.min((qj / bhi) | 0, 0x3ffffff);

	    a._ishlnsubmul(b, qj, j);
	    while (a.sign) {
	      qj--;
	      a.sign = false;
	      a._ishlnsubmul(b, 1, j);
	      if (a.cmpn(0) !== 0)
	        a.sign = !a.sign;
	    }
	    if (q)
	      q.words[j] = qj;
	  }
	  if (q)
	    q.strip();
	  a.strip();

	  // Denormalize
	  if (mode !== 'div' && shift !== 0)
	    a.ishrn(shift);
	  return { div: q ? q : null, mod: a };
	};

	BN.prototype.divmod = function divmod(num, mode) {
	  assert(num.cmpn(0) !== 0);

	  if (this.sign && !num.sign) {
	    var res = this.neg().divmod(num, mode);
	    var div;
	    var mod;
	    if (mode !== 'mod')
	      div = res.div.neg();
	    if (mode !== 'div')
	      mod = res.mod.cmpn(0) === 0 ? res.mod : num.sub(res.mod);
	    return {
	      div: div,
	      mod: mod
	    };
	  } else if (!this.sign && num.sign) {
	    var res = this.divmod(num.neg(), mode);
	    var div;
	    if (mode !== 'mod')
	      div = res.div.neg();
	    return { div: div, mod: res.mod };
	  } else if (this.sign && num.sign) {
	    return this.neg().divmod(num.neg(), mode);
	  }

	  // Both numbers are positive at this point

	  // Strip both numbers to approximate shift value
	  if (num.length > this.length || this.cmp(num) < 0)
	    return { div: new BN(0), mod: this };

	  // Very short reduction
	  if (num.length === 1) {
	    if (mode === 'div')
	      return { div: this.divn(num.words[0]), mod: null };
	    else if (mode === 'mod')
	      return { div: null, mod: new BN(this.modn(num.words[0])) };
	    return {
	      div: this.divn(num.words[0]),
	      mod: new BN(this.modn(num.words[0]))
	    };
	  }

	  return this._wordDiv(num, mode);
	};

	// Find `this` / `num`
	BN.prototype.div = function div(num) {
	  return this.divmod(num, 'div').div;
	};

	// Find `this` % `num`
	BN.prototype.mod = function mod(num) {
	  return this.divmod(num, 'mod').mod;
	};

	// Find Round(`this` / `num`)
	BN.prototype.divRound = function divRound(num) {
	  var dm = this.divmod(num);

	  // Fast case - exact division
	  if (dm.mod.cmpn(0) === 0)
	    return dm.div;

	  var mod = dm.div.sign ? dm.mod.isub(num) : dm.mod;

	  var half = num.shrn(1);
	  var r2 = num.andln(1);
	  var cmp = mod.cmp(half);

	  // Round down
	  if (cmp < 0 || r2 === 1 && cmp === 0)
	    return dm.div;

	  // Round up
	  return dm.div.sign ? dm.div.isubn(1) : dm.div.iaddn(1);
	};

	BN.prototype.modn = function modn(num) {
	  assert(num <= 0x3ffffff);
	  var p = (1 << 26) % num;

	  var acc = 0;
	  for (var i = this.length - 1; i >= 0; i--)
	    acc = (p * acc + this.words[i]) % num;

	  return acc;
	};

	// In-place division by number
	BN.prototype.idivn = function idivn(num) {
	  assert(num <= 0x3ffffff);

	  var carry = 0;
	  for (var i = this.length - 1; i >= 0; i--) {
	    var w = this.words[i] + carry * 0x4000000;
	    this.words[i] = (w / num) | 0;
	    carry = w % num;
	  }

	  return this.strip();
	};

	BN.prototype.divn = function divn(num) {
	  return this.clone().idivn(num);
	};

	BN.prototype.egcd = function egcd(p) {
	  assert(!p.sign);
	  assert(p.cmpn(0) !== 0);

	  var x = this;
	  var y = p.clone();

	  if (x.sign)
	    x = x.mod(p);
	  else
	    x = x.clone();

	  // A * x + B * y = x
	  var A = new BN(1);
	  var B = new BN(0);

	  // C * x + D * y = y
	  var C = new BN(0);
	  var D = new BN(1);

	  var g = 0;

	  while (x.isEven() && y.isEven()) {
	    x.ishrn(1);
	    y.ishrn(1);
	    ++g;
	  }

	  var yp = y.clone();
	  var xp = x.clone();

	  while (x.cmpn(0) !== 0) {
	    while (x.isEven()) {
	      x.ishrn(1);
	      if (A.isEven() && B.isEven()) {
	        A.ishrn(1);
	        B.ishrn(1);
	      } else {
	        A.iadd(yp).ishrn(1);
	        B.isub(xp).ishrn(1);
	      }
	    }

	    while (y.isEven()) {
	      y.ishrn(1);
	      if (C.isEven() && D.isEven()) {
	        C.ishrn(1);
	        D.ishrn(1);
	      } else {
	        C.iadd(yp).ishrn(1);
	        D.isub(xp).ishrn(1);
	      }
	    }

	    if (x.cmp(y) >= 0) {
	      x.isub(y);
	      A.isub(C);
	      B.isub(D);
	    } else {
	      y.isub(x);
	      C.isub(A);
	      D.isub(B);
	    }
	  }

	  return {
	    a: C,
	    b: D,
	    gcd: y.ishln(g)
	  };
	};

	// This is reduced incarnation of the binary EEA
	// above, designated to invert members of the
	// _prime_ fields F(p) at a maximal speed
	BN.prototype._invmp = function _invmp(p) {
	  assert(!p.sign);
	  assert(p.cmpn(0) !== 0);

	  var a = this;
	  var b = p.clone();

	  if (a.sign)
	    a = a.mod(p);
	  else
	    a = a.clone();

	  var x1 = new BN(1);
	  var x2 = new BN(0);

	  var delta = b.clone();

	  while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
	    while (a.isEven()) {
	      a.ishrn(1);
	      if (x1.isEven())
	        x1.ishrn(1);
	      else
	        x1.iadd(delta).ishrn(1);
	    }
	    while (b.isEven()) {
	      b.ishrn(1);
	      if (x2.isEven())
	        x2.ishrn(1);
	      else
	        x2.iadd(delta).ishrn(1);
	    }
	    if (a.cmp(b) >= 0) {
	      a.isub(b);
	      x1.isub(x2);
	    } else {
	      b.isub(a);
	      x2.isub(x1);
	    }
	  }
	  if (a.cmpn(1) === 0)
	    return x1;
	  else
	    return x2;
	};

	BN.prototype.gcd = function gcd(num) {
	  if (this.cmpn(0) === 0)
	    return num.clone();
	  if (num.cmpn(0) === 0)
	    return this.clone();

	  var a = this.clone();
	  var b = num.clone();
	  a.sign = false;
	  b.sign = false;

	  // Remove common factor of two
	  for (var shift = 0; a.isEven() && b.isEven(); shift++) {
	    a.ishrn(1);
	    b.ishrn(1);
	  }

	  do {
	    while (a.isEven())
	      a.ishrn(1);
	    while (b.isEven())
	      b.ishrn(1);

	    var r = a.cmp(b);
	    if (r < 0) {
	      // Swap `a` and `b` to make `a` always bigger than `b`
	      var t = a;
	      a = b;
	      b = t;
	    } else if (r === 0 || b.cmpn(1) === 0) {
	      break;
	    }

	    a.isub(b);
	  } while (true);

	  return b.ishln(shift);
	};

	// Invert number in the field F(num)
	BN.prototype.invm = function invm(num) {
	  return this.egcd(num).a.mod(num);
	};

	BN.prototype.isEven = function isEven() {
	  return (this.words[0] & 1) === 0;
	};

	BN.prototype.isOdd = function isOdd() {
	  return (this.words[0] & 1) === 1;
	};

	// And first word and num
	BN.prototype.andln = function andln(num) {
	  return this.words[0] & num;
	};

	// Increment at the bit position in-line
	BN.prototype.bincn = function bincn(bit) {
	  assert(typeof bit === 'number');
	  var r = bit % 26;
	  var s = (bit - r) / 26;
	  var q = 1 << r;

	  // Fast case: bit is much higher than all existing words
	  if (this.length <= s) {
	    for (var i = this.length; i < s + 1; i++)
	      this.words[i] = 0;
	    this.words[s] |= q;
	    this.length = s + 1;
	    return this;
	  }

	  // Add bit and propagate, if needed
	  var carry = q;
	  for (var i = s; carry !== 0 && i < this.length; i++) {
	    var w = this.words[i];
	    w += carry;
	    carry = w >>> 26;
	    w &= 0x3ffffff;
	    this.words[i] = w;
	  }
	  if (carry !== 0) {
	    this.words[i] = carry;
	    this.length++;
	  }
	  return this;
	};

	BN.prototype.cmpn = function cmpn(num) {
	  var sign = num < 0;
	  if (sign)
	    num = -num;

	  if (this.sign && !sign)
	    return -1;
	  else if (!this.sign && sign)
	    return 1;

	  num &= 0x3ffffff;
	  this.strip();

	  var res;
	  if (this.length > 1) {
	    res = 1;
	  } else {
	    var w = this.words[0];
	    res = w === num ? 0 : w < num ? -1 : 1;
	  }
	  if (this.sign)
	    res = -res;
	  return res;
	};

	// Compare two numbers and return:
	// 1 - if `this` > `num`
	// 0 - if `this` == `num`
	// -1 - if `this` < `num`
	BN.prototype.cmp = function cmp(num) {
	  if (this.sign && !num.sign)
	    return -1;
	  else if (!this.sign && num.sign)
	    return 1;

	  var res = this.ucmp(num);
	  if (this.sign)
	    return -res;
	  else
	    return res;
	};

	// Unsigned comparison
	BN.prototype.ucmp = function ucmp(num) {
	  // At this point both numbers have the same sign
	  if (this.length > num.length)
	    return 1;
	  else if (this.length < num.length)
	    return -1;

	  var res = 0;
	  for (var i = this.length - 1; i >= 0; i--) {
	    var a = this.words[i];
	    var b = num.words[i];

	    if (a === b)
	      continue;
	    if (a < b)
	      res = -1;
	    else if (a > b)
	      res = 1;
	    break;
	  }
	  return res;
	};

	//
	// A reduce context, could be using montgomery or something better, depending
	// on the `m` itself.
	//
	BN.red = function red(num) {
	  return new Red(num);
	};

	BN.prototype.toRed = function toRed(ctx) {
	  assert(!this.red, 'Already a number in reduction context');
	  assert(!this.sign, 'red works only with positives');
	  return ctx.convertTo(this)._forceRed(ctx);
	};

	BN.prototype.fromRed = function fromRed() {
	  assert(this.red, 'fromRed works only with numbers in reduction context');
	  return this.red.convertFrom(this);
	};

	BN.prototype._forceRed = function _forceRed(ctx) {
	  this.red = ctx;
	  return this;
	};

	BN.prototype.forceRed = function forceRed(ctx) {
	  assert(!this.red, 'Already a number in reduction context');
	  return this._forceRed(ctx);
	};

	BN.prototype.redAdd = function redAdd(num) {
	  assert(this.red, 'redAdd works only with red numbers');
	  return this.red.add(this, num);
	};

	BN.prototype.redIAdd = function redIAdd(num) {
	  assert(this.red, 'redIAdd works only with red numbers');
	  return this.red.iadd(this, num);
	};

	BN.prototype.redSub = function redSub(num) {
	  assert(this.red, 'redSub works only with red numbers');
	  return this.red.sub(this, num);
	};

	BN.prototype.redISub = function redISub(num) {
	  assert(this.red, 'redISub works only with red numbers');
	  return this.red.isub(this, num);
	};

	BN.prototype.redShl = function redShl(num) {
	  assert(this.red, 'redShl works only with red numbers');
	  return this.red.shl(this, num);
	};

	BN.prototype.redMul = function redMul(num) {
	  assert(this.red, 'redMul works only with red numbers');
	  this.red._verify2(this, num);
	  return this.red.mul(this, num);
	};

	BN.prototype.redIMul = function redIMul(num) {
	  assert(this.red, 'redMul works only with red numbers');
	  this.red._verify2(this, num);
	  return this.red.imul(this, num);
	};

	BN.prototype.redSqr = function redSqr() {
	  assert(this.red, 'redSqr works only with red numbers');
	  this.red._verify1(this);
	  return this.red.sqr(this);
	};

	BN.prototype.redISqr = function redISqr() {
	  assert(this.red, 'redISqr works only with red numbers');
	  this.red._verify1(this);
	  return this.red.isqr(this);
	};

	// Square root over p
	BN.prototype.redSqrt = function redSqrt() {
	  assert(this.red, 'redSqrt works only with red numbers');
	  this.red._verify1(this);
	  return this.red.sqrt(this);
	};

	BN.prototype.redInvm = function redInvm() {
	  assert(this.red, 'redInvm works only with red numbers');
	  this.red._verify1(this);
	  return this.red.invm(this);
	};

	// Return negative clone of `this` % `red modulo`
	BN.prototype.redNeg = function redNeg() {
	  assert(this.red, 'redNeg works only with red numbers');
	  this.red._verify1(this);
	  return this.red.neg(this);
	};

	BN.prototype.redPow = function redPow(num) {
	  assert(this.red && !num.red, 'redPow(normalNum)');
	  this.red._verify1(this);
	  return this.red.pow(this, num);
	};

	// Prime numbers with efficient reduction
	var primes = {
	  k256: null,
	  p224: null,
	  p192: null,
	  p25519: null
	};

	// Pseudo-Mersenne prime
	function MPrime(name, p) {
	  // P = 2 ^ N - K
	  this.name = name;
	  this.p = new BN(p, 16);
	  this.n = this.p.bitLength();
	  this.k = new BN(1).ishln(this.n).isub(this.p);

	  this.tmp = this._tmp();
	}

	MPrime.prototype._tmp = function _tmp() {
	  var tmp = new BN(null);
	  tmp.words = new Array(Math.ceil(this.n / 13));
	  return tmp;
	};

	MPrime.prototype.ireduce = function ireduce(num) {
	  // Assumes that `num` is less than `P^2`
	  // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
	  var r = num;
	  var rlen;

	  do {
	    this.split(r, this.tmp);
	    r = this.imulK(r);
	    r = r.iadd(this.tmp);
	    rlen = r.bitLength();
	  } while (rlen > this.n);

	  var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
	  if (cmp === 0) {
	    r.words[0] = 0;
	    r.length = 1;
	  } else if (cmp > 0) {
	    r.isub(this.p);
	  } else {
	    r.strip();
	  }

	  return r;
	};

	MPrime.prototype.split = function split(input, out) {
	  input.ishrn(this.n, 0, out);
	};

	MPrime.prototype.imulK = function imulK(num) {
	  return num.imul(this.k);
	};

	function K256() {
	  MPrime.call(
	    this,
	    'k256',
	    'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
	}
	inherits(K256, MPrime);

	K256.prototype.split = function split(input, output) {
	  // 256 = 9 * 26 + 22
	  var mask = 0x3fffff;

	  var outLen = Math.min(input.length, 9);
	  for (var i = 0; i < outLen; i++)
	    output.words[i] = input.words[i];
	  output.length = outLen;

	  if (input.length <= 9) {
	    input.words[0] = 0;
	    input.length = 1;
	    return;
	  }

	  // Shift by 9 limbs
	  var prev = input.words[9];
	  output.words[output.length++] = prev & mask;

	  for (var i = 10; i < input.length; i++) {
	    var next = input.words[i];
	    input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
	    prev = next;
	  }
	  input.words[i - 10] = prev >>> 22;
	  input.length -= 9;
	};

	K256.prototype.imulK = function imulK(num) {
	  // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
	  num.words[num.length] = 0;
	  num.words[num.length + 1] = 0;
	  num.length += 2;

	  // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
	  var hi;
	  var lo = 0;
	  for (var i = 0; i < num.length; i++) {
	    var w = num.words[i];
	    hi = w * 0x40;
	    lo += w * 0x3d1;
	    hi += (lo / 0x4000000) | 0;
	    lo &= 0x3ffffff;

	    num.words[i] = lo;

	    lo = hi;
	  }

	  // Fast length reduction
	  if (num.words[num.length - 1] === 0) {
	    num.length--;
	    if (num.words[num.length - 1] === 0)
	      num.length--;
	  }
	  return num;
	};

	function P224() {
	  MPrime.call(
	    this,
	    'p224',
	    'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
	}
	inherits(P224, MPrime);

	function P192() {
	  MPrime.call(
	    this,
	    'p192',
	    'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
	}
	inherits(P192, MPrime);

	function P25519() {
	  // 2 ^ 255 - 19
	  MPrime.call(
	    this,
	    '25519',
	    '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
	}
	inherits(P25519, MPrime);

	P25519.prototype.imulK = function imulK(num) {
	  // K = 0x13
	  var carry = 0;
	  for (var i = 0; i < num.length; i++) {
	    var hi = num.words[i] * 0x13 + carry;
	    var lo = hi & 0x3ffffff;
	    hi >>>= 26;

	    num.words[i] = lo;
	    carry = hi;
	  }
	  if (carry !== 0)
	    num.words[num.length++] = carry;
	  return num;
	};

	// Exported mostly for testing purposes, use plain name instead
	BN._prime = function prime(name) {
	  // Cached version of prime
	  if (primes[name])
	    return primes[name];

	  var prime;
	  if (name === 'k256')
	    prime = new K256();
	  else if (name === 'p224')
	    prime = new P224();
	  else if (name === 'p192')
	    prime = new P192();
	  else if (name === 'p25519')
	    prime = new P25519();
	  else
	    throw new Error('Unknown prime ' + name);
	  primes[name] = prime;

	  return prime;
	};

	//
	// Base reduction engine
	//
	function Red(m) {
	  if (typeof m === 'string') {
	    var prime = BN._prime(m);
	    this.m = prime.p;
	    this.prime = prime;
	  } else {
	    this.m = m;
	    this.prime = null;
	  }
	}

	Red.prototype._verify1 = function _verify1(a) {
	  assert(!a.sign, 'red works only with positives');
	  assert(a.red, 'red works only with red numbers');
	};

	Red.prototype._verify2 = function _verify2(a, b) {
	  assert(!a.sign && !b.sign, 'red works only with positives');
	  assert(a.red && a.red === b.red,
	         'red works only with red numbers');
	};

	Red.prototype.imod = function imod(a) {
	  if (this.prime)
	    return this.prime.ireduce(a)._forceRed(this);
	  return a.mod(this.m)._forceRed(this);
	};

	Red.prototype.neg = function neg(a) {
	  var r = a.clone();
	  r.sign = !r.sign;
	  return r.iadd(this.m)._forceRed(this);
	};

	Red.prototype.add = function add(a, b) {
	  this._verify2(a, b);

	  var res = a.add(b);
	  if (res.cmp(this.m) >= 0)
	    res.isub(this.m);
	  return res._forceRed(this);
	};

	Red.prototype.iadd = function iadd(a, b) {
	  this._verify2(a, b);

	  var res = a.iadd(b);
	  if (res.cmp(this.m) >= 0)
	    res.isub(this.m);
	  return res;
	};

	Red.prototype.sub = function sub(a, b) {
	  this._verify2(a, b);

	  var res = a.sub(b);
	  if (res.cmpn(0) < 0)
	    res.iadd(this.m);
	  return res._forceRed(this);
	};

	Red.prototype.isub = function isub(a, b) {
	  this._verify2(a, b);

	  var res = a.isub(b);
	  if (res.cmpn(0) < 0)
	    res.iadd(this.m);
	  return res;
	};

	Red.prototype.shl = function shl(a, num) {
	  this._verify1(a);
	  return this.imod(a.shln(num));
	};

	Red.prototype.imul = function imul(a, b) {
	  this._verify2(a, b);
	  return this.imod(a.imul(b));
	};

	Red.prototype.mul = function mul(a, b) {
	  this._verify2(a, b);
	  return this.imod(a.mul(b));
	};

	Red.prototype.isqr = function isqr(a) {
	  return this.imul(a, a);
	};

	Red.prototype.sqr = function sqr(a) {
	  return this.mul(a, a);
	};

	Red.prototype.sqrt = function sqrt(a) {
	  if (a.cmpn(0) === 0)
	    return a.clone();

	  var mod3 = this.m.andln(3);
	  assert(mod3 % 2 === 1);

	  // Fast case
	  if (mod3 === 3) {
	    var pow = this.m.add(new BN(1)).ishrn(2);
	    var r = this.pow(a, pow);
	    return r;
	  }

	  // Tonelli-Shanks algorithm (Totally unoptimized and slow)
	  //
	  // Find Q and S, that Q * 2 ^ S = (P - 1)
	  var q = this.m.subn(1);
	  var s = 0;
	  while (q.cmpn(0) !== 0 && q.andln(1) === 0) {
	    s++;
	    q.ishrn(1);
	  }
	  assert(q.cmpn(0) !== 0);

	  var one = new BN(1).toRed(this);
	  var nOne = one.redNeg();

	  // Find quadratic non-residue
	  // NOTE: Max is such because of generalized Riemann hypothesis.
	  var lpow = this.m.subn(1).ishrn(1);
	  var z = this.m.bitLength();
	  z = new BN(2 * z * z).toRed(this);
	  while (this.pow(z, lpow).cmp(nOne) !== 0)
	    z.redIAdd(nOne);

	  var c = this.pow(z, q);
	  var r = this.pow(a, q.addn(1).ishrn(1));
	  var t = this.pow(a, q);
	  var m = s;
	  while (t.cmp(one) !== 0) {
	    var tmp = t;
	    for (var i = 0; tmp.cmp(one) !== 0; i++)
	      tmp = tmp.redSqr();
	    assert(i < m);
	    var b = this.pow(c, new BN(1).ishln(m - i - 1));

	    r = r.redMul(b);
	    c = b.redSqr();
	    t = t.redMul(c);
	    m = i;
	  }

	  return r;
	};

	Red.prototype.invm = function invm(a) {
	  var inv = a._invmp(this.m);
	  if (inv.sign) {
	    inv.sign = false;
	    return this.imod(inv).redNeg();
	  } else {
	    return this.imod(inv);
	  }
	};

	Red.prototype.pow = function pow(a, num) {
	  var w = [];

	  if (num.cmpn(0) === 0)
	    return new BN(1);

	  var q = num.clone();

	  while (q.cmpn(0) !== 0) {
	    w.push(q.andln(1));
	    q.ishrn(1);
	  }

	  // Skip leading zeroes
	  var res = a;
	  for (var i = 0; i < w.length; i++, res = this.sqr(res))
	    if (w[i] !== 0)
	      break;

	  if (++i < w.length) {
	    for (var q = this.sqr(res); i < w.length; i++, q = this.sqr(q)) {
	      if (w[i] === 0)
	        continue;
	      res = this.mul(res, q);
	    }
	  }

	  return res;
	};

	Red.prototype.convertTo = function convertTo(num) {
	  var r = num.mod(this.m);
	  if (r === num)
	    return r.clone();
	  else
	    return r;
	};

	Red.prototype.convertFrom = function convertFrom(num) {
	  var res = num.clone();
	  res.red = null;
	  return res;
	};

	//
	// Montgomery method engine
	//

	BN.mont = function mont(num) {
	  return new Mont(num);
	};

	function Mont(m) {
	  Red.call(this, m);

	  this.shift = this.m.bitLength();
	  if (this.shift % 26 !== 0)
	    this.shift += 26 - (this.shift % 26);
	  this.r = new BN(1).ishln(this.shift);
	  this.r2 = this.imod(this.r.sqr());
	  this.rinv = this.r._invmp(this.m);

	  this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
	  this.minv.sign = true;
	  this.minv = this.minv.mod(this.r);
	}
	inherits(Mont, Red);

	Mont.prototype.convertTo = function convertTo(num) {
	  return this.imod(num.shln(this.shift));
	};

	Mont.prototype.convertFrom = function convertFrom(num) {
	  var r = this.imod(num.mul(this.rinv));
	  r.red = null;
	  return r;
	};

	Mont.prototype.imul = function imul(a, b) {
	  if (a.cmpn(0) === 0 || b.cmpn(0) === 0) {
	    a.words[0] = 0;
	    a.length = 1;
	    return a;
	  }

	  var t = a.imul(b);
	  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	  var u = t.isub(c).ishrn(this.shift);
	  var res = u;
	  if (u.cmp(this.m) >= 0)
	    res = u.isub(this.m);
	  else if (u.cmpn(0) < 0)
	    res = u.iadd(this.m);

	  return res._forceRed(this);
	};

	Mont.prototype.mul = function mul(a, b) {
	  if (a.cmpn(0) === 0 || b.cmpn(0) === 0)
	    return new BN(0)._forceRed(this);

	  var t = a.mul(b);
	  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	  var u = t.isub(c).ishrn(this.shift);
	  var res = u;
	  if (u.cmp(this.m) >= 0)
	    res = u.isub(this.m);
	  else if (u.cmpn(0) < 0)
	    res = u.iadd(this.m);

	  return res._forceRed(this);
	};

	Mont.prototype.invm = function invm(a) {
	  // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
	  var res = this.imod(a._invmp(this.m).mul(this.r2));
	  return res._forceRed(this);
	};

	})(typeof module === 'undefined' || module, this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(49)(module)))

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var curve = __webpack_require__(46);
	var elliptic = __webpack_require__(15);
	var bn = __webpack_require__(48);
	var inherits = __webpack_require__(51);
	var Base = curve.base;

	var assert = elliptic.utils.assert;

	function ShortCurve(conf) {
	  Base.call(this, 'short', conf);

	  this.a = new bn(conf.a, 16).toRed(this.red);
	  this.b = new bn(conf.b, 16).toRed(this.red);
	  this.tinv = this.two.redInvm();

	  this.zeroA = this.a.fromRed().cmpn(0) === 0;
	  this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0;

	  // If the curve is endomorphic, precalculate beta and lambda
	  this.endo = this._getEndomorphism(conf);
	  this._endoWnafT1 = new Array(4);
	  this._endoWnafT2 = new Array(4);
	}
	inherits(ShortCurve, Base);
	module.exports = ShortCurve;

	ShortCurve.prototype._getEndomorphism = function _getEndomorphism(conf) {
	  // No efficient endomorphism
	  if (!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1)
	    return;

	  // Compute beta and lambda, that lambda * P = (beta * Px; Py)
	  var beta;
	  var lambda;
	  if (conf.beta) {
	    beta = new bn(conf.beta, 16).toRed(this.red);
	  } else {
	    var betas = this._getEndoRoots(this.p);
	    // Choose the smallest beta
	    beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1];
	    beta = beta.toRed(this.red);
	  }
	  if (conf.lambda) {
	    lambda = new bn(conf.lambda, 16);
	  } else {
	    // Choose the lambda that is matching selected beta
	    var lambdas = this._getEndoRoots(this.n);
	    if (this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta)) === 0) {
	      lambda = lambdas[0];
	    } else {
	      lambda = lambdas[1];
	      assert(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta)) === 0);
	    }
	  }

	  // Get basis vectors, used for balanced length-two representation
	  var basis;
	  if (conf.basis) {
	    basis = conf.basis.map(function(vec) {
	      return {
	        a: new bn(vec.a, 16),
	        b: new bn(vec.b, 16)
	      };
	    });
	  } else {
	    basis = this._getEndoBasis(lambda);
	  }

	  return {
	    beta: beta,
	    lambda: lambda,
	    basis: basis
	  };
	};

	ShortCurve.prototype._getEndoRoots = function _getEndoRoots(num) {
	  // Find roots of for x^2 + x + 1 in F
	  // Root = (-1 +- Sqrt(-3)) / 2
	  //
	  var red = num === this.p ? this.red : bn.mont(num);
	  var tinv = new bn(2).toRed(red).redInvm();
	  var ntinv = tinv.redNeg();

	  var s = new bn(3).toRed(red).redNeg().redSqrt().redMul(tinv);

	  var l1 = ntinv.redAdd(s).fromRed();
	  var l2 = ntinv.redSub(s).fromRed();
	  return [ l1, l2 ];
	};

	ShortCurve.prototype._getEndoBasis = function _getEndoBasis(lambda) {
	  // aprxSqrt >= sqrt(this.n)
	  var aprxSqrt = this.n.shrn(Math.floor(this.n.bitLength() / 2));

	  // 3.74
	  // Run EGCD, until r(L + 1) < aprxSqrt
	  var u = lambda;
	  var v = this.n.clone();
	  var x1 = new bn(1);
	  var y1 = new bn(0);
	  var x2 = new bn(0);
	  var y2 = new bn(1);

	  // NOTE: all vectors are roots of: a + b * lambda = 0 (mod n)
	  var a0;
	  var b0;
	  // First vector
	  var a1;
	  var b1;
	  // Second vector
	  var a2;
	  var b2;

	  var prevR;
	  var i = 0;
	  var r;
	  var x;
	  while (u.cmpn(0) !== 0) {
	    var q = v.div(u);
	    r = v.sub(q.mul(u));
	    x = x2.sub(q.mul(x1));
	    var y = y2.sub(q.mul(y1));

	    if (!a1 && r.cmp(aprxSqrt) < 0) {
	      a0 = prevR.neg();
	      b0 = x1;
	      a1 = r.neg();
	      b1 = x;
	    } else if (a1 && ++i === 2) {
	      break;
	    }
	    prevR = r;

	    v = u;
	    u = r;
	    x2 = x1;
	    x1 = x;
	    y2 = y1;
	    y1 = y;
	  }
	  a2 = r.neg();
	  b2 = x;

	  var len1 = a1.sqr().add(b1.sqr());
	  var len2 = a2.sqr().add(b2.sqr());
	  if (len2.cmp(len1) >= 0) {
	    a2 = a0;
	    b2 = b0;
	  }

	  // Normalize signs
	  if (a1.sign) {
	    a1 = a1.neg();
	    b1 = b1.neg();
	  }
	  if (a2.sign) {
	    a2 = a2.neg();
	    b2 = b2.neg();
	  }

	  return [
	    { a: a1, b: b1 },
	    { a: a2, b: b2 }
	  ];
	};

	ShortCurve.prototype._endoSplit = function _endoSplit(k) {
	  var basis = this.endo.basis;
	  var v1 = basis[0];
	  var v2 = basis[1];

	  var c1 = v2.b.mul(k).divRound(this.n);
	  var c2 = v1.b.neg().mul(k).divRound(this.n);

	  var p1 = c1.mul(v1.a);
	  var p2 = c2.mul(v2.a);
	  var q1 = c1.mul(v1.b);
	  var q2 = c2.mul(v2.b);

	  // Calculate answer
	  var k1 = k.sub(p1).sub(p2);
	  var k2 = q1.add(q2).neg();
	  return { k1: k1, k2: k2 };
	};

	ShortCurve.prototype.pointFromX = function pointFromX(odd, x) {
	  x = new bn(x, 16);
	  if (!x.red)
	    x = x.toRed(this.red);

	  var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);
	  var y = y2.redSqrt();

	  // XXX Is there any way to tell if the number is odd without converting it
	  // to non-red form?
	  var isOdd = y.fromRed().isOdd();
	  if (odd && !isOdd || !odd && isOdd)
	    y = y.redNeg();

	  return this.point(x, y);
	};

	ShortCurve.prototype.validate = function validate(point) {
	  if (point.inf)
	    return true;

	  var x = point.x;
	  var y = point.y;

	  var ax = this.a.redMul(x);
	  var rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
	  return y.redSqr().redISub(rhs).cmpn(0) === 0;
	};

	ShortCurve.prototype._endoWnafMulAdd =
	    function _endoWnafMulAdd(points, coeffs) {
	  var npoints = this._endoWnafT1;
	  var ncoeffs = this._endoWnafT2;
	  for (var i = 0; i < points.length; i++) {
	    var split = this._endoSplit(coeffs[i]);
	    var p = points[i];
	    var beta = p._getBeta();

	    if (split.k1.sign) {
	      split.k1.sign = !split.k1.sign;
	      p = p.neg(true);
	    }
	    if (split.k2.sign) {
	      split.k2.sign = !split.k2.sign;
	      beta = beta.neg(true);
	    }

	    npoints[i * 2] = p;
	    npoints[i * 2 + 1] = beta;
	    ncoeffs[i * 2] = split.k1;
	    ncoeffs[i * 2 + 1] = split.k2;
	  }
	  var res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2);

	  // Clean-up references to points and coefficients
	  for (var j = 0; j < i * 2; j++) {
	    npoints[j] = null;
	    ncoeffs[j] = null;
	  }
	  return res;
	};

	function Point(curve, x, y, isRed) {
	  Base.BasePoint.call(this, curve, 'affine');
	  if (x === null && y === null) {
	    this.x = null;
	    this.y = null;
	    this.inf = true;
	  } else {
	    this.x = new bn(x, 16);
	    this.y = new bn(y, 16);
	    // Force redgomery representation when loading from JSON
	    if (isRed) {
	      this.x.forceRed(this.curve.red);
	      this.y.forceRed(this.curve.red);
	    }
	    if (!this.x.red)
	      this.x = this.x.toRed(this.curve.red);
	    if (!this.y.red)
	      this.y = this.y.toRed(this.curve.red);
	    this.inf = false;
	  }
	}
	inherits(Point, Base.BasePoint);

	ShortCurve.prototype.point = function point(x, y, isRed) {
	  return new Point(this, x, y, isRed);
	};

	ShortCurve.prototype.pointFromJSON = function pointFromJSON(obj, red) {
	  return Point.fromJSON(this, obj, red);
	};

	Point.prototype._getBeta = function _getBeta() {
	  if (!this.curve.endo)
	    return;

	  var pre = this.precomputed;
	  if (pre && pre.beta)
	    return pre.beta;

	  var beta = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
	  if (pre) {
	    var curve = this.curve;
	    var endoMul = function(p) {
	      return curve.point(p.x.redMul(curve.endo.beta), p.y);
	    };
	    pre.beta = beta;
	    beta.precomputed = {
	      beta: null,
	      naf: pre.naf && {
	        wnd: pre.naf.wnd,
	        points: pre.naf.points.map(endoMul)
	      },
	      doubles: pre.doubles && {
	        step: pre.doubles.step,
	        points: pre.doubles.points.map(endoMul)
	      }
	    };
	  }
	  return beta;
	};

	Point.prototype.toJSON = function toJSON() {
	  if (!this.precomputed)
	    return [ this.x, this.y ];

	  return [ this.x, this.y, this.precomputed && {
	    doubles: this.precomputed.doubles && {
	      step: this.precomputed.doubles.step,
	      points: this.precomputed.doubles.points.slice(1)
	    },
	    naf: this.precomputed.naf && {
	      wnd: this.precomputed.naf.wnd,
	      points: this.precomputed.naf.points.slice(1)
	    }
	  } ];
	};

	Point.fromJSON = function fromJSON(curve, obj, red) {
	  if (typeof obj === 'string')
	    obj = JSON.parse(obj);
	  var res = curve.point(obj[0], obj[1], red);
	  if (!obj[2])
	    return res;

	  function obj2point(obj) {
	    return curve.point(obj[0], obj[1], red);
	  }

	  var pre = obj[2];
	  res.precomputed = {
	    beta: null,
	    doubles: pre.doubles && {
	      step: pre.doubles.step,
	      points: [ res ].concat(pre.doubles.points.map(obj2point))
	    },
	    naf: pre.naf && {
	      wnd: pre.naf.wnd,
	      points: [ res ].concat(pre.naf.points.map(obj2point))
	    }
	  };
	  return res;
	};

	Point.prototype.inspect = function inspect() {
	  if (this.isInfinity())
	    return '<EC Point Infinity>';
	  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
	      ' y: ' + this.y.fromRed().toString(16, 2) + '>';
	};

	Point.prototype.isInfinity = function isInfinity() {
	  return this.inf;
	};

	Point.prototype.add = function add(p) {
	  // O + P = P
	  if (this.inf)
	    return p;

	  // P + O = P
	  if (p.inf)
	    return this;

	  // P + P = 2P
	  if (this.eq(p))
	    return this.dbl();

	  // P + (-P) = O
	  if (this.neg().eq(p))
	    return this.curve.point(null, null);

	  // P + Q = O
	  if (this.x.cmp(p.x) === 0)
	    return this.curve.point(null, null);

	  var c = this.y.redSub(p.y);
	  if (c.cmpn(0) !== 0)
	    c = c.redMul(this.x.redSub(p.x).redInvm());
	  var nx = c.redSqr().redISub(this.x).redISub(p.x);
	  var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
	  return this.curve.point(nx, ny);
	};

	Point.prototype.dbl = function dbl() {
	  if (this.inf)
	    return this;

	  // 2P = O
	  var ys1 = this.y.redAdd(this.y);
	  if (ys1.cmpn(0) === 0)
	    return this.curve.point(null, null);

	  var a = this.curve.a;

	  var x2 = this.x.redSqr();
	  var dyinv = ys1.redInvm();
	  var c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv);

	  var nx = c.redSqr().redISub(this.x.redAdd(this.x));
	  var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
	  return this.curve.point(nx, ny);
	};

	Point.prototype.getX = function getX() {
	  return this.x.fromRed();
	};

	Point.prototype.getY = function getY() {
	  return this.y.fromRed();
	};

	Point.prototype.mul = function mul(k) {
	  k = new bn(k, 16);

	  if (this.precomputed && this.precomputed.doubles)
	    return this.curve._fixedNafMul(this, k);
	  else if (this.curve.endo)
	    return this.curve._endoWnafMulAdd([ this ], [ k ]);
	  else
	    return this.curve._wnafMul(this, k);
	};

	Point.prototype.mulAdd = function mulAdd(k1, p2, k2) {
	  var points = [ this, p2 ];
	  var coeffs = [ k1, k2 ];
	  if (this.curve.endo)
	    return this.curve._endoWnafMulAdd(points, coeffs);
	  else
	    return this.curve._wnafMulAdd(1, points, coeffs, 2);
	};

	Point.prototype.eq = function eq(p) {
	  return this === p ||
	         this.inf === p.inf &&
	             (this.inf || this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0);
	};

	Point.prototype.neg = function neg(_precompute) {
	  if (this.inf)
	    return this;

	  var res = this.curve.point(this.x, this.y.redNeg());
	  if (_precompute && this.precomputed) {
	    var pre = this.precomputed;
	    var negate = function(p) {
	      return p.neg();
	    };
	    res.precomputed = {
	      naf: pre.naf && {
	        wnd: pre.naf.wnd,
	        points: pre.naf.points.map(negate)
	      },
	      doubles: pre.doubles && {
	        step: pre.doubles.step,
	        points: pre.doubles.points.map(negate)
	      }
	    };
	  }
	  return res;
	};

	Point.prototype.toJ = function toJ() {
	  if (this.inf)
	    return this.curve.jpoint(null, null, null);

	  var res = this.curve.jpoint(this.x, this.y, this.curve.one);
	  return res;
	};

	function JPoint(curve, x, y, z) {
	  Base.BasePoint.call(this, curve, 'jacobian');
	  if (x === null && y === null && z === null) {
	    this.x = this.curve.one;
	    this.y = this.curve.one;
	    this.z = new bn(0);
	  } else {
	    this.x = new bn(x, 16);
	    this.y = new bn(y, 16);
	    this.z = new bn(z, 16);
	  }
	  if (!this.x.red)
	    this.x = this.x.toRed(this.curve.red);
	  if (!this.y.red)
	    this.y = this.y.toRed(this.curve.red);
	  if (!this.z.red)
	    this.z = this.z.toRed(this.curve.red);

	  this.zOne = this.z === this.curve.one;
	}
	inherits(JPoint, Base.BasePoint);

	ShortCurve.prototype.jpoint = function jpoint(x, y, z) {
	  return new JPoint(this, x, y, z);
	};

	JPoint.prototype.toP = function toP() {
	  if (this.isInfinity())
	    return this.curve.point(null, null);

	  var zinv = this.z.redInvm();
	  var zinv2 = zinv.redSqr();
	  var ax = this.x.redMul(zinv2);
	  var ay = this.y.redMul(zinv2).redMul(zinv);

	  return this.curve.point(ax, ay);
	};

	JPoint.prototype.neg = function neg() {
	  return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
	};

	JPoint.prototype.add = function add(p) {
	  // O + P = P
	  if (this.isInfinity())
	    return p;

	  // P + O = P
	  if (p.isInfinity())
	    return this;

	  // 12M + 4S + 7A
	  var pz2 = p.z.redSqr();
	  var z2 = this.z.redSqr();
	  var u1 = this.x.redMul(pz2);
	  var u2 = p.x.redMul(z2);
	  var s1 = this.y.redMul(pz2.redMul(p.z));
	  var s2 = p.y.redMul(z2.redMul(this.z));

	  var h = u1.redSub(u2);
	  var r = s1.redSub(s2);
	  if (h.cmpn(0) === 0) {
	    if (r.cmpn(0) !== 0)
	      return this.curve.jpoint(null, null, null);
	    else
	      return this.dbl();
	  }

	  var h2 = h.redSqr();
	  var h3 = h2.redMul(h);
	  var v = u1.redMul(h2);

	  var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
	  var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
	  var nz = this.z.redMul(p.z).redMul(h);

	  return this.curve.jpoint(nx, ny, nz);
	};

	JPoint.prototype.mixedAdd = function mixedAdd(p) {
	  // O + P = P
	  if (this.isInfinity())
	    return p.toJ();

	  // P + O = P
	  if (p.isInfinity())
	    return this;

	  // 8M + 3S + 7A
	  var z2 = this.z.redSqr();
	  var u1 = this.x;
	  var u2 = p.x.redMul(z2);
	  var s1 = this.y;
	  var s2 = p.y.redMul(z2).redMul(this.z);

	  var h = u1.redSub(u2);
	  var r = s1.redSub(s2);
	  if (h.cmpn(0) === 0) {
	    if (r.cmpn(0) !== 0)
	      return this.curve.jpoint(null, null, null);
	    else
	      return this.dbl();
	  }

	  var h2 = h.redSqr();
	  var h3 = h2.redMul(h);
	  var v = u1.redMul(h2);

	  var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
	  var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
	  var nz = this.z.redMul(h);

	  return this.curve.jpoint(nx, ny, nz);
	};

	JPoint.prototype.dblp = function dblp(pow) {
	  if (pow === 0)
	    return this;
	  if (this.isInfinity())
	    return this;
	  if (!pow)
	    return this.dbl();

	  if (this.curve.zeroA || this.curve.threeA) {
	    var r = this;
	    for (var i = 0; i < pow; i++)
	      r = r.dbl();
	    return r;
	  }

	  // 1M + 2S + 1A + N * (4S + 5M + 8A)
	  // N = 1 => 6M + 6S + 9A
	  var a = this.curve.a;
	  var tinv = this.curve.tinv;

	  var jx = this.x;
	  var jy = this.y;
	  var jz = this.z;
	  var jz4 = jz.redSqr().redSqr();

	  // Reuse results
	  var jyd = jy.redAdd(jy);
	  for (var i = 0; i < pow; i++) {
	    var jx2 = jx.redSqr();
	    var jyd2 = jyd.redSqr();
	    var jyd4 = jyd2.redSqr();
	    var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

	    var t1 = jx.redMul(jyd2);
	    var nx = c.redSqr().redISub(t1.redAdd(t1));
	    var t2 = t1.redISub(nx);
	    var dny = c.redMul(t2);
	    dny = dny.redIAdd(dny).redISub(jyd4);
	    var nz = jyd.redMul(jz);
	    if (i + 1 < pow)
	      jz4 = jz4.redMul(jyd4);

	    jx = nx;
	    jz = nz;
	    jyd = dny;
	  }

	  return this.curve.jpoint(jx, jyd.redMul(tinv), jz);
	};

	JPoint.prototype.dbl = function dbl() {
	  if (this.isInfinity())
	    return this;

	  if (this.curve.zeroA)
	    return this._zeroDbl();
	  else if (this.curve.threeA)
	    return this._threeDbl();
	  else
	    return this._dbl();
	};

	JPoint.prototype._zeroDbl = function _zeroDbl() {
	  var nx;
	  var ny;
	  var nz;
	  // Z = 1
	  if (this.zOne) {
	    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
	    //     #doubling-mdbl-2007-bl
	    // 1M + 5S + 14A

	    // XX = X1^2
	    var xx = this.x.redSqr();
	    // YY = Y1^2
	    var yy = this.y.redSqr();
	    // YYYY = YY^2
	    var yyyy = yy.redSqr();
	    // S = 2 * ((X1 + YY)^2 - XX - YYYY)
	    var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
	    s = s.redIAdd(s);
	    // M = 3 * XX + a; a = 0
	    var m = xx.redAdd(xx).redIAdd(xx);
	    // T = M ^ 2 - 2*S
	    var t = m.redSqr().redISub(s).redISub(s);

	    // 8 * YYYY
	    var yyyy8 = yyyy.redIAdd(yyyy);
	    yyyy8 = yyyy8.redIAdd(yyyy8);
	    yyyy8 = yyyy8.redIAdd(yyyy8);

	    // X3 = T
	    nx = t;
	    // Y3 = M * (S - T) - 8 * YYYY
	    ny = m.redMul(s.redISub(t)).redISub(yyyy8);
	    // Z3 = 2*Y1
	    nz = this.y.redAdd(this.y);
	  } else {
	    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
	    //     #doubling-dbl-2009-l
	    // 2M + 5S + 13A

	    // A = X1^2
	    var a = this.x.redSqr();
	    // B = Y1^2
	    var b = this.y.redSqr();
	    // C = B^2
	    var c = b.redSqr();
	    // D = 2 * ((X1 + B)^2 - A - C)
	    var d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
	    d = d.redIAdd(d);
	    // E = 3 * A
	    var e = a.redAdd(a).redIAdd(a);
	    // F = E^2
	    var f = e.redSqr();

	    // 8 * C
	    var c8 = c.redIAdd(c);
	    c8 = c8.redIAdd(c8);
	    c8 = c8.redIAdd(c8);

	    // X3 = F - 2 * D
	    nx = f.redISub(d).redISub(d);
	    // Y3 = E * (D - X3) - 8 * C
	    ny = e.redMul(d.redISub(nx)).redISub(c8);
	    // Z3 = 2 * Y1 * Z1
	    nz = this.y.redMul(this.z);
	    nz = nz.redIAdd(nz);
	  }

	  return this.curve.jpoint(nx, ny, nz);
	};

	JPoint.prototype._threeDbl = function _threeDbl() {
	  var nx;
	  var ny;
	  var nz;
	  // Z = 1
	  if (this.zOne) {
	    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html
	    //     #doubling-mdbl-2007-bl
	    // 1M + 5S + 15A

	    // XX = X1^2
	    var xx = this.x.redSqr();
	    // YY = Y1^2
	    var yy = this.y.redSqr();
	    // YYYY = YY^2
	    var yyyy = yy.redSqr();
	    // S = 2 * ((X1 + YY)^2 - XX - YYYY)
	    var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
	    s = s.redIAdd(s);
	    // M = 3 * XX + a
	    var m = xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a);
	    // T = M^2 - 2 * S
	    var t = m.redSqr().redISub(s).redISub(s);
	    // X3 = T
	    nx = t;
	    // Y3 = M * (S - T) - 8 * YYYY
	    var yyyy8 = yyyy.redIAdd(yyyy);
	    yyyy8 = yyyy8.redIAdd(yyyy8);
	    yyyy8 = yyyy8.redIAdd(yyyy8);
	    ny = m.redMul(s.redISub(t)).redISub(yyyy8);
	    // Z3 = 2 * Y1
	    nz = this.y.redAdd(this.y);
	  } else {
	    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html#doubling-dbl-2001-b
	    // 3M + 5S

	    // delta = Z1^2
	    var delta = this.z.redSqr();
	    // gamma = Y1^2
	    var gamma = this.y.redSqr();
	    // beta = X1 * gamma
	    var beta = this.x.redMul(gamma);
	    // alpha = 3 * (X1 - delta) * (X1 + delta)
	    var alpha = this.x.redSub(delta).redMul(this.x.redAdd(delta));
	    alpha = alpha.redAdd(alpha).redIAdd(alpha);
	    // X3 = alpha^2 - 8 * beta
	    var beta4 = beta.redIAdd(beta);
	    beta4 = beta4.redIAdd(beta4);
	    var beta8 = beta4.redAdd(beta4);
	    nx = alpha.redSqr().redISub(beta8);
	    // Z3 = (Y1 + Z1)^2 - gamma - delta
	    nz = this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);
	    // Y3 = alpha * (4 * beta - X3) - 8 * gamma^2
	    var ggamma8 = gamma.redSqr();
	    ggamma8 = ggamma8.redIAdd(ggamma8);
	    ggamma8 = ggamma8.redIAdd(ggamma8);
	    ggamma8 = ggamma8.redIAdd(ggamma8);
	    ny = alpha.redMul(beta4.redISub(nx)).redISub(ggamma8);
	  }

	  return this.curve.jpoint(nx, ny, nz);
	};

	JPoint.prototype._dbl = function _dbl() {
	  var a = this.curve.a;

	  // 4M + 6S + 10A
	  var jx = this.x;
	  var jy = this.y;
	  var jz = this.z;
	  var jz4 = jz.redSqr().redSqr();

	  var jx2 = jx.redSqr();
	  var jy2 = jy.redSqr();

	  var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

	  var jxd4 = jx.redAdd(jx);
	  jxd4 = jxd4.redIAdd(jxd4);
	  var t1 = jxd4.redMul(jy2);
	  var nx = c.redSqr().redISub(t1.redAdd(t1));
	  var t2 = t1.redISub(nx);

	  var jyd8 = jy2.redSqr();
	  jyd8 = jyd8.redIAdd(jyd8);
	  jyd8 = jyd8.redIAdd(jyd8);
	  jyd8 = jyd8.redIAdd(jyd8);
	  var ny = c.redMul(t2).redISub(jyd8);
	  var nz = jy.redAdd(jy).redMul(jz);

	  return this.curve.jpoint(nx, ny, nz);
	};

	JPoint.prototype.trpl = function trpl() {
	  if (!this.curve.zeroA)
	    return this.dbl().add(this);

	  // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#tripling-tpl-2007-bl
	  // 5M + 10S + ...

	  // XX = X1^2
	  var xx = this.x.redSqr();
	  // YY = Y1^2
	  var yy = this.y.redSqr();
	  // ZZ = Z1^2
	  var zz = this.z.redSqr();
	  // YYYY = YY^2
	  var yyyy = yy.redSqr();
	  // M = 3 * XX + a * ZZ2; a = 0
	  var m = xx.redAdd(xx).redIAdd(xx);
	  // MM = M^2
	  var mm = m.redSqr();
	  // E = 6 * ((X1 + YY)^2 - XX - YYYY) - MM
	  var e = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
	  e = e.redIAdd(e);
	  e = e.redAdd(e).redIAdd(e);
	  e = e.redISub(mm);
	  // EE = E^2
	  var ee = e.redSqr();
	  // T = 16*YYYY
	  var t = yyyy.redIAdd(yyyy);
	  t = t.redIAdd(t);
	  t = t.redIAdd(t);
	  t = t.redIAdd(t);
	  // U = (M + E)^2 - MM - EE - T
	  var u = m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t);
	  // X3 = 4 * (X1 * EE - 4 * YY * U)
	  var yyu4 = yy.redMul(u);
	  yyu4 = yyu4.redIAdd(yyu4);
	  yyu4 = yyu4.redIAdd(yyu4);
	  var nx = this.x.redMul(ee).redISub(yyu4);
	  nx = nx.redIAdd(nx);
	  nx = nx.redIAdd(nx);
	  // Y3 = 8 * Y1 * (U * (T - U) - E * EE)
	  var ny = this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));
	  ny = ny.redIAdd(ny);
	  ny = ny.redIAdd(ny);
	  ny = ny.redIAdd(ny);
	  // Z3 = (Z1 + E)^2 - ZZ - EE
	  var nz = this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);

	  return this.curve.jpoint(nx, ny, nz);
	};

	JPoint.prototype.mul = function mul(k, kbase) {
	  k = new bn(k, kbase);

	  return this.curve._wnafMul(this, k);
	};

	JPoint.prototype.eq = function eq(p) {
	  if (p.type === 'affine')
	    return this.eq(p.toJ());

	  if (this === p)
	    return true;

	  // x1 * z2^2 == x2 * z1^2
	  var z2 = this.z.redSqr();
	  var pz2 = p.z.redSqr();
	  if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0)
	    return false;

	  // y1 * z2^3 == y2 * z1^3
	  var z3 = z2.redMul(this.z);
	  var pz3 = pz2.redMul(p.z);
	  return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
	};

	JPoint.prototype.inspect = function inspect() {
	  if (this.isInfinity())
	    return '<EC JPoint Infinity>';
	  return '<EC JPoint x: ' + this.x.toString(16, 2) +
	      ' y: ' + this.y.toString(16, 2) +
	      ' z: ' + this.z.toString(16, 2) + '>';
	};

	JPoint.prototype.isInfinity = function isInfinity() {
	  // XXX This code assumes that zero is always zero in red
	  return this.z.cmpn(0) === 0;
	};


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var curve = __webpack_require__(46);
	var bn = __webpack_require__(48);
	var inherits = __webpack_require__(51);
	var Base = curve.base;

	function MontCurve(conf) {
	  Base.call(this, 'mont', conf);

	  this.a = new bn(conf.a, 16).toRed(this.red);
	  this.b = new bn(conf.b, 16).toRed(this.red);
	  this.i4 = new bn(4).toRed(this.red).redInvm();
	  this.two = new bn(2).toRed(this.red);
	  this.a24 = this.i4.redMul(this.a.redAdd(this.two));
	}
	inherits(MontCurve, Base);
	module.exports = MontCurve;

	MontCurve.prototype.validate = function validate(point) {
	  var x = point.normalize().x;
	  var x2 = x.redSqr();
	  var rhs = x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x);
	  var y = rhs.redSqrt();

	  return y.redSqr().cmp(rhs) === 0;
	};

	function Point(curve, x, z) {
	  Base.BasePoint.call(this, curve, 'projective');
	  if (x === null && z === null) {
	    this.x = this.curve.one;
	    this.z = this.curve.zero;
	  } else {
	    this.x = new bn(x, 16);
	    this.z = new bn(z, 16);
	    if (!this.x.red)
	      this.x = this.x.toRed(this.curve.red);
	    if (!this.z.red)
	      this.z = this.z.toRed(this.curve.red);
	  }
	}
	inherits(Point, Base.BasePoint);

	MontCurve.prototype.point = function point(x, z) {
	  return new Point(this, x, z);
	};

	MontCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
	  return Point.fromJSON(this, obj);
	};

	Point.prototype.precompute = function precompute() {
	  // No-op
	};

	Point.fromJSON = function fromJSON(curve, obj) {
	  return new Point(curve, obj[0], obj[1] || curve.one);
	};

	Point.prototype.inspect = function inspect() {
	  if (this.isInfinity())
	    return '<EC Point Infinity>';
	  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
	      ' z: ' + this.z.fromRed().toString(16, 2) + '>';
	};

	Point.prototype.isInfinity = function isInfinity() {
	  // XXX This code assumes that zero is always zero in red
	  return this.z.cmpn(0) === 0;
	};

	Point.prototype.dbl = function dbl() {
	  // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#doubling-dbl-1987-m-3
	  // 2M + 2S + 4A

	  // A = X1 + Z1
	  var a = this.x.redAdd(this.z);
	  // AA = A^2
	  var aa = a.redSqr();
	  // B = X1 - Z1
	  var b = this.x.redSub(this.z);
	  // BB = B^2
	  var bb = b.redSqr();
	  // C = AA - BB
	  var c = aa.redSub(bb);
	  // X3 = AA * BB
	  var nx = aa.redMul(bb);
	  // Z3 = C * (BB + A24 * C)
	  var nz = c.redMul(bb.redAdd(this.curve.a24.redMul(c)));
	  return this.curve.point(nx, nz);
	};

	Point.prototype.add = function add() {
	  throw new Error('Not supported on Montgomery curve');
	};

	Point.prototype.diffAdd = function diffAdd(p, diff) {
	  // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#diffadd-dadd-1987-m-3
	  // 4M + 2S + 6A

	  // A = X2 + Z2
	  var a = this.x.redAdd(this.z);
	  // B = X2 - Z2
	  var b = this.x.redSub(this.z);
	  // C = X3 + Z3
	  var c = p.x.redAdd(p.z);
	  // D = X3 - Z3
	  var d = p.x.redSub(p.z);
	  // DA = D * A
	  var da = d.redMul(a);
	  // CB = C * B
	  var cb = c.redMul(b);
	  // X5 = Z1 * (DA + CB)^2
	  var nx = diff.z.redMul(da.redAdd(cb).redSqr());
	  // Z5 = X1 * (DA - CB)^2
	  var nz = diff.x.redMul(da.redISub(cb).redSqr());
	  return this.curve.point(nx, nz);
	};

	Point.prototype.mul = function mul(k) {
	  var t = k.clone();
	  var a = this; // (N / 2) * Q + Q
	  var b = this.curve.point(null, null); // (N / 2) * Q
	  var c = this; // Q

	  for (var bits = []; t.cmpn(0) !== 0; t.ishrn(1))
	    bits.push(t.andln(1));

	  for (var i = bits.length - 1; i >= 0; i--) {
	    if (bits[i] === 0) {
	      // N * Q + Q = ((N / 2) * Q + Q)) + (N / 2) * Q
	      a = a.diffAdd(b, c);
	      // N * Q = 2 * ((N / 2) * Q + Q))
	      b = b.dbl();
	    } else {
	      // N * Q = ((N / 2) * Q + Q) + ((N / 2) * Q)
	      b = a.diffAdd(b, c);
	      // N * Q + Q = 2 * ((N / 2) * Q + Q)
	      a = a.dbl();
	    }
	  }
	  return b;
	};

	Point.prototype.mulAdd = function mulAdd() {
	  throw new Error('Not supported on Montgomery curve');
	};

	Point.prototype.normalize = function normalize() {
	  this.x = this.x.redMul(this.z.redInvm());
	  this.z = this.curve.one;
	  return this;
	};

	Point.prototype.getX = function getX() {
	  // Normalize coordinates
	  this.normalize();

	  return this.x.fromRed();
	};


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var curve = __webpack_require__(46);
	var elliptic = __webpack_require__(15);
	var bn = __webpack_require__(48);
	var inherits = __webpack_require__(51);
	var Base = curve.base;

	var assert = elliptic.utils.assert;

	function EdwardsCurve(conf) {
	  // NOTE: Important as we are creating point in Base.call()
	  this.twisted = (conf.a | 0) !== 1;
	  this.mOneA = this.twisted && (conf.a | 0) === -1;
	  this.extended = this.mOneA;

	  Base.call(this, 'edwards', conf);

	  this.a = new bn(conf.a, 16).mod(this.red.m).toRed(this.red);
	  this.c = new bn(conf.c, 16).toRed(this.red);
	  this.c2 = this.c.redSqr();
	  this.d = new bn(conf.d, 16).toRed(this.red);
	  this.dd = this.d.redAdd(this.d);

	  assert(!this.twisted || this.c.fromRed().cmpn(1) === 0);
	  this.oneC = (conf.c | 0) === 1;
	}
	inherits(EdwardsCurve, Base);
	module.exports = EdwardsCurve;

	EdwardsCurve.prototype._mulA = function _mulA(num) {
	  if (this.mOneA)
	    return num.redNeg();
	  else
	    return this.a.redMul(num);
	};

	EdwardsCurve.prototype._mulC = function _mulC(num) {
	  if (this.oneC)
	    return num;
	  else
	    return this.c.redMul(num);
	};

	// Just for compatibility with Short curve
	EdwardsCurve.prototype.jpoint = function jpoint(x, y, z, t) {
	  return this.point(x, y, z, t);
	};

	EdwardsCurve.prototype.pointFromX = function pointFromX(odd, x) {
	  x = new bn(x, 16);
	  if (!x.red)
	    x = x.toRed(this.red);

	  var x2 = x.redSqr();
	  var rhs = this.c2.redSub(this.a.redMul(x2));
	  var lhs = this.one.redSub(this.c2.redMul(this.d).redMul(x2));

	  var y = rhs.redMul(lhs.redInvm()).redSqrt();
	  var isOdd = y.fromRed().isOdd();
	  if (odd && !isOdd || !odd && isOdd)
	    y = y.redNeg();

	  return this.point(x, y, curve.one);
	};

	EdwardsCurve.prototype.validate = function validate(point) {
	  if (point.isInfinity())
	    return true;

	  // Curve: A * X^2 + Y^2 = C^2 * (1 + D * X^2 * Y^2)
	  point.normalize();

	  var x2 = point.x.redSqr();
	  var y2 = point.y.redSqr();
	  var lhs = x2.redMul(this.a).redAdd(y2);
	  var rhs = this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));

	  return lhs.cmp(rhs) === 0;
	};

	function Point(curve, x, y, z, t) {
	  Base.BasePoint.call(this, curve, 'projective');
	  if (x === null && y === null && z === null) {
	    this.x = this.curve.zero;
	    this.y = this.curve.one;
	    this.z = this.curve.one;
	    this.t = this.curve.zero;
	    this.zOne = true;
	  } else {
	    this.x = new bn(x, 16);
	    this.y = new bn(y, 16);
	    this.z = z ? new bn(z, 16) : this.curve.one;
	    this.t = t && new bn(t, 16);
	    if (!this.x.red)
	      this.x = this.x.toRed(this.curve.red);
	    if (!this.y.red)
	      this.y = this.y.toRed(this.curve.red);
	    if (!this.z.red)
	      this.z = this.z.toRed(this.curve.red);
	    if (this.t && !this.t.red)
	      this.t = this.t.toRed(this.curve.red);
	    this.zOne = this.z === this.curve.one;

	    // Use extended coordinates
	    if (this.curve.extended && !this.t) {
	      this.t = this.x.redMul(this.y);
	      if (!this.zOne)
	        this.t = this.t.redMul(this.z.redInvm());
	    }
	  }
	}
	inherits(Point, Base.BasePoint);

	EdwardsCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
	  return Point.fromJSON(this, obj);
	};

	EdwardsCurve.prototype.point = function point(x, y, z, t) {
	  return new Point(this, x, y, z, t);
	};

	Point.fromJSON = function fromJSON(curve, obj) {
	  return new Point(curve, obj[0], obj[1], obj[2]);
	};

	Point.prototype.inspect = function inspect() {
	  if (this.isInfinity())
	    return '<EC Point Infinity>';
	  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
	      ' y: ' + this.y.fromRed().toString(16, 2) +
	      ' z: ' + this.z.fromRed().toString(16, 2) + '>';
	};

	Point.prototype.isInfinity = function isInfinity() {
	  // XXX This code assumes that zero is always zero in red
	  return this.x.cmpn(0) === 0 &&
	         this.y.cmp(this.z) === 0;
	};

	Point.prototype._extDbl = function _extDbl() {
	  // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
	  //     #doubling-dbl-2008-hwcd
	  // 4M + 4S

	  // A = X1^2
	  var a = this.x.redSqr();
	  // B = Y1^2
	  var b = this.y.redSqr();
	  // C = 2 * Z1^2
	  var c = this.z.redSqr();
	  c = c.redIAdd(c);
	  // D = a * A
	  var d = this.curve._mulA(a);
	  // E = (X1 + Y1)^2 - A - B
	  var e = this.x.redAdd(this.y).redSqr().redISub(a).redISub(b);
	  // G = D + B
	  var g = d.redAdd(b);
	  // F = G - C
	  var f = g.redSub(c);
	  // H = D - B
	  var h = d.redSub(b);
	  // X3 = E * F
	  var nx = e.redMul(f);
	  // Y3 = G * H
	  var ny = g.redMul(h);
	  // T3 = E * H
	  var nt = e.redMul(h);
	  // Z3 = F * G
	  var nz = f.redMul(g);
	  return this.curve.point(nx, ny, nz, nt);
	};

	Point.prototype._projDbl = function _projDbl() {
	  // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
	  //     #doubling-dbl-2008-bbjlp
	  //     #doubling-dbl-2007-bl
	  // and others
	  // Generally 3M + 4S or 2M + 4S

	  // B = (X1 + Y1)^2
	  var b = this.x.redAdd(this.y).redSqr();
	  // C = X1^2
	  var c = this.x.redSqr();
	  // D = Y1^2
	  var d = this.y.redSqr();

	  var nx;
	  var ny;
	  var nz;
	  if (this.curve.twisted) {
	    // E = a * C
	    var e = this.curve._mulA(c);
	    // F = E + D
	    var f = e.redAdd(d);
	    if (this.zOne) {
	      // X3 = (B - C - D) * (F - 2)
	      nx = b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two));
	      // Y3 = F * (E - D)
	      ny = f.redMul(e.redSub(d));
	      // Z3 = F^2 - 2 * F
	      nz = f.redSqr().redSub(f).redSub(f);
	    } else {
	      // H = Z1^2
	      var h = this.z.redSqr();
	      // J = F - 2 * H
	      var j = f.redSub(h).redISub(h);
	      // X3 = (B-C-D)*J
	      nx = b.redSub(c).redISub(d).redMul(j);
	      // Y3 = F * (E - D)
	      ny = f.redMul(e.redSub(d));
	      // Z3 = F * J
	      nz = f.redMul(j);
	    }
	  } else {
	    // E = C + D
	    var e = c.redAdd(d);
	    // H = (c * Z1)^2
	    var h = this.curve._mulC(this.c.redMul(this.z)).redSqr();
	    // J = E - 2 * H
	    var j = e.redSub(h).redSub(h);
	    // X3 = c * (B - E) * J
	    nx = this.curve._mulC(b.redISub(e)).redMul(j);
	    // Y3 = c * E * (C - D)
	    ny = this.curve._mulC(e).redMul(c.redISub(d));
	    // Z3 = E * J
	    nz = e.redMul(j);
	  }
	  return this.curve.point(nx, ny, nz);
	};

	Point.prototype.dbl = function dbl() {
	  if (this.isInfinity())
	    return this;

	  // Double in extended coordinates
	  if (this.curve.extended)
	    return this._extDbl();
	  else
	    return this._projDbl();
	};

	Point.prototype._extAdd = function _extAdd(p) {
	  // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
	  //     #addition-add-2008-hwcd-3
	  // 8M

	  // A = (Y1 - X1) * (Y2 - X2)
	  var a = this.y.redSub(this.x).redMul(p.y.redSub(p.x));
	  // B = (Y1 + X1) * (Y2 + X2)
	  var b = this.y.redAdd(this.x).redMul(p.y.redAdd(p.x));
	  // C = T1 * k * T2
	  var c = this.t.redMul(this.curve.dd).redMul(p.t);
	  // D = Z1 * 2 * Z2
	  var d = this.z.redMul(p.z.redAdd(p.z));
	  // E = B - A
	  var e = b.redSub(a);
	  // F = D - C
	  var f = d.redSub(c);
	  // G = D + C
	  var g = d.redAdd(c);
	  // H = B + A
	  var h = b.redAdd(a);
	  // X3 = E * F
	  var nx = e.redMul(f);
	  // Y3 = G * H
	  var ny = g.redMul(h);
	  // T3 = E * H
	  var nt = e.redMul(h);
	  // Z3 = F * G
	  var nz = f.redMul(g);
	  return this.curve.point(nx, ny, nz, nt);
	};

	Point.prototype._projAdd = function _projAdd(p) {
	  // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
	  //     #addition-add-2008-bbjlp
	  //     #addition-add-2007-bl
	  // 10M + 1S

	  // A = Z1 * Z2
	  var a = this.z.redMul(p.z);
	  // B = A^2
	  var b = a.redSqr();
	  // C = X1 * X2
	  var c = this.x.redMul(p.x);
	  // D = Y1 * Y2
	  var d = this.y.redMul(p.y);
	  // E = d * C * D
	  var e = this.curve.d.redMul(c).redMul(d);
	  // F = B - E
	  var f = b.redSub(e);
	  // G = B + E
	  var g = b.redAdd(e);
	  // X3 = A * F * ((X1 + Y1) * (X2 + Y2) - C - D)
	  var tmp = this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d);
	  var nx = a.redMul(f).redMul(tmp);
	  var ny;
	  var nz;
	  if (this.curve.twisted) {
	    // Y3 = A * G * (D - a * C)
	    ny = a.redMul(g).redMul(d.redSub(this.curve._mulA(c)));
	    // Z3 = F * G
	    nz = f.redMul(g);
	  } else {
	    // Y3 = A * G * (D - C)
	    ny = a.redMul(g).redMul(d.redSub(c));
	    // Z3 = c * F * G
	    nz = this.curve._mulC(f).redMul(g);
	  }
	  return this.curve.point(nx, ny, nz);
	};

	Point.prototype.add = function add(p) {
	  if (this.isInfinity())
	    return p;
	  if (p.isInfinity())
	    return this;

	  if (this.curve.extended)
	    return this._extAdd(p);
	  else
	    return this._projAdd(p);
	};

	Point.prototype.mul = function mul(k) {
	  if (this.precomputed && this.precomputed.doubles)
	    return this.curve._fixedNafMul(this, k);
	  else
	    return this.curve._wnafMul(this, k);
	};

	Point.prototype.mulAdd = function mulAdd(k1, p, k2) {
	  return this.curve._wnafMulAdd(1, [ this, p ], [ k1, k2 ], 2);
	};

	Point.prototype.normalize = function normalize() {
	  if (this.zOne)
	    return this;

	  // Normalize coordinates
	  var zi = this.z.redInvm();
	  this.x = this.x.redMul(zi);
	  this.y = this.y.redMul(zi);
	  if (this.t)
	    this.t = this.t.redMul(zi);
	  this.z = this.curve.one;
	  this.zOne = true;
	  return this;
	};

	Point.prototype.neg = function neg() {
	  return this.curve.point(this.x.redNeg(),
	                          this.y,
	                          this.z,
	                          this.t && this.t.redNeg());
	};

	Point.prototype.getX = function getX() {
	  this.normalize();
	  return this.x.fromRed();
	};

	Point.prototype.getY = function getY() {
	  this.normalize();
	  return this.y.fromRed();
	};

	// Compatibility with BaseCurve
	Point.prototype.toP = Point.prototype.normalize;
	Point.prototype.mixedAdd = Point.prototype.add;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var curves = exports;

	var hash = __webpack_require__(39);
	var elliptic = __webpack_require__(15);

	var assert = elliptic.utils.assert;

	function PresetCurve(options) {
	  if (options.type === 'short')
	    this.curve = new elliptic.curve.short(options);
	  else if (options.type === 'edwards')
	    this.curve = new elliptic.curve.edwards(options);
	  else
	    this.curve = new elliptic.curve.mont(options);
	  this.g = this.curve.g;
	  this.n = this.curve.n;
	  this.hash = options.hash;

	  assert(this.g.validate(), 'Invalid curve');
	  assert(this.g.mul(this.n).isInfinity(), 'Invalid curve, G*N != O');
	}
	curves.PresetCurve = PresetCurve;

	function defineCurve(name, options) {
	  Object.defineProperty(curves, name, {
	    configurable: true,
	    enumerable: true,
	    get: function() {
	      var curve = new PresetCurve(options);
	      Object.defineProperty(curves, name, {
	        configurable: true,
	        enumerable: true,
	        value: curve
	      });
	      return curve;
	    }
	  });
	}

	defineCurve('p192', {
	  type: 'short',
	  prime: 'p192',
	  p: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff',
	  a: 'ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc',
	  b: '64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1',
	  n: 'ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    '188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012',
	    '07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811'
	  ]
	});

	defineCurve('p224', {
	  type: 'short',
	  prime: 'p224',
	  p: 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001',
	  a: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe',
	  b: 'b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4',
	  n: 'ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    'b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21',
	    'bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34'
	  ]
	});

	defineCurve('p256', {
	  type: 'short',
	  prime: null,
	  p: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff',
	  a: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc',
	  b: '5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b',
	  n: 'ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    '6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296',
	    '4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5'
	  ]
	});

	defineCurve('curve25519', {
	  type: 'mont',
	  prime: 'p25519',
	  p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
	  a: '76d06',
	  b: '0',
	  n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    '9'
	  ]
	});

	defineCurve('ed25519', {
	  type: 'edwards',
	  prime: 'p25519',
	  p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
	  a: '-1',
	  c: '1',
	  // -121665 * (121666^(-1)) (mod P)
	  d: '52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3',
	  n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    '216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a',

	    // 4/5
	    '6666666666666666666666666666666666666666666666666666666666666658'
	  ]
	});

	var pre;
	try {
	  pre = __webpack_require__(55);
	} catch (e) {
	  pre = undefined;
	}

	defineCurve('secp256k1', {
	  type: 'short',
	  prime: 'k256',
	  p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f',
	  a: '0',
	  b: '7',
	  n: 'ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141',
	  h: '1',
	  hash: hash.sha256,

	  // Precomputed endomorphism
	  beta: '7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee',
	  lambda: '5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72',
	  basis: [
	    {
	      a: '3086d221a7d46bcde86c90e49284eb15',
	      b: '-e4437ed6010e88286f547fa90abfe4c3'
	    },
	    {
	      a: '114ca50f7a8e2f3f657c1108d9d44cfd8',
	      b: '3086d221a7d46bcde86c90e49284eb15'
	    }
	  ],

	  gRed: false,
	  g: [
	    '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
	    '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',
	    pre
	  ]
	});


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  doubles: {
	    step: 4,
	    points: [
	      [
	        'e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a',
	        'f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821'
	      ],
	      [
	        '8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508',
	        '11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf'
	      ],
	      [
	        '175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739',
	        'd3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695'
	      ],
	      [
	        '363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640',
	        '4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9'
	      ],
	      [
	        '8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c',
	        '4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36'
	      ],
	      [
	        '723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda',
	        '96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f'
	      ],
	      [
	        'eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa',
	        '5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999'
	      ],
	      [
	        '100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0',
	        'cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09'
	      ],
	      [
	        'e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d',
	        '9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d'
	      ],
	      [
	        'feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d',
	        'e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088'
	      ],
	      [
	        'da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1',
	        '9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d'
	      ],
	      [
	        '53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0',
	        '5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8'
	      ],
	      [
	        '8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047',
	        '10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a'
	      ],
	      [
	        '385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862',
	        '283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453'
	      ],
	      [
	        '6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7',
	        '7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160'
	      ],
	      [
	        '3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd',
	        '56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0'
	      ],
	      [
	        '85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83',
	        '7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6'
	      ],
	      [
	        '948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a',
	        '53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589'
	      ],
	      [
	        '6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8',
	        'bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17'
	      ],
	      [
	        'e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d',
	        '4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda'
	      ],
	      [
	        'e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725',
	        '7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd'
	      ],
	      [
	        '213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754',
	        '4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2'
	      ],
	      [
	        '4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c',
	        '17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6'
	      ],
	      [
	        'fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6',
	        '6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f'
	      ],
	      [
	        '76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39',
	        'c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01'
	      ],
	      [
	        'c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891',
	        '893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3'
	      ],
	      [
	        'd895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b',
	        'febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f'
	      ],
	      [
	        'b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03',
	        '2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7'
	      ],
	      [
	        'e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d',
	        'eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78'
	      ],
	      [
	        'a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070',
	        '7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1'
	      ],
	      [
	        '90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4',
	        'e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150'
	      ],
	      [
	        '8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da',
	        '662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82'
	      ],
	      [
	        'e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11',
	        '1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc'
	      ],
	      [
	        '8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e',
	        'efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b'
	      ],
	      [
	        'e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41',
	        '2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51'
	      ],
	      [
	        'b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef',
	        '67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45'
	      ],
	      [
	        'd68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8',
	        'db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120'
	      ],
	      [
	        '324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d',
	        '648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84'
	      ],
	      [
	        '4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96',
	        '35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d'
	      ],
	      [
	        '9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd',
	        'ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d'
	      ],
	      [
	        '6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5',
	        '9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8'
	      ],
	      [
	        'a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266',
	        '40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8'
	      ],
	      [
	        '7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71',
	        '34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac'
	      ],
	      [
	        '928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac',
	        'c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f'
	      ],
	      [
	        '85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751',
	        '1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962'
	      ],
	      [
	        'ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e',
	        '493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907'
	      ],
	      [
	        '827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241',
	        'c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec'
	      ],
	      [
	        'eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3',
	        'be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d'
	      ],
	      [
	        'e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f',
	        '4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414'
	      ],
	      [
	        '1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19',
	        'aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd'
	      ],
	      [
	        '146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be',
	        'b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0'
	      ],
	      [
	        'fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9',
	        '6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811'
	      ],
	      [
	        'da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2',
	        '8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1'
	      ],
	      [
	        'a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13',
	        '7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c'
	      ],
	      [
	        '174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c',
	        'ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73'
	      ],
	      [
	        '959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba',
	        '2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd'
	      ],
	      [
	        'd2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151',
	        'e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405'
	      ],
	      [
	        '64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073',
	        'd99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589'
	      ],
	      [
	        '8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458',
	        '38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e'
	      ],
	      [
	        '13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b',
	        '69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27'
	      ],
	      [
	        'bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366',
	        'd3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1'
	      ],
	      [
	        '8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa',
	        '40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482'
	      ],
	      [
	        '8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0',
	        '620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945'
	      ],
	      [
	        'dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787',
	        '7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573'
	      ],
	      [
	        'f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e',
	        'ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82'
	      ]
	    ]
	  },
	  naf: {
	    wnd: 7,
	    points: [
	      [
	        'f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
	        '388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672'
	      ],
	      [
	        '2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
	        'd8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6'
	      ],
	      [
	        '5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc',
	        '6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da'
	      ],
	      [
	        'acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe',
	        'cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37'
	      ],
	      [
	        '774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
	        'd984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b'
	      ],
	      [
	        'f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8',
	        'ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81'
	      ],
	      [
	        'd7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e',
	        '581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58'
	      ],
	      [
	        'defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34',
	        '4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77'
	      ],
	      [
	        '2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c',
	        '85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a'
	      ],
	      [
	        '352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5',
	        '321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c'
	      ],
	      [
	        '2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f',
	        '2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67'
	      ],
	      [
	        '9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714',
	        '73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402'
	      ],
	      [
	        'daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729',
	        'a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55'
	      ],
	      [
	        'c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db',
	        '2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482'
	      ],
	      [
	        '6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4',
	        'e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82'
	      ],
	      [
	        '1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5',
	        'b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396'
	      ],
	      [
	        '605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479',
	        '2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49'
	      ],
	      [
	        '62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d',
	        '80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf'
	      ],
	      [
	        '80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f',
	        '1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a'
	      ],
	      [
	        '7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb',
	        'd0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7'
	      ],
	      [
	        'd528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9',
	        'eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933'
	      ],
	      [
	        '49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963',
	        '758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a'
	      ],
	      [
	        '77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74',
	        '958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6'
	      ],
	      [
	        'f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530',
	        'e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37'
	      ],
	      [
	        '463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b',
	        '5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e'
	      ],
	      [
	        'f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247',
	        'cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6'
	      ],
	      [
	        'caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1',
	        'cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476'
	      ],
	      [
	        '2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120',
	        '4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40'
	      ],
	      [
	        '7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435',
	        '91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61'
	      ],
	      [
	        '754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18',
	        '673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683'
	      ],
	      [
	        'e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8',
	        '59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5'
	      ],
	      [
	        '186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb',
	        '3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b'
	      ],
	      [
	        'df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f',
	        '55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417'
	      ],
	      [
	        '5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143',
	        'efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868'
	      ],
	      [
	        '290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba',
	        'e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a'
	      ],
	      [
	        'af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45',
	        'f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6'
	      ],
	      [
	        '766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a',
	        '744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996'
	      ],
	      [
	        '59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e',
	        'c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e'
	      ],
	      [
	        'f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8',
	        'e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d'
	      ],
	      [
	        '7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c',
	        '30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2'
	      ],
	      [
	        '948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519',
	        'e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e'
	      ],
	      [
	        '7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab',
	        '100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437'
	      ],
	      [
	        '3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca',
	        'ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311'
	      ],
	      [
	        'd3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf',
	        '8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4'
	      ],
	      [
	        '1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610',
	        '68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575'
	      ],
	      [
	        '733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4',
	        'f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d'
	      ],
	      [
	        '15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c',
	        'd56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d'
	      ],
	      [
	        'a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940',
	        'edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629'
	      ],
	      [
	        'e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980',
	        'a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06'
	      ],
	      [
	        '311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3',
	        '66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374'
	      ],
	      [
	        '34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf',
	        '9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee'
	      ],
	      [
	        'f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63',
	        '4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1'
	      ],
	      [
	        'd7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448',
	        'fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b'
	      ],
	      [
	        '32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf',
	        '5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661'
	      ],
	      [
	        '7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5',
	        '8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6'
	      ],
	      [
	        'ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6',
	        '8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e'
	      ],
	      [
	        '16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5',
	        '5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d'
	      ],
	      [
	        'eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99',
	        'f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc'
	      ],
	      [
	        '78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51',
	        'f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4'
	      ],
	      [
	        '494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5',
	        '42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c'
	      ],
	      [
	        'a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5',
	        '204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b'
	      ],
	      [
	        'c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997',
	        '4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913'
	      ],
	      [
	        '841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881',
	        '73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154'
	      ],
	      [
	        '5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5',
	        '39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865'
	      ],
	      [
	        '36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66',
	        'd2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc'
	      ],
	      [
	        '336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726',
	        'ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224'
	      ],
	      [
	        '8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede',
	        '6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e'
	      ],
	      [
	        '1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94',
	        '60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6'
	      ],
	      [
	        '85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31',
	        '3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511'
	      ],
	      [
	        '29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51',
	        'b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b'
	      ],
	      [
	        'a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252',
	        'ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2'
	      ],
	      [
	        '4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5',
	        'cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c'
	      ],
	      [
	        'd24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b',
	        '6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3'
	      ],
	      [
	        'ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4',
	        '322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d'
	      ],
	      [
	        'af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f',
	        '6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700'
	      ],
	      [
	        'e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889',
	        '2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4'
	      ],
	      [
	        '591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246',
	        'b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196'
	      ],
	      [
	        '11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984',
	        '998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4'
	      ],
	      [
	        '3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a',
	        'b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257'
	      ],
	      [
	        'cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030',
	        'bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13'
	      ],
	      [
	        'c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197',
	        '6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096'
	      ],
	      [
	        'c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593',
	        'c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38'
	      ],
	      [
	        'a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef',
	        '21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f'
	      ],
	      [
	        '347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38',
	        '60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448'
	      ],
	      [
	        'da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a',
	        '49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a'
	      ],
	      [
	        'c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111',
	        '5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4'
	      ],
	      [
	        '4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502',
	        '7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437'
	      ],
	      [
	        '3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea',
	        'be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7'
	      ],
	      [
	        'cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26',
	        '8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d'
	      ],
	      [
	        'b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986',
	        '39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a'
	      ],
	      [
	        'd4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e',
	        '62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54'
	      ],
	      [
	        '48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4',
	        '25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77'
	      ],
	      [
	        'dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda',
	        'ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517'
	      ],
	      [
	        '6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859',
	        'cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10'
	      ],
	      [
	        'e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f',
	        'f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125'
	      ],
	      [
	        'eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c',
	        '6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e'
	      ],
	      [
	        '13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942',
	        'fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1'
	      ],
	      [
	        'ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a',
	        '1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2'
	      ],
	      [
	        'b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80',
	        '5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423'
	      ],
	      [
	        'ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d',
	        '438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8'
	      ],
	      [
	        '8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1',
	        'cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758'
	      ],
	      [
	        '52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63',
	        'c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375'
	      ],
	      [
	        'e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352',
	        '6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d'
	      ],
	      [
	        '7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193',
	        'ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec'
	      ],
	      [
	        '5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00',
	        '9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0'
	      ],
	      [
	        '32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58',
	        'ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c'
	      ],
	      [
	        'e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7',
	        'd3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4'
	      ],
	      [
	        '8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8',
	        'c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f'
	      ],
	      [
	        '4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e',
	        '67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649'
	      ],
	      [
	        '3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d',
	        'cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826'
	      ],
	      [
	        '674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b',
	        '299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5'
	      ],
	      [
	        'd32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f',
	        'f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87'
	      ],
	      [
	        '30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6',
	        '462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b'
	      ],
	      [
	        'be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297',
	        '62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc'
	      ],
	      [
	        '93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a',
	        '7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c'
	      ],
	      [
	        'b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c',
	        'ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f'
	      ],
	      [
	        'd5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52',
	        '4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a'
	      ],
	      [
	        'd3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb',
	        'bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46'
	      ],
	      [
	        '463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065',
	        'bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f'
	      ],
	      [
	        '7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917',
	        '603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03'
	      ],
	      [
	        '74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9',
	        'cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08'
	      ],
	      [
	        '30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3',
	        '553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8'
	      ],
	      [
	        '9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57',
	        '712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373'
	      ],
	      [
	        '176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66',
	        'ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3'
	      ],
	      [
	        '75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8',
	        '9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8'
	      ],
	      [
	        '809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721',
	        '9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1'
	      ],
	      [
	        '1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180',
	        '4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9'
	      ]
	    ]
	  }
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bn = __webpack_require__(48);
	var elliptic = __webpack_require__(15);
	var utils = elliptic.utils;
	var assert = utils.assert;

	var KeyPair = __webpack_require__(57);
	var Signature = __webpack_require__(58);

	function EC(options) {
	  if (!(this instanceof EC))
	    return new EC(options);

	  // Shortcut `elliptic.ec(curve-name)`
	  if (typeof options === 'string') {
	    assert(elliptic.curves.hasOwnProperty(options), 'Unknown curve ' + options);

	    options = elliptic.curves[options];
	  }

	  // Shortcut for `elliptic.ec(elliptic.curves.curveName)`
	  if (options instanceof elliptic.curves.PresetCurve)
	    options = { curve: options };

	  this.curve = options.curve.curve;
	  this.n = this.curve.n;
	  this.nh = this.n.shrn(1);
	  this.g = this.curve.g;

	  // Point on curve
	  this.g = options.curve.g;
	  this.g.precompute(options.curve.n.bitLength() + 1);

	  // Hash for function for DRBG
	  this.hash = options.hash || options.curve.hash;
	}
	module.exports = EC;

	EC.prototype.keyPair = function keyPair(options) {
	  return new KeyPair(this, options);
	};

	EC.prototype.keyFromPrivate = function keyFromPrivate(priv, enc) {
	  return KeyPair.fromPrivate(this, priv, enc);
	};

	EC.prototype.keyFromPublic = function keyFromPublic(pub, enc) {
	  return KeyPair.fromPublic(this, pub, enc);
	};

	EC.prototype.genKeyPair = function genKeyPair(options) {
	  if (!options)
	    options = {};

	  // Instantiate Hmac_DRBG
	  var drbg = new elliptic.hmacDRBG({
	    hash: this.hash,
	    pers: options.pers,
	    entropy: options.entropy || elliptic.rand(this.hash.hmacStrength),
	    nonce: this.n.toArray()
	  });

	  var bytes = this.n.byteLength();
	  var ns2 = this.n.sub(new bn(2));
	  do {
	    var priv = new bn(drbg.generate(bytes));
	    if (priv.cmp(ns2) > 0)
	      continue;

	    priv.iaddn(1);
	    return this.keyFromPrivate(priv);
	  } while (true);
	};

	EC.prototype._truncateToN = function truncateToN(msg, truncOnly) {
	  var delta = msg.byteLength() * 8 - this.n.bitLength();
	  if (delta > 0)
	    msg = msg.shrn(delta);
	  if (!truncOnly && msg.cmp(this.n) >= 0)
	    return msg.sub(this.n);
	  else
	    return msg;
	};

	EC.prototype.sign = function sign(msg, key, enc, options) {
	  if (typeof enc === 'object') {
	    options = enc;
	    enc = null;
	  }
	  if (!options)
	    options = {};

	  key = this.keyFromPrivate(key, enc);
	  msg = this._truncateToN(new bn(msg, 16));

	  // Zero-extend key to provide enough entropy
	  var bytes = this.n.byteLength();
	  var bkey = key.getPrivate().toArray();
	  for (var i = bkey.length; i < 21; i++)
	    bkey.unshift(0);

	  // Zero-extend nonce to have the same byte size as N
	  var nonce = msg.toArray();
	  for (var i = nonce.length; i < bytes; i++)
	    nonce.unshift(0);

	  // Instantiate Hmac_DRBG
	  var drbg = new elliptic.hmacDRBG({
	    hash: this.hash,
	    entropy: bkey,
	    nonce: nonce
	  });

	  // Number of bytes to generate
	  var ns1 = this.n.sub(new bn(1));
	  do {
	    var k = new bn(drbg.generate(this.n.byteLength()));
	    k = this._truncateToN(k, true);
	    if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0)
	      continue;

	    var kp = this.g.mul(k);
	    if (kp.isInfinity())
	      continue;

	    var r = kp.getX().mod(this.n);
	    if (r.cmpn(0) === 0)
	      continue;

	    var s = k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg)).mod(this.n);
	    if (s.cmpn(0) === 0)
	      continue;

	    // Use complement of `s`, if it is > `n / 2`
	    if (options.canonical && s.cmp(this.nh) > 0)
	      s = this.n.sub(s);

	    return new Signature({ r: r, s: s });
	  } while (true);
	};

	EC.prototype.verify = function verify(msg, signature, key, enc) {
	  msg = this._truncateToN(new bn(msg, 16));
	  key = this.keyFromPublic(key, enc);
	  signature = new Signature(signature, 'hex');

	  // Perform primitive values validation
	  var r = signature.r;
	  var s = signature.s;
	  if (r.cmpn(1) < 0 || r.cmp(this.n) >= 0)
	    return false;
	  if (s.cmpn(1) < 0 || s.cmp(this.n) >= 0)
	    return false;

	  // Validate signature
	  var sinv = s.invm(this.n);
	  var u1 = sinv.mul(msg).mod(this.n);
	  var u2 = sinv.mul(r).mod(this.n);

	  var p = this.g.mulAdd(u1, key.getPublic(), u2);
	  if (p.isInfinity())
	    return false;

	  return p.getX().mod(this.n).cmp(r) === 0;
	};


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bn = __webpack_require__(48);

	var elliptic = __webpack_require__(15);
	var utils = elliptic.utils;

	function KeyPair(ec, options) {
	  this.ec = ec;
	  this.priv = null;
	  this.pub = null;

	  // KeyPair(ec, { priv: ..., pub: ... })
	  if (options.priv)
	    this._importPrivate(options.priv, options.privEnc);
	  if (options.pub)
	    this._importPublic(options.pub, options.pubEnc);
	}
	module.exports = KeyPair;

	KeyPair.fromPublic = function fromPublic(ec, pub, enc) {
	  if (pub instanceof KeyPair)
	    return pub;

	  return new KeyPair(ec, {
	    pub: pub,
	    pubEnc: enc
	  });
	};

	KeyPair.fromPrivate = function fromPrivate(ec, priv, enc) {
	  if (priv instanceof KeyPair)
	    return priv;

	  return new KeyPair(ec, {
	    priv: priv,
	    privEnc: enc
	  });
	};

	KeyPair.prototype.validate = function validate() {
	  var pub = this.getPublic();

	  if (pub.isInfinity())
	    return { result: false, reason: 'Invalid public key' };
	  if (!pub.validate())
	    return { result: false, reason: 'Public key is not a point' };
	  if (!pub.mul(this.ec.curve.n).isInfinity())
	    return { result: false, reason: 'Public key * N != O' };

	  return { result: true, reason: null };
	};

	KeyPair.prototype.getPublic = function getPublic(compact, enc) {
	  if (!this.pub)
	    this.pub = this.ec.g.mul(this.priv);

	  // compact is optional argument
	  if (typeof compact === 'string') {
	    enc = compact;
	    compact = null;
	  }

	  if (!enc)
	    return this.pub;

	  var len = this.ec.curve.p.byteLength();
	  var x = this.pub.getX().toArray();

	  for (var i = x.length; i < len; i++)
	    x.unshift(0);

	  var res;
	  if (this.ec.curve.type !== 'mont') {
	    if (compact) {
	      res = [ this.pub.getY().isEven() ? 0x02 : 0x03 ].concat(x);
	    } else {
	      var y = this.pub.getY().toArray();
	      for (var i = y.length; i < len; i++)
	        y.unshift(0);
	      var res = [ 0x04 ].concat(x, y);
	    }
	  } else {
	    res = x;
	  }

	  return utils.encode(res, enc);
	};

	KeyPair.prototype.getPrivate = function getPrivate(enc) {
	  if (enc === 'hex')
	    return this.priv.toString(16, 2);
	  else
	    return this.priv;
	};

	KeyPair.prototype._importPrivate = function _importPrivate(key, enc) {
	  this.priv = new bn(key, enc || 16);

	  // Ensure that the priv won't be bigger than n, otherwise we may fail
	  // in fixed multiplication method
	  this.priv = this.priv.mod(this.ec.curve.n);
	};

	KeyPair.prototype._importPublic = function _importPublic(key, enc) {
	  if (key.x || key.y) {
	    this.pub = this.ec.curve.point(key.x, key.y);
	    return;
	  }

	  key = utils.toArray(key, enc);
	  if (this.ec.curve.type !== 'mont')
	    return this._importPublicShort(key);
	  else
	    return this._importPublicMont(key);
	};

	KeyPair.prototype._importPublicShort = function _importPublicShort(key) {
	  var len = this.ec.curve.p.byteLength();
	  if (key[0] === 0x04 && key.length - 1 === 2 * len) {
	    this.pub = this.ec.curve.point(
	      key.slice(1, 1 + len),
	      key.slice(1 + len, 1 + 2 * len));
	  } else if ((key[0] === 0x02 || key[0] === 0x03) && key.length - 1 === len) {
	    this.pub = this.ec.curve.pointFromX(key[0] === 0x03, key.slice(1, 1 + len));
	  }
	};

	KeyPair.prototype._importPublicMont = function _importPublicMont(key) {
	  this.pub = this.ec.curve.point(key, 1);
	};

	// ECDH
	KeyPair.prototype.derive = function derive(pub) {
	  return pub.mul(this.priv).getX();
	};

	// ECDSA
	KeyPair.prototype.sign = function sign(msg) {
	  return this.ec.sign(msg, this);
	};

	KeyPair.prototype.verify = function verify(msg, signature) {
	  return this.ec.verify(msg, signature, this);
	};

	KeyPair.prototype.inspect = function inspect() {
	  return '<Key priv: ' + (this.priv && this.priv.toString(16, 2)) +
	         ' pub: ' + (this.pub && this.pub.inspect()) + ' >';
	};


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bn = __webpack_require__(48);

	var elliptic = __webpack_require__(15);
	var utils = elliptic.utils;
	var assert = utils.assert;

	function Signature(options, enc) {
	  if (options instanceof Signature)
	    return options;

	  if (this._importDER(options, enc))
	    return;

	  assert(options.r && options.s, 'Signature without r or s');
	  this.r = new bn(options.r, 16);
	  this.s = new bn(options.s, 16);
	}
	module.exports = Signature;

	Signature.prototype._importDER = function _importDER(data, enc) {
	  data = utils.toArray(data, enc);
	  if (data.length < 6 || data[0] !== 0x30 || data[2] !== 0x02)
	    return false;
	  var total = data[1];
	  if (1 + total > data.length)
	    return false;
	  var rlen = data[3];
	  // Short length notation
	  if (rlen >= 0x80)
	    return false;
	  if (4 + rlen + 2 >= data.length)
	    return false;
	  if (data[4 + rlen] !== 0x02)
	    return false;
	  var slen = data[5 + rlen];
	  // Short length notation
	  if (slen >= 0x80)
	    return false;
	  if (4 + rlen + 2 + slen > data.length)
	    return false;

	  this.r = new bn(data.slice(4, 4 + rlen));
	  this.s = new bn(data.slice(4 + rlen + 2, 4 + rlen + 2 + slen));

	  return true;
	};

	Signature.prototype.toDER = function toDER(enc) {
	  var r = this.r.toArray();
	  var s = this.s.toArray();

	  // Pad values
	  if (r[0] & 0x80)
	    r = [ 0 ].concat(r);
	  // Pad values
	  if (s[0] & 0x80)
	    s = [ 0 ].concat(s);

	  var total = r.length + s.length + 4;
	  var res = [ 0x30, total, 0x02, r.length ];
	  res = res.concat(r, [ 0x02, s.length ], s);
	  return utils.encode(res, enc);
	};


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Browser implementation of platform-specific routines.
	 */

	"use strict";

	// `hash.js` is already required by
	// `bitmessage -> eccrypto -> elliptic -> hash.js` so it won't add
	// additional bytes to the bundle.
	// See also: <https://github.com/indutny/elliptic/pull/26>.
	var hash = __webpack_require__(39);
	// Use only one submodule from `sha.js` here and in worker because it's
	// faster. It will add additional bytes to the bundle but not that much
	// (~9KB).
	var Sha512 = __webpack_require__(61);
	var BN = __webpack_require__(48);
	var work = __webpack_require__(60);
	var assert = __webpack_require__(12).assert;

	var cryptoObj = window.crypto || window.msCrypto;

	exports.sha1 = function(buf) {
	  return new Buffer(hash.sha1().update(buf).digest());
	};

	exports.sha256 = function(buf) {
	  return new Buffer(hash.sha256().update(buf).digest());
	};

	exports.sha512 = function(buf) {
	  return new Sha512().update(buf).digest();
	};

	exports.ripemd160 = function(buf) {
	  return new Buffer(hash.ripemd160().update(buf).digest());
	};

	exports.randomBytes = function(size) {
	  var arr = new Uint8Array(size);
	  cryptoObj.getRandomValues(arr);
	  return new Buffer(arr);
	};

	// See `platform.js` for comments.
	var B80 = new BN("1208925819614629174706176");
	exports.getTarget = function(opts) {
	  var length = new BN(opts.payloadLength);
	  length.iaddn(opts.payloadLengthExtraBytes);
	  var denominator = new BN(opts.ttl);
	  denominator.iaddn(65536);
	  denominator.imul(length);
	  denominator.imul(new BN(opts.nonceTrialsPerByte));
	  var target = parseInt(B80.div(denominator).toString(16), 16);
	  assert(target <= 9007199254740991, "Unsafe target");
	  return target;
	};

	var FAILBACK_POOL_SIZE = 8;

	// NOTE(Kagami): We don't use promise shim in Browser implementation
	// because it's supported natively in new browsers (see
	// <http://caniuse.com/#feat=promises>) and we can use only new browsers
	// because of the WebCryptoAPI (see
	// <http://caniuse.com/#feat=cryptography>).
	exports.pow = function(opts) {
	  // Try to get CPU cores count otherwise fallback to default value.
	  // Currenty navigator's concurrency property available in Chrome and
	  // not available in Firefox; hope default value won't slow down POW
	  // speed much on systems with 1 or 2 cores. There are core estimator
	  // libraries exist (see <https://stackoverflow.com/q/3289465>) but
	  // they are buggy. Ulimately library user could adjust pool size
	  // manually.
	  var poolSize = opts.poolSize || navigator.hardwareConcurrency;
	  poolSize = poolSize || FAILBACK_POOL_SIZE;

	  var cancel;
	  var powp = new Promise(function(resolve, reject) {
	    assert(typeof poolSize === "number", "Bad pool size");
	    assert(poolSize >= 1, "Pool size is too low");
	    assert(poolSize <= 1024, "Pool size is too high");
	    assert(typeof opts.target === "number", "Bad target");
	    assert(opts.target >= 0, "Target is too low");
	    assert(opts.target <= 9007199254740991, "Target is too high");
	    assert(Buffer.isBuffer(opts.initialHash), "Bad initial hash");
	    assert(opts.initialHash.length === 64, "Bad initial hash");

	    function terminateAll() {
	      while (workers.length) {
	        workers.shift().terminate();
	      }
	    }

	    function onmessage(e) {
	      terminateAll();
	      if (e.data >= 0) {
	        resolve(e.data);
	      } else {
	        // It's very unlikely that execution will ever reach this place.
	        // Currently the only reason why Worker may return value less
	        // than zero is a 32-bit nonce overflow (see worker
	        // implementation). It's 4G double hashes.
	        reject(new Error("uint32_t nonce overflow"));
	      }
	    }

	    function onerror(e) {
	      // XXX(Kagami): `onerror` events fires in Chrome even after all
	      // workers were terminated. It doesn't cause wrong behaviour but
	      // beware that this function may be executed several times.
	      terminateAll();
	      reject(e);
	    }

	    var workers = [];
	    var worker;
	    for (var i = 0; i < poolSize; i++) {
	      worker = work(__webpack_require__(64));
	      workers.push(worker);
	      // NOTE(Kagami): There is no race condition here. `onmessage` can
	      // only be called _after_ this for-loop finishes. See
	      // <https://stackoverflow.com/a/18192122> for details.
	      worker.onmessage = onmessage;
	      worker.onerror = onerror;
	      worker.postMessage({
	        num: i,
	        poolSize: poolSize,
	        target: opts.target,
	        initialHash: opts.initialHash,
	      });
	    }

	    cancel = function(e) {
	      terminateAll();
	      reject(e);
	    };
	  });
	  // Allow to stop a POW via custom function added to the Promise
	  // instance.
	  powp.cancel = cancel;
	  return powp;
	};

	exports.Promise = window.Promise;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var bundleFn = arguments[3];
	var sources = arguments[4];
	var cache = arguments[5];

	var stringify = JSON.stringify;

	module.exports = function (fn) {
	    var keys = [];
	    var wkey;
	    var cacheKeys = Object.keys(cache);
	    
	    for (var i = 0, l = cacheKeys.length; i < l; i++) {
	        var key = cacheKeys[i];
	        if (cache[key].exports === fn) {
	            wkey = key;
	            break;
	        }
	    }
	    
	    if (!wkey) {
	        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
	        var wcache = {};
	        for (var i = 0, l = cacheKeys.length; i < l; i++) {
	            var key = cacheKeys[i];
	            wcache[key] = key;
	        }
	        sources[wkey] = [
	            Function(['require','module','exports'], '(' + fn + ')(self)'),
	            wcache
	        ];
	    }
	    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
	    
	    var scache = {}; scache[wkey] = wkey;
	    sources[skey] = [
	        Function(['require'],'require(' + stringify(wkey) + ')(self)'),
	        scache
	    ];
	    
	    var src = '(' + bundleFn + ')({'
	        + Object.keys(sources).map(function (key) {
	            return stringify(key) + ':['
	                + sources[key][0]
	                + ',' + stringify(sources[key][1]) + ']'
	            ;
	        }).join(',')
	        + '},{},[' + stringify(skey) + '])'
	    ;
	    
	    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
	    
	    return new Worker(URL.createObjectURL(
	        new Blob([src], { type: 'text/javascript' })
	    ));
	};


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var inherits = __webpack_require__(62)
	var Hash = __webpack_require__(63)

	var K = [
	  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	]

	var W = new Array(160)

	function Sha512() {
	  this.init()
	  this._w = W

	  Hash.call(this, 128, 112)
	}

	inherits(Sha512, Hash)

	Sha512.prototype.init = function () {
	  this._a = 0x6a09e667|0
	  this._b = 0xbb67ae85|0
	  this._c = 0x3c6ef372|0
	  this._d = 0xa54ff53a|0
	  this._e = 0x510e527f|0
	  this._f = 0x9b05688c|0
	  this._g = 0x1f83d9ab|0
	  this._h = 0x5be0cd19|0

	  this._al = 0xf3bcc908|0
	  this._bl = 0x84caa73b|0
	  this._cl = 0xfe94f82b|0
	  this._dl = 0x5f1d36f1|0
	  this._el = 0xade682d1|0
	  this._fl = 0x2b3e6c1f|0
	  this._gl = 0xfb41bd6b|0
	  this._hl = 0x137e2179|0

	  return this
	}

	function S (X, Xl, n) {
	  return (X >>> n) | (Xl << (32 - n))
	}

	function Ch (x, y, z) {
	  return ((x & y) ^ ((~x) & z));
	}

	function Maj (x, y, z) {
	  return ((x & y) ^ (x & z) ^ (y & z));
	}

	Sha512.prototype._update = function(M) {
	  var W = this._w

	  var a = this._a | 0
	  var b = this._b | 0
	  var c = this._c | 0
	  var d = this._d | 0
	  var e = this._e | 0
	  var f = this._f | 0
	  var g = this._g | 0
	  var h = this._h | 0

	  var al = this._al | 0
	  var bl = this._bl | 0
	  var cl = this._cl | 0
	  var dl = this._dl | 0
	  var el = this._el | 0
	  var fl = this._fl | 0
	  var gl = this._gl | 0
	  var hl = this._hl | 0

	  var i = 0, j = 0
	  var Wi, Wil
	  function calcW() {
	    var x  = W[j - 15*2]
	    var xl = W[j - 15*2 + 1]
	    var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
	    var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)

	    x  = W[j - 2*2]
	    xl = W[j - 2*2 + 1]
	    var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
	    var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)

	    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	    var Wi7  = W[j - 7*2]
	    var Wi7l = W[j - 7*2 + 1]

	    var Wi16  = W[j - 16*2]
	    var Wi16l = W[j - 16*2 + 1]

	    Wil = gamma0l + Wi7l
	    Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
	    Wil = Wil + gamma1l
	    Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
	    Wil = Wil + Wi16l
	    Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)
	  }

	  function loop() {
	    W[j] = Wi
	    W[j + 1] = Wil

	    var maj = Maj(a, b, c)
	    var majl = Maj(al, bl, cl)

	    var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
	    var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
	    var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
	    var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)

	    // t1 = h + sigma1 + ch + K[i] + W[i]
	    var Ki = K[j]
	    var Kil = K[j + 1]

	    var ch = Ch(e, f, g)
	    var chl = Ch(el, fl, gl)

	    var t1l = hl + sigma1l
	    var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
	    t1l = t1l + chl
	    t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
	    t1l = t1l + Kil
	    t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
	    t1l = t1l + Wil
	    t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)

	    // t2 = sigma0 + maj
	    var t2l = sigma0l + majl
	    var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)

	    h  = g
	    hl = gl
	    g  = f
	    gl = fl
	    f  = e
	    fl = el
	    el = (dl + t1l) | 0
	    e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	    d  = c
	    dl = cl
	    c  = b
	    cl = bl
	    b  = a
	    bl = al
	    al = (t1l + t2l) | 0
	    a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0

	    i++
	    j += 2
	  }

	  while (i < 16) {
	    Wi = M.readInt32BE(j * 4)
	    Wil = M.readInt32BE(j * 4 + 4)

	    loop()
	  }

	  while (i < 80) {
	    calcW()
	    loop()
	  }

	  this._al = (this._al + al) | 0
	  this._bl = (this._bl + bl) | 0
	  this._cl = (this._cl + cl) | 0
	  this._dl = (this._dl + dl) | 0
	  this._el = (this._el + el) | 0
	  this._fl = (this._fl + fl) | 0
	  this._gl = (this._gl + gl) | 0
	  this._hl = (this._hl + hl) | 0

	  this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
	  this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
	  this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
	  this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	  this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
	  this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
	  this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
	  this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
	}

	Sha512.prototype._hash = function () {
	  var H = new Buffer(64)

	  function writeInt64BE(h, l, offset) {
	    H.writeInt32BE(h, offset)
	    H.writeInt32BE(l, offset + 4)
	  }

	  writeInt64BE(this._a, this._al, 0)
	  writeInt64BE(this._b, this._bl, 8)
	  writeInt64BE(this._c, this._cl, 16)
	  writeInt64BE(this._d, this._dl, 24)
	  writeInt64BE(this._e, this._el, 32)
	  writeInt64BE(this._f, this._fl, 40)
	  writeInt64BE(this._g, this._gl, 48)
	  writeInt64BE(this._h, this._hl, 56)

	  return H
	}

	module.exports = Sha512

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {//prototype class for hash functions
	function Hash (blockSize, finalSize) {
	  this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
	  this._finalSize = finalSize
	  this._blockSize = blockSize
	  this._len = 0
	  this._s = 0
	}

	Hash.prototype.update = function (data, enc) {
	  if ("string" === typeof data) {
	    enc = enc || "utf8"
	    data = new Buffer(data, enc)
	  }

	  var l = this._len += data.length
	  var s = this._s || 0
	  var f = 0
	  var buffer = this._block

	  while (s < l) {
	    var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
	    var ch = (t - f)

	    for (var i = 0; i < ch; i++) {
	      buffer[(s % this._blockSize) + i] = data[i + f]
	    }

	    s += ch
	    f += ch

	    if ((s % this._blockSize) === 0) {
	      this._update(buffer)
	    }
	  }
	  this._s = s

	  return this
	}

	Hash.prototype.digest = function (enc) {
	  // Suppose the length of the message M, in bits, is l
	  var l = this._len * 8

	  // Append the bit 1 to the end of the message
	  this._block[this._len % this._blockSize] = 0x80

	  // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
	  this._block.fill(0, this._len % this._blockSize + 1)

	  if (l % (this._blockSize * 8) >= this._finalSize * 8) {
	    this._update(this._block)
	    this._block.fill(0)
	  }

	  // to this append the block which is equal to the number l written in binary
	  // TODO: handle case where l is > Math.pow(2, 29)
	  this._block.writeInt32BE(l, this._blockSize - 4)

	  var hash = this._update(this._block) || this._hash()

	  return enc ? hash.toString(enc) : hash
	}

	Hash.prototype._update = function () {
	  throw new Error('_update must be implemented by subclass')
	}

	module.exports = Hash

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Web Worker routines for Browser platform.
	 */

	"use strict";

	var Sha512 = __webpack_require__(61);

	function sha512(buf) {
	  return new Sha512().update(buf).digest();
	}

	function pow(opts) {
	  var nonce = opts.num;
	  var poolSize = opts.poolSize;
	  var message = new Buffer(72);
	  message.fill(0);
	  Buffer(opts.initialHash).copy(message, 8);
	  var targetHi = Math.floor(opts.target / 4294967296);
	  var targetLo = opts.target % 4294967296;
	  var digest, trialHi, trialLo;

	  while (true) {
	    // uint32_t overflow. There is no much need to fix it since 4G
	    // double hashes would we computed too long anyway in a Browser.
	    if (nonce > 4294967295) {
	      return -1;
	    }

	    message.writeUInt32BE(nonce, 4, true);
	    digest = sha512(sha512(message));
	    trialHi = digest.readUInt32BE(0, true);

	    if (trialHi > targetHi) {
	      nonce += poolSize;
	    } else if (trialHi === targetHi) {
	      trialLo = digest.readUInt32BE(4, true);
	      if (trialLo > targetLo) {
	        nonce += poolSize;
	      } else {
	        return nonce;
	      }
	    } else {
	      return nonce;
	    }
	  }
	}

	module.exports = function(self) {
	  self.onmessage = function(e) {
	    self.postMessage(pow(e.data));
	  };
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Implements common structures.
	 * @see {@link
	 * https://bitmessage.org/wiki/Protocol_specification#Common_structures}
	 * @module bitmessage/structs
	 * @example
	 * var structs = require("bitmessage").structs;
	 *
	 * var encoded = Buffer.concat([
	 *   structs.var_int.encode(4),
	 *   Buffer("test"),
	 *   structs.var_str.encode("test2"),
	 *   structs.var_int_list.encode([1, 2, 3]),
	 * ]);
	 *
	 * var decoded1 = structs.var_str.decode(encoded);
	 * console.log(decoded1.str);  // test
	 * var decoded2 = structs.var_str.decode(decoded1.rest);
	 * console.log(decoded2.str);  // test2
	 * var decoded3 = structs.var_int.decode(decoded2.rest);
	 * console.log(decoded3.value);  // 3
	 * var decoded4 = structs.var_int_list.decode(decoded2.rest);
	 * console.log(decoded4.list);  // [1, 2, 3]
	 */

	"use strict";

	var objectAssign = Object.assign || __webpack_require__(66);
	var bufferEqual = __webpack_require__(10);
	var bmcrypto = __webpack_require__(13);
	var POW = __webpack_require__(67);
	var util = __webpack_require__(12);

	var assert = util.assert;
	var IPv4_MAPPING = util.IPv4_MAPPING;
	var inet_pton = util.inet_pton;

	function isAscii(str) {
	  for (var i = 0; i < str.length; i++) {
	    if (str.charCodeAt(i) > 127) {
	      return false;
	    }
	  }
	  return true;
	}

	// Compute the message checksum for the given data.
	function getmsgchecksum(data) {
	  return bmcrypto.sha512(data).slice(0, 4);
	}

	// \ :3 /
	function findMagic(buf) {
	  var i;
	  var len = buf.length;
	  var firstb = false;
	  var secondb = false;
	  var thirdb = false;
	  for (i = 0; i < len; ++i) {
	    switch (buf[i]) {
	      case 0xE9:
	        firstb = true;
	        break;
	      case 0xBE:
	        if (firstb) { secondb = true; }
	        break;
	      case 0xB4:
	        if (firstb && secondb) { thirdb = true; }
	        break;
	      case 0xD9:
	        if (firstb && secondb && thirdb) { return i - 3; }
	        break;
	      default:
	        firstb = false;
	        secondb = false;
	        thirdb = false;
	    }
	  }
	  // If we reached the end of the buffer but part of the magic matches
	  // we'll still return index of the magic's start position.
	  if (firstb) {
	    if (secondb) {
	      --i;
	    }
	    if (thirdb) {
	      --i;
	    }
	    return i - 1;  // Compensate for last i's increment
	  } else {
	    return -1;
	  }
	}

	/**
	 * Message structure.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Message_structure}
	 * @namespace
	 * @static
	 */
	var message = exports.message = {
	  /**
	   * Bitmessage magic value.
	   * @constant {number}
	   */
	  MAGIC: 0xE9BEB4D9,

	  /**
	   * @typedef {Object} TryDecodeResult
	   * @property {Object} message - Decoded message
	   * @property {string} message.command - Message command
	   * @property {Buffer} message.payload - Message payload
	   * @property {number} message.length - Full message length
	   * @property {Error} error - ...or decoding error
	   * @property {Buffer} rest - The rest of the input buffer after
	   * processing message
	   * @memberof module:bitmessage/structs.message
	   */

	  /**
	   * Decode message in "stream" mode.  
	   * NOTE: message payload and `rest` are copied (so the runtime can GC
	   * processed buffer data).
	   * @param {Buffer} buf - Data buffer
	   * @return {?TryDecodeResult}
	   * [Decoded result.]{@link module:bitmessage/structs.message.TryDecodeResult}
	   */
	  tryDecode: function(buf) {
	    if (buf.length < 24) {
	      // Message is not yet fully received, just skip to next process
	      // cycle.
	      return;
	    }
	    var res = {};

	    // Magic.
	    var mindex = findMagic(buf);
	    if (mindex !== 0) {
	      if (mindex === -1) {
	        res.error = new Error("Magic not found, skipping buffer data");
	        res.rest = new Buffer(0);
	      } else {
	        res.error = new Error(
	          "Magic in the middle of buffer, skipping some data at start"
	        );
	        res.rest = new Buffer(buf.length - mindex);
	        buf.copy(res.rest, 0, mindex);
	      }
	      return res;
	    }

	    // Payload length.
	    var payloadLength = buf.readUInt32BE(16, true);
	    var msgLength = 24 + payloadLength;
	    // See: <https://github.com/Bitmessage/PyBitmessage/issues/767>.
	    if (payloadLength > 1600003) {
	      res.error = new Error("Message is too large, skipping it");
	      if (buf.length > msgLength) {
	        res.rest = new Buffer(buf.length - msgLength);
	        buf.copy(res.rest, 0, msgLength);
	      } else {
	        res.rest = new Buffer(0);
	      }
	      return res;
	    }
	    if (buf.length < msgLength) {
	      // Message is not yet fully received, just skip to next process
	      // cycle.
	      return;
	    }

	    // Now we can set `rest` value.
	    res.rest = new Buffer(buf.length - msgLength);
	    buf.copy(res.rest, 0, msgLength);

	    // Command.
	    var command = buf.slice(4, 16);
	    var firstNonNull = 0;
	    var i;
	    for (i = 11; i >=0; i--) {
	      if (command[i] > 127) {
	        res.error = new Error(
	          "Non-ASCII characters in command, skipping message"
	        );
	        return res;
	      }
	      if (!firstNonNull && command[i] !== 0) {
	        firstNonNull = i + 1;
	      }
	    }
	    command = command.slice(0, firstNonNull).toString("ascii");

	    // Payload.
	    var payload = new Buffer(payloadLength);
	    buf.copy(payload, 0, 24, msgLength);
	    var checksum = buf.slice(20, 24);
	    if (!bufferEqual(checksum, getmsgchecksum(payload))) {
	      res.error = new Error("Bad checksum, skipping message");
	      return res;
	    }

	    res.message = {command: command, payload: payload, length: msgLength};
	    return res;
	  },

	  /**
	   * @typedef {Object} DecodeResult
	   * @property {string} command - Message command
	   * @property {Buffer} payload - Message payload
	   * @property {number} length - Full message length
	   * @property {Buffer} rest - The rest of the input buffer
	   * @memberof module:bitmessage/structs.message
	   */

	  /**
	   * Decode message.  
	   * NOTE: `payload` is copied, `rest` references input buffer.
	   * @param {Buffer} buf - Buffer that starts with encoded message
	   * @return {DecodeResult}
	   * [Decoded message structure.]{@link module:bitmessage/structs.message.DecodeResult}
	   */
	  decode: function(buf) {
	    assert(buf.length >= 24, "Buffer is too small");
	    assert(buf.readUInt32BE(0, true) === message.MAGIC, "Wrong magic");
	    var command = buf.slice(4, 16);
	    var firstNonNull = 0;
	    for (var i = 11; i >=0; i--) {
	      assert(command[i] <= 127, "Non-ASCII characters in command");
	      if (!firstNonNull && command[i] !== 0) {
	        firstNonNull = i + 1;
	      }
	    }
	    // NOTE(Kagami): Command can be empty.
	    // NOTE(Kagami): "ascii" encoding is not necessary here since we
	    // already validated the command but that should be quite faster
	    // than default "utf-8" encoding.
	    command = command.slice(0, firstNonNull).toString("ascii");
	    var payloadLength = buf.readUInt32BE(16, true);
	    assert(payloadLength <= 1600003, "Message payload is too big");
	    var length = 24 + payloadLength;
	    assert(buf.length >= length, "Truncated payload");
	    var checksum = buf.slice(20, 24);
	    // NOTE(Kagami): We do copy instead of slice to protect against
	    // possible source buffer modification by user.
	    var payload = new Buffer(payloadLength);
	    buf.copy(payload, 0, 24, length);
	    assert(bufferEqual(checksum, getmsgchecksum(payload)), "Bad checksum");
	    var rest = buf.slice(length);
	    return {command: command, payload: payload, length: length, rest: rest};
	  },

	  /**
	   * Encode message.
	   * @param {string} command - Message command
	   * @param {Bufer} payload - Message payload
	   * @return {Buffer} Encoded message structure.
	   */
	  encode: function(command, payload) {
	    assert(command.length <= 12, "Command is too long");
	    assert(isAscii(command), "Non-ASCII characters in command");
	    payload = payload || new Buffer(0);
	    assert(payload.length <= 1600003, "Message payload is too big");
	    var buf = new Buffer(24 + payload.length);
	    buf.fill(0);
	    buf.writeUInt32BE(message.MAGIC, 0, true);
	    buf.write(command, 4);
	    buf.writeUInt32BE(payload.length, 16, true);
	    getmsgchecksum(payload).copy(buf, 20);
	    payload.copy(buf, 24);
	    return buf;
	  },
	};

	/**
	 * An `object` is a message which is shared throughout a stream. It is
	 * the only message which propagates; all others are only between two
	 * nodes.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#object}
	 * @namespace
	 * @static
	 */
	var object = exports.object = {
	  /**
	   * [getpubkey]{@link module:bitmessage/objects.getpubkey} object type.
	   * @constant {number}
	   */
	  GETPUBKEY: 0,
	  /**
	   * [pubkey]{@link module:bitmessage/objects.pubkey} object type.
	   * @constant {number}
	   */
	  PUBKEY: 1,
	  /**
	   * [msg]{@link module:bitmessage/objects.msg} object type.
	   * @constant {number}
	   */
	  MSG: 2,
	  /**
	   * [broadcast]{@link module:bitmessage/objects.broadcast} object type.
	   * @constant {number}
	   */
	  BROADCAST: 3,

	  /**
	   * @typedef {Object} DecodeResult
	   * @property {Buffer} nonce - A 8-byte object nonce
	   * @property {number} ttl - Time to live in seconds
	   * @property {Date} expires - Object expiration date
	   * @property {number} type - Object type
	   * @property {number} version - Object version
	   * @property {number} stream - Object stream
	   * @property {number} headerLength - Length of the object header
	   * @property {Buffer} objectPayload - Object payload
	   * @memberof module:bitmessage/structs.object
	   */

	  /**
	   * Decode `object` message.  
	   * NOTE: `nonce` and `objectPayload` are copied.
	   * @param {Buffer} buf - Message
	   * @param {Object=} opts - Decoding options
	   * @param {boolean} opts.allowExpired - Allow expired objects
	   * @param {boolean} opts.skipPow - Do not validate object POW
	   * @return {DecodeResult} [Decoded `object` structure.]{@link
	   * module:bitmessage/structs.object.DecodeResult}
	   * @throws {Error} Invalid object
	   */
	  decode: function(buf, opts) {
	    var decoded = message.decode(buf);
	    assert(decoded.command === "object", "Given message is not an object");
	    return object.decodePayload(decoded.payload, opts);
	  },

	  /**
	   * Decode `object` message payload.
	   * The same as [decode]{@link module:bitmessage/structs.object.decode}.
	   */
	  decodePayload: function(buf, opts) {
	    opts = opts || {};

	    // 8 + 8 + 4 + (1+) + (1+)
	    assert(buf.length >= 22, "object message payload is too small");
	    assert(buf.length <= 262144, "object message payload is too big");
	    var nonce;
	    if (!opts._validate) {
	      nonce = new Buffer(8);
	      buf.copy(nonce, 0, 0, 8);
	    }

	    // TTL.
	    var expiresTime = util.readTimestamp64BE(buf.slice(8, 16));
	    var expires = new Date(expiresTime * 1000);
	    var ttl = expiresTime - util.tnow();
	    assert(ttl <= 2430000, "expiresTime is too far in the future");
	    if (!opts.allowExpired) {
	      assert(ttl >= -3600, "Object expired more than a hour ago");
	    }

	    // POW.
	    if (!opts.skipPow) {
	      // User may specify trials/payload extra options and we will
	      // account in here.
	      var targetOpts = objectAssign({}, opts, {ttl: ttl, payload: buf});
	      var target = POW.getTarget(targetOpts);
	      assert(POW.check({target: target, payload: buf}), "Insufficient POW");
	    }

	    var type = buf.readUInt32BE(16, true);
	    var decodedVersion = var_int.decode(buf.slice(20));
	    var decodedStream = var_int.decode(decodedVersion.rest);
	    var headerLength = 20 + decodedVersion.length + decodedStream.length;

	    if (opts._validate) { return {stream: decodedStream.value}; }

	    var objectPayload = new Buffer(decodedStream.rest.length);
	    decodedStream.rest.copy(objectPayload);

	    return {
	      nonce: nonce,
	      ttl: ttl,
	      expires: expires,
	      type: type,
	      version: decodedVersion.value,
	      stream: decodedStream.value,
	      headerLength: headerLength,
	      objectPayload: objectPayload,
	    };
	  },

	  /**
	   * Check whether given `object` message is valid.
	   * @param {Buffer} buf - Message
	   * @param {Object=} opts - Any of [object.decode]{@link
	   * module:bitmessage/structs.object.decode} options and:
	   * @param {number} opts.stream - Expected object's stream
	   * @return {?Error} Return an error with description if object is
	   * invalid.
	   */
	  validate: function(buf, opts) {
	    var decoded;
	    try {
	      decoded = message.decode(buf);
	    } catch(e) {
	      return e;
	    }
	    if (decoded.command !== "object") {
	      return new Error("Given message is not an object");
	    }
	    return object.validatePayload(decoded.payload, opts);
	  },

	  /**
	   * Check whether `object` message payload is valid.
	   * The same as [validate]{@link
	   * module:bitmessage/structs.object.validate}.
	   */
	  validatePayload: function(buf, opts) {
	    opts = objectAssign({}, opts, {_validate: true});
	    var decoded;
	    try {
	      decoded = object.decodePayload(buf, opts);
	    } catch(e) {
	      return e;
	    }
	    if (opts.stream && decoded.stream !== opts.stream) {
	      return new Error(
	        "The stream number " + opts.stream +
	        " is not the one we are interested in"
	      );
	    }
	  },

	  /**
	   * Encode `object` message.
	   * @param {Object} opts - Object options
	   * @param {Object} opts.nonce - A 8-byte object nonce
	   * @param {number} opts.ttl - Time to live in seconds
	   * @param {number} opts.type - Object type
	   * @param {number} opts.version - Object version
	   * @param {number=} opts.stream - Object stream (1 by default)
	   * @param {Buffer} opts.objectPayload - Object payload
	   * @return {Buffer} Encoded message.
	   */
	  encode: function(opts) {
	    var payload = object.encodePayload(opts);
	    return message.encode("object", payload);
	  },

	  /**
	   * Encode `object` message payload.
	   * The same as [encode]{@link module:bitmessage/structs.object.encode}.
	   */
	  encodePayload: function(opts) {
	    // NOTE(Kagami): We do not try to calculate nonce here if it is not
	    // provided because:
	    // 1) It's async operation but in `structs` module all operations
	    // are synchronous.
	    // 2) It shouldn't be useful because almost all objects signatures
	    // include object header and POW is computed for entire object so at
	    // first the object header should be assembled and only then we can
	    // do a POW.
	    assert(opts.nonce.length === 8, "Bad nonce");
	    // NOTE(Kagami): This may be a bit inefficient since we allocate
	    // twice.
	    return Buffer.concat([
	      opts.nonce,
	      object.encodePayloadWithoutNonce(opts),
	    ]);
	  },

	  /**
	   * Encode `object` message payload without leading nonce field (may be
	   * useful if you are going to calculate it later).
	   * @param {Object} opts - Object options
	   * @param {number} opts.ttl - Time to live in seconds
	   * @param {number} opts.type - Object type
	   * @param {number} opts.version - Object version
	   * @param {number=} opts.stream - Object stream (1 by default)
	   * @param {Buffer} opts.objectPayload - Object payload
	   * @return {Buffer} Encoded payload.
	   */
	  encodePayloadWithoutNonce: function(opts) {
	    assert(opts.ttl > 0, "Bad TTL");
	    assert(opts.ttl <= 2430000, "TTL may not be larger than 28 days + 3 hours");
	    var expiresTime = util.tnow() + opts.ttl;
	    var type = new Buffer(4);
	    type.writeUInt32BE(opts.type, 0);
	    var stream = opts.stream || 1;
	    var obj = Buffer.concat([
	      util.writeUInt64BE(null, expiresTime),
	      type,
	      var_int.encode(opts.version),
	      var_int.encode(stream),
	      opts.objectPayload,
	    ]);
	    assert(obj.length <= 262136, "object message payload is too big");
	    return obj;
	  },
	};

	/**
	 * Variable length integer.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Variable_length_integer}
	 * @namespace
	 * @static
	 */
	var var_int = exports.var_int = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {number} value - Stored value
	   * @property {number} length - `var_int` full length
	   * @property {Buffer} rest - The rest of the input buffer
	   * @memberof module:bitmessage/structs.var_int
	   */

	  /**
	   * Decode `var_int`.  
	   * NOTE: `rest` references input buffer.
	   * @param {Buffer} buf - A buffer that starts with encoded `var_int`
	   * @return {DecodeResult}
	   * [Decoded `var_int` structure.]{@link module:bitmessage/structs.var_int.DecodeResult}
	   */
	  decode: function(buf) {
	    var value, length;
	    assert(buf.length > 0, "Empty buffer");
	    switch (buf[0]) {
	      case 253:
	        value = buf.readUInt16BE(1);
	        assert(value >= 253, "Impractical var_int");
	        length = 3;
	        break;
	      case 254:
	        value = buf.readUInt32BE(1);
	        assert(value >= 65536, "Impractical var_int");
	        length = 5;
	        break;
	      case 255:
	        var hi = buf.readUInt32BE(1);
	        assert(hi !== 0, "Impractical var_int");
	        // Max safe number = 2^53 - 1 =
	        // 0b0000000000011111111111111111111111111111111111111111111111111111
	        // = 2097151*(2^32) + (2^32 - 1).
	        // So it's safe until hi <= 2097151. See
	        // <http://mdn.io/issafeinteger>,
	        // <https://stackoverflow.com/q/307179> for details.
	        // TODO(Kagami): We may want to return raw Buffer for
	        // 2^53 <= value <= 2^64 - 1 range. Probably using the optional
	        // argument because most of the code expect to get a number when
	        // calling `var_int.decode`.
	        assert(hi <= 2097151, "Unsafe integer");
	        var lo = buf.readUInt32BE(5);
	        value = hi * 4294967296 + lo;
	        length = 9;
	        break;
	      default:
	        value = buf[0];
	        length = 1;
	    }
	    var rest = buf.slice(length);
	    return {value: value, length: length, rest: rest};
	  },

	  /**
	   * Encode number into `var_int`.
	   * @param {(number|Buffer)} value - Input number
	   * @return {Buffer} Encoded `var_int`.
	   */
	  encode: function(value) {
	    var buf, targetStart;
	    if (typeof value === "number") {
	      assert(value >= 0, "Value cannot be less than zero");
	      if (value < 253) {
	        buf = new Buffer([value]);
	      } else if (value < 65536) {
	        buf = new Buffer(3);
	        buf[0] = 253;
	        buf.writeUInt16BE(value, 1, true);
	      } else if (value < 4294967296) {
	        buf = new Buffer(5);
	        buf[0] = 254;
	        buf.writeUInt32BE(value, 1, true);
	      } else {
	        assert(value <= 9007199254740991, "Unsafe integer");
	        buf = new Buffer(9);
	        buf[0] = 255;
	        buf.writeUInt32BE(Math.floor(value / 4294967296), 1, true);  // high32
	        buf.writeUInt32BE(value % 4294967296, 5, true);  // low32
	      }
	    } else if (Buffer.isBuffer(value)) {
	      assert(value.length <= 8, "Buffer is too big");
	      buf = new Buffer(9);
	      buf.fill(0);
	      buf[0] = 255;
	      targetStart = 1 + (8 - value.length);
	      value.copy(buf, targetStart);
	    } else {
	      throw new Error("Unknown value type");
	    }
	    return buf;
	  },
	};

	/**
	 * Variable length string.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Variable_length_string}
	 * @namespace
	 */
	exports.var_str = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {number} str - The string itself
	   * @property {number} length - `var_str` full length
	   * @property {Buffer} rest - The rest of the input buffer
	   * @memberof module:bitmessage/structs.var_str
	   */

	  /**
	   * Decode `var_str`.  
	   * NOTE: `rest` references input buffer.
	   * @param {Buffer} buf - A buffer that starts with encoded `var_str`
	   * @return {DecodeResult}
	   * [Decoded `var_str` structure.]{@link module:bitmessage/structs.var_str.DecodeResult}
	   */
	  decode: function(buf) {
	    var decoded = var_int.decode(buf);
	    var strLength = decoded.value;
	    var length = decoded.length + strLength;
	    assert(buf.length >= length, "Buffer is too small");
	    // XXX(Kagami): Spec doesn't mention encoding, using UTF-8.
	    var str = decoded.rest.slice(0, strLength).toString("utf8");
	    var rest = decoded.rest.slice(strLength);
	    return {str: str, length: length, rest: rest};
	  },

	  /**
	   * Encode string into `var_str`.
	   * @param {string} str - A string
	   * @return {Buffer} Encoded `var_str`.
	   */
	  encode: function(str) {
	    // XXX(Kagami): Spec doesn't mention encoding, using UTF-8.
	    var strBuf = new Buffer(str, "utf8");
	    return Buffer.concat([var_int.encode(strBuf.length), strBuf]);
	  },
	};

	/**
	 * Variable length list of integers.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Variable_length_list_of_integers}
	 * @namespace
	 */
	exports.var_int_list = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {number} list - Stored numbers
	   * @property {number} length - `var_int_list` full length
	   * @property {Buffer} rest - The rest of the input buffer
	   * @memberof module:bitmessage/structs.var_int_list
	   */

	  /**
	   * Decode `var_int_list`.  
	   * NOTE: `rest` references input buffer.
	   * @param {Buffer} buf - A buffer that starts with encoded
	   * `var_int_list`
	   * @return {DecodeResult}
	   * [Decoded `var_int_list` structure.]{@link module:bitmessage/structs.var_int_list.DecodeResult}
	   */
	  decode: function(buf) {
	    var decoded = var_int.decode(buf);
	    var listLength = decoded.value;
	    var list = new Array(listLength);
	    var rest = decoded.rest;
	    var sumLength = decoded.length;
	    for (var i = 0; i < listLength; i++) {
	      decoded = var_int.decode(rest);
	      list[i] = decoded.value;
	      rest = decoded.rest;
	      sumLength += decoded.length;
	    }
	    return {list: list, length: sumLength, rest: rest};
	  },

	  /**
	   * Encode list of numbers into `var_int_list`.
	   * @param {number[]} list - A number list
	   * @return {Buffer} Encoded `var_int_list`.
	   */
	  encode: function(list) {
	    var var_ints = list.map(var_int.encode);
	    var bufs = [var_int.encode(list.length)].concat(var_ints);
	    return Buffer.concat(bufs);
	  },
	};

	// Very simple inet_ntop(3) equivalent.
	function inet_ntop(buf) {
	  assert(buf.length === 16, "Bad buffer size");
	  // IPv4 mapped to IPv6.
	  if (bufferEqual(buf.slice(0, 12), IPv4_MAPPING)) {
	    return Array.prototype.join.call(buf.slice(12), ".");
	  // IPv6.
	  } else {
	    // TODO(Kagami): Join empty groups to make address looks nicer.
	    var groups = [];
	    for (var i = 0; i < 8; i++) {
	      groups.push(buf.readUInt16BE(i * 2, true).toString(16));
	    }
	    return groups.join(":");
	  }
	}

	/**
	 * Network address.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Network_address}
	 * @namespace
	 */
	exports.net_addr = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {Date} time - Time the node was last active, not included
	   * in short mode
	   * @property {number} stream - Stream number of the node, not included
	   * in short mode
	   * @property {Object} services -
	   * [Services]{@link module:bitmessage/structs.ServicesBitfield}
	   * provided by the node
	   * @property {string} host - IPv4/IPv6 address of the node
	   * @property {number} port - Incoming port of the node
	   * @memberof module:bitmessage/structs.net_addr
	   */

	  /**
	   * Decode `net_addr`.
	   * @param {Buffer} buf - A buffer that contains encoded `net_addr`
	   * @param {Object=} opts - Decoding options; use `short` option to
	   * decode `net_addr` from
	   * [version message]{@link module:bitmessage/messages.version}
	   * @return {DecodeResult}
	   * [Decoded `net_addr` structure.]{@link module:bitmessage/structs.net_addr.DecodeResult}
	   */
	  decode: function(buf, opts) {
	    var short = !!(opts || {}).short;
	    var res = {};
	    if (short) {
	      assert(buf.length === 26, "Bad buffer size");
	    } else {
	      assert(buf.length === 38, "Bad buffer size");
	      var timeHi = buf.readUInt32BE(0, true);
	      var timeLo = buf.readUInt32BE(4, true);
	      // JavaScript's Date object can't work with timestamps higher than
	      // 8640000000000 (~2^43, ~275760 year). Hope JavaScript will
	      // support 64-bit numbers up to this date.
	      assert(timeHi <= 2011, "Time is too high");
	      assert(timeHi !== 2011 || timeLo <= 2820767744, "Time is too high");
	      res.time = new Date((timeHi * 4294967296 + timeLo) * 1000);
	      res.stream = buf.readUInt32BE(8, true);
	      buf = buf.slice(12);
	    }
	    res.services = ServicesBitfield(buf.slice(0, 8), {copy: true});
	    res.host = inet_ntop(buf.slice(8, 24));
	    res.port = buf.readUInt16BE(24, true);
	    return res;
	  },

	  /**
	   * Encode `net_addr`.
	   * @param {Object} opts - Encoding options
	   * @param {boolean=} opts.short - Encode `net_addr` for
	   * [version message]{@link module:bitmessage/messages.version}
	   * (false by default)
	   * @param {Date=} opts.time - Time the node was last active, not
	   * included in short mode (current time by default)
	   * @param {number=} opts.stream - Stream number of the node, not
	   * included in short mode (1 by default)
	   * @param {(Object|Buffer)=} opts.services -
	   * [Services]{@link module:bitmessage/structs.ServicesBitfield}
	   * provided by the node (`NODE_NETWORK` by default)
	   * @param {string} opts.host - IPv4/IPv6 address of the node
	   * @param {number} opts.port - Incoming port of the node
	   * @return {Buffer} Encoded `net_addr`.
	   */
	  encode: function(opts) {
	    // Be aware of `Buffer.slice` quirk in browserify:
	    // <http://git.io/lNZF1A> (does not modify parent buffer's memory in
	    // old browsers). So we use offset instead of `buf = buf.slice`.
	    var buf, shift;
	    if (opts.short) {
	      buf = new Buffer(26);
	      shift = 0;
	    } else {
	      buf = new Buffer(38);
	      var time = opts.time || new Date();
	      time = Math.floor(time.getTime() / 1000);
	      buf.writeUInt32BE(Math.floor(time / 4294967296), 0, true);  // high32
	      buf.writeUInt32BE(time % 4294967296, 4, true);  // low32
	      var stream = opts.stream || 1;
	      buf.writeUInt32BE(stream, 8);
	      shift = 12;
	    }
	    var services = opts.services ||
	                   ServicesBitfield().set(ServicesBitfield.NODE_NETWORK);
	    if (Buffer.isBuffer(services)) {
	      assert(services.length === 8, "Bad services buffer length");
	    } else {
	      services = services.buffer;
	    }
	    services.copy(buf, shift);
	    inet_pton(opts.host).copy(buf, shift + 8);
	    buf.writeUInt16BE(opts.port, shift + 24);
	    return buf;
	  },
	};

	/**
	 * Inventory vector.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Inventory_Vectors}
	 * @namespace
	 */
	exports.inv_vect = {
	  // NOTE(Kagami): Only encode operation is defined because decoding of
	  // the encoded vector is impossible.

	  /**
	   * Encode inventory vector.
	   * @param {Buffer} buf - Payload to calculate the inventory vector for
	   * @return {Buffer} A 32-byte encoded `inv_vect`.
	   */
	  encode: function(buf) {
	    return bmcrypto.sha512(bmcrypto.sha512(buf)).slice(0, 32);
	  },
	};

	/**
	 * Encrypted payload.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Encrypted_payload}
	 * @namespace encrypted
	 * @static
	 */
	/**
	 * @typedef {Object} DecodeResult
	 * @property {Buffer} iv - Initialization vector (16 bytes)
	 * @property {Buffer} ephemPrivateKey - Ephemeral private key (32 bytes)
	 * @property {Buffer} ciphertext - The result of encryption (variable
	 * size)
	 * @property {Buffer} mac - Message authentication code (32 bytes)
	 * @memberof module:bitmessage/structs.encrypted
	 */
	/**
	 * Decode encrypted payload.  
	 * NOTE: all structure members are copied.
	 * @param {Buffer} buf - A buffer that contains encrypted payload
	 * @return {DecodeResult}
	 * [Decoded `encrypted` structure.]{@link module:bitmessage/structs.encrypted.DecodeResult}
	 * @function decode
	 * @memberof module:bitmessage/structs.encrypted
	 */
	/**
	 * Encode `encrypted`.
	 * @param {Object} opts - Encoding options
	 * @param {Buffer} opts.iv - Initialization vector (16 bytes)
	 * @param {Buffer} opts.ephemPrivateKey - Ephemeral private key (32
	 * bytes)
	 * @param {Buffer} opts.ciphertext - The result of encryption (variable
	 * size)
	 * @param {Buffer} opts.mac - Message authentication code (32 bytes)
	 * @return {Buffer} Encoded `encrypted` payload.
	 * @function encode
	 * @memberof module:bitmessage/structs.encrypted
	 */
	// Reexport struct.
	exports.encrypted = bmcrypto.encrypted;

	// Creates bitfield (MSB 0) class of the specified size.
	var Bitfield = function(size) {
	  var bytesize = size / 8;

	  // Inspired by <https://github.com/fb55/bitfield>.
	  function BitfieldInner(buf, opts) {
	    if (!(this instanceof BitfieldInner)) {
	      return new BitfieldInner(buf);
	    }
	    opts = opts || {};
	    if (buf) {
	      assert(buf.length === bytesize, "Bad buffer size");
	      if (opts.copy) {
	        var dup = new Buffer(bytesize);
	        dup.fill(0);
	        buf.copy(dup);
	        buf = dup;
	      }
	    } else {
	      buf = new Buffer(bytesize);
	      buf.fill(0);
	    }
	    this.buffer = buf;
	  }

	  BitfieldInner.prototype.get = function(bits) {
	    if (!Array.isArray(bits)) {
	      bits = [bits];
	    }
	    var buf = this.buffer;
	    return bits.every(function(bit) {
	      assert(bit >= 0, "Bit number is too low");
	      assert(bit < size, "Bit number is too high");
	      var index = Math.floor(bit / 8);
	      var shift = 7 - (bit % 8);
	      return (buf[index] & (1 << shift)) !== 0;  // jshint ignore:line
	    });
	  };

	  BitfieldInner.prototype.set = function(bits) {
	    if (!Array.isArray(bits)) {
	      bits = [bits];
	    }
	    var buf = this.buffer;
	    bits.forEach(function(bit) {
	      assert(bit >= 0, "Bit number is too low");
	      assert(bit < size, "Bit number is too high");
	      var index = Math.floor(bit / 8);
	      var shift = 7 - (bit % 8);
	      buf[index] |= 1 << shift;  // jshint ignore:line
	    });
	    return this;
	  };

	  BitfieldInner.prototype.toString = function() {
	    var i;
	    var str = "";
	    for (i = 0; i < this.buffer.length; i++) {
	      // Should be faster than pushing to array and joining on v8.
	      str += ("0000000" + this.buffer[i].toString(2)).slice(-8);
	    }
	    return "<Bitfield:" + str + ">";
	  };

	  return BitfieldInner;
	};

	/**
	 * Service features bitfield (MSB 0).
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#version}
	 * @param {Buffer=} buf - A 8-byte bitfield buffer (will be created if
	 * not provided or will be copied if `opts.copy` is `true`)
	 * @param {Object=} opts - Options
	 * @constructor
	 * @static
	 * @example
	 * var ServicesBitfield = require("bitmessage").structs.ServicesBitfield;
	 * var services = ServicesBitfield().set(ServicesBitfield.NODE_NETWORK);
	 * console.log(services.get(ServicesBitfield.NODE_NETWORK));  // true
	 * console.log(services.get(15));  // false
	 */
	// NOTE(Kagami): Since pubkey bitfield uses MSB 0, we use it here too.
	// See <https://github.com/Bitmessage/PyBitmessage/issues/769> for
	// details.
	var ServicesBitfield = exports.ServicesBitfield = objectAssign(Bitfield(64), {
	  /**
	   * Returns a boolean indicating whether the bit is set.
	   * @param {number} index - Bit index (MSB 0)
	   * @function get
	   * @instance
	   * @return {boolean}
	   * @memberof module:bitmessage/structs.ServicesBitfield
	   */
	  /**
	   * Set the given bit(s) to `1`.
	   * @param {(number|number[])} index - Bit(s) index (MSB 0)
	   * @function set
	   * @instance
	   * @return {Object} Returns self so methods can be chained.
	   * @memberof module:bitmessage/structs.ServicesBitfield
	   */
	  /**
	   * The contents of the bitfield.
	   * @type {Buffer}
	   * @var buffer
	   * @instance
	   * @memberof module:bitmessage/structs.ServicesBitfield
	   */

	  /**
	   * Bit index indicating normal network node.
	   * @memberof module:bitmessage/structs.ServicesBitfield
	   * @constant {number}
	   */
	  NODE_NETWORK: 63,
	  /**
	   * Bit index indicating web/mobile client with limited network
	   * capabilities (proposal feature).
	   * @memberof module:bitmessage/structs.ServicesBitfield
	   * @see {@link https://bitmessage.org/wiki/Mobile_Protocol_specification}
	   * @constant {number}
	   */
	  NODE_MOBILE: 62,
	  /**
	   * Bit index indicating node which can work as a WebSocket gateway for
	   * web/mobile clients (proposal feature).
	   * @memberof module:bitmessage/structs.ServicesBitfield
	   * @see {@link https://bitmessage.org/wiki/Mobile_Protocol_specification}
	   * @constant {number}
	   */
	  NODE_GATEWAY: 61,
	});

	/**
	 * Pubkey features bitfield (MSB 0).
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Pubkey_bitfield_features}
	 * @param {Buffer=} buf - A 4-byte bitfield buffer (will be created if
	 * not provided or will be copied if `opts.copy` is `true`)
	 * @param {Object=} opts - Options
	 * @constructor
	 * @example
	 * var PubkeyBitfield = require("bitmessage").structs.PubkeyBitfield;
	 * var behavior = PubkeyBitfield().set([
	 *   PubkeyBitfield.INCLUDE_DESTINATION,
	 *   PubkeyBitfield.DOES_ACK,
	 * ]).set(1);
	 * console.log(behavior.get(PubkeyBitfield.DOES_ACK));  // true
	 * console.log(behavior.get(15));  // false
	 */
	exports.PubkeyBitfield = objectAssign(Bitfield(32), {
	  /**
	   * Returns a boolean indicating whether the bit is set.
	   * @param {number} index - Bit index (MSB 0)
	   * @function get
	   * @instance
	   * @return {boolean}
	   * @memberof module:bitmessage/structs.PubkeyBitfield
	   */
	  /**
	   * Set the given bit(s) to `1`.
	   * @param {(number|number[])} index - Bit(s) index (MSB 0)
	   * @function set
	   * @instance
	   * @return {Object} Returns self so methods can be chained.
	   * @memberof module:bitmessage/structs.PubkeyBitfield
	   */
	  /**
	   * The contents of the bitfield.
	   * @type {Buffer}
	   * @var buffer
	   * @instance
	   * @memberof module:bitmessage/structs.PubkeyBitfield
	   */

	  /**
	   * Bit index.
	   * If set, the receiving node does send acknowledgements (rather than
	   * dropping them).
	   * @memberof module:bitmessage/structs.PubkeyBitfield
	   * @constant {number}
	   */
	  DOES_ACK: 31,
	  /**
	   * Bit index.
	   * If set, the receiving node expects that the RIPEMD hash encoded in
	   * their address preceedes the encrypted message data of msg messages
	   * bound for them.
	   * @memberof module:bitmessage/structs.PubkeyBitfield
	   * @constant {number}
	   */
	  INCLUDE_DESTINATION: 30,
	});

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = Object.keys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Implements proof of work.
	 * @see {@link https://bitmessage.org/wiki/Proof_of_work}
	 * @module bitmessage/pow
	 */

	"use strict";

	var objectAssign = Object.assign || __webpack_require__(66);
	var bmcrypto = __webpack_require__(13);
	var platform = __webpack_require__(59);
	var util = __webpack_require__(12);

	/**
	 * Calculate target.
	 * @param {Object} opts - Target options
	 * @param {number} opts.ttl - Time to live of the message in seconds
	 * @param {number} opts.payloadLength - Length of the message payload
	 * (with nonce)
	 * @param {Buffer} opts.payload - ...or payload itself
	 * @param {number=} opts.nonceTrialsPerByte - This number is the average
	 * number of nonce trials a node will have to perform to meet the Proof
	 * of Work requirement. 1000 is the network minimum so any lower values
	 * will be automatically raised to 1000.
	 * @param {number=} opts.payloadLengthExtraBytes - This number is added
	 * to the data length to make sending small messages more difficult.
	 * 1000 is the network minimum so any lower values will be automatically
	 * raised to 1000.
	 * @return {number} Target.
	 * @function
	 * @static
	 */
	// Just a wrapper around platform-specific implementation.
	var getTarget = exports.getTarget = function(opts) {
	  var payloadLength = opts.payloadLength || opts.payload.length;
	  return platform.getTarget({
	    ttl: opts.ttl,
	    payloadLength: payloadLength,
	    nonceTrialsPerByte: util.getTrials(opts),
	    payloadLengthExtraBytes: util.getExtraBytes(opts),
	  });
	};

	/**
	 * Check a POW.
	 * @param {Object} opts - Proof of work options
	 * @param {number} opts.target - Proof of work target or pass
	 * [getTarget]{@link module:bitmessage/pow.getTarget} options to `opts`
	 * to compute it
	 * @param {Buffer} opts.payload - Message payload (with nonce)
	 * @param {(number|Buffer)} opts.nonce  - ...or already derived nonce
	 * @param {Buffer} opts.initialHash - ...and initial hash
	 * @return {boolean} Is the proof of work sufficient.
	 */
	exports.check = function(opts) {
	  var initialHash;
	  var nonce;
	  var target = opts.target;
	  if (target === undefined) {
	    target = getTarget(opts);
	  }
	  if (opts.payload) {
	    nonce = opts.payload.slice(0, 8);
	    initialHash = bmcrypto.sha512(opts.payload.slice(8));
	  } else {
	    if (typeof opts.nonce === "number") {
	      nonce = new Buffer(8);
	      // High 32 bits.
	      nonce.writeUInt32BE(Math.floor(opts.nonce / 4294967296), 0, true);
	      // Low 32 bits.
	      nonce.writeUInt32BE(opts.nonce % 4294967296, 4, true);
	    } else {
	      nonce = opts.nonce;
	    }
	    initialHash = opts.initialHash;
	  }
	  var targetHi = Math.floor(target / 4294967296);
	  var targetLo = target % 4294967296;
	  var dataToHash = Buffer.concat([nonce, initialHash]);
	  var resultHash = bmcrypto.sha512(bmcrypto.sha512(dataToHash));
	  var trialHi = resultHash.readUInt32BE(0, true);
	  if (trialHi > targetHi) {
	    return false;
	  } else if (trialHi < targetHi) {
	    return true;
	  } else {
	    var trialLo = resultHash.readUInt32BE(4, true);
	    return trialLo <= targetLo;
	  }
	};

	/**
	 * Do a POW.
	 * @param {Object} opts - Proof of work options
	 * @param {Buffer} opts.data - Object message payload without nonce to
	 * get the initial hash from
	 * @param {Buffer} opts.initialHash - ...or already computed initial
	 * hash
	 * @param {number} opts.target - POW target
	 * @param {number=} opts.poolSize - POW calculation pool size (by
	 * default equals to number of cores)
	 * @return {Promise.<number>} A promise that contains computed nonce for
	 * the given target when fulfilled.
	 */
	exports.doAsync = function(opts) {
	  var initialHash;
	  if (opts.data) {
	    initialHash = bmcrypto.sha512(opts.data);
	  } else {
	    initialHash = opts.initialHash;
	  }
	  opts = objectAssign({}, opts, {initialHash: initialHash});
	  return platform.pow(opts);
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Working with messages.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Message_types}
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification_v3#Message_types}
	 * @see {@link https://bitmessage.org/Bitmessage%20Technical%20Paper.pdf}
	 * @module bitmessage/messages
	 * @example
	 * var structs = require("bitmessage").structs;
	 * var messages = require("bitmessage").messages;
	 *
	 * // Simple encoding and decoding:
	 * var vermsg = messages.version.encode({
	 *   remoteHost: "1.1.1.1",
	 *   remotePort: 8444,
	 * });
	 * console.log(messages.version.decode(vermsg).remoteHost);  // 1.1.1.1
	 *
	 * // Low-level encoding and decoding:
	 * var addrPayload = messages.addr.encodePayload([
	 *   {host: "2.2.2.2", port: 28444},
	 * ]);
	 * var addrmsg = structs.message.encode("addr", addrPayload);
	 * var decoded = structs.message.decode(addrmsg);
	 * console.log(decoded.command);  // addr
	 * var addr = messages.addr.decodePayload(decoded.payload);
	 * console.log(addr.addrs[0].host);  // 2.2.2.2
	 *
	 * // Encode with empty payload:
	 * var verackmsg = structs.message.encode("verack");
	 * console.log(structs.message.decode(verackmsg).command);  // verack
	 */

	"use strict";

	var objectAssign = Object.assign || __webpack_require__(66);
	var bufferEqual = __webpack_require__(10);
	var assert = __webpack_require__(12).assert;
	var structs = __webpack_require__(65);
	var bmcrypto = __webpack_require__(13);
	var UserAgent = __webpack_require__(69);
	var util = __webpack_require__(12);

	var message = structs.message;
	var ServicesBitfield = structs.ServicesBitfield;
	var IPv4_MAPPING = util.IPv4_MAPPING;
	var inet_pton = util.inet_pton;

	/**
	 * Try to get command of the given encoded message.
	 * Note that this function doesn't do any validation because it is
	 * already provided by
	 * [message.decode]{@link module:bitmessage/structs.message.decode}
	 * routine.
	 * @param {Buffer} buf - Buffer that starts with encoded message
	 * @return {?string} Message's command if any.
	 */
	exports.getCommand = function(buf) {
	  if (buf.length < 16) {
	    return;
	  }
	  var command = buf.slice(4, 16);
	  var firstNonNull = 0;
	  for (var i = 11; i >=0; i--) {
	    if (command[i] !== 0) {
	      firstNonNull = i + 1;
	      break;
	    }
	  }
	  return command.slice(0, firstNonNull).toString("ascii");
	};

	/**
	 * `version` message.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#version}
	 * @namespace
	 * @static
	 */
	var version = exports.version = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {number} protoVersion - Identifies protocol version being
	   * used by the node. Should equal 3. Nodes should disconnect if the
	   * remote node's version is lower but continue with the connection if
	   * it is higher.
	   * @property {Object} services -
	   * [Service]{@link module:bitmessage/structs.ServicesBitfield}
	   * features to be enabled for this connection
	   * @property {Date} time - Node time
	   * @property {string} remoteHost - IPv4/IPv6 address of the node
	   * receiving this message
	   * @property {number} remotePort - Port of the node receiving this
	   * message
	   * @property {number} port - Incoming port of the node sending this
	   * message
	   * @property {Buffer} nonce - An 8-byte random nonce used to detect
	   * connection to self
	   * @property {string} userAgent - [User agent]{@link
	   * module:bitmessage/user-agent} of the node
	   * @property {number[]} streams - Streams accepted by the node
	   * @property {number} length - Real data length
	   * @memberof module:bitmessage/messages.version
	   */

	  /**
	   * Random nonce used to detect connections to self.
	   * @constant {Buffer}
	   */
	  randomNonce: bmcrypto.randomBytes(8),

	  /**
	   * Decode `version` message.  
	   * NOTE: `nonce` is copied.
	   * @param {Buffer} buf - Message
	   * @return {DecodeResult}
	   * [Decoded `version` structure.]{@link module:bitmessage/messages.version.DecodeResult}
	   */
	  decode: function(buf) {
	    var decoded = message.decode(buf);
	    assert(decoded.command === "version", "Bad command");
	    return version.decodePayload(decoded.payload);
	  },

	  /**
	   * Decode `version` message payload.
	   * The same as [decode]{@link module:bitmessage/messages.version.decode}.
	   */
	  decodePayload: function(buf) {
	    // 4 + 8 + 8 + 26 + 26 + 8 + (1+) + (1+)
	    assert(buf.length >= 82, "Buffer is too small");
	    var protoVersion = buf.readUInt32BE(0, true);
	    var services = ServicesBitfield(buf.slice(4, 12), {copy: true});
	    var time = util.readTime64BE(buf, 12);
	    var short = {short: true};
	    var addrRecv = structs.net_addr.decode(buf.slice(20, 46), short);
	    var addrFrom = structs.net_addr.decode(buf.slice(46, 72), short);
	    var nonce = new Buffer(8);
	    buf.copy(nonce, 0, 72, 80);
	    var decodedUa = UserAgent.decode(buf.slice(80));
	    assert(decodedUa.length <= 5000, "User agent is too long");
	    var decodedStreams = structs.var_int_list.decode(decodedUa.rest);
	    assert(decodedStreams.list.length <= 160000, "Too many streams");
	    return {
	      protoVersion: protoVersion,
	      services: services,
	      time: time,
	      remoteHost: addrRecv.host,
	      remotePort: addrRecv.port,
	      port: addrFrom.port,
	      nonce: nonce,
	      userAgent: decodedUa.str,
	      streams: decodedStreams.list,
	      // NOTE(Kagami): Real data length. It may be some gap between end
	      // of stream numbers list and end of payload:
	      //     [payload..............[stream numbers]xxxx]
	      // We are currently ignoring that.
	      length: 80 + decodedUa.length + decodedStreams.length,
	    };
	  },

	  /**
	   * Encode `version` message.
	   * @param {Object} opts - Version options
	   * @param {Object=} opts.services -
	   * [Service]{@link module:bitmessage/structs.ServicesBitfield}
	   * features to be enabled for this connection (`NODE_NETWORK` by
	   * default)
	   * @param {Date=} opts.time - Node time (current time by default)
	   * @param {string} opts.remoteHost - IPv4/IPv6 address of the node
	   * receiving this message
	   * @param {number} opts.remotePort - Port of the node receiving this
	   * message
	   * @param {number=} opts.port - Incoming port of the node (8444 by
	   * default)
	   * @param {Buffer=} opts.nonce - An 8-byte random nonce used to detect
	   * connection to self (unique per node.js process by default)
	   * @param {(Array|string|Buffer)=} opts.userAgent -
	   * [User agent]{@link module:bitmessage/user-agent} of the node
	   * (user agent of bitmessage library by default)
	   * @param {Array<number>=} opts.streams - Streams accepted by the node
	   * ([1] by default)
	   * @return {Buffer} Encoded message.
	   */
	  encode: function(opts) {
	    var payload = version.encodePayload(opts);
	    return message.encode("version", payload);
	  },

	  /**
	   * Encode `version` message payload.
	   * The same as [encode]{@link module:bitmessage/messages.version.encode}.
	   */
	  encodePayload: function(opts) {
	    // Deal with default options.
	    var services = opts.services ||
	                   ServicesBitfield().set(ServicesBitfield.NODE_NETWORK);
	    var time = opts.time || new Date();
	    var nonce = opts.nonce || version.randomNonce;
	    assert(nonce.length === 8, "Bad nonce");
	    var port = opts.port || 8444;
	    var userAgent = UserAgent.encode(opts.userAgent || UserAgent.SELF);
	    assert(userAgent.length <= 5000, "User agent is too long");
	    var streams = opts.streams || [1];
	    assert(streams.length <= 160000, "Too many streams");
	    // Start encoding.
	    var protoVersion = new Buffer(4);
	    protoVersion.writeUInt32BE(util.PROTOCOL_VERSION, 0);
	    var addrRecv = structs.net_addr.encode({
	      services: services,
	      host: opts.remoteHost,
	      port: opts.remotePort,
	      short: true,
	    });
	    var addrFrom = structs.net_addr.encode({
	      services: services,
	      host: "127.0.0.1",
	      port: port,
	      short: true,
	    });
	    return Buffer.concat([
	      protoVersion,
	      services.buffer,
	      util.writeTime64BE(null, time),
	      addrRecv,
	      addrFrom,
	      nonce,
	      userAgent,
	      structs.var_int_list.encode(streams),
	    ]);
	  },
	};

	var IPv6_LOOPBACK = new Buffer(
	  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
	);

	// Check whether given encoded IPv6 or IPv4-mapped IPv6 is in private
	// network range. See
	// <https://en.wikipedia.org/wiki/Reserved_IP_addresses> for details.
	// TODO(Kagami): Do we also need to filter multicasts and other reserved
	// ranges?
	function isPrivateIp(buf) {
	  // IPv4.
	  if (bufferEqual(buf.slice(0, 12), IPv4_MAPPING)) {
	    buf = buf.slice(12);
	    if (buf[0] === 127) {
	      return true;
	    } else if (buf[0] === 10) {
	      return true;
	    } else if (buf[0] === 192 && buf[1] === 168) {
	      return true;
	    // XXX(Kagami): ignore:start and ignore:end doesn't ignore this for
	    // some reason. Probably related:
	    // <https://github.com/jshint/jshint/issues/1465>.
	    } else if (buf[0] === 172 && (buf[1] & 0xf0) === 0x10) {//jshint ignore:line
	      return true;
	    } else if (buf[0] === 169 && buf[1] === 254) {
	      return true;
	    } else {
	      return false;
	    }
	  // IPv6.
	  } else {
	    if (bufferEqual(buf, IPv6_LOOPBACK)) {
	      return true;
	    } else if (buf[0] === 0xfe && (buf[1] & 0xc0) === 0x80) {//jshint ignore:line
	      return true;
	    } else if ((buf[0] & 0xfe) === 0xfc) {  // jshint ignore:line
	      return true;
	    } else {
	      return false;
	    }
	  }
	}

	// Helper to make it easier to filter out private IPs.
	function checkAddrOpts(opts) {
	  return !isPrivateIp(inet_pton(opts.host));
	}

	/**
	 * `addr` message. Provide information on known nodes of the network.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#addr}
	 * @namespace
	 * @static
	 */
	var addr = exports.addr = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {Object[]} addrs - List of
	   * [decoded `net_addr` structures]{@link module:bitmessage/structs.net_addr.DecodeResult}
	   * @property {number} length - Real data length
	   * @memberof module:bitmessage/messages.addr
	   */

	  /**
	   * Decode `addr` message.
	   * @param {Buffer} buf - Message
	   * @return {DecodeResult}
	   * [Decoded `addr` structure.]{@link module:bitmessage/messages.addr.DecodeResult}
	   */
	  decode: function(buf) {
	    var decoded = message.decode(buf);
	    assert(decoded.command === "addr", "Bad command");
	    return addr.decodePayload(decoded.payload);
	  },

	  /**
	   * Decode `addr` message payload.
	   * The same as [decode]{@link module:bitmessage/messages.addr.decode}.
	   */
	  decodePayload: function(buf) {
	    var decoded = structs.var_int.decode(buf);
	    var listLength = decoded.value;
	    // NOTE(Kagami): Check length before filtering private IPs because
	    // we shouldn't even receive them.
	    assert(listLength <= 1000, "Too many address entires");
	    var length = decoded.length + listLength * 38;
	    assert(buf.length >= length, "Buffer is too small");
	    var rest = decoded.rest;
	    var addrs = [];
	    var addrBuf;
	    for (var i = 0; i < listLength; i++) {
	      addrBuf = rest.slice(i*38, (i+1)*38);
	      if (!isPrivateIp(addrBuf.slice(20, 36))) {
	        addrs.push(structs.net_addr.decode(addrBuf));
	      }
	    }
	    return {
	      addrs: addrs,
	      // Real data length.
	      length: length,
	    };
	  },

	  /**
	   * Encode `addr` message.
	   * @param {Object[]} addrs - List of
	   * [net_addr encode options]{@link module:bitmessage/structs.net_addr.encode}
	   * @return {Buffer} Encoded message.
	   */
	  encode: function(addrs) {
	    var payload = addr.encodePayload(addrs);
	    return message.encode("addr", payload);
	  },

	  /**
	   * Encode `addr` message payload.
	   * The same as [encode]{@link module:bitmessage/messages.addr.encode}.
	   */
	  encodePayload: function(addrs) {
	    addrs = addrs.filter(checkAddrOpts);
	    assert(addrs.length <= 1000, "Too many address entires");
	    var addrBufs = addrs.map(structs.net_addr.encode);
	    var bufs = [structs.var_int.encode(addrs.length)].concat(addrBufs);
	    return Buffer.concat(bufs);
	  },
	};

	/**
	 * `inv` message. Allows a node to advertise its knowledge of one or
	 * more objects.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#inv}
	 * @namespace
	 * @static
	 */
	var inv = exports.inv = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {Buffer[]} vectors - List of [inventory vectors]{@link
	   * module:bitmessage/structs.inv_vect}
	   * @property {number} length - Real data length
	   * @memberof module:bitmessage/messages.inv
	   */

	  /**
	   * Decode `inv` message.
	   * @param {Buffer} buf - Message
	   * @return {DecodeResult}
	   * [Decoded `inv` structure.]{@link module:bitmessage/messages.inv.DecodeResult}
	   */
	  decode: function(buf) {
	    var decoded = message.decode(buf);
	    assert(decoded.command === "inv", "Bad command");
	    return inv.decodePayload(decoded.payload);
	  },

	  /**
	   * Decode `inv` message payload.
	   * The same as [decode]{@link module:bitmessage/messages.inv.decode}.
	   */
	  decodePayload: function(buf) {
	    var decoded = structs.var_int.decode(buf);
	    var listLength = decoded.value;
	    assert(listLength <= 50000, "Too many vectors");
	    var length = decoded.length + listLength * 32;
	    assert(buf.length >= length, "Buffer is too small");
	    var rest = decoded.rest;
	    var vectors = new Array(listLength);
	    for (var i = 0; i < listLength; i++) {
	      vectors[i] = rest.slice(i*32, (i+1)*32);
	    }
	    return {
	      vectors: vectors,
	      // Real data length.
	      length: length,
	    };
	  },

	  /**
	   * Encode `inv` message.
	   * @param {Buffer[]} vectors - [Inventory vector]{@link
	   * module:bitmessage/structs.inv_vect} list
	   * @return {Buffer} Encoded message.
	   */
	  encode: function(vectors) {
	    var payload = inv.encodePayload(vectors);
	    return message.encode("inv", payload);
	  },

	  /**
	   * Encode `inv` message payload.
	   * The same as [encode]{@link module:bitmessage/messages.inv.encode}.
	   */
	  encodePayload: function(vectors) {
	    assert(vectors.length <= 50000, "Too many vectors");
	    // TODO(Kagami): Validate vectors length.
	    var bufs = [structs.var_int.encode(vectors.length)].concat(vectors);
	    return Buffer.concat(bufs);
	  },
	};

	/**
	 * `getdata` message. `getdata` is used in response to an
	 * [inv]{@link module:bitmessage/messages.inv} message to retrieve the
	 * content of a specific object after filtering known elements.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#getdata}
	 * @namespace
	 */
	exports.getdata = objectAssign({}, inv, {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {Buffer[]} vectors - List of [inventory vectors]{@link
	   * module:bitmessage/structs.inv_vect}
	   * @property {number} length - Real data length
	   * @memberof module:bitmessage/messages.getdata
	   */

	  /**
	   * Decode `getdata` message.
	   * @param {Buffer} buf - Message
	   * @return {DecodeResult}
	   * [Decoded `getdata` structure.]{@link module:bitmessage/messages.getdata.DecodeResult}
	   * @memberof module:bitmessage/messages.getdata
	   */
	  decode: function(buf) {
	    var decoded = message.decode(buf);
	    assert(decoded.command === "getdata", "Bad command");
	    return inv.decodePayload(decoded.payload);
	  },

	  /**
	   * Decode `getdata` message payload.
	   * The same as [decode]{@link module:bitmessage/messages.getdata.decode}.
	   * @function decodePayload
	   * @memberof module:bitmessage/messages.getdata
	   */

	  /**
	   * Encode `getdata` message.
	   * @param {Buffer[]} vectors - [Inventory vector]{@link
	   * module:bitmessage/structs.inv_vect} list
	   * @return {Buffer} Encoded message.
	   * @memberof module:bitmessage/messages.getdata
	   */
	  encode: function(vectors) {
	    var payload = inv.encodePayload(vectors);
	    return message.encode("getdata", payload);
	  },

	  /**
	   * Encode `getdata` message payload.
	   * The same as [encode]{@link module:bitmessage/messages.getdata.encode}.
	   * @function encodePayload
	   * @memberof module:bitmessage/messages.getdata
	   */
	});

	/**
	 * `error` message.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification_v3#error}
	 * @namespace
	 * @static
	 */
	var error = exports.error = {
	  /**
	   * Just a warning.
	   * @constant {number}
	   */
	  WARNING: 0,

	  /**
	   * It's an error, something was going wrong (e.g. an object got lost).
	   * @constant {number}
	   */
	  ERROR: 1,

	  /**
	   * It's a fatal error. The node will drop the line for that error and
	   * maybe ban you for some time.
	   * @constant {number}
	   */
	  FATAL: 2,

	  /**
	   * Convert error type to a human-readable string.
	   * @param {number} type - Type of the error
	   * @return {string}
	   */
	  type2str: function(type) {
	    switch (type) {
	      case error.WARNING: return "warning";
	      case error.ERROR: return "error";
	      case error.FATAL: return "fatal";
	      default: return "unknown";
	    }
	  },

	  /**
	   * @typedef {Object} DecodeResult
	   * @property {number} type - Type of the error
	   * @property {number} banTime - The other node informs that it will
	   * not accept further connections for this number of seconds
	   * @property {?Buffer} vector - [Inventory vector]{@link
	   * module:bitmessage/structs.inv_vect} related to the error
	   * @property {string} errorText - A human-readable error description
	   * @property {number} length - Real data length
	   * @memberof module:bitmessage/messages.error
	   */

	  /**
	   * Decode `error` message.
	   * @param {Buffer} buf - Message
	   * @return {DecodeResult}
	   * [Decoded `error` structure.]{@link module:bitmessage/messages.error.DecodeResult}
	   */
	  decode: function(buf) {
	    var decoded = message.decode(buf);
	    assert(decoded.command === "error", "Bad command");
	    return error.decodePayload(decoded.payload);
	  },

	  /**
	   * Decode `error` message payload.
	   * The same as [decode]{@link module:bitmessage/messages.error.decode}.
	   */
	  decodePayload: function(buf) {
	    assert(buf.length >= 4, "Buffer is too small");
	    var decodedType = structs.var_int.decode(buf);
	    var decodedBanTime = structs.var_int.decode(decodedType.rest);

	    var decodedVectorLength = structs.var_int.decode(decodedBanTime.rest);
	    // NOTE(Kagami): Inventory vector should be only 32-byte in size but
	    // currently we don't ensure it.
	    var vectorLength = decodedVectorLength.value;
	    var rest = decodedVectorLength.rest;
	    assert(rest.length >= vectorLength, "Buffer is too small");
	    var vector = null;
	    if (vectorLength) {
	      vector = new Buffer(vectorLength);
	      rest.copy(vector);
	      rest = rest.slice(vectorLength);
	    }

	    var decodedErrorText = structs.var_str.decode(rest);
	    var length = (
	      decodedType.length +
	      decodedBanTime.length +
	      decodedVectorLength.length + vectorLength +
	      decodedErrorText.length
	    );
	    return {
	      type: decodedType.value,
	      banTime: decodedBanTime.value,
	      vector: vector,
	      errorText: decodedErrorText.str,
	      // Real data length.
	      length: length,
	    };
	  },

	  /**
	   * Encode `error` message.
	   * @param {Object} opts - Error options
	   * @param {number=} opts.type - Type of the error
	   * ([warning]{@link module:bitmessage/messages.error.WARNING} by
	   * default)
	   * @param {number=} opts.banTime - Inform the other node, that you
	   * will not accept further connections for this number of seconds (0
	   * by default)
	   * @param {Buffer=} opts.vector - A 32-byte [inventory vector]{@link
	   * module:bitmessage/structs.inv_vect} related to the error (empty by
	   * default)
	   * @param {string} opts.errorText - A human-readable error description
	   * @return {Buffer} Encoded message.
	   */
	  encode: function(opts) {
	    var payload = error.encodePayload(opts);
	    return message.encode("error", payload);
	  },

	  /**
	   * Encode `error` message payload.
	   * The same as [encode]{@link module:bitmessage/messages.error.encode}.
	   */
	  encodePayload: function(opts) {
	    var type = opts.type || error.WARNING;
	    var banTime = opts.banTime || 0;
	    // TODO(Kagami): Validate vector length.
	    var vector = opts.vector || new Buffer(0);
	    return Buffer.concat([
	      structs.var_int.encode(type),
	      structs.var_int.encode(banTime),
	      structs.var_int.encode(vector.length),
	      vector,
	      structs.var_str.encode(opts.errorText),
	    ]);
	  },
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Working with Bitmessage user agents.
	 * @see {@link https://bitmessage.org/wiki/User_Agent}
	 * @module bitmessage/user-agent
	 */

	"use strict";

	var var_str = __webpack_require__(65).var_str;
	var BM_NAME = __webpack_require__(70).name;
	var BM_VERSION = __webpack_require__(70).version;

	/**
	 * User agent of the bitmessage library itself.
	 * @constant {Object[]}
	 * @static
	 */
	var SELF = exports.SELF = [{name: BM_NAME, version: BM_VERSION}];

	/**
	 * Decode user agent's `var_str`. Just an alias for
	 * [var_str.decode]{@link module:bitmessage/structs.var_str.decode}.
	 * @function
	 */
	exports.decode = var_str.decode;

	/**
	 * Parse raw user agent into software stack list. Most underlying
	 * software comes first.  
	 * NOTE: Decoding is rather loose, it won't fail on bad user agent
	 * format because it's not that important.
	 * @param {string} str - Raw user agent string
	 * @return {Object[]} Parsed user agent.
	 */
	exports.parse = function(str) {
	  var software = [];
	  if (str.length > 2 && str[0] === "/" && str[str.length - 1] === "/") {
	    software = str.slice(1, -1).split("/");
	    software = software.map(function(str) {
	      // That's more readable than /([^:]*)(?::([^(]*)(?:\(([^)]*))?)?/
	      var soft = {name: str};
	      var semicolon = soft.name.indexOf(":");
	      if (semicolon !== -1) {
	        soft.version = soft.name.slice(semicolon + 1);
	        soft.name = soft.name.slice(0, semicolon);
	        var obracket = soft.version.indexOf("(");
	        if (obracket !== -1) {
	          soft.comments = soft.version.slice(obracket + 1);
	          soft.version = soft.version.slice(0, obracket);
	          var cbracket = soft.comments.indexOf(")");
	          if (cbracket !== -1) {
	            soft.comments = soft.comments.slice(0, cbracket);
	          }
	        }
	      }
	      return soft;
	    });
	  }
	  return software;
	};

	/**
	 * Encode user agent into `var_str` Buffer. Most underlying software
	 * comes first.
	 * @param {(Object[]|string[]|string|Buffer)} software - List of
	 * software to encode or just raw user agent string/Buffer
	 * @return {Buffer} Encoded user agent.
	 * @function
	 * @static
	 */
	var encode = exports.encode = function(software) {
	  var ua;
	  if (Array.isArray(software)) {
	    ua = software.map(function(soft) {
	      if (typeof soft === "string") {
	        return soft;
	      }
	      var version = soft.version || "0.0.0";
	      var str = soft.name + ":" + version;
	      if (soft.comments) {
	        str += "(" + soft.comments + ")";
	      }
	      return str;
	    }).join("/");
	    ua = "/" + ua + "/";
	  } else if (Buffer.isBuffer(software)) {
	    return software;
	  } else {
	    ua = software;
	  }
	  return var_str.encode(ua);
	};

	/**
	 * Encode user agent of bitmessage library.
	 * @return {Buffer} Encoded user agent.
	 */
	exports.encodeSelf = function() {
	  return encode(SELF);
	};

	/**
	 * Encode user agent with user agent of bitmessage library underneath.
	 * Most underlying software comes first.
	 * @param {(Object[]|string[]|Object|string)} software - List of
	 * software to encode
	 * @return {Buffer} Encoded user agent.
	 */
	exports.encodeSelfWith = function(software) {
	  software = SELF.concat(software);
	  return encode(software);
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		"name": "bitmessage",
		"version": "0.6.3",
		"description": "JavaScript Bitmessage library",
		"main": "./lib/index.js",
		"browser": {
			"./lib/platform.js": "./lib/platform.browser.js"
		},
		"scripts": {
			"install": "node-gyp rebuild || exit 0",
			"test": "ALL_TESTS=1 mocha && ALL_TESTS=1 xvfb-run -a karma start --browsers Chromium && ALL_TESTS=1 xvfb-run -a karma start --browsers Firefox && jshint .",
			"m": "mocha",
			"kc": "xvfb-run -a karma start --browsers Chromium",
			"kf": "xvfb-run -a karma start --browsers Firefox",
			"j": "jshint .",
			"d": "jsdoc -c jsdoc.json",
			"mv-docs": "rm -rf docs && jsdoc -c jsdoc.json && D=`mktemp -d` && mv docs \"$D\" && git checkout gh-pages && rm -rf docs && mv \"$D/docs\" . && rm -rf \"$D\""
		},
		"repository": {
			"type": "git",
			"url": "git+https://github.com/bitchan/bitmessage.git"
		},
		"keywords": [
			"bitmessage",
			"crypto",
			"library",
			"messaging"
		],
		"author": {
			"name": "Kagami Hiiragi"
		},
		"license": "CC0",
		"bugs": {
			"url": "https://github.com/bitchan/bitmessage/issues"
		},
		"homepage": "https://github.com/bitchan/bitmessage",
		"devDependencies": {
			"chai": "*",
			"jsdoc": "git+https://github.com/jsdoc3/jsdoc.git",
			"jshint": "*",
			"karma": "^0.12.31",
			"karma-browserify": "^2.0.0",
			"karma-chrome-launcher": "^0.1.7",
			"karma-cli": "~0.0.4",
			"karma-env-preprocessor": "^0.1.0",
			"karma-firefox-launcher": "^0.1.4",
			"karma-mocha": "^0.1.10",
			"karma-mocha-reporter": "^0.3.1",
			"mocha": "*"
		},
		"dependencies": {
			"bn.js": "^2.0.0",
			"bs58": "^2.0.0",
			"buffer-equal": "~0.0.1",
			"eccrypto": "^0.9.7",
			"es6-promise": "^2.0.1",
			"hash.js": "^1.0.2",
			"nan": "^1.4.1",
			"object-assign": "^2.0.0",
			"sha.js": "^2.3.1",
			"webworkify": "^1.0.1",
			"bignum": "^0.9.0"
		},
		"optionalDependencies": {
			"bignum": "^0.9.0"
		},
		"gitHead": "b7014025f08e65df1579f99c4d20ab3fe920e1b5",
		"_id": "bitmessage@0.6.3",
		"_shasum": "0817c46c14de3349fd85b29d34b5abf9af3b3fc8",
		"_from": "bitmessage@*",
		"_npmVersion": "1.4.28",
		"_npmUser": {
			"name": "kagami",
			"email": "kagami@genshiken.org"
		},
		"maintainers": [
			{
				"name": "kagami",
				"email": "kagami@genshiken.org"
			}
		],
		"dist": {
			"shasum": "0817c46c14de3349fd85b29d34b5abf9af3b3fc8",
			"tarball": "http://registry.npmjs.org/bitmessage/-/bitmessage-0.6.3.tgz"
		},
		"directories": {},
		"_resolved": "https://registry.npmjs.org/bitmessage/-/bitmessage-0.6.3.tgz",
		"readme": "ERROR: No README data found!"
	}

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Working with objects.  
	 * NOTE: Most operations with objects are asynchronous and return
	 * promises.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#Object_types}
	 * @module bitmessage/objects
	 */

	"use strict";

	var objectAssign = Object.assign || __webpack_require__(66);
	var bufferEqual = __webpack_require__(10);
	var assert = __webpack_require__(12).assert;
	var PPromise = __webpack_require__(59).Promise;
	var bmcrypto = __webpack_require__(13);
	var Address = __webpack_require__(72);
	var structs = __webpack_require__(65);
	var POW = __webpack_require__(67);
	var util = __webpack_require__(12);

	var var_int = structs.var_int;
	var PubkeyBitfield = structs.PubkeyBitfield;
	var message = structs.message;
	var object = structs.object;

	/**
	 * Try to get type of the given encoded object message.
	 * Note that this function doesn't do any validation because it is
	 * already provided by
	 * [object.decode]{@link module:bitmessage/structs.object.decode}
	 * routine. Normally you call this for each incoming object message and
	 * then call decode function of the appropriate object handler.
	 * @param {Buffer} buf - Buffer that starts with encoded object message
	 * @return {?number} Object's type if any.
	 */
	exports.getType = function(buf) {
	  // Message header: 4 + 12 + 4 + 4
	  // Object header: 8 + 8 + 4
	  if (buf.length < 44) {
	    return;
	  }
	  return buf.readUInt32BE(40, true);
	};

	/**
	 * Try to get type of the given object message payload.
	 * The same as [getType]{@link module:bitmessage/objects.getType}.
	 */
	exports.getPayloadType = function(buf) {
	  // Object header: 8 + 8 + 4
	  if (buf.length < 20) {
	    return;
	  }
	  return buf.readUInt32BE(16, true);
	};

	// Prepend nonce to a given object without nonce.
	function prependNonce(obj, opts) {
	  return new PPromise(function(resolve) {
	    assert(obj.length <= 262136, "object message payload is too big");
	    opts = objectAssign({}, opts);
	    var nonce, target, powp;
	    if (opts.skipPow) {
	      nonce = new Buffer(8);
	      nonce.fill(0);
	      resolve(Buffer.concat([nonce, obj]));
	    } else {
	      opts.payloadLength = obj.length + 8;  // Compensate for nonce
	      target = POW.getTarget(opts);
	      powp = POW.doAsync({target: target, data: obj})
	        .then(function(nonce) {
	          // TODO(Kagami): We may want to receive nonce as a Buffer from
	          // POW module to skip conversion step.
	          var payload = new Buffer(opts.payloadLength);
	          util.writeUInt64BE(payload, nonce, 0, true);
	          obj.copy(payload, 8);
	          return payload;
	        });
	      resolve(powp);
	    }
	  });
	}

	/**
	 * `getpubkey` object. When a node has the hash of a public key (from an
	 * address) but not the public key itself, it must send out a request
	 * for the public key.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#getpubkey}
	 * @namespace
	 * @static
	 */
	var getpubkey = exports.getpubkey = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {Buffer} nonce - A 8-byte object nonce
	   * @property {number} ttl - Time to live in seconds
	   * @property {Date} expires - Object expiration date
	   * @property {number} type - Object type
	   * @property {number} version - Object version
	   * @property {number} stream - Object stream
	   * @property {number} headerLength - Length of the object header
	   * @property {Buffer} ripe - The RIPEMD hash of the requested public
	   * keys for address version <= 3
	   * @property {Buffer} tag - ...or tag derived from the address object
	   * for address version >= 4
	   * @property {number} length - Real data length
	   * @memberof module:bitmessage/objects.getpubkey
	   */

	  /**
	   * Decode `getpubkey` object message.
	   * @param {Buffer} buf - Message
	   * @param {Object=} opts - Any of [object.decode]{@link
	   * module:bitmessage/structs.object.decode} options
	   * @return {Promise.<DecodeResult>} A promise that contains
	   * [decoded `getpubkey` structure]{@link
	   * module:bitmessage/objects.getpubkey.DecodeResult} when fulfilled.
	   */
	  decodeAsync: function(buf, opts) {
	    return new PPromise(function(resolve) {
	      var decoded = message.decode(buf);
	      assert(decoded.command === "object", "Bad command");
	      resolve(getpubkey.decodePayloadAsync(decoded.payload, opts));
	    });
	  },

	  /**
	   * Decode `getpubkey` object message payload.
	   * The same as [decodeAsync]{@link
	   * module:bitmessage/objects.getpubkey.decodeAsync}.
	   */
	  decodePayloadAsync: function(buf, opts) {
	    return new PPromise(function(resolve) {
	      var decoded = object.decodePayload(buf, opts);
	      assert(decoded.type === object.GETPUBKEY, "Wrong object type");
	      assert(decoded.version >= 2, "getpubkey version is too low");
	      assert(decoded.version <= 4, "getpubkey version is too high");
	      var objectPayload = util.popkey(decoded, "objectPayload");
	      if (decoded.version < 4) {
	        assert(objectPayload.length === 20, "getpubkey ripe is too small");
	        // Object payload is copied so it's safe to return it right away.
	        decoded.ripe = objectPayload;
	      } else {
	        assert(objectPayload.length === 32, "getpubkey tag is too small");
	        // Object payload is copied so it's safe to return it right away.
	        decoded.tag = objectPayload;
	      }
	      resolve(decoded);
	    });
	  },

	  /**
	   * Encode `getpubkey` object message.
	   * @param {Object} opts - `getpubkey` object options
	   * @param {number} opts.ttl - Time to live in seconds
	   * @param {Address} opts.to - Receiver of the message
	   * @param {boolean=} opts.skipPow - Do not compute POW (false by
	   * default)
	   * @return {Promise.<Buffer>} A promise that contains encoded message
	   * when fulfilled.
	   */
	  encodeAsync: function(opts) {
	    return getpubkey.encodePayloadAsync(opts).then(function(payload) {
	      return message.encode("object", payload);
	    });
	  },

	  /**
	   * Encode `getpubkey` object message payload.
	   * The same as
	   * [encodeAsync]{@link module:bitmessage/objects.getpubkey.encodeAsync}.
	   */
	  encodePayloadAsync: function(opts) {
	    return new PPromise(function(resolve) {
	      opts = objectAssign({}, opts);
	      opts.type = object.GETPUBKEY;
	      // Bitmessage address of recepeint of `getpubkey` message.
	      var to = Address.decode(opts.to);
	      assert(to.version >= 2, "Address version is too low");
	      assert(to.version <= 4, "Address version is too high");
	      opts.version = to.version;
	      opts.stream = to.stream;
	      opts.objectPayload = to.version < 4 ? to.ripe : to.getTag();
	      var obj = object.encodePayloadWithoutNonce(opts);
	      resolve(prependNonce(obj, opts));
	    });
	  },
	};

	// Extract pubkey data from decrypted object payload.
	function extractPubkey(buf) {
	  var decoded = {length: 132};
	  // We assume here that input buffer was copied before so it's safe to
	  // return reference to it.
	  decoded.behavior = PubkeyBitfield(buf.slice(0, 4));
	  var signPublicKey = decoded.signPublicKey = new Buffer(65);
	  signPublicKey[0] = 4;
	  buf.copy(signPublicKey, 1, 4, 68);
	  var encPublicKey = decoded.encPublicKey = new Buffer(65);
	  encPublicKey[0] = 4;
	  buf.copy(encPublicKey, 1, 68, 132);
	  return decoded;
	}

	// Extract pubkey version 3 data from decrypted object payload.
	function extractPubkeyV3(buf) {
	  var decoded = extractPubkey(buf);
	  var decodedTrials = var_int.decode(buf.slice(132));
	  decoded.nonceTrialsPerByte = decodedTrials.value;
	  decoded.length += decodedTrials.length;
	  var decodedExtraBytes = var_int.decode(decodedTrials.rest);
	  decoded.payloadLengthExtraBytes = decodedExtraBytes.value;
	  decoded.length += decodedExtraBytes.length;
	  var decodedSigLength = var_int.decode(decodedExtraBytes.rest);
	  var siglen = decodedSigLength.value;
	  var rest = decodedSigLength.rest;
	  assert(rest.length >= siglen, "Bad pubkey object payload length");
	  decoded.signature = rest.slice(0, siglen);
	  siglen += decodedSigLength.length;
	  decoded._siglen = siglen;  // Internal value
	  decoded.length += siglen;
	  return decoded;
	}

	// Note that tag matching only works for address version >= 4.
	function findAddrByTag(addrs, tag) {
	  var i, addr;
	  addrs = addrs || [];
	  if (Address.isAddress(addrs)) {
	    addrs = [addrs];
	  }
	  if (Array.isArray(addrs)) {
	    for (i = 0; i < addrs.length; i++) {
	      addr = addrs[i];
	      if (addr.version >= 4 && bufferEqual(addr.getTag(), tag)) {
	        return addr;
	      }
	    }
	  } else {
	    addr = addrs[tag];
	    if (addr && addr.version >= 4) {
	      return addr;
	    }
	  }
	}

	/**
	 * `pubkey` object.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#pubkey}
	 * @namespace
	 * @static
	 */
	var pubkey = exports.pubkey = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {Buffer} nonce - A 8-byte object nonce
	   * @property {number} ttl - Time to live in seconds
	   * @property {Date} expires - Object expiration date
	   * @property {number} type - Object type
	   * @property {number} version - Object version
	   * @property {number} stream - Object stream
	   * @property {number} headerLength - Length of the object header
	   * @property {Buffer} tag - Tag derived from the address object
	   * (present only if object version is 4)
	   * @property {Object} behavior - [Pubkey features]{@link
	   * module:bitmessage/structs.PubkeyBitfield} that can be expected from
	   * the node
	   * @property {Buffer} signPublicKey - Signing public key
	   * @property {Buffer} encPublicKey - Encryption public key
	   * @property {number} nonceTrialsPerByte - Difficulty parameter of the
	   * node (present only for `pubkey` version >= 3)
	   * @property {number} payloadLengthExtraBytes - Difficulty parameter
	   * of the node (present only for `pubkey` version >= 3)
	   * @property {Buffer} signature - Signature of the message (present
	   * only for `pubkey` version >= 3)
	   * @property {number} length - Real data length
	   * @memberof module:bitmessage/objects.pubkey
	   */

	  /**
	   * Decode `pubkey` object message.
	   * @param {Buffer} buf - Message
	   * @param {Object=} opts - Any of [object.decode]{@link
	   * module:bitmessage/structs.object.decode} options and:
	   * @param {(Address[]|Address|Object)} opts.needed - Address objects
	   * which represent pubkeys that we are interested in (used only for
	   * pubkeys v4). It is either addresses array or single address or
	   * Object addr-by-tag. Time to match the key is O(n), O(1), O(1)
	   * respectfully.
	   * @return {Promise.<DecodeResult>} A promise that contains
	   * [decoded `pubkey` structure]{@link
	   * module:bitmessage/objects.pubkey.DecodeResult}
	   * when fulfilled.
	   */
	  decodeAsync: function(buf, opts) {
	    return new PPromise(function(resolve) {
	      var decoded = message.decode(buf);
	      assert(decoded.command === "object", "Bad command");
	      resolve(pubkey.decodePayloadAsync(decoded.payload, opts));
	    });
	  },

	  /**
	   * Decode `pubkey` object message payload.
	   * The same as [decodeAsync]{@link
	   * module:bitmessage/objects.pubkey.decodeAsync}.
	   */
	  decodePayloadAsync: function(buf, opts) {
	    return new PPromise(function(resolve) {
	      opts = opts || {};
	      var decoded = object.decodePayload(buf, opts);
	      assert(decoded.type === object.PUBKEY, "Wrong object type");
	      var version = decoded.version;
	      assert(version >= 2, "Address version is too low");
	      assert(version <= 4, "Address version is too high");
	      var objectPayload = util.popkey(decoded, "objectPayload");
	      var siglen, pos, sig, dataToVerify, pubkeyp;
	      var tag, addr, pubkeyPrivateKey, dataToDecrypt;

	      // v2 pubkey.
	      if (version === 2) {
	        // 4 + 64 + 64
	        assert(
	          objectPayload.length === 132,
	          "Bad pubkey v2 object payload length");
	        objectAssign(decoded, extractPubkey(objectPayload));
	        return resolve(decoded);
	      }

	      // v3 pubkey.
	      if (version === 3) {
	        // 4 + 64 + 64 + (1+) + (1+) + (1+)
	        assert(
	          objectPayload.length >= 135,
	          "Bad pubkey v3 object payload length");
	        objectAssign(decoded, extractPubkeyV3(objectPayload));
	        siglen = util.popkey(decoded, "_siglen");
	        pos = decoded.headerLength + decoded.length - siglen;
	        // Object message payload from `expiresTime` up to `sig_length`.
	        dataToVerify = buf.slice(8, pos);
	        sig = decoded.signature;
	        pubkeyp = bmcrypto.verify(decoded.signPublicKey, dataToVerify, sig)
	          .then(function() {
	            return decoded;
	          });
	        return resolve(pubkeyp);
	      }

	      // v4 pubkey.
	      assert(objectPayload.length >= 32, "Bad pubkey v4 object payload length");
	      tag = decoded.tag = objectPayload.slice(0, 32);
	      addr = findAddrByTag(opts.needed, tag);
	      assert(addr, "You are not interested in this pubkey v4");
	      pubkeyPrivateKey = addr.getPubkeyPrivateKey();
	      dataToDecrypt = objectPayload.slice(32);
	      pubkeyp = bmcrypto
	        .decrypt(pubkeyPrivateKey, dataToDecrypt)
	        .then(function(decrypted) {
	          // 4 + 64 + 64 + (1+) + (1+) + (1+)
	          assert(
	            decrypted.length >= 135,
	            "Bad pubkey v4 object payload length");
	          objectAssign(decoded, extractPubkeyV3(decrypted));
	          siglen = util.popkey(decoded, "_siglen");
	          dataToVerify = Buffer.concat([
	            // Object header without nonce + tag.
	            buf.slice(8, decoded.headerLength + 32),
	            // Unencrypted pubkey data without signature.
	            decrypted.slice(0, decoded.length - siglen),
	          ]);
	          sig = decoded.signature;
	          // Since data is encrypted, entire object payload is used.
	          decoded.length = objectPayload.length;
	          return bmcrypto.verify(decoded.signPublicKey, dataToVerify, sig);
	        }).then(function() {
	          return decoded;
	        });
	      resolve(pubkeyp);
	    });
	  },

	  /**
	   * Encode `pubkey` object message.
	   * @param {Object} opts - `pubkey` object options
	   * @param {number} opts.ttl - Time to live in seconds
	   * @param {Address} opts.from - Originator of the message
	   * @param {Address} opts.to - Receiver of the message
	   * @param {boolean=} opts.skipPow - Do not compute POW (false by
	   * default)
	   * @return {Promise.<Buffer>} A promise that contains encoded message
	   * when fulfilled.
	   */
	  encodeAsync: function(opts) {
	    return pubkey.encodePayloadAsync(opts).then(function(payload) {
	      return message.encode("object", payload);
	    });
	  },

	  /**
	   * Encode `pubkey` object message payload.
	   * The same as [encodeAsync]{@link
	   * module:bitmessage/objects.pubkey.encodeAsync}.
	   */
	  encodePayloadAsync: function(opts) {
	    return new PPromise(function(resolve) {
	      opts = objectAssign({}, opts);
	      opts.type = object.PUBKEY;
	      // Originator of `pubkey` message.
	      var from = Address.decode(opts.from);
	      var nonceTrialsPerByte = util.getTrials(from);
	      var payloadLengthExtraBytes = util.getExtraBytes(from);
	      // Bitmessage address of recepient of `pubkey` message.
	      var to, version, stream;
	      if (opts.to) {
	        to = Address.decode(opts.to);
	        version = to.version;
	        stream = to.stream;
	      } else {
	        version = opts.version || 4;
	        stream = opts.stream || 1;
	      }
	      assert(version >= 2, "Address version is too low");
	      assert(version <= 4, "Address version is too high");
	      opts.version = version;
	      opts.stream = stream;
	      var obj, pubkeyp;

	      // v2 pubkey.
	      if (version === 2) {
	        opts.objectPayload = Buffer.concat([
	          from.behavior.buffer,
	          from.signPublicKey.slice(1),
	          from.encPublicKey.slice(1),
	        ]);
	        obj = object.encodePayloadWithoutNonce(opts);
	        return resolve(prependNonce(obj, opts));
	      }

	      var pubkeyData = [
	        from.behavior.buffer,
	        from.signPublicKey.slice(1),
	        from.encPublicKey.slice(1),
	        var_int.encode(nonceTrialsPerByte),
	        var_int.encode(payloadLengthExtraBytes),
	      ];

	      // v3 pubkey.
	      if (version === 3) {
	        opts.objectPayload = Buffer.concat(pubkeyData);
	        obj = object.encodePayloadWithoutNonce(opts);
	        pubkeyp = bmcrypto
	          .sign(from.signPrivateKey, obj)
	          .then(function(sig) {
	            // Append signature to the encoded object and we are done.
	            obj = Buffer.concat([obj, var_int.encode(sig.length), sig]);
	            return prependNonce(obj, opts);
	          });
	        return resolve(pubkeyp);
	      }

	      // v4 pubkey.
	      opts.objectPayload = from.getTag();
	      obj = object.encodePayloadWithoutNonce(opts);
	      var dataToSign = Buffer.concat([obj].concat(pubkeyData));
	      pubkeyp = bmcrypto
	        .sign(from.signPrivateKey, dataToSign)
	        .then(function(sig) {
	          var dataToEnc = pubkeyData.concat(var_int.encode(sig.length), sig);
	          dataToEnc = Buffer.concat(dataToEnc);
	          return bmcrypto.encrypt(from.getPubkeyPublicKey(), dataToEnc);
	        }).then(function(enc) {
	          // Concat object header with ecnrypted data and we are done.
	          obj = Buffer.concat([obj, enc]);
	          return prependNonce(obj, opts);
	        });
	      resolve(pubkeyp);
	    });
	  },
	};

	// Try to decrypt message with all provided identities.
	function tryDecryptMsg(identities, buf) {
	  function inner(i) {
	    if (i > last) {
	      return PPromise.reject(
	        new Error("Failed to decrypt msg with given identities")
	      );
	    }
	    return bmcrypto
	      .decrypt(identities[i].encPrivateKey, buf)
	      .then(function(decrypted) {
	        return {addr: identities[i], decrypted: decrypted};
	      }).catch(function() {
	        return inner(i + 1);
	      });
	  }

	  if (Address.isAddress(identities)) {
	    identities = [identities];
	  }
	  var last = identities.length - 1;
	  return inner(0);
	}

	// Encode message from the given options.
	function encodeMessage(opts) {
	  var encoding = opts.encoding || DEFAULT_ENCODING;
	  var message = opts.message;
	  var subject = opts.subject;
	  if (encoding === msg.IGNORE && !message) {
	    // User may omit message for IGNORE encoding.
	    message = new Buffer(0);
	  } else if (!Buffer.isBuffer(message)) {
	    // User may specify message as a string.
	    message = new Buffer(message, "utf8");
	  }
	  if (encoding === msg.SIMPLE && subject) {
	    // User may specify subject for SIMPLE encoding.
	    if (!Buffer.isBuffer(subject)) {
	      subject = new Buffer(subject, "utf8");
	    }
	    message = Buffer.concat([
	      new Buffer("Subject:"),
	      subject,
	      new Buffer("\nBody:"),
	      message,
	    ]);
	  }
	  return message;
	}

	// Decode message to the given encoding.
	function decodeMessage(message, encoding) {
	  var decoded = {};
	  if (encoding === msg.TRIVIAL || encoding === msg.SIMPLE) {
	    message = message.toString("utf8");
	  }
	  if (encoding !== msg.SIMPLE) {
	    decoded.message = message;
	    return decoded;
	  }

	  // SIMPLE.
	  var subject, index;
	  if (message.slice(0, 8) === "Subject:") {
	    subject = message.slice(8);
	    index = subject.indexOf("\nBody:");
	    if (index !== -1) {
	      message = subject.slice(index + 6);
	      subject = subject.slice(0, index);
	    } else {
	      message = "";
	    }
	    decoded.subject = subject;
	    decoded.message = message;
	  } else {
	    decoded.subject = "";
	    decoded.message = message;
	  }
	  return decoded;
	}

	/**
	 * `msg` object.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#msg}
	 * @namespace
	 * @static
	 */
	var msg = exports.msg = {
	  /**
	   * Any data with this number may be ignored. The sending node might
	   * simply be sharing its public key with you.
	   * @constant {number}
	   */
	  IGNORE: 0,
	  /**
	   * UTF-8. No 'Subject' or 'Body' sections. Useful for simple strings
	   * of data, like URIs or magnet links.
	   * @constant {number}
	   */
	  TRIVIAL: 1,
	  /**
	   * UTF-8. Uses 'Subject' and 'Body' sections. No MIME is used.
	   * @constant {number}
	   */
	  SIMPLE: 2,

	  /**
	   * @typedef {Object} DecodeResult
	   * @property {Buffer} nonce - A 8-byte object nonce
	   * @property {number} ttl - Time to live in seconds
	   * @property {Date} expires - Object expiration date
	   * @property {number} type - Object type
	   * @property {number} version - Object version
	   * @property {number} stream - Object stream
	   * @property {number} headerLength - Length of the object header
	   * @property {number} senderVersion - Sender's address version
	   * @property {number} senderStream - Sender's stream
	   * @property {Object} behavior - Sender's [pubkey features]{@link
	   * module:bitmessage/structs.PubkeyBitfield} that can be expected from
	   * the node
	   * @property {Buffer} signPublicKey - Sender's signing public key
	   * @property {Buffer} encPublicKey - Sender's encryption public key
	   * @property {number} nonceTrialsPerByte - Difficulty parameter of the
	   * sender (present only if sender's address version >= 3)
	   * @property {number} payloadLengthExtraBytes - Difficulty parameter
	   * of the sender (present only if sender's address version >= 3)
	   * @property {Buffer} ripe - The RIPEMD hash of the receiver's keys
	   * @property {number} encoding - Message encoding
	   * @property {(string|Buffer)} message - Message string for
	   * [TRIVIAL]{@link module:bitmessage/objects.msg.TRIVIAL} and
	   * [SIMPLE]{@link module:bitmessage/objects.msg.SIMPLE} encodings or
	   * unparsed buffer data for other encodings
	   * @property {string=} subject - Subject string for [SIMPLE]{@link
	   * module:bitmessage/objects.msg.SIMPLE} encoding
	   * @property {Buffer} ack - Message acknowledgement
	   * @property {Buffer} signature - Signature of the message
	   * @property {number} length - Real data length
	   * @memberof module:bitmessage/objects.msg
	   */

	  /**
	   * Decode `msg` object message.
	   * @param {Buffer} buf - Message
	   * @param {Object} opts - Any of [object.decode]{@link
	   * module:bitmessage/structs.object.decode} options and:
	   * @param {(Address[]|Address)} opts.identities - Address objects used
	   * to decrypt the message
	   * @return {Promise.<DecodeResult>} A promise that contains [decoded
	   * `msg` structure]{@link module:bitmessage/objects.msg.DecodeResult}
	   * when fulfilled.
	   */
	  decodeAsync: function(buf, opts) {
	    return new PPromise(function(resolve) {
	      var decoded = message.decode(buf);
	      assert(decoded.command === "object", "Bad command");
	      resolve(msg.decodePayloadAsync(decoded.payload, opts));
	    });
	  },

	  /**
	   * Decode `msg` object message payload.
	   * The same as [decodeAsync]{@link
	   * module:bitmessage/objects.msg.decodeAsync}.
	   */
	  decodePayloadAsync: function(buf, opts) {
	    return new PPromise(function(resolve) {
	      var decoded = object.decodePayload(buf, opts);
	      assert(decoded.type === object.MSG, "Bad object type");
	      assert(decoded.version === 1, "Bad msg version");
	      var objectPayload = util.popkey(decoded, "objectPayload");

	      var msgp = tryDecryptMsg(opts.identities, objectPayload)
	        .then(function(decInfo) {
	          var decrypted = decInfo.decrypted;

	          // Version, stream.
	          var decodedVersion = var_int.decode(decrypted);
	          var senderVersion = decoded.senderVersion = decodedVersion.value;
	          assert(senderVersion >= 2, "Sender version is too low");
	          assert(senderVersion <= 4, "Sender version is too high");
	          var decodedStream = var_int.decode(decodedVersion.rest);
	          decoded.senderStream = decodedStream.value;

	          // Behavior, keys.
	          assert(
	            decodedStream.rest.length >= 132,
	            "Bad msg object payload length");
	          objectAssign(decoded, extractPubkey(decodedStream.rest));
	          decoded.length += decodedVersion.length + decodedStream.length;
	          var rest = decrypted.slice(decoded.length);

	          // Pow extra.
	          if (senderVersion >= 3) {
	            var decodedTrials = var_int.decode(rest);
	            decoded.nonceTrialsPerByte = decodedTrials.value;
	            decoded.length += decodedTrials.length;
	            var decodedExtraBytes = var_int.decode(decodedTrials.rest);
	            decoded.payloadLengthExtraBytes = decodedExtraBytes.value;
	            decoded.length += decodedExtraBytes.length;
	            rest = decodedExtraBytes.rest;
	          }

	          // Ripe, encoding.
	          assert(rest.length >= 20, "Bad msg object payload length");
	          decoded.ripe = rest.slice(0, 20);
	          // TODO(Kagami): Also check against the calculated ripe (see
	          // GH-6)?
	          assert(
	            bufferEqual(decoded.ripe, decInfo.addr.ripe),
	            "msg was decrypted but the destination ripe doesn't match");
	          decoded.length += 20;
	          var decodedEncoding = var_int.decode(rest.slice(20));
	          var encoding = decoded.encoding = decodedEncoding.value;
	          decoded.length += decodedEncoding.length;

	          // Message.
	          var decodedMsgLength = var_int.decode(decodedEncoding.rest);
	          var msglen = decodedMsgLength.value;
	          rest = decodedMsgLength.rest;
	          assert(rest.length >= msglen, "Bad msg object payload length");
	          decoded.length += decodedMsgLength.length + msglen;
	          var message = rest.slice(0, msglen);
	          objectAssign(decoded, decodeMessage(message, encoding));

	          // Acknowledgement data.
	          // TODO(Kagami): Validate ack, check a POW.
	          var decodedAckLength = var_int.decode(rest.slice(msglen));
	          var acklen = decodedAckLength.value;
	          rest = decodedAckLength.rest;
	          assert(rest.length >= acklen, "Bad msg object payload length");
	          decoded.length += decodedAckLength.length + acklen;
	          decoded.ack = rest.slice(0, acklen);

	          // Signature.
	          var decodedSigLength = var_int.decode(rest.slice(acklen));
	          var siglen = decodedSigLength.value;
	          rest = decodedSigLength.rest;
	          assert(rest.length >= siglen, "Bad msg object payload length");
	          var sig = decoded.signature = rest.slice(0, siglen);

	          // Verify signature.
	          var dataToVerify = Buffer.concat([
	            // Object header without nonce.
	            buf.slice(8, decoded.headerLength),
	            // Unencrypted pubkey data without signature.
	            decrypted.slice(0, decoded.length),
	          ]);
	          // Since data is encrypted, entire object payload is used.
	          decoded.length = objectPayload.length;
	          return bmcrypto.verify(decoded.signPublicKey, dataToVerify, sig);
	        }).then(function() {
	          return decoded;
	        });
	      resolve(msgp);
	    });
	  },

	  /**
	   * Encode `msg` object message.
	   * @param {Object} opts - `msg` object options
	   * @param {number} opts.ttl - Time to live in seconds
	   * @param {Address} opts.from - Originator of the message
	   * @param {Address} opts.to - Receiver of the message
	   * @param {(string|Buffer)} opts.message - Message
	   * @param {(string|Buffer)=} opts.subject - Subject for [SIMPLE]{@link
	   * module:bitmessage/objects.msg.SIMPLE} encoding
	   * @param {number=} opts.encoding - Encoding of the message
	   * ([TRIVIAL]{@link module:bitmessage/objects.msg.TRIVIAL} by default)
	   * @param {boolean=} opts.friend - Whether the receiver is friend and
	   * should have minimal POW difficulty (false by default)
	   * @param {boolean=} opts.skipPow - Do not compute POW (false by
	   * default)
	   * @return {Promise.<Buffer>} A promise that contains encoded message
	   * when fulfilled.
	   */
	  encodeAsync: function(opts) {
	    return msg.encodePayloadAsync(opts).then(function(payload) {
	      return message.encode("object", payload);
	    });
	  },

	  /**
	   * Encode `msg` object message payload.
	   * The same as [encodeAsync]{@link
	   * module:bitmessage/objects.msg.encodeAsync}.
	   */
	  encodePayloadAsync: function(opts) {
	    return new PPromise(function(resolve) {
	      // Deal with options.
	      opts = objectAssign({}, opts);
	      opts.type = object.MSG;
	      opts.version = 1;  // The only known msg version
	      var from = Address.decode(opts.from);
	      assert(from.version >= 2, "Address version is too low");
	      assert(from.version <= 4, "Address version is too high");
	      var to = Address.decode(opts.to);
	      opts.stream = to.stream;
	      var nonceTrialsPerByte, payloadLengthExtraBytes;
	      if (from.version >= 3) {
	        if (opts.friend) {
	          nonceTrialsPerByte = util.DEFAULT_TRIALS_PER_BYTE;
	          payloadLengthExtraBytes = util.DEFAULT_EXTRA_BYTES;
	        } else {
	          nonceTrialsPerByte = util.getTrials(from);
	          payloadLengthExtraBytes = util.getExtraBytes(from);
	        }
	      }
	      var encoding = opts.encoding || DEFAULT_ENCODING;
	      var message = encodeMessage(opts);

	      // Assemble the unencrypted message data.
	      var msgData = [
	        var_int.encode(from.version),
	        var_int.encode(from.stream),
	        from.behavior.buffer,
	        from.signPublicKey.slice(1),
	        from.encPublicKey.slice(1),
	      ];
	      if (from.version >= 3) {
	        msgData.push(
	          var_int.encode(nonceTrialsPerByte),
	          var_int.encode(payloadLengthExtraBytes)
	        );
	      }
	      msgData.push(
	        to.ripe,
	        var_int.encode(encoding),
	        var_int.encode(message.length),
	        message
	      );
	      // TODO(Kagami): Calculate ACK.
	      msgData.push(var_int.encode(0));

	      // Sign and encrypt.
	      opts.objectPayload = new Buffer(0);
	      var obj = object.encodePayloadWithoutNonce(opts);
	      var dataToSign = Buffer.concat([obj].concat(msgData));
	      var msgp = bmcrypto
	        .sign(from.signPrivateKey, dataToSign)
	        .then(function(sig) {
	          var dataToEnc = msgData.concat(var_int.encode(sig.length), sig);
	          dataToEnc = Buffer.concat(dataToEnc);
	          return bmcrypto.encrypt(to.encPublicKey, dataToEnc);
	        }).then(function(enc) {
	          // Concat object header with ecnrypted data and we are done.
	          obj = Buffer.concat([obj, enc]);
	          // TODO(Kagami): Merge receiver's trials/extra bytes options
	          // so we can calculate right POW (now we need to pass them to
	          // opts manually).
	          return prependNonce(obj, opts);
	        });
	      resolve(msgp);
	    });
	  },
	};

	var DEFAULT_ENCODING = msg.TRIVIAL;

	// Try to decrypt broadcast v4 with all provided subscription objects.
	function tryDecryptBroadcastV4(subscriptions, buf) {
	  function inner(i) {
	    if (i > last) {
	      return PPromise.reject(
	        new Error("Failed to decrypt broadcast with given identities")
	      );
	    }
	    return bmcrypto
	      .decrypt(subscriptions[i].getBroadcastPrivateKey(), buf)
	      .then(function(decrypted) {
	        return {addr: subscriptions[i], decrypted: decrypted};
	      }).catch(function() {
	        return inner(i + 1);
	      });
	  }

	  if (Address.isAddress(subscriptions)) {
	    subscriptions = [subscriptions];
	  } else if (!Array.isArray(subscriptions)) {
	    subscriptions = Object.keys(subscriptions).map(function(k) {
	      return subscriptions[k];
	    });
	  }
	  // Only addresses with version < 4 may be used to encode broadcast v4.
	  subscriptions = subscriptions.filter(function(a) {
	    return a.version < 4;
	  });
	  var last = subscriptions.length - 1;
	  return inner(0);
	}

	/**
	 * `broadcast` object.
	 * @see {@link https://bitmessage.org/wiki/Protocol_specification#broadcast}
	 * @namespace
	 * @static
	 */
	var broadcast = exports.broadcast = {
	  /**
	   * @typedef {Object} DecodeResult
	   * @property {Buffer} nonce - A 8-byte object nonce
	   * @property {number} ttl - Time to live in seconds
	   * @property {Date} expires - Object expiration date
	   * @property {number} type - Object type
	   * @property {number} version - Object version
	   * @property {number} stream - Object stream
	   * @property {number} headerLength - Length of the object header
	   * @property {Buffer} tag - Tag derived from the address object used
	   * to send this `broadcast` (present only for object version >= 5)
	   * @property {number} senderVersion - Sender's address version
	   * @property {number} senderStream - Sender's stream
	   * @property {Object} behavior - Sender's [pubkey features]{@link
	   * module:bitmessage/structs.PubkeyBitfield} that can be expected from
	   * the node
	   * @property {Buffer} signPublicKey - Sender's signing public key
	   * @property {Buffer} encPublicKey - Sender's encryption public key
	   * @property {number} nonceTrialsPerByte - Difficulty parameter of the
	   * sender (present only if sender's address version >= 3)
	   * @property {number} payloadLengthExtraBytes - Difficulty parameter
	   * of the sender (present only if sender's address version >= 3)
	   * @property {number} encoding - Message encoding
	   * @property {(string|Buffer)} message - Message string for
	   * [TRIVIAL]{@link module:bitmessage/objects.msg.TRIVIAL} and
	   * [SIMPLE]{@link module:bitmessage/objects.msg.SIMPLE} encodings or
	   * unparsed buffer data for other encodings
	   * @property {string=} subject - Subject string for [SIMPLE]{@link
	   * module:bitmessage/objects.msg.SIMPLE} encoding
	   * @property {Buffer} signature - Signature of the message
	   * @property {number} length - Real data length
	   * @memberof module:bitmessage/objects.broadcast
	   */

	  /**
	   * Decode `broadcast` object message.
	   * @param {Buffer} buf - Message
	   * @param {Object} opts - Any of [object.decode]{@link
	   * module:bitmessage/structs.object.decode} options and:
	   * @param {(Address[]|Address|Object)} opts.subscriptions - Address
	   * objects which represent broadcast subscriptions. It is either
	   * addresses array or single address or Object
	   * addr-by-tag/addr-by-ripe. Time to match the key is O(n), O(1), O(1)
	   * respectfully.
	   * @return {Promise.<DecodeResult>} A promise that contains
	   * [decoded `broadcast` structure]{@link
	   * module:bitmessage/objects.broadcast.DecodeResult} when fulfilled.
	   */
	  decodeAsync: function(buf, opts) {
	    return new PPromise(function(resolve) {
	      var decoded = message.decode(buf);
	      assert(decoded.command === "object", "Bad command");
	      resolve(broadcast.decodePayloadAsync(decoded.payload, opts));
	    });
	  },

	  /**
	   * Decode `broadcast` object message payload.
	   * The same as [decodeAsync]{@link
	   * module:bitmessage/objects.broadcast.decodeAsync}.
	   */
	  decodePayloadAsync: function(buf, opts) {
	    return new PPromise(function(resolve) {
	      var decoded = object.decodePayload(buf, opts);
	      assert(decoded.type === object.BROADCAST, "Bad object type");
	      var version = decoded.version;
	      assert(version === 4 || version === 5, "Bad broadcast version");
	      var objectPayload = util.popkey(decoded, "objectPayload");
	      var tag, addr, broadPrivateKey, dataToDecrypt, broadp;

	      if (version === 4) {
	        broadp = tryDecryptBroadcastV4(opts.subscriptions, objectPayload);
	      } else {
	        assert(
	          objectPayload.length >= 32,
	          "Bad broadcast v5 object payload length");
	        tag = decoded.tag = objectPayload.slice(0, 32);
	        addr = findAddrByTag(opts.subscriptions, tag);
	        assert(addr, "You are not interested in this broadcast v5");
	        broadPrivateKey = addr.getBroadcastPrivateKey();
	        dataToDecrypt = objectPayload.slice(32);
	        broadp = bmcrypto
	          .decrypt(broadPrivateKey, dataToDecrypt)
	          .then(function(decrypted) {
	            return {addr: addr, decrypted: decrypted};
	          });
	      }

	      broadp = broadp.then(function(decInfo) {
	        var decrypted = decInfo.decrypted;

	        // Version, stream.
	        var decodedVersion = var_int.decode(decrypted);
	        var senderVersion = decoded.senderVersion = decodedVersion.value;
	        if (version === 4) {
	          assert(senderVersion >= 2, "Sender version is too low");
	          assert(senderVersion <= 3, "Sender version is too high");
	        } else {
	          assert(senderVersion === 4, "Bad sender version");
	        }
	        var decodedStream = var_int.decode(decodedVersion.rest);
	        var senderStream = decoded.senderStream = decodedStream.value;
	        assert(
	          senderStream === decoded.stream,
	          "Cleartext broadcast object stream doesn't match encrypted");

	        // Behavior, keys.
	        assert(
	          decodedStream.rest.length >= 132,
	          "Bad broadcast object payload length");
	        objectAssign(decoded, extractPubkey(decodedStream.rest));
	        decoded.length += decodedVersion.length + decodedStream.length;
	        var rest = decrypted.slice(decoded.length);
	        var sender = new Address({
	          version: senderVersion,
	          stream: senderStream,
	          signPublicKey: decoded.signPublicKey,
	          encPublicKey: decoded.encPublicKey,
	        });
	        if (version === 4) {
	          assert(
	            bufferEqual(sender.ripe, decInfo.addr.ripe),
	            "The keys used to encrypt the broadcast doesn't match the keys "+
	            "embedded into the object");
	        } else {
	          assert(
	            bufferEqual(sender.getTag(), tag),
	            "The tag used to encrypt the broadcast doesn't match the keys "+
	            "and version/stream embedded into the object");
	        }

	        // Pow extra.
	        if (senderVersion >= 3) {
	          var decodedTrials = var_int.decode(rest);
	          decoded.nonceTrialsPerByte = decodedTrials.value;
	          decoded.length += decodedTrials.length;
	          var decodedExtraBytes = var_int.decode(decodedTrials.rest);
	          decoded.payloadLengthExtraBytes = decodedExtraBytes.value;
	          decoded.length += decodedExtraBytes.length;
	          rest = decodedExtraBytes.rest;
	        }

	        // Encoding, message
	        var decodedEncoding = var_int.decode(rest);
	        var encoding = decoded.encoding = decodedEncoding.value;
	        decoded.length += decodedEncoding.length;
	        var decodedMsgLength = var_int.decode(decodedEncoding.rest);
	        var msglen = decodedMsgLength.value;
	        rest = decodedMsgLength.rest;
	        assert(rest.length >= msglen, "Bad broadcast object payload length");
	        decoded.length += decodedMsgLength.length + msglen;
	        var message = rest.slice(0, msglen);
	        objectAssign(decoded, decodeMessage(message, encoding));

	        // Signature.
	        var decodedSigLength = var_int.decode(rest.slice(msglen));
	        var siglen = decodedSigLength.value;
	        rest = decodedSigLength.rest;
	        assert(rest.length >= siglen, "Bad broadcast object payload length");
	        var sig = decoded.signature = rest.slice(0, siglen);

	        // Verify signature.
	        var headerLength = decoded.headerLength;
	        if (version !== 4) {
	          // Compensate for tag.
	          headerLength += 32;
	        }
	        var dataToVerify = Buffer.concat([
	          // Object header without nonce.
	          buf.slice(8, headerLength),
	          // Unencrypted pubkey data without signature.
	          decrypted.slice(0, decoded.length),
	        ]);
	        // Since data is encrypted, entire object payload is used.
	        decoded.length = objectPayload.length;
	        return bmcrypto.verify(decoded.signPublicKey, dataToVerify, sig);
	      }).then(function() {
	        return decoded;
	      });
	      resolve(broadp);
	    });
	  },

	  /**
	   * Encode `broadcast` object message.
	   * @param {Object} opts - `broadcast` object options
	   * @param {number} opts.ttl - Time to live in seconds
	   * @param {Address} opts.from - Originator of the message
	   * @param {(string|Buffer)} opts.message - Message
	   * @param {(string|Buffer)=} opts.subject - Subject for [SIMPLE]{@link
	   * module:bitmessage/objects.msg.SIMPLE} encoding
	   * @param {number=} opts.encoding - Encoding of the message
	   * ([TRIVIAL]{@link module:bitmessage/objects.msg.TRIVIAL} by default)
	   * @param {boolean=} opts.skipPow - Do not compute POW (false by
	   * default)
	   * @return {Promise.<Buffer>} A promise that contains encoded message
	   * when fulfilled.
	   */
	  encodeAsync: function(opts) {
	    return broadcast.encodePayloadAsync(opts).then(function(payload) {
	      return message.encode("object", payload);
	    });
	  },

	  /**
	   * Encode `broadcast` object message payload.
	   * The same as [encodeAsync]{@link
	   * module:bitmessage/objects.broadcast.encodeAsync}.
	   */
	  encodePayloadAsync: function(opts) {
	    return new PPromise(function(resolve) {
	      // Deal with options.
	      opts = objectAssign({}, opts);
	      opts.type = object.BROADCAST;
	      var from = Address.decode(opts.from);
	      assert(from.version >= 2, "Address version is too low");
	      assert(from.version <= 4, "Address version is too high");
	      opts.version = from.version >= 4 ? 5 : 4;
	      opts.stream = from.stream;
	      var encoding = opts.encoding || DEFAULT_ENCODING;
	      var message = encodeMessage(opts);

	      // Assemble the unencrypted message data.
	      var broadData = [
	        var_int.encode(from.version),
	        var_int.encode(from.stream),
	        from.behavior.buffer,
	        from.signPublicKey.slice(1),
	        from.encPublicKey.slice(1),
	      ];
	      if (from.version >= 3) {
	        broadData.push(
	          var_int.encode(util.getTrials(from)),
	          var_int.encode(util.getExtraBytes(from))
	        );
	      }
	      broadData.push(
	        var_int.encode(encoding),
	        var_int.encode(message.length),
	        message
	      );

	      // Sign and encrypt.
	      opts.objectPayload = from.version >= 4 ? from.getTag() : new Buffer(0);
	      var obj = object.encodePayloadWithoutNonce(opts);
	      var dataToSign = Buffer.concat([obj].concat(broadData));
	      var broadp = bmcrypto
	        .sign(from.signPrivateKey, dataToSign)
	        .then(function(sig) {
	          var dataToEnc = broadData.concat(var_int.encode(sig.length), sig);
	          dataToEnc = Buffer.concat(dataToEnc);
	          return bmcrypto.encrypt(from.getBroadcastPublicKey(), dataToEnc);
	        }).then(function(enc) {
	          obj = Buffer.concat([obj, enc]);
	          return prependNonce(obj, opts);
	        });
	      resolve(broadp);
	    });
	  },
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * Working with Bitmessage addresses.  
	 * **NOTE**: `Address` is exported as a module.
	 * @example
	 * var Address = require("bitmessage").Address;
	 *
	 * // Generate a new random Bitmessage identity.
	 * var addr1 = Address.fromRandom();
	 * console.log("New random Bitmessage address:", addr1.encode());
	 *
	 * // Or create it from passphrase.
	 * var addr2 = Address.fromPassphrase("test");
	 * console.log("Deterministic Bitmessage address:", addr2.encode());
	 * @see {@link https://bitmessage.org/wiki/Address}
	 * @module bitmessage/address
	 */
	// TODO(Kagami): Document getters/setters.

	"use strict";

	var objectAssign = Object.assign || __webpack_require__(66);
	var bufferEqual = __webpack_require__(10);
	var bs58 = __webpack_require__(11);
	var assert = __webpack_require__(12).assert;
	var var_int = __webpack_require__(65).var_int;
	var PubkeyBitfield = __webpack_require__(65).PubkeyBitfield;
	var bmcrypto = __webpack_require__(13);
	var popkey = __webpack_require__(12).popkey;

	/**
	 * Create a new Bitmessage address object.
	 * @param {Object=} opts - Address options
	 * @param {number} opts.version - Version number (4 by default)
	 * @param {number} opts.stream - Stream number (1 by default)
	 * @param {Object} opts.behavior - [Pubkey features]{@link
	 * module:bitmessage/structs.PubkeyBitfield} (`DOES_ACK` by default)
	 * @param {Buffer} opts.signPrivateKey - Signing private key
	 * @param {Buffer} opts.signPublicKey - Signing public key
	 * @param {Buffer} opts.encPrivateKey - Encryption private key
	 * @param {Buffer} opts.encPublicKey - Encryption public key
	 * @param {Buffer} opts.ripe - Keys RIPEMD hash
	 * @constructor
	 * @static
	 */
	function Address(opts) {
	  if (!(this instanceof Address)) {
	    return new Address(opts);
	  }
	  opts = objectAssign({}, opts);
	  // Pull out version right away because it may be needed in setters.
	  this.version = popkey(opts, "version") || 4;
	  assert(this.version <= 4, "Version too high");
	  assert(this.version >= 1, "Version too low");
	  // Set defaults.
	  opts.stream = opts.stream || 1;
	  opts.behavior = opts.behavior ||
	                  PubkeyBitfield().set(PubkeyBitfield.DOES_ACK);
	  // Merge remained values.
	  objectAssign(this, opts);
	}

	/**
	 * Create a copy of the address object.
	 * @return {Address} Cloned address.
	 */
	Address.prototype.clone = function() {
	  return new Address(this);
	};

	/**
	 * Test if the given object is an Address instance.  
	 * NOTE: Implementation is just simple `instanceof` but it improves
	 * readability and consistent with `isArray`, `isBuffer`, etc.
	 * @param {Object} obj - Given object
	 * @return {boolean}
	 */
	Address.isAddress = function(obj) {
	  return obj instanceof Address;
	};

	/**
	 * Parse Bitmessage address into address object.
	 * @param {string} str - Address string (with or without `BM-` prefix)
	 * @return {Address} Decoded address object.
	 */
	Address.decode = function(str) {
	  if (Address.isAddress(str)) {
	    return str;
	  }

	  str = str.trim();
	  if (str.slice(0, 3) === "BM-") {
	    str = str.slice(3);
	  } else if (str.slice(0, 11) === "bitmessage:") {
	    str = str.slice(11);
	  }

	  var bytes = bs58.decode(str);
	  var data = new Buffer(bytes.slice(0, -4));
	  var checksum = new Buffer(bytes.slice(-4));
	  assert(bufferEqual(checksum, getaddrchecksum(data)), "Bad checkum");

	  var decoded = var_int.decode(data);
	  var version = decoded.value;

	  data = decoded.rest;
	  decoded = var_int.decode(data);
	  var stream = decoded.value;

	  var ripe = decoded.rest;
	  if (version === 4) {
	    assert(ripe[0] !== 0, "Ripe encode error");
	  }

	  return new Address({version: version, stream: stream, ripe: ripe});
	};

	// Compute the Bitmessage checksum for the given data.
	function getaddrchecksum(data) {
	  return bmcrypto.sha512(bmcrypto.sha512(data)).slice(0, 4);
	}

	/**
	 * Get the RIPEMD hash of the address keys without prefix nulls.
	 * @return {Buffer} A short RIPEMD hash.
	 */
	Address.prototype.getShortRipe = function() {
	  var ripe = this.ripe;
	  return ripe.slice(20 - getripelen(ripe));
	};

	function getaddrhash(addr) {
	  var dataToHash = Buffer.concat([
	    var_int.encode(addr.version),
	    var_int.encode(addr.stream),
	    addr.ripe,
	  ]);
	  return bmcrypto.sha512(dataToHash);
	}

	/**
	 * Calculate the encryption key used to encrypt/decrypt
	 * [pubkey]{@link module:bitmessage/objects.pubkey} objects.
	 * @return {Buffer} A 32-byte private key.
	 */
	Address.prototype.getPubkeyPrivateKey = function() {
	  return bmcrypto.sha512(getaddrhash(this)).slice(0, 32);
	};

	/**
	 * Calculate the corresponding public key for encryption key used to
	 * encrypt/decrypt
	 * [pubkey]{@link module:bitmessage/objects.pubkey} objects.
	 * @return {Buffer} A 65-byte public key.
	 */
	Address.prototype.getPubkeyPublicKey = function() {
	  return bmcrypto.getPublic(this.getPubkeyPrivateKey());
	};

	/**
	 * Calculate the encryption key used to encrypt/decrypt
	 * [broadcast]{@link module:bitmessage/objects.broadcast} objects.
	 * @return {Buffer} A 32-byte private key.
	 */
	Address.prototype.getBroadcastPrivateKey = function() {
	  if (this.version >= 4) {
	    return bmcrypto.sha512(getaddrhash(this)).slice(0, 32);
	  } else {
	    return getaddrhash(this).slice(0, 32);
	  }
	};

	/**
	 * Calculate the corresponding public key for encryption key used to
	 * encrypt/decrypt
	 * [broadcast]{@link module:bitmessage/objects.broadcast} objects.
	 * @return {Buffer} A 65-byte public key.
	 */
	Address.prototype.getBroadcastPublicKey = function() {
	  return bmcrypto.getPublic(this.getBroadcastPrivateKey());
	};

	/**
	 * Calculate the address tag.
	 * @return {Buffer} A 32-byte address tag.
	 */
	Address.prototype.getTag = function() {
	  return bmcrypto.sha512(getaddrhash(this)).slice(32);
	};


	// Get truncated ripe hash length.
	function getripelen(ripe) {
	  var zeroes = 0;
	  for (var i = 0; i < 20, ripe[i] === 0; i++) {
	    zeroes++;
	  }
	  return 20 - zeroes;
	}

	// Do neccessary checkings of the truncated ripe hash length depending
	// on the address version.
	function assertripelen(ripelen, version, ripe) {
	  if (ripe) {
	    assert(ripe.length <= 20, "Bad ripe");
	  }
	  switch (version) {
	    case 1:
	      assert(ripelen === 20, "Bad ripe length");
	      break;
	    case 2:
	    case 3:
	      assert(ripelen >= 18, "Ripe is too short");
	      assert(ripelen <= 20, "Ripe is too long");
	      break;
	    case 4:
	      assert(ripelen >= 4, "Ripe is too short");
	      assert(ripelen <= 20, "Ripe is too long");
	      break;
	    default:
	      throw new Error("Bad version");
	  }
	}

	// The same as `assertripelen` but return boolean instead of thrown an
	// Error.
	function checkripelen(ripelen, version) {
	  try {
	    assertripelen(ripelen, version);
	    return true;
	  } catch(e) {
	    return false;
	  }
	}

	/**
	 * Encode Bitmessage address object into address string.
	 * @return {string} Address string.
	 */
	Address.prototype.encode = function() {
	  var data = Buffer.concat([
	    var_int.encode(this.version),
	    var_int.encode(this.stream),
	    this.getShortRipe(),
	  ]);
	  var addr = Buffer.concat([data, getaddrchecksum(data)]);
	  return "BM-" + bs58.encode(addr);
	};

	/**
	 * Create a new Bitmessage address with random encryption and signing
	 * private keys.
	 * @param {Object=} opts - Address options
	 * @param {number} opts.ripeLength - Required length of the short RIPEMD
	 * hash (19 by default)
	 * @param {number} opts.version - Version number (4 by default)
	 * @param {number} opts.stream - Stream number (1 by default)
	 * @param {Object} opts.behavior - [Pubkey features]{@link module:bitmessage/structs.PubkeyBitfield} (`DOES_ACK` by default)
	 * @return {Address} New address object.
	 */
	Address.fromRandom = function(opts) {
	  opts = objectAssign({}, opts);
	  var version = opts.version = opts.version || 4;
	  var ripelen = popkey(opts, "ripeLength") || 19;
	  assertripelen(ripelen, version);

	  // TODO(Kagami): Speed it up using web workers in Browser.
	  // TODO(Kagami): Bind to C++ version of this code in Node.
	  var encPrivateKey, encPublicKey, ripe, len;
	  var signPrivateKey = bmcrypto.getPrivate();
	  var signPublicKey = bmcrypto.getPublic(signPrivateKey);
	  var keysbuf = new Buffer(130);
	  signPublicKey.copy(keysbuf);
	  while (true) {
	    encPrivateKey = bmcrypto.getPrivate();
	    encPublicKey = bmcrypto.getPublic(encPrivateKey);
	    encPublicKey.copy(keysbuf, 65);
	    ripe = bmcrypto.ripemd160(bmcrypto.sha512(keysbuf));
	    len = getripelen(ripe);
	    if (len <= ripelen && checkripelen(len, version)) {
	      opts.signPrivateKey = signPrivateKey;
	      opts.encPrivateKey = encPrivateKey;
	      return new Address(opts);
	    }
	  }
	};

	/**
	 * Create a new Bitmessage address from passphrase.
	 * @param {(string|Object)} opts - Passphrase or address options
	 * @param {string} opts.passphrase - Passphrase to generate address from
	 * @param {number=} opts.ripeLength - Required length of the short
	 * RIPEMD hash (19 by default)
	 * @param {number=} opts.version - Version number (4 by default)
	 * @param {number=} opts.stream - Stream number (1 by default)
	 * @param {Object=} opts.behavior - [Pubkey features]{@link module:bitmessage/structs.PubkeyBitfield} (`DOES_ACK` by default)
	 * @return {Address} New address object.
	 */
	Address.fromPassphrase = function(opts) {
	  if (typeof opts === "string") {
	    opts = {passphrase: opts};
	  } else {
	    opts = objectAssign({}, opts);
	  }
	  var version = opts.version = opts.version || 4;
	  var ripelen = popkey(opts, "ripeLength") || 19;
	  assertripelen(ripelen, version);
	  var passphrase = popkey(opts, "passphrase");

	  // TODO(Kagami): Speed it up using web workers in Browser.
	  // TODO(Kagami): Bind to C++ version of this code in Node.
	  var signPrivateKey, signPublicKey, encPrivateKey, encPublicKey;
	  var ripe, len, tmp;
	  var signnonce = 0;
	  var encnonce = 1;
	  var keysbuf = new Buffer(130);
	  // XXX(Kagami): Spec doesn't mention encoding, using UTF-8.
	  var phrasebuf = new Buffer(passphrase, "utf8");
	  while (true) {
	    // TODO(Kagami): We may slightly optimize it and pre-create tmp
	    // buffers based on the encoded nonce size (1, 3, 5 and 9 bytes).
	    tmp = Buffer.concat([phrasebuf, var_int.encode(signnonce)]);
	    signPrivateKey = bmcrypto.sha512(tmp).slice(0, 32);
	    signPublicKey = bmcrypto.getPublic(signPrivateKey);
	    signPublicKey.copy(keysbuf);

	    tmp = Buffer.concat([phrasebuf, var_int.encode(encnonce)]);
	    encPrivateKey = bmcrypto.sha512(tmp).slice(0, 32);
	    encPublicKey = bmcrypto.getPublic(encPrivateKey);
	    encPublicKey.copy(keysbuf, 65);

	    ripe = bmcrypto.ripemd160(bmcrypto.sha512(keysbuf));
	    len = getripelen(ripe);
	    if (len <= ripelen && checkripelen(len, version)) {
	      opts.signPrivateKey = signPrivateKey;
	      opts.encPrivateKey = encPrivateKey;
	      return new Address(opts);
	    }
	    signnonce += 2;
	    encnonce += 2;
	  }
	};

	Object.defineProperty(Address.prototype, "signPrivateKey", {
	  get: function() {
	    return this._signPrivateKey;
	  },
	  set: function(signPrivateKey) {
	    this._signPrivateKey = signPrivateKey;
	    // Invalidate cached values;
	    delete this._signPublicKey;
	    delete this._ripe;
	  },
	});

	Object.defineProperty(Address.prototype, "signPublicKey", {
	  get: function() {
	    if (this._signPublicKey) {
	      return this._signPublicKey;
	    } else if (this.signPrivateKey) {
	      this._signPublicKey = bmcrypto.getPublic(this.signPrivateKey);
	      return this._signPublicKey;
	    } else {
	      throw new Error("No signing key");
	    }
	  },
	  set: function(signPublicKey) {
	    this._signPublicKey = signPublicKey;
	  },
	});

	Object.defineProperty(Address.prototype, "encPrivateKey", {
	  get: function() {
	    return this._encPrivateKey;
	  },
	  set: function(encPrivateKey) {
	    this._encPrivateKey = encPrivateKey;
	    // Invalidate cached values;
	    delete this._encPublicKey;
	    delete this._ripe;
	  },
	});

	Object.defineProperty(Address.prototype, "encPublicKey", {
	  get: function() {
	    if (this._encPublicKey) {
	      return this._encPublicKey;
	    } else if (this.encPrivateKey) {
	      this._encPublicKey = bmcrypto.getPublic(this.encPrivateKey);
	      return this._encPublicKey;
	    } else {
	      throw new Error("No encryption key");
	    }
	  },
	  set: function(encPublicKey) {
	    this._encPublicKey = encPublicKey;
	  },
	});

	Object.defineProperty(Address.prototype, "ripe", {
	  get: function() {
	    if (this._ripe) {
	      return this._ripe;
	    }
	    var dataToHash = Buffer.concat([this.signPublicKey, this.encPublicKey]);
	    this._ripe = bmcrypto.ripemd160(bmcrypto.sha512(dataToHash));
	    return this._ripe;
	  },
	  set: function(ripe) {
	    assertripelen(getripelen(ripe), this.version, ripe);
	    if (ripe.length < 20) {
	      var fullripe = new Buffer(20);
	      fullripe.fill(0);
	      ripe.copy(fullripe, 20 - ripe.length);
	      ripe = fullripe;
	    }
	    this._ripe = ripe;
	  },
	});

	module.exports = Address;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Library entry point. Just reexports all available transports.
	 * @module bitmessage-transports
	 */

	"use strict";

	/** [Base transport.]{@link module:bitmessage-transports/base} */
	exports.BaseTransport = __webpack_require__(74);

	/** [TCP transport.]{@link module:bitmessage-transports/tcp} */
	exports.TcpTransport = __webpack_require__(79);

	/** [WebSocket transport.]{@link module:bitmessage-transports/ws} */
	exports.WsTransport = __webpack_require__(106);


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Networking base module. Defines base transport interface, useful for
	 * implementing new transports. End-users should import some transport
	 * instead in order to connect/accept connections to/from other nodes.  
	 * **NOTE**: `BaseTransport` is exported as a module.
	 * @module bitmessage-transports/base
	 */
	// TODO(Kagami): Write some sort of tutorial.

	"use strict";

	var inherits = __webpack_require__(75);
	var EventEmitter = __webpack_require__(76).EventEmitter;
	var bufferEqual = __webpack_require__(77);
	var bitmessage = __webpack_require__(4);
	var PROTOCOL_VERSION = __webpack_require__(78).PROTOCOL_VERSION;

	var structs = bitmessage.structs;
	var ServicesBitfield = structs.ServicesBitfield;
	var messages = bitmessage.messages;

	/**
	 * Base transport class. Allows to use single class for both client and
	 * server modes (as separate instances).
	 * @constructor
	 * @static
	 */
	function BaseTransport() {
	  BaseTransport.super_.call(this);
	}

	inherits(BaseTransport, EventEmitter);

	/**
	 * Do the transport-specific bootstrap process and return promise that
	 * contains discovered nodes when fulfilled (both modes).  
	 * NOTE: Do not use nodes received by this method in `addr` messages!
	 * This is meaningless.
	 * @return {Promise.<Array>}
	 * @abstract
	 */
	BaseTransport.prototype.bootstrap = function() {
	  throw new Error("Not implemented");
	};

	/**
	 * Connect to the transport-specific address. Enters client mode. Should
	 * emit `open` event after successful connect and `established` event
	 * after `verack` messages exchange.
	 * @abstract
	 */
	BaseTransport.prototype.connect = function() {
	  throw new Error("Not implemented");
	};

	/**
	 * Listen for the transport-specific incoming connections. Enters server
	 * mode. Should emit `connection` event with a transport instance for
	 * each new connection.
	 * @abstract
	 */
	BaseTransport.prototype.listen = function() {
	  throw new Error("Not implemented");
	};

	/**
	 * Send message over the wire (client mode only).
	 * @param {(Buffer|string)} msg - Encoded message or command string
	 * @param {Buffer=} payload - Message payload (used if the first
	 * argument is a string)
	 * @abstract
	 */
	BaseTransport.prototype.send = function() {
	  throw new Error("Not implemented");
	};

	/**
	 * Send message to all connected clients (server mode only).
	 * @param {(Buffer|string)} msg - Encoded message or command string
	 * @param {Buffer=} payload - Message payload (used if the first
	 * argument is a string)
	 * @abstract
	 */
	BaseTransport.prototype.broadcast = function() {
	  throw new Error("Not implemented");
	};

	/**
	 * Close connection(s) and/or stop listening (both modes).
	 * @abstract
	 */
	BaseTransport.prototype.close = function() {
	  throw new Error("Not implemented");
	};

	// Private helpers.

	// Make a message from variable number of arguments.
	BaseTransport._getmsg = function(args) {
	  if (typeof args[0] === "string") {
	    return structs.message.encode(args[0], args[1]);
	  } else {
	    return args[0];
	  }
	};

	// Unmap IPv4-mapped IPv6 address.
	BaseTransport._unmap = function(addr) {
	  if (addr.slice(0, 7) === "::ffff:") {
	    return addr.slice(7);
	  } else {
	    return addr;
	  }
	};

	// Check whether two given arrays intersect.
	// NOTE(Kagami): It has O(n*m) complexity in the worst case but:
	// * Max length of stream list = 160,000
	// * One of the arrays (our streams) should have reasonable length
	function intersects(a, b) {
	  var alen = a.length;
	  var blen = b.length;
	  if (!alen || !blen) {
	    return false;
	  }
	  var i, j;
	  for (i = 0; i < alen; ++i) {
	    for (j = 0; j < blen; ++j) {
	      if (a[i] === b[j]) {
	        return true;
	      }
	    }
	  }
	  return false;
	}

	// Decode and validate version message.
	BaseTransport.prototype._decodeVersion = function(payload, opts) {
	  opts = opts || {};
	  var version;
	  try {
	    version = messages.version.decodePayload(payload);
	  } catch(err) {
	    throw new Error("Version decode error: " + err.message);
	  }
	  if (version.version < PROTOCOL_VERSION) {
	    throw new Error("Peer uses old protocol v" + version.version);
	  }
	  // TODO(Kagami): We may want to send error message describing the time
	  // offset problem to this node as PyBitmessage.
	  var delta = (version.time.getTime() - new Date().getTime()) / 1000;
	  if (delta > 3600) {
	    throw new Error("Peer's time is too far in the future: +" + delta + "s");
	  }
	  if (delta < -3600) {
	    throw new Error("Peer's time is too far in the past: " + delta + "s");
	  }
	  if (bufferEqual(version.nonce, messages.version.randomNonce)) {
	    throw new Error("Connection to self");
	  }
	  if (!intersects(this.streams, version.streams)) {
	    throw new Error(
	      "Peer isn't interested in our streams; " +
	      "first 10 peer's streams: " + version.streams.slice(0, 10)
	    );
	  }
	  if (opts.network && !version.services.get(ServicesBitfield.NODE_NETWORK)) {
	    throw new Error("Not a normal network node: " + version.services);
	  }
	  if (opts.gateway && !version.services.get(ServicesBitfield.NODE_GATEWAY)) {
	    throw new Error("Not a gateway node: " + version.services);
	  }
	  if (opts.mobile && !version.services.get(ServicesBitfield.NODE_MOBILE)) {
	    throw new Error("Not a mobile node: " + version.services);
	  }
	  return version;
	};

	module.exports = BaseTransport;


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++)
	          args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++)
	      args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type])
	    ret = 0;
	  else if (isFunction(emitter._events[type]))
	    ret = 1;
	  else
	    ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var Buffer = __webpack_require__(6).Buffer; // for use with browserify

	module.exports = function (a, b) {
	    if (!Buffer.isBuffer(a)) return undefined;
	    if (!Buffer.isBuffer(b)) return undefined;
	    if (typeof a.equals === 'function') return a.equals(b);
	    if (a.length !== b.length) return false;
	    
	    for (var i = 0; i < a.length; i++) {
	        if (a[i] !== b[i]) return false;
	    }
	    
	    return true;
	};


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * A few helper routines.
	 * @module bitmessage-transports/util
	 */

	"use strict";

	exports.assert = function(condition, message) {
	  if (!condition) {
	    throw new Error(message || "Assertion failed");
	  }
	};

	exports.PROTOCOL_VERSION = 3;


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * TCP transport compatible with PyBitmessage. Available only for Node
	 * platform.  
	 * **NOTE**: `TcpTransport` is exported as a module.
	 * @module bitmessage-transports/tcp
	 */

	"use strict";

	var objectAssign = Object.assign || __webpack_require__(80);
	var PPromise = typeof Promise === "undefined" ?
	               __webpack_require__(81).Promise :
	               Promise;
	var inherits = __webpack_require__(75);
	var net = __webpack_require__(85);
	// dns is disabled
	//var dns = require("dns");
	var dns = {};
	var bitmessage = __webpack_require__(4);
	var assert = __webpack_require__(78).assert;
	var BaseTransport = __webpack_require__(74);

	var structs = bitmessage.structs;
	var messages = bitmessage.messages;
	var getmsg = BaseTransport._getmsg;
	var unmap = BaseTransport._unmap;

	/**
	 * TCP transport class. Implements [base transport interface]{@link
	 * module:bitmessage-transports/base.BaseTransport}.
	 * @param {Object=} opts - Transport options
	 * @param {Array} opts.seeds - Bootstrap nodes (none by default)
	 * @param {Array} opts.dnsSeeds - Bootstrap DNS nodes (none by default)
	 * @param {Object} opts.services - Service features provided by this
	 * node (`NODE_NETWORK` by default)
	 * @param {(Array|string|Buffer)} opts.userAgent - User agent of this
	 * node (user agent of bitmessage library by default)
	 * @param {number[]} opts.streams - Streams accepted by this node ([1]
	 * by default)
	 * @param {number} opts.port - Incoming port of this node (8444 by
	 * default)
	 * @constructor
	 * @static
	 */
	function TcpTransport(opts) {
	  TcpTransport.super_.call(this);
	  objectAssign(this, opts);
	  this.seeds = this.seeds || [];
	  this.dnsSeeds = this.dnsSeeds || [];
	  this.streams = this.streams || [1];
	  this._clients = {};
	}

	inherits(TcpTransport, BaseTransport);

	TcpTransport.prototype.toString = function() {
	  if (this._client && this._client.remoteAddress) {
	    return (
	      "tcp:" +
	      unmap(this._client.remoteAddress) + ":" +
	      this._client.remotePort
	    );
	  } else {
	    return "tcp:not-connected";
	  }
	};

	TcpTransport.prototype._sendVersion = function() {
	  return this.send(messages.version.encode({
	    services: this.services,
	    userAgent: this.userAgent,
	    streams: this.streams,
	    port: this.port,
	    remoteHost: this._client.remoteAddress,
	    remotePort: this._client.remotePort,
	  }));
	};

	TcpTransport.prototype._setupClient = function(client, incoming) {
	  var self = this;
	  self._client = client;
	  var cache = Buffer(0);
	  var decoded;
	  var verackSent = false;
	  var verackReceived = false;
	  var established = false;

	  // Set default transport timeout per spec.
	  // TODO(Kagami): We may also want to close connection if it wasn't
	  // established within minute.
	  client.setTimeout(20000);

	  client.on("connect", function() {
	    // NOTE(Kagami): This handler shouldn't be called at all for
	    // incoming connections but let's be sure.
	    if (!incoming) {
	      self.emit("open");
	      self._sendVersion();
	    }
	  });

	  client.on("data", function(data) {
	    // TODO(Kagami): We may want to preallocate 1.6M buffer for each
	    // client instead (max size of the message) to not constantly
	    // allocate new buffers. Though this may lead to another issues: too
	    // many memory per client.
	    cache = Buffer.concat([cache, data]);
	    while (true) {
	      decoded = structs.message.tryDecode(cache);
	      if (!decoded) {
	        break;
	      }
	      cache = decoded.rest;
	      if (decoded.message) {
	        self.emit("message", decoded.message.command, decoded.message.payload);
	      } else if (decoded.error) {
	        // TODO(Kagami): Wrap it in custom error class?
	        // TODO(Kagami): Send `error` message and ban node for some time
	        // if there were too many errors?
	        self.emit("warning", new Error(
	          "Message decoding error: " + decoded.error.message
	        ));
	      }
	    }
	  });

	  // High-level message processing.
	  self.on("message", function(command, payload) {
	    var version;
	    if (!established) {
	      if (command === "version") {
	        if (verackSent) {
	          return;
	        }
	        try {
	          version = self._decodeVersion(payload, {network: true});
	        } catch(err) {
	          self.emit("error", err);
	          return client.end();
	        }
	        self.send("verack");
	        verackSent = true;
	        if (incoming) {
	          self._sendVersion();
	        } else if (verackReceived) {
	          self.emit("established", version);
	        }
	      } else if (command === "verack") {
	        verackReceived = true;
	        if (verackSent) {
	          self.emit("established", version);
	        }
	      }
	    }
	  });

	  self.on("established", function() {
	    established = true;
	    // Raise timeout up to 10 minutes per spec.
	    // TODO(Kagami): Send pong messages every 5 minutes as PyBitmessage.
	    client.setTimeout(600000);
	  });

	  client.on("timeout", function() {
	    client.end();
	  });

	  client.on("error", function(err) {
	    self.emit("error", err);
	  });

	  client.on("close", function() {
	    self.emit("close");
	    delete self._client;
	  });
	};

	function resolveDnsSeed(seed) {
	  var host = seed[0];
	  var port = seed[1];
	  var nodes = [];
	  // NOTE(Kagami):
	  // 1) Node's `getaddrinfo` (`dns.lookup`) returns only one address so
	  // we can't use it.
	  // 2) Node's `dig host any` (`dns.resolve`) doesn't return type of the
	  // record! So we resolve twice for A and AAAA.
	  // 3) We ignore any errors here, promise's result is always a list.
	  return new PPromise(function(resolve) {
	    dns.resolve4(host, function(err, nodes4) {
	      if (!err) {
	        nodes4.forEach(function(n) {
	          nodes.push([n, port]);
	        });
	      }
	      dns.resolve6(host, function(err, nodes6) {
	        if (!err) {
	          nodes6.forEach(function(n) {
	            nodes.push([n, port]);
	          });
	        }
	        resolve(nodes);
	      });
	    });
	  });
	}

	TcpTransport.prototype.bootstrap = function() {
	  var hardcodedNodes = this.seeds;
	  // FIXME(Kagami): Filter incorrect/private IP range nodes?
	  // See also: <https://github.com/Bitmessage/PyBitmessage/issues/768>.
	  return this.bootstrapDns().then(function(dnsNodes) {
	    // Add hardcoded nodes to the end of list because DNS nodes should
	    // be more up-to-date.
	    return dnsNodes.concat(hardcodedNodes);
	  });
	};

	/**
	 * Do only DNS-specific bootstrap.
	 * @return {Promise.<Array>} Discovered seed nodes.
	 */
	TcpTransport.prototype.bootstrapDns = function() {
	  var promises = this.dnsSeeds.map(resolveDnsSeed);
	  return PPromise.all(promises).then(function(dnsNodes) {
	    // Flatten array of arrays.
	    return Array.prototype.concat.apply([], dnsNodes);
	  });
	};

	/**
	 * Connect to a TCP node. Connection arguments are the same as for
	 * [net.connect](http://nodejs.org/api/net.html#net_net_connect_port_host_connectlistener).
	 */
	TcpTransport.prototype.connect = function() {
	  assert(!this._client, "Already connected");
	  assert(!this._server, "Already listening");
	  this._setupClient(net.connect.apply(null, arguments));
	};

	/**
	 * Listen for incoming TCP connections. Listen arguments are the same as
	 * for
	 * [server.listen](http://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback).
	 */
	TcpTransport.prototype.listen = function() {
	  assert(!this._client, "Already connected");
	  assert(!this._server, "Already listening");

	  var self = this;
	  var server = self._server = net.createServer();
	  server.listen.apply(server, arguments);

	  var clientIdCounter = 0;

	  server.on("connection", function(client) {
	    var id = client.id = clientIdCounter++;
	    self._clients[id] = client;
	    client.on("close", function() {
	      delete self._clients[id];
	    });
	    var opts = objectAssign({}, self);
	    delete opts._server;
	    var transport = new self.constructor(opts);
	    var incoming = true;
	    transport._setupClient(client, incoming);
	    var addr = client.remoteAddress;
	    var port = client.remotePort;
	    self.emit("connection", transport, unmap(addr), port);
	  });

	  server.on("error", function(err) {
	    self.emit("error", err);
	  });

	  server.on("close", function() {
	    self.emit("close");
	    delete self._server;
	  });
	};

	TcpTransport.prototype.send = function() {
	  if (this._client) {
	    this._client.write(getmsg(arguments));
	  } else {
	    throw new Error("Not connected");
	  }
	};

	TcpTransport.prototype.broadcast = function() {
	  var data = getmsg(arguments);
	  if (this._server) {
	    Object.keys(this._clients).forEach(function(id) {
	      this._clients[id].write(data);
	    }, this);
	  } else {
	    throw new Error("Not listening");
	  }
	};

	TcpTransport.prototype.close = function() {
	  if (this._client) {
	    this._client.end();
	  } else if (this._server) {
	    Object.keys(this._clients).forEach(function(id) {
	      this._clients[id].end();
	    }, this);
	    this._server.close();
	  }
	};

	module.exports = TcpTransport;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = Object.keys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, setImmediate, global, module) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   2.1.1
	 */

	(function() {
	    "use strict";
	    function lib$es6$promise$utils$$objectOrFunction(x) {
	      return typeof x === 'function' || (typeof x === 'object' && x !== null);
	    }

	    function lib$es6$promise$utils$$isFunction(x) {
	      return typeof x === 'function';
	    }

	    function lib$es6$promise$utils$$isMaybeThenable(x) {
	      return typeof x === 'object' && x !== null;
	    }

	    var lib$es6$promise$utils$$_isArray;
	    if (!Array.isArray) {
	      lib$es6$promise$utils$$_isArray = function (x) {
	        return Object.prototype.toString.call(x) === '[object Array]';
	      };
	    } else {
	      lib$es6$promise$utils$$_isArray = Array.isArray;
	    }

	    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
	    var lib$es6$promise$asap$$len = 0;
	    var lib$es6$promise$asap$$toString = {}.toString;
	    var lib$es6$promise$asap$$vertxNext;
	    function lib$es6$promise$asap$$asap(callback, arg) {
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
	      lib$es6$promise$asap$$len += 2;
	      if (lib$es6$promise$asap$$len === 2) {
	        // If len is 2, that means that we need to schedule an async flush.
	        // If additional callbacks are queued before the queue is flushed, they
	        // will be processed by this flush that we are scheduling.
	        lib$es6$promise$asap$$scheduleFlush();
	      }
	    }

	    var lib$es6$promise$asap$$default = lib$es6$promise$asap$$asap;

	    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
	    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
	    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
	    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

	    // test for web worker but not in IE10
	    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
	      typeof importScripts !== 'undefined' &&
	      typeof MessageChannel !== 'undefined';

	    // node
	    function lib$es6$promise$asap$$useNextTick() {
	      var nextTick = process.nextTick;
	      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	      // setImmediate should be used instead instead
	      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
	      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
	        nextTick = setImmediate;
	      }
	      return function() {
	        nextTick(lib$es6$promise$asap$$flush);
	      };
	    }

	    // vertx
	    function lib$es6$promise$asap$$useVertxTimer() {
	      return function() {
	        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
	      };
	    }

	    function lib$es6$promise$asap$$useMutationObserver() {
	      var iterations = 0;
	      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
	      var node = document.createTextNode('');
	      observer.observe(node, { characterData: true });

	      return function() {
	        node.data = (iterations = ++iterations % 2);
	      };
	    }

	    // web worker
	    function lib$es6$promise$asap$$useMessageChannel() {
	      var channel = new MessageChannel();
	      channel.port1.onmessage = lib$es6$promise$asap$$flush;
	      return function () {
	        channel.port2.postMessage(0);
	      };
	    }

	    function lib$es6$promise$asap$$useSetTimeout() {
	      return function() {
	        setTimeout(lib$es6$promise$asap$$flush, 1);
	      };
	    }

	    var lib$es6$promise$asap$$queue = new Array(1000);
	    function lib$es6$promise$asap$$flush() {
	      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
	        var callback = lib$es6$promise$asap$$queue[i];
	        var arg = lib$es6$promise$asap$$queue[i+1];

	        callback(arg);

	        lib$es6$promise$asap$$queue[i] = undefined;
	        lib$es6$promise$asap$$queue[i+1] = undefined;
	      }

	      lib$es6$promise$asap$$len = 0;
	    }

	    function lib$es6$promise$asap$$attemptVertex() {
	      try {
	        var r = require;
	        var vertx = __webpack_require__(83);
	        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
	        return lib$es6$promise$asap$$useVertxTimer();
	      } catch(e) {
	        return lib$es6$promise$asap$$useSetTimeout();
	      }
	    }

	    var lib$es6$promise$asap$$scheduleFlush;
	    // Decide what async method to use to triggering processing of queued callbacks:
	    if (lib$es6$promise$asap$$isNode) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
	    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
	    } else if (lib$es6$promise$asap$$isWorker) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
	    } else if (lib$es6$promise$asap$$browserWindow === undefined && "function" === 'function') {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
	    } else {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
	    }

	    function lib$es6$promise$$internal$$noop() {}

	    var lib$es6$promise$$internal$$PENDING   = void 0;
	    var lib$es6$promise$$internal$$FULFILLED = 1;
	    var lib$es6$promise$$internal$$REJECTED  = 2;

	    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$selfFullfillment() {
	      return new TypeError("You cannot resolve a promise with itself");
	    }

	    function lib$es6$promise$$internal$$cannotReturnOwn() {
	      return new TypeError('A promises callback cannot return that same promise.');
	    }

	    function lib$es6$promise$$internal$$getThen(promise) {
	      try {
	        return promise.then;
	      } catch(error) {
	        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
	        return lib$es6$promise$$internal$$GET_THEN_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	      try {
	        then.call(value, fulfillmentHandler, rejectionHandler);
	      } catch(e) {
	        return e;
	      }
	    }

	    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
	       lib$es6$promise$asap$$default(function(promise) {
	        var sealed = false;
	        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
	          if (sealed) { return; }
	          sealed = true;
	          if (thenable !== value) {
	            lib$es6$promise$$internal$$resolve(promise, value);
	          } else {
	            lib$es6$promise$$internal$$fulfill(promise, value);
	          }
	        }, function(reason) {
	          if (sealed) { return; }
	          sealed = true;

	          lib$es6$promise$$internal$$reject(promise, reason);
	        }, 'Settle: ' + (promise._label || ' unknown promise'));

	        if (!sealed && error) {
	          sealed = true;
	          lib$es6$promise$$internal$$reject(promise, error);
	        }
	      }, promise);
	    }

	    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
	      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
	      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, thenable._result);
	      } else {
	        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      }
	    }

	    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
	      if (maybeThenable.constructor === promise.constructor) {
	        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
	      } else {
	        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

	        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
	        } else if (then === undefined) {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        } else if (lib$es6$promise$utils$$isFunction(then)) {
	          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
	        } else {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        }
	      }
	    }

	    function lib$es6$promise$$internal$$resolve(promise, value) {
	      if (promise === value) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
	      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
	        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
	      } else {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$publishRejection(promise) {
	      if (promise._onerror) {
	        promise._onerror(promise._result);
	      }

	      lib$es6$promise$$internal$$publish(promise);
	    }

	    function lib$es6$promise$$internal$$fulfill(promise, value) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

	      promise._result = value;
	      promise._state = lib$es6$promise$$internal$$FULFILLED;

	      if (promise._subscribers.length !== 0) {
	        lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, promise);
	      }
	    }

	    function lib$es6$promise$$internal$$reject(promise, reason) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	      promise._state = lib$es6$promise$$internal$$REJECTED;
	      promise._result = reason;

	      lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publishRejection, promise);
	    }

	    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
	      var subscribers = parent._subscribers;
	      var length = subscribers.length;

	      parent._onerror = null;

	      subscribers[length] = child;
	      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
	      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

	      if (length === 0 && parent._state) {
	        lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, parent);
	      }
	    }

	    function lib$es6$promise$$internal$$publish(promise) {
	      var subscribers = promise._subscribers;
	      var settled = promise._state;

	      if (subscribers.length === 0) { return; }

	      var child, callback, detail = promise._result;

	      for (var i = 0; i < subscribers.length; i += 3) {
	        child = subscribers[i];
	        callback = subscribers[i + settled];

	        if (child) {
	          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
	        } else {
	          callback(detail);
	        }
	      }

	      promise._subscribers.length = 0;
	    }

	    function lib$es6$promise$$internal$$ErrorObject() {
	      this.error = null;
	    }

	    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
	      try {
	        return callback(detail);
	      } catch(e) {
	        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
	        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
	      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
	          value, error, succeeded, failed;

	      if (hasCallback) {
	        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

	        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
	          failed = true;
	          error = value.error;
	          value = null;
	        } else {
	          succeeded = true;
	        }

	        if (promise === value) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
	          return;
	        }

	      } else {
	        value = detail;
	        succeeded = true;
	      }

	      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	        // noop
	      } else if (hasCallback && succeeded) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      } else if (failed) {
	        lib$es6$promise$$internal$$reject(promise, error);
	      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
	      try {
	        resolver(function resolvePromise(value){
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function rejectPromise(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      } catch(e) {
	        lib$es6$promise$$internal$$reject(promise, e);
	      }
	    }

	    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
	      var enumerator = this;

	      enumerator._instanceConstructor = Constructor;
	      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (enumerator._validateInput(input)) {
	        enumerator._input     = input;
	        enumerator.length     = input.length;
	        enumerator._remaining = input.length;

	        enumerator._init();

	        if (enumerator.length === 0) {
	          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
	        } else {
	          enumerator.length = enumerator.length || 0;
	          enumerator._enumerate();
	          if (enumerator._remaining === 0) {
	            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
	          }
	        }
	      } else {
	        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
	      }
	    }

	    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
	      return lib$es6$promise$utils$$isArray(input);
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
	      return new Error('Array Methods must be provided an Array');
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
	      this._result = new Array(this.length);
	    };

	    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

	    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
	      var enumerator = this;

	      var length  = enumerator.length;
	      var promise = enumerator.promise;
	      var input   = enumerator._input;

	      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        enumerator._eachEntry(input[i], i);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
	      var enumerator = this;
	      var c = enumerator._instanceConstructor;

	      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
	        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
	          entry._onerror = null;
	          enumerator._settledAt(entry._state, i, entry._result);
	        } else {
	          enumerator._willSettleAt(c.resolve(entry), i);
	        }
	      } else {
	        enumerator._remaining--;
	        enumerator._result[i] = entry;
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
	      var enumerator = this;
	      var promise = enumerator.promise;

	      if (promise._state === lib$es6$promise$$internal$$PENDING) {
	        enumerator._remaining--;

	        if (state === lib$es6$promise$$internal$$REJECTED) {
	          lib$es6$promise$$internal$$reject(promise, value);
	        } else {
	          enumerator._result[i] = value;
	        }
	      }

	      if (enumerator._remaining === 0) {
	        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
	      var enumerator = this;

	      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
	        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
	      }, function(reason) {
	        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
	      });
	    };
	    function lib$es6$promise$promise$all$$all(entries) {
	      return new lib$es6$promise$enumerator$$default(this, entries).promise;
	    }
	    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	    function lib$es6$promise$promise$race$$race(entries) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (!lib$es6$promise$utils$$isArray(entries)) {
	        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
	        return promise;
	      }

	      var length = entries.length;

	      function onFulfillment(value) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      }

	      function onRejection(reason) {
	        lib$es6$promise$$internal$$reject(promise, reason);
	      }

	      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
	      }

	      return promise;
	    }
	    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
	    function lib$es6$promise$promise$resolve$$resolve(object) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      if (object && typeof object === 'object' && object.constructor === Constructor) {
	        return object;
	      }

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$resolve(promise, object);
	      return promise;
	    }
	    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
	    function lib$es6$promise$promise$reject$$reject(reason) {
	      /*jshint validthis:true */
	      var Constructor = this;
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$reject(promise, reason);
	      return promise;
	    }
	    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

	    var lib$es6$promise$promise$$counter = 0;

	    function lib$es6$promise$promise$$needsResolver() {
	      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	    }

	    function lib$es6$promise$promise$$needsNew() {
	      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	    }

	    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
	    /**
	      Promise objects represent the eventual result of an asynchronous operation. The
	      primary way of interacting with a promise is through its `then` method, which
	      registers callbacks to receive either a promise’s eventual value or the reason
	      why the promise cannot be fulfilled.

	      Terminology
	      -----------

	      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	      - `thenable` is an object or function that defines a `then` method.
	      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	      - `exception` is a value that is thrown using the throw statement.
	      - `reason` is a value that indicates why a promise was rejected.
	      - `settled` the final resting state of a promise, fulfilled or rejected.

	      A promise can be in one of three states: pending, fulfilled, or rejected.

	      Promises that are fulfilled have a fulfillment value and are in the fulfilled
	      state.  Promises that are rejected have a rejection reason and are in the
	      rejected state.  A fulfillment value is never a thenable.

	      Promises can also be said to *resolve* a value.  If this value is also a
	      promise, then the original promise's settled state will match the value's
	      settled state.  So a promise that *resolves* a promise that rejects will
	      itself reject, and a promise that *resolves* a promise that fulfills will
	      itself fulfill.


	      Basic Usage:
	      ------------

	      ```js
	      var promise = new Promise(function(resolve, reject) {
	        // on success
	        resolve(value);

	        // on failure
	        reject(reason);
	      });

	      promise.then(function(value) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Advanced Usage:
	      ---------------

	      Promises shine when abstracting away asynchronous interactions such as
	      `XMLHttpRequest`s.

	      ```js
	      function getJSON(url) {
	        return new Promise(function(resolve, reject){
	          var xhr = new XMLHttpRequest();

	          xhr.open('GET', url);
	          xhr.onreadystatechange = handler;
	          xhr.responseType = 'json';
	          xhr.setRequestHeader('Accept', 'application/json');
	          xhr.send();

	          function handler() {
	            if (this.readyState === this.DONE) {
	              if (this.status === 200) {
	                resolve(this.response);
	              } else {
	                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	              }
	            }
	          };
	        });
	      }

	      getJSON('/posts.json').then(function(json) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Unlike callbacks, promises are great composable primitives.

	      ```js
	      Promise.all([
	        getJSON('/posts'),
	        getJSON('/comments')
	      ]).then(function(values){
	        values[0] // => postsJSON
	        values[1] // => commentsJSON

	        return values;
	      });
	      ```

	      @class Promise
	      @param {function} resolver
	      Useful for tooling.
	      @constructor
	    */
	    function lib$es6$promise$promise$$Promise(resolver) {
	      this._id = lib$es6$promise$promise$$counter++;
	      this._state = undefined;
	      this._result = undefined;
	      this._subscribers = [];

	      if (lib$es6$promise$$internal$$noop !== resolver) {
	        if (!lib$es6$promise$utils$$isFunction(resolver)) {
	          lib$es6$promise$promise$$needsResolver();
	        }

	        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
	          lib$es6$promise$promise$$needsNew();
	        }

	        lib$es6$promise$$internal$$initializePromise(this, resolver);
	      }
	    }

	    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
	    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
	    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
	    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;

	    lib$es6$promise$promise$$Promise.prototype = {
	      constructor: lib$es6$promise$promise$$Promise,

	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.

	      ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```

	      Chaining
	      --------

	      The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.

	      ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });

	      findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

	      ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```

	      Assimilation
	      ------------

	      Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```

	      If the assimliated promise rejects, then the downstream promise will also reject.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```

	      Simple Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var result;

	      try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```

	      Advanced Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var author, books;

	      try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js

	      function foundBooks(books) {

	      }

	      function failure(reason) {

	      }

	      findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	      then: function(onFulfillment, onRejection) {
	        var parent = this;
	        var state = parent._state;

	        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
	          return this;
	        }

	        var child = new this.constructor(lib$es6$promise$$internal$$noop);
	        var result = parent._result;

	        if (state) {
	          var callback = arguments[state - 1];
	          lib$es6$promise$asap$$default(function(){
	            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
	          });
	        } else {
	          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
	        }

	        return child;
	      },

	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.

	      ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }

	      // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }

	      // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	      'catch': function(onRejection) {
	        return this.then(null, onRejection);
	      }
	    };
	    function lib$es6$promise$polyfill$$polyfill() {
	      var local;

	      if (typeof global !== 'undefined') {
	          local = global;
	      } else if (typeof self !== 'undefined') {
	          local = self;
	      } else {
	          try {
	              local = Function('return this')();
	          } catch (e) {
	              throw new Error('polyfill failed because global object is unavailable in this environment');
	          }
	      }

	      var P = local.Promise;

	      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
	        return;
	      }

	      local.Promise = lib$es6$promise$promise$$default;
	    }
	    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

	    var lib$es6$promise$umd$$ES6Promise = {
	      'Promise': lib$es6$promise$promise$$default,
	      'polyfill': lib$es6$promise$polyfill$$default
	    };

	    /* global define:true module:true window: true */
	    if ("function" === 'function' && __webpack_require__(84)['amd']) {
	      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return lib$es6$promise$umd$$ES6Promise; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module['exports']) {
	      module['exports'] = lib$es6$promise$umd$$ES6Promise;
	    } else if (typeof this !== 'undefined') {
	      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
	    }

	    lib$es6$promise$polyfill$$default();
	}).call(this);


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27), __webpack_require__(82).setImmediate, (function() { return this; }()), __webpack_require__(49)(module)))

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(27).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(82).setImmediate, __webpack_require__(82).clearImmediate))

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/* (ignored) */

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, Buffer) {/*global chrome */

	/**
	 * net
	 * ===
	 *
	 * The net module provides you with an asynchronous network wrapper. It
	 * contains methods for creating both servers and clients (called streams).
	 * You can include this module with require('chrome-net')
	 */

	var EventEmitter = __webpack_require__(76).EventEmitter
	var inherits = __webpack_require__(86)
	var ipaddr = __webpack_require__(87)
	var is = __webpack_require__(88)
	var stream = __webpack_require__(89)

	// Track open servers and sockets to route incoming sockets (via onAccept and onReceive)
	// to the right handlers.
	var servers = {}
	var sockets = {}

	if (typeof chrome !== 'undefined') {
	  chrome.sockets.tcpServer.onAccept.addListener(onAccept)
	  chrome.sockets.tcpServer.onAcceptError.addListener(onAcceptError)
	  chrome.sockets.tcp.onReceive.addListener(onReceive)
	  chrome.sockets.tcp.onReceiveError.addListener(onReceiveError)
	}

	function onAccept (info) {
	  if (info.socketId in servers) {
	    servers[info.socketId]._onAccept(info.clientSocketId)
	  } else {
	    console.error('Unknown server socket id: ' + info.socketId)
	  }
	}

	function onAcceptError (info) {
	  if (info.socketId in servers) {
	    servers[info.socketId]._onAcceptError(info.resultCode)
	  } else {
	    console.error('Unknown server socket id: ' + info.socketId)
	  }
	}

	function onReceive (info) {
	  if (info.socketId in sockets) {
	    sockets[info.socketId]._onReceive(info.data)
	  } else {
	    console.error('Unknown socket id: ' + info.socketId)
	  }
	}

	function onReceiveError (info) {
	  if (info.socketId in sockets) {
	    sockets[info.socketId]._onReceiveError(info.resultCode)
	  } else {
	    if (info.resultCode === -100) return // net::ERR_CONNECTION_CLOSED
	    console.error('Unknown socket id: ' + info.socketId)
	  }
	}

	/**
	 * Creates a new TCP server. The connectionListener argument is automatically
	 * set as a listener for the 'connection' event.
	 *
	 * @param  {Object} options
	 * @param  {function} listener
	 * @return {Server}
	 */
	exports.createServer = function (options, listener) {
	  return new Server(options, listener)
	}

	/**
	 * net.connect(options, [connectionListener])
	 * net.createConnection(options, [connectionListener])
	 *
	 * Constructs a new socket object and opens the socket to the given location.
	 * When the socket is established, the 'connect' event will be emitted.
	 *
	 * For TCP sockets, options argument should be an object which specifies:
	 *
	 *   port: Port the client should connect to (Required).
	 *   host: Host the client should connect to. Defaults to 'localhost'.
	 *   localAddress: Local interface to bind to for network connections.
	 *
	 * ===============================================================
	 *
	 * net.connect(port, [host], [connectListener])
	 * net.createConnection(port, [host], [connectListener])
	 *
	 * Creates a TCP connection to port on host. If host is omitted,
	 * 'localhost' will be assumed. The connectListener parameter will be
	 * added as an listener for the 'connect' event.
	 *
	 * @param {Object} options
	 * @param {function} listener
	 * @return {Socket}
	 */
	exports.connect = exports.createConnection = function () {
	  var args = normalizeConnectArgs(arguments)
	  var s = new Socket(args[0])
	  return Socket.prototype.connect.apply(s, args)
	}

	inherits(Server, EventEmitter)

	/**
	 * Class: net.Server
	 * =================
	 *
	 * This class is used to create a TCP server.
	 *
	 * Event: 'listening'
	 *   Emitted when the server has been bound after calling server.listen.
	 *
	 * Event: 'connection'
	 *   - Socket object The connection object
	 *   Emitted when a new connection is made. socket is an instance of net.Socket.
	 *
	 * Event: 'close'
	 *   Emitted when the server closes. Note that if connections exist, this event
	 *   is not emitted until all connections are ended.
	 *
	 * Event: 'error'
	 *   - Error Object
	 *   Emitted when an error occurs. The 'close' event will be called directly
	 *   following this event. See example in discussion of server.listen.
	 */
	function Server (/* [options], listener */) {
	  var self = this
	  if (!(self instanceof Server)) return new Server(arguments[0], arguments[1])
	  EventEmitter.call(self)

	  /*eslint-disable no-unused-vars*/
	  var options
	  /*eslint-enable no-unused-vars*/

	  if (is.isFunction(arguments[0])) {
	    options = {}
	    self.on('connection', arguments[0])
	  } else {
	    options = arguments[0] || {}

	    if (is.isFunction(arguments[1])) {
	      self.on('connection', arguments[1])
	    }
	  }

	  self._destroyed = false
	  self._connections = 0
	}
	exports.Server = Server

	/**
	 * server.listen(port, [host], [backlog], [callback])
	 *
	 * Begin accepting connections on the specified port and host. If the host is
	 * omitted, the server will accept connections directed to any IPv4 address
	 * (INADDR_ANY). A port value of zero will assign a random port.
	 *
	 * Backlog is the maximum length of the queue of pending connections. The
	 * actual length will be determined by your OS through sysctl settings such as
	 * tcp_max_syn_backlog and somaxconn on linux. The default value of this
	 * parameter is 511 (not 512).
	 *
	 * This function is asynchronous. When the server has been bound, 'listening'
	 * event will be emitted. The last parameter callback will be added as an
	 * listener for the 'listening' event.
	 *
	 * @return {Socket}
	 */
	Server.prototype.listen = function (/* variable arguments... */) {
	  var self = this

	  var lastArg = arguments[arguments.length - 1]
	  if (is.isFunction(lastArg)) {
	    self.once('listening', lastArg)
	  }

	  // If port is invalid or undefined, bind to a random port.
	  var port = toNumber(arguments[0]) || 0

	  var address
	  if (arguments[1] == null ||
	      is.isFunction(arguments[1]) ||
	      is.isNumber(arguments[1])) {
	    // The first argument is the port, no IP given.
	    address = '0.0.0.0'
	  } else {
	    address = arguments[1]
	  }

	  // The third optional argument is the backlog size.
	  // When the ip is omitted it can be the second argument.
	  var backlog = toNumber(arguments[1]) || toNumber(arguments[2]) || undefined

	  chrome.sockets.tcpServer.create(function (createInfo) {
	    self.id = createInfo.socketId

	    chrome.sockets.tcpServer.listen(self.id, address, port, backlog, function (result) {
	      if (result < 0) {
	        self.emit('error', new Error('Socket ' + self.id + ' failed to listen. ' +
	          chrome.runtime.lastError.message))
	        self._destroy()
	        return
	      }

	      servers[self.id] = self

	      chrome.sockets.tcpServer.getInfo(self.id, function (socketInfo) {
	        self._address = socketInfo.localAddress
	        self._port = socketInfo.localPort
	        self.emit('listening')
	      })
	    })
	  })

	  return self
	}

	Server.prototype._onAccept = function (clientSocketId) {
	  var self = this

	  // Set the `maxConnections` property to reject connections when the server's
	  // connection count gets high.
	  if (self.maxConnections && self._connections >= self.maxConnections) {
	    chrome.sockets.tcpServer.disconnect(clientSocketId)
	    chrome.sockets.tcpServer.close(clientSocketId)
	    console.warn('Rejected connection - hit `maxConnections` limit')
	    return
	  }

	  self._connections += 1

	  var acceptedSocket = new Socket({
	    server: self,
	    id: clientSocketId
	  })
	  acceptedSocket.on('connect', function () {
	    self.emit('connection', acceptedSocket)
	  })

	  chrome.sockets.tcp.setPaused(clientSocketId, false)
	}

	Server.prototype._onAcceptError = function (resultCode) {
	  var self = this
	  self.emit('error', new Error('Socket ' + self.id + ' failed to accept (' +
	    resultCode + ')'))
	  self._destroy()
	}

	/**
	 * Stops the server from accepting new connections and keeps existing
	 * connections. This function is asynchronous, the server is finally closed
	 * when all connections are ended and the server emits a 'close' event.
	 * Optionally, you can pass a callback to listen for the 'close' event.
	 * @param  {function} callback
	 */
	Server.prototype.close = function (callback) {
	  var self = this
	  self._destroy(callback)
	}

	Server.prototype._destroy = function (exception, cb) {
	  var self = this

	  if (self._destroyed) return

	  if (cb) this.once('close', cb)

	  this._destroyed = true
	  this._connections = 0
	  delete servers[self.id]

	  chrome.sockets.tcpServer.disconnect(self.id, function () {
	    chrome.sockets.tcpServer.close(self.id, function () {
	      self.emit('close')
	    })
	  })
	}

	/**
	 * Returns the bound address, the address family name and port of the socket
	 * as reported by the operating system. Returns an object with three
	 * properties, e.g. { port: 12346, family: 'IPv4', address: '127.0.0.1' }
	 *
	 * @return {Object} information
	 */
	Server.prototype.address = function () {
	  var self = this
	  return {
	    address: self._address,
	    port: self._port,
	    family: 'IPv4'
	  }
	}

	Server.prototype.unref = function () {
	  // No chrome.socket equivalent
	}

	Server.prototype.ref = function () {
	  // No chrome.socket equivalent
	}

	/**
	 * Asynchronously get the number of concurrent connections on the server.
	 * Works when sockets were sent to forks.
	 *
	 * Callback should take two arguments err and count.
	 *
	 * @param  {function} callback
	 */
	Server.prototype.getConnections = function (callback) {
	  var self = this
	  process.nextTick(function () {
	    callback(null, self._connections)
	  })
	}

	inherits(Socket, stream.Duplex)

	/**
	 * Class: net.Socket
	 * =================
	 *
	 * This object is an abstraction of a TCP or UNIX socket. net.Socket instances
	 * implement a duplex Stream interface. They can be created by the user and
	 * used as a client (with connect()) or they can be created by Node and passed
	 * to the user through the 'connection' event of a server.
	 *
	 * Construct a new socket object.
	 *
	 * options is an object with the following defaults:
	 *
	 *   { fd: null // NO CHROME EQUIVALENT
	 *     type: null
	 *     allowHalfOpen: false // NO CHROME EQUIVALENT
	 *   }
	 *
	 * `type` can only be 'tcp4' (for now).
	 *
	 * Event: 'connect'
	 *   Emitted when a socket connection is successfully established. See
	 *   connect().
	 *
	 * Event: 'data'
	 *   - Buffer object
	 *   Emitted when data is received. The argument data will be a Buffer or
	 *   String. Encoding of data is set by socket.setEncoding(). (See the Readable
	 *   Stream section for more information.)
	 *
	 *   Note that the data will be lost if there is no listener when a Socket
	 *   emits a 'data' event.
	 *
	 * Event: 'end'
	 *   Emitted when the other end of the socket sends a FIN packet.
	 *
	 *   By default (allowHalfOpen == false) the socket will destroy its file
	 *   descriptor once it has written out its pending write queue. However,
	 *   by setting allowHalfOpen == true the socket will not automatically
	 *   end() its side allowing the user to write arbitrary amounts of data,
	 *   with the caveat that the user is required to end() their side now.
	 *
	 * Event: 'timeout'
	 *   Emitted if the socket times out from inactivity. This is only to notify
	 *   that the socket has been idle. The user must manually close the connection.
	 *
	 *   See also: socket.setTimeout()
	 *
	 * Event: 'drain'
	 *   Emitted when the write buffer becomes empty. Can be used to throttle
	 *   uploads.
	 *
	 *   See also: the return values of socket.write()
	 *
	 * Event: 'error'
	 *   - Error object
	 *   Emitted when an error occurs. The 'close' event will be called directly
	 *   following this event.
	 *
	 * Event: 'close'
	 *   - had_error Boolean true if the socket had a transmission error
	 *   Emitted once the socket is fully closed. The argument had_error is a
	 *   boolean which says if the socket was closed due to a transmission error.
	 */
	function Socket (options) {
	  var self = this
	  if (!(self instanceof Socket)) return new Socket(options)

	  if (is.isUndefined(options)) options = {}

	  stream.Duplex.call(self, options)

	  self.destroyed = false
	  self.errorEmitted = false
	  self.readable = self.writable = false

	  // The amount of received bytes.
	  self.bytesRead = 0

	  self._bytesDispatched = 0
	  self._connecting = false

	  self.ondata = null
	  self.onend = null

	  if (options.server) {
	    self.server = options.server
	    self.id = options.id

	    // For incoming sockets (from server), it's already connected.
	    self._connecting = true
	    self._onConnect()
	  }
	}
	exports.Socket = Socket

	/**
	 * socket.connect(port, [host], [connectListener])
	 * socket.connect(options, [connectListener])
	 *
	 * Opens the connection for a given socket. If port and host are given, then
	 * the socket will be opened as a TCP socket, if host is omitted, localhost
	 * will be assumed. If a path is given, the socket will be opened as a unix
	 * socket to that path.
	 *
	 * Normally this method is not needed, as net.createConnection opens the
	 * socket. Use this only if you are implementing a custom Socket.
	 *
	 * This function is asynchronous. When the 'connect' event is emitted the
	 * socket is established. If there is a problem connecting, the 'connect'
	 * event will not be emitted, the 'error' event will be emitted with the
	 * exception.
	 *
	 * The connectListener parameter will be added as an listener for the
	 * 'connect' event.
	 *
	 * @param  {Object} options
	 * @param  {function} cb
	 * @return {Socket}   this socket (for chaining)
	 */
	Socket.prototype.connect = function () {
	  var self = this
	  var args = normalizeConnectArgs(arguments)
	  var options = args[0]
	  var cb = args[1]

	  if (self._connecting) return
	  self._connecting = true

	  var port = Number(options.port)

	  if (is.isFunction(cb)) {
	    self.once('connect', cb)
	  }

	  chrome.sockets.tcp.create(function (createInfo) {
	    if (self.destroyed) {
	      chrome.sockets.tcp.close(createInfo.socketId)
	      return
	    }

	    self.id = createInfo.socketId

	    chrome.sockets.tcp.connect(self.id, options.host, port, function (result) {
	      if (result < 0) {
	        self.destroy(new Error('Socket ' + self.id + ' connect error ' + result +
	          ': ' + chrome.runtime.lastError.message))
	        return
	      }

	      self._onConnect()
	    })
	  })

	  return self
	}

	Socket.prototype._onConnect = function () {
	  var self = this

	  sockets[self.id] = self
	  chrome.sockets.tcp.getInfo(self.id, function (result) {
	    self.remoteAddress = result.peerAddress
	    self.remotePort = result.peerPort
	    self.localAddress = result.localAddress
	    self.localPort = result.localPort

	    self._connecting = false
	    self.readable = self.writable = true

	    self.emit('connect')
	    // start the first read, or get an immediate EOF.
	    // this doesn't actually consume any bytes, because len=0
	    self.read(0)
	  })
	}

	/**
	 * The number of characters currently buffered to be written.
	 * @type {number}
	 */
	Object.defineProperty(Socket.prototype, 'bufferSize', {
	  get: function () {
	    var self = this
	    if (self._pendingData) return self._pendingData.length
	    else return 0 // Unfortunately, chrome.socket does not make this info available
	  }
	})

	/**
	 * Sends data on the socket. The second parameter specifies the encoding in
	 * the case of a string--it defaults to UTF8 encoding.
	 *
	 * Returns true if the entire data was flushed successfully to the kernel
	 * buffer. Returns false if all or part of the data was queued in user memory.
	 * 'drain' will be emitted when the buffer is again free.
	 *
	 * The optional callback parameter will be executed when the data is finally
	 * written out - this may not be immediately.
	 *
	 * @param  {Buffer|Arrayish|string} chunk
	 * @param  {string} [encoding]
	 * @param  {function} [callback]
	 * @return {boolean}             flushed to kernel completely?
	 */
	Socket.prototype.write = function (chunk, encoding, callback) {
	  var self = this
	  if (!Buffer.isBuffer(chunk)) chunk = new Buffer(chunk, encoding)

	  return stream.Duplex.prototype.write.call(self, chunk, encoding, callback)
	}

	Socket.prototype._write = function (buffer, encoding, callback) {
	  var self = this
	  if (!callback) callback = function () {}

	  if (!self.writable) {
	    self._pendingData = buffer
	    self._pendingEncoding = encoding
	    self.once('connect', function () {
	      self._write(buffer, encoding, callback)
	    })
	    return
	  }
	  self._pendingData = null
	  self._pendingEncoding = null

	  // assuming buffer is browser implementation (`buffer` package on npm)
	  var buf = buffer.buffer
	  if (buffer.byteOffset || buffer.byteLength !== buf.byteLength) {
	    buf = buf.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
	  }

	  chrome.sockets.tcp.send(self.id, buf, function (sendInfo) {
	    if (sendInfo.resultCode < 0) {
	      var err = new Error('Socket ' + self.id + ' write error: ' + sendInfo.resultCode)
	      callback(err)
	      self.destroy(err)
	    } else {
	      self._resetTimeout()
	      callback(null)
	    }
	  })

	  self._bytesDispatched += buffer.length
	}

	Socket.prototype._read = function (bufferSize) {
	  var self = this
	  if (self._connecting || !self.id) {
	    self.once('connect', self._read.bind(self, bufferSize))
	    return
	  }

	  chrome.sockets.tcp.setPaused(self.id, false)
	}

	Socket.prototype._onReceive = function (data) {
	  var self = this
	  var buffer = new Buffer(new Uint8Array(data))
	  var offset = self.bytesRead

	  self.bytesRead += buffer.length
	  self._resetTimeout()

	  if (self.ondata) self.ondata(buffer, offset, self.bytesRead)
	  if (!self.push(buffer)) { // if returns false, then apply backpressure
	    chrome.sockets.tcp.setPaused(self.id, true)
	  }
	}

	Socket.prototype._onReceiveError = function (resultCode) {
	  var self = this
	  if (resultCode === -100) {
	    if (self.onend) self.once('end', self.onend)
	    self.push(null)
	    self.destroy()
	  } else if (resultCode < 0) {
	    self.destroy(new Error('Socket ' + self.id + ' receive error ' + resultCode))
	  }
	}

	/**
	 * The amount of bytes sent.
	 * @return {number}
	 */
	Object.defineProperty(Socket.prototype, 'bytesWritten', {
	  get: function () {
	    var self = this
	    var bytes = self._bytesDispatched

	    self._writableState.toArrayBuffer().forEach(function (el) {
	      if (Buffer.isBuffer(el.chunk)) bytes += el.chunk.length
	      else bytes += new Buffer(el.chunk, el.encoding).length
	    })

	    if (self._pendingData) {
	      if (Buffer.isBuffer(self._pendingData)) bytes += self._pendingData.length
	      else bytes += Buffer.byteLength(self._pendingData, self._pendingEncoding)
	    }

	    return bytes
	  }
	})

	Socket.prototype.destroy = function (exception) {
	  var self = this
	  self._destroy(exception)
	}

	Socket.prototype._destroy = function (exception, cb) {
	  var self = this

	  function fireErrorCallbacks () {
	    if (cb) cb(exception)
	    if (exception && !self.errorEmitted) {
	      process.nextTick(function () {
	        self.emit('error', exception)
	      })
	      self.errorEmitted = true
	    }
	  }

	  if (self.destroyed) {
	    // already destroyed, fire error callbacks
	    fireErrorCallbacks()
	    return
	  }

	  if (this.server) {
	    this.server._connections -= 1
	  }

	  self._connecting = false
	  this.readable = this.writable = false
	  self.destroyed = true
	  delete sockets[self.id]

	  // if _destroy() has been called before chrome.sockets.tcp.create()
	  // callback, we don't have an id. Therefore we don't need to close
	  // or disconnect
	  if (self.id) {
	    chrome.sockets.tcp.disconnect(self.id, function () {
	      chrome.sockets.tcp.close(self.id, function () {
	        self.emit('close', !!exception)
	        fireErrorCallbacks()
	      })
	    })
	  }
	}

	Socket.prototype.destroySoon = function () {
	  var self = this

	  if (self.writable) self.end()

	  if (self._writableState.finished) self.destroy()
	  else self.once('finish', self._destroy.bind(self))
	}

	/**
	 * Sets the socket to timeout after timeout milliseconds of inactivity on the socket.
	 * By default net.Socket do not have a timeout. When an idle timeout is triggered the
	 * socket will receive a 'timeout' event but the connection will not be severed. The
	 * user must manually end() or destroy() the socket.
	 *
	 * If timeout is 0, then the existing idle timeout is disabled.
	 *
	 * The optional callback parameter will be added as a one time listener for the 'timeout' event.
	 *
	 * @param {number}   timeout
	 * @param {function} callback
	 */
	Socket.prototype.setTimeout = function (timeout, callback) {
	  var self = this
	  if (callback) self.once('timeout', callback)
	  self._timeoutMs = timeout
	  self._resetTimeout()
	}

	Socket.prototype._onTimeout = function () {
	  var self = this
	  self._timeout = null
	  self._timeoutMs = 0
	  self.emit('timeout')
	}

	Socket.prototype._resetTimeout = function () {
	  var self = this
	  if (self._timeout) {
	    clearTimeout(self._timeout)
	  }
	  if (self._timeoutMs) {
	    self._timeout = setTimeout(self._onTimeout.bind(self), self._timeoutMs)
	  }
	}

	/**
	 * Disables the Nagle algorithm. By default TCP connections use the Nagle
	 * algorithm, they buffer data before sending it off. Setting true for noDelay
	 * will immediately fire off data each time socket.write() is called. noDelay
	 * defaults to true.
	 *
	 * NOTE: The Chrome version of this function is async, whereas the node
	 * version is sync. Keep this in mind.
	 *
	 * @param {boolean} [noDelay] Optional
	 * @param {function} callback CHROME-SPECIFIC: Called when the configuration
	 *                            operation is done.
	 */
	Socket.prototype.setNoDelay = function (noDelay, callback) {
	  var self = this
	  // backwards compatibility: assume true when `enable` is omitted
	  noDelay = is.isUndefined(noDelay) ? true : !!noDelay
	  if (!callback) callback = function () {}
	  chrome.sockets.tcp.setNoDelay(self.id, noDelay, callback)
	}

	/**
	 * Enable/disable keep-alive functionality, and optionally set the initial
	 * delay before the first keepalive probe is sent on an idle socket. enable
	 * defaults to false.
	 *
	 * Set initialDelay (in milliseconds) to set the delay between the last data
	 * packet received and the first keepalive probe. Setting 0 for initialDelay
	 * will leave the value unchanged from the default (or previous) setting.
	 * Defaults to 0.
	 *
	 * NOTE: The Chrome version of this function is async, whereas the node
	 * version is sync. Keep this in mind.
	 *
	 * @param {boolean} [enable] Optional
	 * @param {number} [initialDelay]
	 * @param {function} callback CHROME-SPECIFIC: Called when the configuration
	 *                            operation is done.
	 */
	Socket.prototype.setKeepAlive = function (enable, initialDelay, callback) {
	  var self = this
	  if (!callback) callback = function () {}
	  chrome.sockets.tcp.setKeepAlive(self.id, !!enable, ~~(initialDelay / 1000),
	      callback)
	}

	/**
	 * Returns the bound address, the address family name and port of the socket
	 * as reported by the operating system. Returns an object with three
	 * properties, e.g. { port: 12346, family: 'IPv4', address: '127.0.0.1' }
	 *
	 * @return {Object} information
	 */
	Socket.prototype.address = function () {
	  var self = this
	  return {
	    address: self.localAddress,
	    port: self.localPort,
	    family: 'IPv4'
	  }
	}

	Object.defineProperty(Socket.prototype, 'readyState', {
	  get: function () {
	    var self = this
	    if (self._connecting) {
	      return 'opening'
	    } else if (self.readable && self.writable) {
	      return 'open'
	    } else {
	      return 'closed'
	    }
	  }
	})

	Socket.prototype.unref = function () {
	  // No chrome.socket equivalent
	}

	Socket.prototype.ref = function () {
	  // No chrome.socket equivalent
	}

	//
	// EXPORTED HELPERS
	//

	exports.isIP = function (input) {
	  try {
	    ipaddr.parse(input)
	  } catch (e) {
	    return false
	  }
	  return true
	}

	exports.isIPv4 = function (input) {
	  try {
	    var parsed = ipaddr.parse(input)
	    return (parsed.kind() === 'ipv4')
	  } catch (e) {
	    return false
	  }
	}

	exports.isIPv6 = function (input) {
	  try {
	    var parsed = ipaddr.parse(input)
	    return (parsed.kind() === 'ipv6')
	  } catch (e) {
	    return false
	  }
	}

	//
	// HELPERS
	//

	/**
	 * Returns an array [options] or [options, cb]
	 * It is the same as the argument of Socket.prototype.connect().
	 */
	function normalizeConnectArgs (args) {
	  var options = {}

	  if (is.isObject(args[0])) {
	    // connect(options, [cb])
	    options = args[0]
	  } else {
	    // connect(port, [host], [cb])
	    options.port = args[0]
	    if (is.isString(args[1])) {
	      options.host = args[1]
	    } else {
	      options.host = '127.0.0.1'
	    }
	  }

	  var cb = args[args.length - 1]
	  return is.isFunction(cb) ? [options, cb] : [options]
	}

	function toNumber (x) {
	  return (x = Number(x)) >= 0 ? x : false
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27), __webpack_require__(6).Buffer))

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {(function() {
	  var expandIPv6, ipaddr, ipv4Part, ipv4Regexes, ipv6Part, ipv6Regexes, matchCIDR, root;

	  ipaddr = {};

	  root = this;

	  if ((typeof module !== "undefined" && module !== null) && module.exports) {
	    module.exports = ipaddr;
	  } else {
	    root['ipaddr'] = ipaddr;
	  }

	  matchCIDR = function(first, second, partSize, cidrBits) {
	    var part, shift;
	    if (first.length !== second.length) {
	      throw new Error("ipaddr: cannot match CIDR for objects with different lengths");
	    }
	    part = 0;
	    while (cidrBits > 0) {
	      shift = partSize - cidrBits;
	      if (shift < 0) {
	        shift = 0;
	      }
	      if (first[part] >> shift !== second[part] >> shift) {
	        return false;
	      }
	      cidrBits -= partSize;
	      part += 1;
	    }
	    return true;
	  };

	  ipaddr.subnetMatch = function(address, rangeList, defaultName) {
	    var rangeName, rangeSubnets, subnet, _i, _len;
	    if (defaultName == null) {
	      defaultName = 'unicast';
	    }
	    for (rangeName in rangeList) {
	      rangeSubnets = rangeList[rangeName];
	      if (toString.call(rangeSubnets[0]) !== '[object Array]') {
	        rangeSubnets = [rangeSubnets];
	      }
	      for (_i = 0, _len = rangeSubnets.length; _i < _len; _i++) {
	        subnet = rangeSubnets[_i];
	        if (address.match.apply(address, subnet)) {
	          return rangeName;
	        }
	      }
	    }
	    return defaultName;
	  };

	  ipaddr.IPv4 = (function() {
	    function IPv4(octets) {
	      var octet, _i, _len;
	      if (octets.length !== 4) {
	        throw new Error("ipaddr: ipv4 octet count should be 4");
	      }
	      for (_i = 0, _len = octets.length; _i < _len; _i++) {
	        octet = octets[_i];
	        if (!((0 <= octet && octet <= 255))) {
	          throw new Error("ipaddr: ipv4 octet is a byte");
	        }
	      }
	      this.octets = octets;
	    }

	    IPv4.prototype.kind = function() {
	      return 'ipv4';
	    };

	    IPv4.prototype.toString = function() {
	      return this.octets.join(".");
	    };

	    IPv4.prototype.toByteArray = function() {
	      return this.octets.slice(0);
	    };

	    IPv4.prototype.match = function(other, cidrRange) {
	      var _ref;
	      if (cidrRange === void 0) {
	        _ref = other, other = _ref[0], cidrRange = _ref[1];
	      }
	      if (other.kind() !== 'ipv4') {
	        throw new Error("ipaddr: cannot match ipv4 address with non-ipv4 one");
	      }
	      return matchCIDR(this.octets, other.octets, 8, cidrRange);
	    };

	    IPv4.prototype.SpecialRanges = {
	      unspecified: [[new IPv4([0, 0, 0, 0]), 8]],
	      broadcast: [[new IPv4([255, 255, 255, 255]), 32]],
	      multicast: [[new IPv4([224, 0, 0, 0]), 4]],
	      linkLocal: [[new IPv4([169, 254, 0, 0]), 16]],
	      loopback: [[new IPv4([127, 0, 0, 0]), 8]],
	      "private": [[new IPv4([10, 0, 0, 0]), 8], [new IPv4([172, 16, 0, 0]), 12], [new IPv4([192, 168, 0, 0]), 16]],
	      reserved: [[new IPv4([192, 0, 0, 0]), 24], [new IPv4([192, 0, 2, 0]), 24], [new IPv4([192, 88, 99, 0]), 24], [new IPv4([198, 51, 100, 0]), 24], [new IPv4([203, 0, 113, 0]), 24], [new IPv4([240, 0, 0, 0]), 4]]
	    };

	    IPv4.prototype.range = function() {
	      return ipaddr.subnetMatch(this, this.SpecialRanges);
	    };

	    IPv4.prototype.toIPv4MappedAddress = function() {
	      return ipaddr.IPv6.parse("::ffff:" + (this.toString()));
	    };

	    return IPv4;

	  })();

	  ipv4Part = "(0?\\d+|0x[a-f0-9]+)";

	  ipv4Regexes = {
	    fourOctet: new RegExp("^" + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "$", 'i'),
	    longValue: new RegExp("^" + ipv4Part + "$", 'i')
	  };

	  ipaddr.IPv4.parser = function(string) {
	    var match, parseIntAuto, part, shift, value;
	    parseIntAuto = function(string) {
	      if (string[0] === "0" && string[1] !== "x") {
	        return parseInt(string, 8);
	      } else {
	        return parseInt(string);
	      }
	    };
	    if (match = string.match(ipv4Regexes.fourOctet)) {
	      return (function() {
	        var _i, _len, _ref, _results;
	        _ref = match.slice(1, 6);
	        _results = [];
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          part = _ref[_i];
	          _results.push(parseIntAuto(part));
	        }
	        return _results;
	      })();
	    } else if (match = string.match(ipv4Regexes.longValue)) {
	      value = parseIntAuto(match[1]);
	      if (value > 0xffffffff || value < 0) {
	        throw new Error("ipaddr: address outside defined range");
	      }
	      return ((function() {
	        var _i, _results;
	        _results = [];
	        for (shift = _i = 0; _i <= 24; shift = _i += 8) {
	          _results.push((value >> shift) & 0xff);
	        }
	        return _results;
	      })()).reverse();
	    } else {
	      return null;
	    }
	  };

	  ipaddr.IPv6 = (function() {
	    function IPv6(parts) {
	      var part, _i, _len;
	      if (parts.length !== 8) {
	        throw new Error("ipaddr: ipv6 part count should be 8");
	      }
	      for (_i = 0, _len = parts.length; _i < _len; _i++) {
	        part = parts[_i];
	        if (!((0 <= part && part <= 0xffff))) {
	          throw new Error("ipaddr: ipv6 part should fit to two octets");
	        }
	      }
	      this.parts = parts;
	    }

	    IPv6.prototype.kind = function() {
	      return 'ipv6';
	    };

	    IPv6.prototype.toString = function() {
	      var compactStringParts, part, pushPart, state, stringParts, _i, _len;
	      stringParts = (function() {
	        var _i, _len, _ref, _results;
	        _ref = this.parts;
	        _results = [];
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          part = _ref[_i];
	          _results.push(part.toString(16));
	        }
	        return _results;
	      }).call(this);
	      compactStringParts = [];
	      pushPart = function(part) {
	        return compactStringParts.push(part);
	      };
	      state = 0;
	      for (_i = 0, _len = stringParts.length; _i < _len; _i++) {
	        part = stringParts[_i];
	        switch (state) {
	          case 0:
	            if (part === '0') {
	              pushPart('');
	            } else {
	              pushPart(part);
	            }
	            state = 1;
	            break;
	          case 1:
	            if (part === '0') {
	              state = 2;
	            } else {
	              pushPart(part);
	            }
	            break;
	          case 2:
	            if (part !== '0') {
	              pushPart('');
	              pushPart(part);
	              state = 3;
	            }
	            break;
	          case 3:
	            pushPart(part);
	        }
	      }
	      if (state === 2) {
	        pushPart('');
	        pushPart('');
	      }
	      return compactStringParts.join(":");
	    };

	    IPv6.prototype.toByteArray = function() {
	      var bytes, part, _i, _len, _ref;
	      bytes = [];
	      _ref = this.parts;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        part = _ref[_i];
	        bytes.push(part >> 8);
	        bytes.push(part & 0xff);
	      }
	      return bytes;
	    };

	    IPv6.prototype.toNormalizedString = function() {
	      var part;
	      return ((function() {
	        var _i, _len, _ref, _results;
	        _ref = this.parts;
	        _results = [];
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          part = _ref[_i];
	          _results.push(part.toString(16));
	        }
	        return _results;
	      }).call(this)).join(":");
	    };

	    IPv6.prototype.match = function(other, cidrRange) {
	      var _ref;
	      if (cidrRange === void 0) {
	        _ref = other, other = _ref[0], cidrRange = _ref[1];
	      }
	      if (other.kind() !== 'ipv6') {
	        throw new Error("ipaddr: cannot match ipv6 address with non-ipv6 one");
	      }
	      return matchCIDR(this.parts, other.parts, 16, cidrRange);
	    };

	    IPv6.prototype.SpecialRanges = {
	      unspecified: [new IPv6([0, 0, 0, 0, 0, 0, 0, 0]), 128],
	      linkLocal: [new IPv6([0xfe80, 0, 0, 0, 0, 0, 0, 0]), 10],
	      multicast: [new IPv6([0xff00, 0, 0, 0, 0, 0, 0, 0]), 8],
	      loopback: [new IPv6([0, 0, 0, 0, 0, 0, 0, 1]), 128],
	      uniqueLocal: [new IPv6([0xfc00, 0, 0, 0, 0, 0, 0, 0]), 7],
	      ipv4Mapped: [new IPv6([0, 0, 0, 0, 0, 0xffff, 0, 0]), 96],
	      rfc6145: [new IPv6([0, 0, 0, 0, 0xffff, 0, 0, 0]), 96],
	      rfc6052: [new IPv6([0x64, 0xff9b, 0, 0, 0, 0, 0, 0]), 96],
	      '6to4': [new IPv6([0x2002, 0, 0, 0, 0, 0, 0, 0]), 16],
	      teredo: [new IPv6([0x2001, 0, 0, 0, 0, 0, 0, 0]), 32],
	      reserved: [[new IPv6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]), 32]]
	    };

	    IPv6.prototype.range = function() {
	      return ipaddr.subnetMatch(this, this.SpecialRanges);
	    };

	    IPv6.prototype.isIPv4MappedAddress = function() {
	      return this.range() === 'ipv4Mapped';
	    };

	    IPv6.prototype.toIPv4Address = function() {
	      var high, low, _ref;
	      if (!this.isIPv4MappedAddress()) {
	        throw new Error("ipaddr: trying to convert a generic ipv6 address to ipv4");
	      }
	      _ref = this.parts.slice(-2), high = _ref[0], low = _ref[1];
	      return new ipaddr.IPv4([high >> 8, high & 0xff, low >> 8, low & 0xff]);
	    };

	    return IPv6;

	  })();

	  ipv6Part = "(?:[0-9a-f]+::?)+";

	  ipv6Regexes = {
	    "native": new RegExp("^(::)?(" + ipv6Part + ")?([0-9a-f]+)?(::)?$", 'i'),
	    transitional: new RegExp(("^((?:" + ipv6Part + ")|(?:::)(?:" + ipv6Part + ")?)") + ("" + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "$"), 'i')
	  };

	  expandIPv6 = function(string, parts) {
	    var colonCount, lastColon, part, replacement, replacementCount;
	    if (string.indexOf('::') !== string.lastIndexOf('::')) {
	      return null;
	    }
	    colonCount = 0;
	    lastColon = -1;
	    while ((lastColon = string.indexOf(':', lastColon + 1)) >= 0) {
	      colonCount++;
	    }
	    if (string[0] === ':') {
	      colonCount--;
	    }
	    if (string[string.length - 1] === ':') {
	      colonCount--;
	    }
	    if (colonCount > parts) {
	      return null;
	    }
	    replacementCount = parts - colonCount;
	    replacement = ':';
	    while (replacementCount--) {
	      replacement += '0:';
	    }
	    string = string.replace('::', replacement);
	    if (string[0] === ':') {
	      string = string.slice(1);
	    }
	    if (string[string.length - 1] === ':') {
	      string = string.slice(0, -1);
	    }
	    return (function() {
	      var _i, _len, _ref, _results;
	      _ref = string.split(":");
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        part = _ref[_i];
	        _results.push(parseInt(part, 16));
	      }
	      return _results;
	    })();
	  };

	  ipaddr.IPv6.parser = function(string) {
	    var match, parts;
	    if (string.match(ipv6Regexes['native'])) {
	      return expandIPv6(string, 8);
	    } else if (match = string.match(ipv6Regexes['transitional'])) {
	      parts = expandIPv6(match[1].slice(0, -1), 6);
	      if (parts) {
	        parts.push(parseInt(match[2]) << 8 | parseInt(match[3]));
	        parts.push(parseInt(match[4]) << 8 | parseInt(match[5]));
	        return parts;
	      }
	    }
	    return null;
	  };

	  ipaddr.IPv4.isIPv4 = ipaddr.IPv6.isIPv6 = function(string) {
	    return this.parser(string) !== null;
	  };

	  ipaddr.IPv4.isValid = ipaddr.IPv6.isValid = function(string) {
	    var e;
	    try {
	      new this(this.parser(string));
	      return true;
	    } catch (_error) {
	      e = _error;
	      return false;
	    }
	  };

	  ipaddr.IPv4.parse = ipaddr.IPv6.parse = function(string) {
	    var parts;
	    parts = this.parser(string);
	    if (parts === null) {
	      throw new Error("ipaddr: string is not formatted like ip address");
	    }
	    return new this(parts);
	  };

	  ipaddr.IPv4.parseCIDR = ipaddr.IPv6.parseCIDR = function(string) {
	    var match;
	    if (match = string.match(/^(.+)\/(\d+)$/)) {
	      return [this.parse(match[1]), parseInt(match[2])];
	    }
	    throw new Error("ipaddr: string is not formatted like a CIDR range");
	  };

	  ipaddr.isValid = function(string) {
	    return ipaddr.IPv6.isValid(string) || ipaddr.IPv4.isValid(string);
	  };

	  ipaddr.parse = function(string) {
	    if (ipaddr.IPv6.isValid(string)) {
	      return ipaddr.IPv6.parse(string);
	    } else if (ipaddr.IPv4.isValid(string)) {
	      return ipaddr.IPv4.parse(string);
	    } else {
	      throw new Error("ipaddr: the address has neither IPv6 nor IPv4 format");
	    }
	  };

	  ipaddr.parseCIDR = function(string) {
	    var e;
	    try {
	      return ipaddr.IPv6.parseCIDR(string);
	    } catch (_error) {
	      e = _error;
	      try {
	        return ipaddr.IPv4.parseCIDR(string);
	      } catch (_error) {
	        e = _error;
	        throw new Error("ipaddr: the address has neither IPv6 nor IPv4 CIDR format");
	      }
	    }
	  };

	  ipaddr.process = function(string) {
	    var addr;
	    addr = this.parse(string);
	    if (addr.kind() === 'ipv6' && addr.isIPv4MappedAddress()) {
	      return addr.toIPv4Address();
	    } else {
	      return addr;
	    }
	  };

	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(49)(module)))

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	function isBuffer(arg) {
	  return Buffer.isBuffer(arg);
	}
	exports.isBuffer = isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Stream;

	var EE = __webpack_require__(76).EventEmitter;
	var inherits = __webpack_require__(90);

	inherits(Stream, EE);
	Stream.Readable = __webpack_require__(91);
	Stream.Writable = __webpack_require__(102);
	Stream.Duplex = __webpack_require__(103);
	Stream.Transform = __webpack_require__(104);
	Stream.PassThrough = __webpack_require__(105);

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;



	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	  EE.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	  var source = this;

	  function ondata(chunk) {
	    if (dest.writable) {
	      if (false === dest.write(chunk) && source.pause) {
	        source.pause();
	      }
	    }
	  }

	  source.on('data', ondata);

	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }

	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }

	  var didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    dest.end();
	  }


	  function onclose() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EE.listenerCount(this, 'error') === 0) {
	      throw er; // Unhandled stream error in pipe.
	    }
	  }

	  source.on('error', onerror);
	  dest.on('error', onerror);

	  // remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);

	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);

	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);

	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);

	    dest.removeListener('close', cleanup);
	  }

	  source.on('end', cleanup);
	  source.on('close', cleanup);

	  dest.on('close', cleanup);

	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest;
	};


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(95);
	exports.Stream = __webpack_require__(89);
	exports.Readable = exports;
	exports.Writable = __webpack_require__(99);
	exports.Duplex = __webpack_require__(92);
	exports.Transform = __webpack_require__(100);
	exports.PassThrough = __webpack_require__(101);


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	module.exports = Duplex;

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	}
	/*</replacement>*/


	/*<replacement>*/
	var util = __webpack_require__(93);
	util.inherits = __webpack_require__(94);
	/*</replacement>*/

	var Readable = __webpack_require__(95);
	var Writable = __webpack_require__(99);

	util.inherits(Duplex, Readable);

	forEach(objectKeys(Writable.prototype), function(method) {
	  if (!Duplex.prototype[method])
	    Duplex.prototype[method] = Writable.prototype[method];
	});

	function Duplex(options) {
	  if (!(this instanceof Duplex))
	    return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false)
	    this.readable = false;

	  if (options && options.writable === false)
	    this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false)
	    this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended)
	    return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  process.nextTick(this.end.bind(this));
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	function isBuffer(arg) {
	  return Buffer.isBuffer(arg);
	}
	exports.isBuffer = isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Readable;

	/*<replacement>*/
	var isArray = __webpack_require__(96);
	/*</replacement>*/


	/*<replacement>*/
	var Buffer = __webpack_require__(6).Buffer;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	var EE = __webpack_require__(76).EventEmitter;

	/*<replacement>*/
	if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	var Stream = __webpack_require__(89);

	/*<replacement>*/
	var util = __webpack_require__(93);
	util.inherits = __webpack_require__(94);
	/*</replacement>*/

	var StringDecoder;


	/*<replacement>*/
	var debug = __webpack_require__(97);
	if (debug && debug.debuglog) {
	  debug = debug.debuglog('stream');
	} else {
	  debug = function () {};
	}
	/*</replacement>*/


	util.inherits(Readable, Stream);

	function ReadableState(options, stream) {
	  var Duplex = __webpack_require__(92);

	  options = options || {};

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.buffer = [];
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;


	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder)
	      StringDecoder = __webpack_require__(98).StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  var Duplex = __webpack_require__(92);

	  if (!(this instanceof Readable))
	    return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  Stream.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function(chunk, encoding) {
	  var state = this._readableState;

	  if (util.isString(chunk) && !state.objectMode) {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = new Buffer(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function(chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (util.isNullOrUndefined(chunk)) {
	    state.reading = false;
	    if (!state.ended)
	      onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var e = new Error('stream.unshift() after end event');
	      stream.emit('error', e);
	    } else {
	      if (state.decoder && !addToFront && !encoding)
	        chunk = state.decoder.write(chunk);

	      if (!addToFront)
	        state.reading = false;

	      // if we want the data now, just emit it.
	      if (state.flowing && state.length === 0 && !state.sync) {
	        stream.emit('data', chunk);
	        stream.read(0);
	      } else {
	        // update the buffer info.
	        state.length += state.objectMode ? 1 : chunk.length;
	        if (addToFront)
	          state.buffer.unshift(chunk);
	        else
	          state.buffer.push(chunk);

	        if (state.needReadable)
	          emitReadable(stream);
	      }

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}



	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended &&
	         (state.needReadable ||
	          state.length < state.highWaterMark ||
	          state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function(enc) {
	  if (!StringDecoder)
	    StringDecoder = __webpack_require__(98).StringDecoder;
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 128MB
	var MAX_HWM = 0x800000;
	function roundUpToNextPowerOf2(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2
	    n--;
	    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
	    n++;
	  }
	  return n;
	}

	function howMuchToRead(n, state) {
	  if (state.length === 0 && state.ended)
	    return 0;

	  if (state.objectMode)
	    return n === 0 ? 0 : 1;

	  if (isNaN(n) || util.isNull(n)) {
	    // only flow one buffer at a time
	    if (state.flowing && state.buffer.length)
	      return state.buffer[0].length;
	    else
	      return state.length;
	  }

	  if (n <= 0)
	    return 0;

	  // If we're asking for more than the target buffer level,
	  // then raise the water mark.  Bump up to the next highest
	  // power of 2, to prevent increasing it excessively in tiny
	  // amounts.
	  if (n > state.highWaterMark)
	    state.highWaterMark = roundUpToNextPowerOf2(n);

	  // don't have that much.  return null, unless we've ended.
	  if (n > state.length) {
	    if (!state.ended) {
	      state.needReadable = true;
	      return 0;
	    } else
	      return state.length;
	  }

	  return n;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function(n) {
	  debug('read', n);
	  var state = this._readableState;
	  var nOrig = n;

	  if (!util.isNumber(n) || n > 0)
	    state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 &&
	      state.needReadable &&
	      (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended)
	      endReadable(this);
	    else
	      emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0)
	      endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  }

	  if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0)
	      state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	  }

	  // If _read pushed data synchronously, then `reading` will be false,
	  // and we need to re-evaluate how much data we can return to the user.
	  if (doRead && !state.reading)
	    n = howMuchToRead(nOrig, state);

	  var ret;
	  if (n > 0)
	    ret = fromList(n, state);
	  else
	    ret = null;

	  if (util.isNull(ret)) {
	    state.needReadable = true;
	    n = 0;
	  }

	  state.length -= n;

	  // If we have nothing in the buffer, then we want to know
	  // as soon as we *do* get something into the buffer.
	  if (state.length === 0 && !state.ended)
	    state.needReadable = true;

	  // If we tried to read() past the EOF, then emit end on the next tick.
	  if (nOrig !== n && state.ended && state.length === 0)
	    endReadable(this);

	  if (!util.isNull(ret))
	    this.emit('data', ret);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}


	function onEofChunk(stream, state) {
	  if (state.decoder && !state.ended) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync)
	      process.nextTick(function() {
	        emitReadable_(stream);
	      });
	    else
	      emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}


	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(function() {
	      maybeReadMore_(stream, state);
	    });
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended &&
	         state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;
	    else
	      len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function(n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function(dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
	              dest !== process.stdout &&
	              dest !== process.stderr;

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted)
	    process.nextTick(endFn);
	  else
	    src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    debug('onunpipe');
	    if (readable === src) {
	      cleanup();
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);
	    src.removeListener('data', ondata);

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain &&
	        (!dest._writableState || dest._writableState.needDrain))
	      ondrain();
	  }

	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    var ret = dest.write(chunk);
	    if (false === ret) {
	      debug('false write response, pause',
	            src._readableState.awaitDrain);
	      src._readableState.awaitDrain++;
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EE.listenerCount(dest, 'error') === 0)
	      dest.emit('error', er);
	  }
	  // This is a brutally ugly hack to make sure that our error handler
	  // is attached before any userland ones.  NEVER DO THIS.
	  if (!dest._events || !dest._events.error)
	    dest.on('error', onerror);
	  else if (isArray(dest._events.error))
	    dest._events.error.unshift(onerror);
	  else
	    dest._events.error = [onerror, dest._events.error];



	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function() {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain)
	      state.awaitDrain--;
	    if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}


	Readable.prototype.unpipe = function(dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0)
	    return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes)
	      return this;

	    if (!dest)
	      dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest)
	      dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++)
	      dests[i].emit('unpipe', this);
	    return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1)
	    return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1)
	    state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function(ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);

	  // If listening to data, and it has not explicitly been paused,
	  // then call resume to start the flow of data on the next tick.
	  if (ev === 'data' && false !== this._readableState.flowing) {
	    this.resume();
	  }

	  if (ev === 'readable' && this.readable) {
	    var state = this._readableState;
	    if (!state.readableListening) {
	      state.readableListening = true;
	      state.emittedReadable = false;
	      state.needReadable = true;
	      if (!state.reading) {
	        var self = this;
	        process.nextTick(function() {
	          debug('readable nexttick read 0');
	          self.read(0);
	        });
	      } else if (state.length) {
	        emitReadable(this, state);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function() {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    if (!state.reading) {
	      debug('resume read 0');
	      this.read(0);
	    }
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    process.nextTick(function() {
	      resume_(stream, state);
	    });
	  }
	}

	function resume_(stream, state) {
	  state.resumeScheduled = false;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading)
	    stream.read(0);
	}

	Readable.prototype.pause = function() {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  if (state.flowing) {
	    do {
	      var chunk = stream.read();
	    } while (null !== chunk && state.flowing);
	  }
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function(stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function() {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length)
	        self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function(chunk) {
	    debug('wrapped data');
	    if (state.decoder)
	      chunk = state.decoder.write(chunk);
	    if (!chunk || !state.objectMode && !chunk.length)
	      return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
	      this[i] = function(method) { return function() {
	        return stream[method].apply(stream, arguments);
	      }}(i);
	    }
	  }

	  // proxy certain important events.
	  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events, function(ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function(n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};



	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	function fromList(n, state) {
	  var list = state.buffer;
	  var length = state.length;
	  var stringMode = !!state.decoder;
	  var objectMode = !!state.objectMode;
	  var ret;

	  // nothing in the list, definitely empty.
	  if (list.length === 0)
	    return null;

	  if (length === 0)
	    ret = null;
	  else if (objectMode)
	    ret = list.shift();
	  else if (!n || n >= length) {
	    // read it all, truncate the array.
	    if (stringMode)
	      ret = list.join('');
	    else
	      ret = Buffer.concat(list, length);
	    list.length = 0;
	  } else {
	    // read just some of it.
	    if (n < list[0].length) {
	      // just take a part of the first list item.
	      // slice is the same for buffers and strings.
	      var buf = list[0];
	      ret = buf.slice(0, n);
	      list[0] = buf.slice(n);
	    } else if (n === list[0].length) {
	      // first list is a perfect match
	      ret = list.shift();
	    } else {
	      // complex case.
	      // we have enough to cover it, but it spans past the first buffer.
	      if (stringMode)
	        ret = '';
	      else
	        ret = new Buffer(n);

	      var c = 0;
	      for (var i = 0, l = list.length; i < l && c < n; i++) {
	        var buf = list[0];
	        var cpy = Math.min(n - c, buf.length);

	        if (stringMode)
	          ret += buf.slice(0, cpy);
	        else
	          buf.copy(ret, c, 0, cpy);

	        if (cpy < buf.length)
	          list[0] = buf.slice(cpy);
	        else
	          list.shift();

	        c += cpy;
	      }
	    }
	  }

	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0)
	    throw new Error('endReadable called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    process.nextTick(function() {
	      // Check that we didn't get one last unshift.
	      if (!state.endEmitted && state.length === 0) {
	        state.endEmitted = true;
	        stream.readable = false;
	        stream.emit('end');
	      }
	    });
	  }
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf (xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	/* (ignored) */

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var Buffer = __webpack_require__(6).Buffer;

	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     }


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	var StringDecoder = exports.StringDecoder = function(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	};


	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, cb), and it'll handle all
	// the drain event emission and buffering.

	module.exports = Writable;

	/*<replacement>*/
	var Buffer = __webpack_require__(6).Buffer;
	/*</replacement>*/

	Writable.WritableState = WritableState;


	/*<replacement>*/
	var util = __webpack_require__(93);
	util.inherits = __webpack_require__(94);
	/*</replacement>*/

	var Stream = __webpack_require__(89);

	util.inherits(Writable, Stream);

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	}

	function WritableState(options, stream) {
	  var Duplex = __webpack_require__(92);

	  options = options || {};

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function(er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.buffer = [];

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;
	}

	function Writable(options) {
	  var Duplex = __webpack_require__(92);

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex))
	    return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function() {
	  this.emit('error', new Error('Cannot pipe. Not readable.'));
	};


	function writeAfterEnd(stream, state, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  process.nextTick(function() {
	    cb(er);
	  });
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    var er = new TypeError('Invalid non-string/buffer chunk');
	    stream.emit('error', er);
	    process.nextTick(function() {
	      cb(er);
	    });
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function(chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  else if (!encoding)
	    encoding = state.defaultEncoding;

	  if (!util.isFunction(cb))
	    cb = function() {};

	  if (state.ended)
	    writeAfterEnd(this, state, cb);
	  else if (validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function() {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function() {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing &&
	        !state.corked &&
	        !state.finished &&
	        !state.bufferProcessing &&
	        state.buffer.length)
	      clearBuffer(this, state);
	  }
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode &&
	      state.decodeStrings !== false &&
	      util.isString(chunk)) {
	    chunk = new Buffer(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);
	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret)
	    state.needDrain = true;

	  if (state.writing || state.corked)
	    state.buffer.push(new WriteReq(chunk, encoding, cb));
	  else
	    doWrite(stream, state, false, len, chunk, encoding, cb);

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev)
	    stream._writev(chunk, state.onwrite);
	  else
	    stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  if (sync)
	    process.nextTick(function() {
	      state.pendingcb--;
	      cb(er);
	    });
	  else {
	    state.pendingcb--;
	    cb(er);
	  }

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er)
	    onwriteError(stream, state, sync, er, cb);
	  else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(stream, state);

	    if (!finished &&
	        !state.corked &&
	        !state.bufferProcessing &&
	        state.buffer.length) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      process.nextTick(function() {
	        afterWrite(stream, state, finished, cb);
	      });
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished)
	    onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}


	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;

	  if (stream._writev && state.buffer.length > 1) {
	    // Fast case, write everything using _writev()
	    var cbs = [];
	    for (var c = 0; c < state.buffer.length; c++)
	      cbs.push(state.buffer[c].callback);

	    // count the one we are adding, as well.
	    // TODO(isaacs) clean this up
	    state.pendingcb++;
	    doWrite(stream, state, true, state.length, state.buffer, '', function(err) {
	      for (var i = 0; i < cbs.length; i++) {
	        state.pendingcb--;
	        cbs[i](err);
	      }
	    });

	    // Clear buffer
	    state.buffer = [];
	  } else {
	    // Slow case, write chunks one-by-one
	    for (var c = 0; c < state.buffer.length; c++) {
	      var entry = state.buffer[c];
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);

	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        c++;
	        break;
	      }
	    }

	    if (c < state.buffer.length)
	      state.buffer = state.buffer.slice(c);
	    else
	      state.buffer.length = 0;
	  }

	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function(chunk, encoding, cb) {
	  cb(new Error('not implemented'));

	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function(chunk, encoding, cb) {
	  var state = this._writableState;

	  if (util.isFunction(chunk)) {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (!util.isNullOrUndefined(chunk))
	    this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished)
	    endWritable(this, state, cb);
	};


	function needFinish(stream, state) {
	  return (state.ending &&
	          state.length === 0 &&
	          !state.finished &&
	          !state.writing);
	}

	function prefinish(stream, state) {
	  if (!state.prefinished) {
	    state.prefinished = true;
	    stream.emit('prefinish');
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(stream, state);
	  if (need) {
	    if (state.pendingcb === 0) {
	      prefinish(stream, state);
	      state.finished = true;
	      stream.emit('finish');
	    } else
	      prefinish(stream, state);
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished)
	      process.nextTick(cb);
	    else
	      stream.once('finish', cb);
	  }
	  state.ended = true;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	module.exports = Transform;

	var Duplex = __webpack_require__(92);

	/*<replacement>*/
	var util = __webpack_require__(93);
	util.inherits = __webpack_require__(94);
	/*</replacement>*/

	util.inherits(Transform, Duplex);


	function TransformState(options, stream) {
	  this.afterTransform = function(er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb)
	    return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (!util.isNullOrUndefined(data))
	    stream.push(data);

	  if (cb)
	    cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}


	function Transform(options) {
	  if (!(this instanceof Transform))
	    return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = new TransformState(options, this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  this.once('prefinish', function() {
	    if (util.isFunction(this._flush))
	      this._flush(function(er) {
	        done(stream, er);
	      });
	    else
	      done(stream);
	  });
	}

	Transform.prototype.push = function(chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function(chunk, encoding, cb) {
	  throw new Error('not implemented');
	};

	Transform.prototype._write = function(chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform ||
	        rs.needReadable ||
	        rs.length < rs.highWaterMark)
	      this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function(n) {
	  var ts = this._transformState;

	  if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};


	function done(stream, er) {
	  if (er)
	    return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var ts = stream._transformState;

	  if (ws.length)
	    throw new Error('calling transform done when ws.length != 0');

	  if (ts.transforming)
	    throw new Error('calling transform done when still transforming');

	  return stream.push(null);
	}


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	module.exports = PassThrough;

	var Transform = __webpack_require__(100);

	/*<replacement>*/
	var util = __webpack_require__(93);
	util.inherits = __webpack_require__(94);
	/*</replacement>*/

	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough))
	    return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function(chunk, encoding, cb) {
	  cb(null, chunk);
	};


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(99)


/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(92)


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(100)


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(101)


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * WebSocket transport. Needed because browsers can't handle TCP sockets
	 * so we use separate WebSocket server to proxy messages into TCP data
	 * packets. Available for both Node.js and Browser platforms.  
	 * **NOTE**: `WsTransport` is exported as a module.
	 * @module bitmessage-transports/ws
	 */

	"use strict";

	var objectAssign = Object.assign || __webpack_require__(80);
	var PPromise = typeof Promise === "undefined" ?
	               __webpack_require__(81).Promise :
	               Promise;
	var inherits = __webpack_require__(75);
	var WebSocket = __webpack_require__(107);  // jshint ignore:line
	var bitmessage = __webpack_require__(4);
	var assert = __webpack_require__(78).assert;
	var BaseTransport = __webpack_require__(74);

	var WebSocketServer = WebSocket.Server;
	var structs = bitmessage.structs;
	var ServicesBitfield = structs.ServicesBitfield;
	var messages = bitmessage.messages;
	var getmsg = BaseTransport._getmsg;
	var unmap = BaseTransport._unmap;

	/**
	 * WebSocket transport class. Implements
	 * [base transport interface]{@link
	 * module:bitmessage-transports/base.BaseTransport}.
	 * @param {Object=} opts - Transport options
	 * @param {Array} opts.seeds - Bootstrap nodes (none by default)
	 * @param {Object} opts.services - Service features provided by this
	 * node (`NODE_MOBILE` for Browser and `NODE_MOBILE` + `NODE_GATEWAY`
	 * for Node by default)
	 * @param {(Array|string|Buffer)} opts.userAgent - User agent of this
	 * node (user agent of bitmessage library by default)
	 * @param {number[]} opts.streams - Streams accepted by this node ([1]
	 * by default)
	 * @param {number} opts.port - Incoming port of this node, makes sence
	 * only on Node platform (18444 by default)
	 * @constructor
	 * @static
	 */
	function WsTransport(opts) {
	  WsTransport.super_.call(this);
	  objectAssign(this, opts);
	  this.seeds = this.seeds || [];
	  this.services = this.services || ServicesBitfield().set([
	    ServicesBitfield.NODE_MOBILE,
	    ServicesBitfield.NODE_GATEWAY,
	  ]);
	  this.streams = this.streams || [1];
	  this.port = this.port || 18444;
	}

	inherits(WsTransport, BaseTransport);

	WsTransport.prototype.toString = function() {
	  if (this._client &&
	      this._client._socket &&
	      this._client._socket.remoteAddress) {
	    return (
	      "ws:" +
	      unmap(this._client._socket.remoteAddress) + ":" +
	      this._client._socket.remotePort
	    );
	  } else {
	    return "ws:not-connected";
	  }
	};

	WsTransport.prototype._sendVersion = function() {
	  return this.send(messages.version.encode({
	    services: this.services,
	    userAgent: this.userAgent,
	    streams: this.streams,
	    port: this.port,
	    remoteHost: this._client._socket.remoteAddress,
	    remotePort: this._client._socket.remotePort,
	  }));
	};

	WsTransport.prototype._handleTimeout = function() {
	  var client = this._client;
	  // TODO(Kagami): We may also want to close connection if it wasn't
	  // established within minute.
	  client._socket.setTimeout(20000);
	  client._socket.on("timeout", function() {
	    client.close();
	  });
	  this.on("established", function() {
	    // Raise timeout up to 10 minutes per spec.
	    // TODO(Kagami): Send ping frame every 5 minutes as PyBitmessage.
	    client._socket.setTimeout(600000);
	  });
	};

	WsTransport.prototype._setupClient = function(client, incoming) {
	  var self = this;
	  self._client = client;
	  var verackSent = false;
	  var verackReceived = false;
	  var established = false;

	  client.on("open", function() {
	    // NOTE(Kagami): This handler shouldn't be called at all for
	    // incoming connections but let's be sure.
	    if (!incoming) {
	      // NOTE(Kagami): We may set timeout only after connection was
	      // opened because socket may not yet be available when
	      // `_setupClient` is called.
	      self._handleTimeout();
	      self.emit("open");
	      self._sendVersion();
	    }
	  });

	  client.on("message", function(data, flags) {
	    var decoded;
	    if (!flags.binary) {
	      // TODO(Kagami): Send `error` message and ban node for some time
	      // if there were too many errors?
	      return self.emit("warning", new Error("Peer sent non-binary data"));
	    }
	    try {
	      decoded = structs.message.decode(data);
	    } catch (err) {
	      return self.emit("warning", new Error(
	        "Message decoding error: " + err.message
	      ));
	    }
	    self.emit("message", decoded.command, decoded.payload);
	  });

	  // High-level message processing.
	  self.on("message", function(command, payload) {
	    var version;
	    var veropts = incoming ? {mobile: true} : {gateway: true};
	    if (!established) {
	      if (command === "version") {
	        if (verackSent) {
	          return;
	        }
	        try {
	          version = self._decodeVersion(payload, veropts);
	        } catch(err) {
	          self.emit("error", err);
	          return client.close();
	        }
	        self.send("verack");
	        verackSent = true;
	        if (incoming) {
	          self._sendVersion();
	        } else if (verackReceived) {
	          established = true;
	          self.emit("established", version);
	        }
	      } else if (command === "verack") {
	        verackReceived = true;
	        if (verackSent) {
	          established = true;
	          self.emit("established", version);
	        }
	      }
	    }
	  });

	  client.on("error", function(err) {
	    self.emit("error", err);
	  });

	  client.on("close", function() {
	    self.emit("close");
	    delete self._client;
	  });
	};

	WsTransport.prototype.bootstrap = function() {
	  return PPromise.resolve([].concat(this.seeds));
	};

	/**
	 * Connect to a WebSocket node. Connection arguments are the same as for
	 * [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).
	 */
	WsTransport.prototype.connect = function(address, protocols, options) {
	  assert(!this._client, "Already connected");
	  assert(!this._server, "Already listening");
	  // `new` doesn't work with `apply`, so passing all possible arguments
	  // manually.
	  this._setupClient(new WebSocket(address, protocols, options));
	};

	/**
	 * Listen for incoming WebSocket connections. Listen arguments are the
	 * same as for
	 * [WebSocketServer](https://github.com/websockets/ws#server-example).
	 * Available only for Node platform.
	 */
	WsTransport.prototype.listen = function(options, callback) {
	  assert(!this._client, "Already connected");
	  assert(!this._server, "Already listening");

	  var self = this;
	  var server = self._server = new WebSocketServer(options, callback);

	  server.on("connection", function(client) {
	    var opts = objectAssign({}, self);
	    delete opts._server;
	    var transport = new self.constructor(opts);
	    var incoming = true;
	    transport._setupClient(client, incoming);
	    transport._handleTimeout();
	    var addr = client._socket.remoteAddress;
	    var port = client._socket.remotePort;
	    self.emit("connection", transport, unmap(addr), port);
	  });

	  server.on("error", function(err) {
	    self.emit("error", err);
	  });

	  // `ws` doesn't emit "close" event by default.
	  server._server.on("close", function() {
	    self.emit("close");
	    delete self._server;
	  });
	};

	WsTransport.prototype.send = function() {
	  if (this._client) {
	    // TODO(Kagami): `mask: true` doesn't work with Chromium 40. File a
	    // bug to ws bugtracker.
	    this._client.send(getmsg(arguments), {binary: true});
	  } else {
	    throw new Error("Not connected");
	  }
	};

	WsTransport.prototype.broadcast = function() {
	  var data = getmsg(arguments);
	  if (this._server) {
	    this._server.clients.forEach(function(client) {
	      client.send(data, {binary: true});
	    });
	  } else {
	    throw new Error("Not listening");
	  }
	};

	WsTransport.prototype.close = function() {
	  if (this._client) {
	    this._client.close();
	  } else if (this._server) {
	    this._server.close();
	  }
	};

	module.exports = WsTransport;


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var global = (function() { return this; })();

	/**
	 * WebSocket constructor.
	 */

	var WebSocket = global.WebSocket || global.MozWebSocket;

	/**
	 * Module exports.
	 */

	module.exports = WebSocket ? ws : null;

	/**
	 * WebSocket constructor.
	 *
	 * The third `opts` options object gets ignored in web browsers, since it's
	 * non-standard, and throws a TypeError if passed to the constructor.
	 * See: https://github.com/einaros/ws/issues/227
	 *
	 * @param {String} uri
	 * @param {Array} protocols (optional)
	 * @param {Object) opts (optional)
	 * @api public
	 */

	function ws(uri, protocols, opts) {
	  var instance;
	  if (protocols) {
	    instance = new WebSocket(uri, protocols);
	  } else {
	    instance = new WebSocket(uri);
	  }
	  return instance;
	}

	if (WebSocket) ws.prototype = WebSocket.prototype;


/***/ }
/******/ ]);
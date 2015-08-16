var addon = require('./build/Release/xattr')

function fakeAsync (fn, args, cb) {
  process.nextTick(function () {
    try {
      cb(null, addon[fn].apply(addon, args))
    } catch (err) {
      cb(err)
    }
  })
}

function defaultCallback (err) {
  if (err) throw err
}

function validateArgument (key, val) {
  switch (key) {
    case 'path':
      if (typeof val === 'string') return val
      throw new TypeError('`path` must be a string')
    case 'attr':
      if (typeof val === 'string') return val
      throw new TypeError('`attr` must be a string')
    case 'value':
      if (typeof val === 'string') return new Buffer(val)
      if (Buffer.isBuffer(val)) return val
      throw new TypeError('`value` must be a string or buffer')
    case 'cb':
      if (typeof val === 'function') return val
      if (val == null) return defaultCallback
      throw new TypeError('`cb` must be a function')
    default:
      throw new Error('Unknown argument: ' + key)
  }
}

/* Async methods */

exports.get = function get (path, attr, cb) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)
  cb = validateArgument('cb', cb)

  fakeAsync('get', [path, attr], cb)
}

exports.set = function set (path, attr, value, cb) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)
  value = validateArgument('value', value)
  cb = validateArgument('cb', cb)

  fakeAsync('set', [path, attr, value], cb)
}

exports.list = function list (path, cb) {
  path = validateArgument('path', path)
  cb = validateArgument('cb', cb)

  fakeAsync('list', [path], cb)
}

exports.remove = function remove (path, attr, cb) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)
  cb = validateArgument('cb', cb)

  fakeAsync('remove', [path, attr], cb)
}

/* Sync methods */

exports.getSync = function getSync (path, attr) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)

  return addon.get(path, attr)
}

exports.setSync = function setSync (path, attr, value) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)
  value = validateArgument('value', value)

  return addon.set(path, attr, value)
}

exports.listSync = function listSync (path) {
  path = validateArgument('path', path)

  return addon.list(path)
}

exports.removeSync = function removeSync (path, attr) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)

  return addon.remove(path, attr)
}

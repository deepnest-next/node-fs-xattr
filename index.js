// Will load a compiled build if present or a prebuild.
// If no build if found it will throw an exception
const addon = require('node-gyp-build')(__dirname)

function validateArgument (key, val) {
  switch (key) {
    case 'path':
      if (typeof val === 'string') return val
      throw new TypeError('`path` must be a string')
    case 'attr':
      if (typeof val === 'string') return val
      throw new TypeError('`attr` must be a string')
    case 'value':
      if (typeof val === 'string') return Buffer.from(val)
      if (Buffer.isBuffer(val)) return val
      throw new TypeError('`value` must be a string or buffer')
    default:
      throw new Error(`Unknown argument: ${key}`)
  }
}

/* Async methods */

async function getAttribute (path, attr) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)

  return addon.get(path, attr)
}

async function setAttribute (path, attr, value) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)
  value = validateArgument('value', value)

  return addon.set(path, attr, value)
}

async function listAttributes (path) {
  path = validateArgument('path', path)

  return addon.list(path)
}

async function removeAttribute (path, attr) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)

  return addon.remove(path, attr)
}

/* Sync methods */

function getAttributeSync (path, attr) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)

  return addon.getSync(path, attr)
}

function setAttributeSync (path, attr, value) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)
  value = validateArgument('value', value)

  return addon.setSync(path, attr, value)
}

function listAttributesSync (path) {
  path = validateArgument('path', path)

  return addon.listSync(path)
}

function removeAttributeSync (path, attr) {
  path = validateArgument('path', path)
  attr = validateArgument('attr', attr)

  return addon.removeSync(path, attr)
}

module.exports = {
  getAttribute,
  setAttribute,
  listAttributes,
  removeAttribute,
  getAttributeSync,
  setAttributeSync,
  listAttributesSync,
  removeAttributeSync
}

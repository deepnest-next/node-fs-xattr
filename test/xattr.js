/* eslint-env mocha */

import * as xattr from '../index.js'

import assert from 'node:assert'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'

import temp from 'fs-temp'

const attribute0 = 'user.linusu.test'
const attribute1 = 'user.linusu.secondary'
const payload0 = crypto.randomBytes(24).toString('hex')
const payload1 = crypto.randomBytes(24).toString('hex')

describe('xattr#sync', function () {
  let path

  before(function () {
    path = temp.writeFileSync('')
  })

  it('should set an attribute', function () {
    xattr.setAttributeSync(path, attribute0, payload0)
    xattr.setAttributeSync(path, attribute1, payload1)
  })

  it('should get an attribute', function () {
    const val = xattr.getAttributeSync(path, attribute0)
    assert(Buffer.isBuffer(val))
    assert.strictEqual(val.toString(), payload0)
  })

  it('should list the attributes', function () {
    const val = xattr.listAttributesSync(path)
    assert.ok(val.includes(attribute0))
    assert.ok(val.includes(attribute1))
  })

  it('should remove the attribute', function () {
    xattr.removeAttributeSync(path, attribute0)
    xattr.removeAttributeSync(path, attribute1)
  })

  it('should give useful errors', function () {
    assert.throws(function () {
      xattr.getAttributeSync(path, attribute0)
    }, function (err) {
      assert.strictEqual(err.errno, os.platform() === 'darwin' ? 93 : 61)
      assert.strictEqual(err.code, os.platform() === 'darwin' ? 'ENOATTR' : 'ENODATA')
      return true
    })
  })

  it('should reject null bytes in path and attribute', function () {
    assert.throws(() => xattr.setAttributeSync(path, 'user.a\0b', 'v'), TypeError)
    assert.throws(() => xattr.getAttributeSync(path + '\0x', attribute0), TypeError)
  })

  it('should give set-specific error messages', function () {
    // too long name: the get texts would say "too small to hold" / "exceeds"
    const [code, message] = os.platform() === 'darwin' ? ['ENAMETOOLONG', /exceeded XATTR_MAXNAMELEN/] : ['ERANGE', /out of range/]
    assert.throws(() => xattr.setAttributeSync(path, 'user.' + 'n'.repeat(300), 'v'), function (err) {
      assert.strictEqual(err.code, code)
      assert.match(err.message, message)
      return true
    })
  })

  after(function (done) {
    fs.unlink(path, done)
  })
})

describe('xattr#async', function () {
  let path

  before(function () {
    path = temp.writeFileSync('')
  })

  it('should set an attribute', async function () {
    await xattr.setAttribute(path, attribute0, payload0)
    await xattr.setAttribute(path, attribute1, payload1)
  })

  it('should get an attribute', async function () {
    const val = await xattr.getAttribute(path, attribute0)

    assert(Buffer.isBuffer(val))
    assert.strictEqual(val.toString(), payload0)
  })

  it('should list the attributes', async function () {
    const list = await xattr.listAttributes(path)

    assert.ok(list.includes(attribute0))
    assert.ok(list.includes(attribute1))
  })

  it('should remove the attribute', async function () {
    await xattr.removeAttribute(path, attribute0)
    await xattr.removeAttribute(path, attribute1)
  })

  it('should give useful errors', async function () {
    let err
    try {
      await xattr.getAttribute(path, attribute0)
    } catch (_err) {
      err = _err
    }

    assert(err)
    assert.strictEqual(err.errno, os.platform() === 'darwin' ? 93 : 61)
    assert.strictEqual(err.code, os.platform() === 'darwin' ? 'ENOATTR' : 'ENODATA')
  })

  it('should not read the value buffer after setAttribute returns', async function () {
    const value = Buffer.alloc(2048, 0x41)
    const pending = xattr.setAttribute(path, attribute0, value)
    value.fill(0x42) // the caller may reuse the buffer right away
    await pending

    assert.ok((await xattr.getAttribute(path, attribute0)).equals(Buffer.alloc(2048, 0x41)))
    await xattr.removeAttribute(path, attribute0)
  })

  after(function (done) {
    fs.unlink(path, done)
  })
})

describe('xattr#async memory', function () {
  this.timeout(240000)

  let path

  before(function () {
    path = temp.writeFileSync('')
  })

  it('does not grow rss when looping async calls', async function () {
    const loop = async function (iterations) {
      for (let i = 0; i < iterations; i++) {
        await xattr.setAttribute(path, attribute0, payload0)
        await xattr.getAttribute(path, attribute0)
        await xattr.listAttributes(path)
        await xattr.removeAttribute(path, attribute0)
        await xattr.getAttribute(path, attribute0).catch(() => {}) // error path
      }
    }

    await loop(10000) // warm-up, stabilises the allocator

    const before = process.memoryUsage().rss
    await loop(60000)
    const growth = process.memoryUsage().rss - before

    // unfixed build leaks ~0.5 kB per async call (~150 MB here)
    assert(growth < 20 * 1024 * 1024, 'rss grew by ' + (growth / 1048576).toFixed(1) + ' MB')
  })

  after(function (done) {
    fs.unlink(path, done)
  })
})

describe('xattr#utf8', function () {
  let path

  before(function () {
    path = temp.template('∞ %s').writeFileSync('')
  })

  it('should set an attribute', async function () {
    await xattr.setAttribute(path, attribute0, payload0)
  })

  it('should get an attribute', async function () {
    const val = await xattr.getAttribute(path, attribute0)

    assert(Buffer.isBuffer(val))
    assert.strictEqual(val.toString(), payload0)
  })

  it('should list the attributes', async function () {
    const list = await xattr.listAttributes(path)

    assert.ok(list.includes(attribute0))
  })

  it('should remove the attribute', async function () {
    await xattr.removeAttribute(path, attribute0)
  })

  it('should give useful errors', async function () {
    let err
    try {
      await xattr.getAttribute(path, attribute0)
    } catch (_err) {
      err = _err
    }

    assert(err)
    assert.strictEqual(err.errno, os.platform() === 'darwin' ? 93 : 61)
    assert.strictEqual(err.code, os.platform() === 'darwin' ? 'ENOATTR' : 'ENODATA')
  })

  after(function (done) {
    fs.unlink(path, done)
  })
})

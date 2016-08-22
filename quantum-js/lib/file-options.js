/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  File Option
  ===========

  Glob-spec resolving to list of files

*/

const path = require('path')
const Promise = require('bluebird')
const globby = require('globby')
const flatten = require('flatten')

const File = require('./file')

function isString (str) {
  return typeof str === 'string' || str instanceof String
}

/* Converts a filename (and spec) to an object with relevant details copied over from the spec */
function createFileUsingSpec (src, spec, dest) {
  const base = spec.base
  const destForObj = spec.dest ? path.join(dest, spec.dest) : dest
  const resolved = path.relative(base, src)
  const destForFile = path.join(destForObj, resolved)
  const watch = spec.watch === undefined ? true : spec.watch
  return new File({
    src: src,
    resolved: resolved,
    base: base,
    dest: destForFile,
    watch: watch
  })
}

/* Checks a spec or array of specs looks correct (has all the correct properties etc) */
function validate (specs) {
  if (Array.isArray(specs)) {
    return specs.map(validateSpec).filter((d) => d !== undefined)[0]
  } else {
    return validateSpec(specs)
  }
}

/* Checks the spec passed in look like a valid spec */
function validateSpec (spec) {
  if (spec === undefined) {
    return new Error('spec cannot be undefined')
  }

  const isSimpleSpec = isString(spec) || isString(spec.files)
  const isArraySpec = (Array.isArray(spec.files) && spec.files.every(isString))

  if (isArraySpec) {
    if (spec.base === undefined) {
      return new Error('spec.base cannot be undefined if spec.files is an array')
    }
  } else {
    if (!isSimpleSpec) {
      return new Error('spec.files cannot be undefined property')
    }
  }

  return undefined
}

/* Expands short spec definitions into full definitions */
function normalize (specs) {
  const arrayedSpecs = Array.isArray(specs) ? specs : [specs]
  const objectifiedSpecs = arrayedSpecs.map(normalizeSpec)
  return objectifiedSpecs
}

/* Makes sure a single object in the list argument is of the right shape */
function normalizeSpec (item) {
  if (isString(item)) {
    return {
      files: [item],
      base: inferBase(item),
      watch: true
    }
  } else {
    const files = Array.isArray(item.files) ? item.files : [item.files]
    return {
      files: files,
      base: item.base ? item.base : inferBase(item.files), // in the 'else' situation item.files must be a string since it passed the validation check
      watch: item.watch,
      dest: item.dest
    }
  }
}

/* Infers a sensible base directory for a glob string */
function inferBase (globString) {
  const end = globString.indexOf('*')
  return globString.slice(0, end - 1)
}

/* Resolves a list of specs into a list of file-objects */
function resolve (specs, opts) {
  const err = validate(specs)
  if (err) {
    return Promise.reject(err)
  }
  const options = opts || {}
  const dir = options.dir || '.'
  const dest = options.dest || 'target'
  return Promise.all(normalize(specs))
    .map((spec) => {
      return Promise.resolve(globby(spec.files, { cwd: dir, nodir: true }))
        .map((file) => createFileUsingSpec(file, spec, dest))
    }).then(flatten)
}

module.exports = {
  resolve: resolve,
  validate: validate,
  createFileUsingSpec: createFileUsingSpec,
  normalize: normalize
}

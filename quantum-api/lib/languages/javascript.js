'use strict'

const path = require('path')
const dom = require('quantum-dom')
const type = require('../entity-transforms/components/type')
const header = require('../entity-transforms/builders/header')
const body = require('../entity-transforms/builders/body')
const item = require('../entity-transforms/builders/item')
const itemGroup = require('../entity-transforms/builders/item-group')
const createLanguage = require('../create-language.js')

/*
  The assets that should be included on the page for this language
*/
const assets = [
  dom.asset({
    url: '/quantum-api-javascript.css',
    file: path.join(__dirname, '../../assets/languages/quantum-api-javascript.css'),
    shared: true
  })
]

const description = body.description
const groups = body.groups
const extras = body.extras
const defaultValue = body.default
const prototypes = itemGroup('prototype', 'Prototypes')
const constructors = itemGroup('constructor', 'Constructors')
const objects = itemGroup('object', 'Objects')
const params = itemGroup(['param', 'param?'], 'Arguments', { noSort: true })
const properties = itemGroup(['property', 'property?'], 'Properties')
const methods = itemGroup('method', 'Methods')
const events = itemGroup('event', 'Events')
const functions = itemGroup('function', 'Functions')
const returns = itemGroup('returns', 'Returns')

function typeBuilder (typeLinks) {
  return (selection, transformer) => {
    return dom.create('span')
      .class('qm-api-type-standalone qm-code-font')
      .add(type(selection.cs(), typeLinks))
  }
}

function propertyHeaderDetails (typeLinks) {
  return (selection, transformer) => {
    return dom.create('span')
      .class('qm-api-javascript-header-property')
      .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
      .add(dom.create('span').class('qm-api-javascript-header-property-name').text(selection.param(0) || ''))
      .add(dom.create('span').class('qm-api-javascript-header-property-type').add(type(selection.param(1), typeLinks)))
  }
}

function typeHeaderDetails (typeLinks) {
  return (selection, transformer) => {
    return dom.create('span')
      .class('qm-api-javascript-header-type')
      .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
      .add(type(selection.param(0), typeLinks))
  }
}

function functionHeaderDetails (typeLinks) {
  return (selection, transformer) => {
    const name = dom.create('span')
      .class('qm-api-javascript-header-function-name')
      .text(selection.type() === 'constructor' ? 'constructor' : selection.param(0))

    const params = selection.selectAll(['param', 'param?']).map((param) => {
      const isOptional = param.type()[param.type().length - 1] === '?'
      return dom.create('span')
        .class(isOptional ? 'qm-api-javascript-header-function-param qm-api-optional' : 'qm-api-javascript-header-function-param')
        .add(dom.create('span').class('qm-api-javascript-header-function-param-name').text(param.param(0)))
        .add(dom.create('span').class('qm-api-javascript-header-function-param-type').add(type(param.param(1), typeLinks)))
    })

    const returnsSelection = selection
      .selectAll('returns')
      .filter(sel => !sel.has('removed'))[0]

    const retns = returnsSelection ?
      dom.create('span')
        .class('qm-api-javascript-header-function-returns')
        .add(type(returnsSelection.ps(), typeLinks)) :
      undefined

    return dom.create('span')
      .class('qm-api-javascript-header-function')
      .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
      .add(name)
      .add(dom.create('span').class('qm-api-javascript-header-function-params').add(params))
      .add(retns)
  }
}

function prototypeHeaderDetails (typeLinks) {
  return (selection, transformer) => {
    let details = dom.create('span')
      .class('qm-api-javascript-header-prototype')
      .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
      .add(dom.create('span').class('qm-api-prototype-name').text(selection.param(0) || ''))

    const extendsEntities = selection.selectAll('extends')

    if (extendsEntities.length > 0) {
      details = details.add(dom.create('span').class('qm-api-prototype-extends').text('extends'))

      extendsEntities.forEach((ent) => {
        const extender = dom.create('span')
          .class('qm-api-prototype-extender')
          .add(type(ent.ps(), typeLinks))
        details = details.add(extender)
      })
    }

    return details
  }
}

/* The config for building javascript api docs */
function getTransforms (options) {
  const typeLinks = (options || {}).typeLinks || {}
  const propertyHeader = header('property', propertyHeaderDetails(typeLinks), typeLinks)
  const prototypeHeader = header('prototype', prototypeHeaderDetails(typeLinks), typeLinks)
  const functionHeader = header('function', functionHeaderDetails(typeLinks), typeLinks)
  const typeHeader = header('type', typeHeaderDetails(typeLinks), typeLinks)

  const typeHeaderBuilders = {
    constructor: functionHeader,
    event: propertyHeader,
    function: functionHeader,
    method: propertyHeader,
    object: functionHeader,
    param: propertyHeader,
    property: propertyHeader,
    prototype: prototypeHeader,
    returns: typeHeader,
    type: typeHeader
  }

  const constructorBuilder = item({
    class: 'qm-api-javascript-constructor',
    header: typeHeaderBuilders.constructor,
    content: [ description, extras, params ]
  })

  const prototypeBuilder = item({
    class: 'qm-api-javascript-prototype',
    header: typeHeaderBuilders.prototype,
    content: [ description, extras, defaultValue, constructors, groups, properties, events, methods, functions ]
  })

  const functionBuilder = item({
    class: 'qm-api-javascript-function',
    header: typeHeaderBuilders.function,
    content: [ description, extras, defaultValue, params, groups, events, returns ]
  })

  const objectBuilder = item({
    class: 'qm-api-javascript-object',
    header: typeHeaderBuilders.object,
    content: [ description, extras, defaultValue, groups, properties, events, prototypes, functions ]
  })

  const methodBuilder = item({
    class: 'qm-api-javascript-method',
    header: typeHeaderBuilders.method,
    content: [ description, extras, defaultValue, params, groups, events, returns ]
  })

  const propertyBuilder = item({
    class: 'qm-api-javascript-property',
    header: typeHeaderBuilders.property,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const paramBuilder = item({
    class: 'qm-api-javascript-param',
    header: typeHeaderBuilders.param,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const eventBuilder = item({
    class: 'qm-api-javascript-event',
    header: typeHeaderBuilders.event,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const returnsBuilder = item({
    class: 'qm-api-javascript-returns',
    header: typeHeaderBuilders.returns,
    content: [ description, extras ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  return {
    transforms: {
      'type': typeBuilder,
      'prototype': prototypeBuilder,
      'object': objectBuilder,
      'method': methodBuilder,
      'function': functionBuilder,
      'constructor': constructorBuilder,
      'param': paramBuilder,
      'param?': paramBuilder,
      'property': propertyBuilder,
      'property?': propertyBuilder,
      'event': eventBuilder,
      'returns': returnsBuilder
    },
    changelogHeaderTransforms: {
      'object': typeHeaderBuilders.object,
      'prototype': typeHeaderBuilders.prototype,
      'event': typeHeaderBuilders.event,
      'constructor': typeHeaderBuilders.constructor,
      'function': typeHeaderBuilders.function,
      'method': typeHeaderBuilders.method,
      'property': typeHeaderBuilders.property,
      'property?': typeHeaderBuilders.property
    }
  }
}

module.exports = (options) => {
  return createLanguage('javascript', getTransforms, options, assets)
}

module.exports.prototypes = prototypes
module.exports.constructors = constructors
module.exports.objects = objects
module.exports.params = params
module.exports.properties = properties
module.exports.methods = methods
module.exports.events = events
module.exports.functions = functions
module.exports.returns = returns

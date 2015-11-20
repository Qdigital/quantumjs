;(function () {
  var body = document.body

  function getMethod (node, methodName) {
    if (node === window) {
      return window[methodName]
    } else if (node instanceof Document) {
      return Document.prototype[methodName]
    } else {
      return Element.prototype[methodName]
    }
  }

  function select (node, selector) {
    return getMethod(node, 'querySelector').call(node, selector)
  }
  function selectAll (node, selector) {
    return getMethod(node, 'querySelectorAll').call(node, selector)
  }
  function addHandler (node, eventName, handler) {
    return getMethod(node, 'addEventListener').call(node, eventName, handler)
  }
  function collapsibleToggle (collapsibleNode, nodeClass, contentNode) {
    var open = collapsibleNode.className.indexOf('qm-api-collapsible-open') !== -1
    collapsibleNode.className = (open ? nodeClass : nodeClass + ' qm-api-collapsible-open')
  }

  function collapsible (node) {
    var nodeClass = node.className
    var nodeToggle = select(node, '.qm-api-collapsible-toggle') || select(node, '.qm-api-collapsible-heading')

    if (nodeToggle.className.indexOf('toggle') === -1) {
      nodeToggle.className = nodeToggle.className + ' qm-api-collapsible-toggle'
    }

    var contentNode = select(node, '.qm-api-collapsible-content')

    if (contentNode) {
      addHandler(nodeToggle, 'click', function (event) { collapsibleToggle(node, nodeClass, contentNode) })
    }
  }

  function initializeCollapsibles (selector) {
    var collapsibles = selectAll(document.body, selector)
    for (var i = 0; i < collapsibles.length; i++) {
      collapsible(collapsibles[i])
    }
    return collapsibles
  }
  initializeCollapsibles('.qm-api-collapsible')
})()

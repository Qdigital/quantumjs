'use strict'

function defaultIssueUrl () {
  return undefined
}

/*
  Resolves the options passed in to make sure every option is set to something
  sensible.
*/
function resolve (options) {
  return {
    targetVersions: options ? options.targetVersions : undefined,
    languages: options ? options.languages || [] : [],
    reverseVisibleList: options ? options.reverseVisibleList === true : false,
    groupByApi: options ? options.groupByApi === true : false,
    issueUrl: options ? options.issueUrl || defaultIssueUrl : defaultIssueUrl,
    tags: {
      info: {
        displayName: 'Information',
        iconClass: 'quantum-changelog-icon-info'
      },
      bugfix: {
        displayName: 'Bug Fix',
        iconClass: 'quantum-changelog-icon-bug-fix'
      },
      removed: {
        displayName: 'Removed',
        iconClass: 'quantum-changelog-icon-removed'
      },
      deprecated: {
        displayName: 'Deprecated',
        iconClass: 'quantum-changelog-icon-deprecated'
      },
      enhancement: {
        displayName: 'Enhancement',
        iconClass: 'quantum-changelog-icon-enhancement'
      },
      updated: {
        displayName: 'Updated',
        iconClass: 'quantum-changelog-icon-updated'
      },
      added: {
        displayName: 'Added',
        iconClass: 'quantum-changelog-icon-added'
      }
    }
  }
}

module.exports = {
  resolve,
  defaultIssueUrl
}

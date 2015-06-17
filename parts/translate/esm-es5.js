(function (root, factory) {
  'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['esprima'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('esprima'));
    } else {
        root.esmEs5 = factory(root.esprima);
    }
}(this, function (esprima) {
 'use strict';

  // var hasOwn = Object.prototype.hasOwnProperty;
  // function hasProp(obj, prop) {
  //   return hasOwn.call(obj, prop);
  // }

  //From an esprima example for traversing its ast.
  function traverse(object, visitor) {
    var key, child;

    if (!object) {
      return;
    }

    if (visitor.call(null, object) === false) {
      return false;
    }
    for (key in object) {
      if (object.hasOwnProperty(key)) {
        child = object[key];
        if (typeof child === 'object' && child !== null) {
          if (traverse(child, visitor) === false) {
            return false;
          }
        }
      }
    }
  }

  function translateImport(node, depIds, source, simulateCycle) {
    var translation = {
      range: node.range,
      ids: {},
      result: ''
    };

    translation.range[1] = node.source.range[1];

    var ids = translation.ids;
    var hasIds = !!node.specifiers.length;
    var result = '';

    var depId = translation.depId = node.source.value;
    if (depIds.indexOf(depId) === -1) {
      depIds.push(depId);
    }

    node.specifiers.forEach(function(specifier) {
      var imported,
          local = specifier.local.name;

      if (specifier.type === 'ImportDefaultSpecifier') {
        imported = 'default';
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        // Explicitly no imported name, the whole module object is
        // bound to the local identifier.
        imported = '';
      } else if (specifier.imported) {
        imported = specifier.imported.name;
      }

      if (simulateCycle) {
        ids[local] = imported;
      } else {
        result += 'var ' + local + ' = require(\'' + depId + '\')';
        if (imported) {
          result += '.' + imported;
        }
      }
    });

    if (!hasIds) {
      // Just a bare import 'something', no local identifiers, so just write out
      // a require call.
      result = 'require(\'' + depId + '\')';
    }

    translation.result = result;

    return translation;
  }

  function translateDefaultExport(node, source) {
    var translation = {
      range: [node.range[0], node.declaration.range[0]],
      result: 'exports.default = '
    };

    return translation;
  }

  function translateNamedExport(node, source) {
    var translation = {
      range: [node.range[0], 0],
      result: ''
    };

    var result = '';

    if (node.declaration) {
      if (node.declaration.type === 'FunctionDeclaration') {
        // export function name() {}
        translation.range[1] = node.declaration.range[0];

        // Find the identifier name to use for the export
        var id;
        traverse(node, function(node) {
          if (!id && node.type === 'Identifier') {
            id = node.name;
            return false;
          }
        });

        translation.result = 'exports.' + id + ' = ';
      } else if (node.declaration.type === 'VariableDeclaration') {

        var endIndex = node.declaration.declarations.length - 1;
        translation.range[1] = node.declaration.declarations[endIndex]
                               .range[1];

        var ids = [];
        node.declaration.declarations.forEach(function(declaration) {
          if (declaration.id.type === 'Identifier') {
            ids.push(declaration.id.name);
          }
        });

        result = source.substring(translation.range[0],
                                  translation.range[1])
                                  .replace(/export\s+/, '');

        ids.forEach(function(id) {
          result += '; exports.' + id + ' = ' + id;
        });

        translation.result = result;
      }
    } else {
      // export { name as other }
      translation.range[1] = node.range[1];
      node.specifiers.forEach(function(specifier) {
        var local = specifier.local.name,
            exported = specifier.exported.name;

        result += 'exports.' + exported + ' = ' + local + ';';
      });
      translation.result = result;
    }

    return translation;
  }

  function esmEs5(source, options) {
    options = options || {};
    var simulateCycle = !!options.simulateCycle;

    var translations = [];
    var depIds = [];

    var ast = esprima.parse(source, {
      range: true,
      tolerant: true
    });

    // console.log(source);
    // console.log(JSON.stringify(ast, null, '  '));

    var ids = {};

    traverse(ast, function(node) {
      var translation;

      if (node.type === 'ImportDeclaration') {
        translation = translateImport(node, depIds, source, simulateCycle);

        if (simulateCycle) {
          Object.keys(translation.ids).forEach(function(key) {
            ids[key] = translation.ids[key];
          });
        }

        translations.push(translation);
      } else if (node.type === 'ExportDefaultDeclaration') {
        translations.push(translateDefaultExport(node, source));
      } else if (node.type === 'ExportNamedDeclaration') {
        translations.push(translateNamedExport(node, source));
      } else if (simulateCycle && options.node.type === 'Identifier') {
        // Translate the identifiers to getters for imports.
  //todo
      }

    });

    // No ES module syntax found? Then no translation needed, just return the
    // original source.
    if (!translations.length) {
      return {
        translated: false,
        source: source
      };
    }

    // Reverse the matches, need to start from the bottom of the file to modify
    // it, so that the ranges are still true further up.
    translations.reverse();

    translations.forEach(function(translation) {
      source = source.substring(0, translation.range[0]) +
               translation.result +
               source.substring(translation.range[1]);
    });

    return {
      translated: true,
      depIds: depIds,
      //source: 'define(function(require, exports, module) { ' + source + ' });'
      source: source
    };
  }

  return esmEs5;
}));

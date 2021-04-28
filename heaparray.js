"use strict";

if (typeof module !== 'undefined') {
    var binarytree = require('./binarytree'),
        NIL = binarytree.NIL,
        heaptree = require('./heaptree');
} else {
    var heaparray = {},
        exports = heaparray;
}

function heapArrayInsert (arr, node, type) {
    node.idx = arr.length;
    arr.push(node);

    arr = heaptree.heapBubbleUp(arr, node, type);

    return arr;
}

function heapArrayRemove (arr, node, type) {
    if (arr.length <= 1) {
        arr.pop();
    } else {
        var n = arr.pop();
        n.idx = 0;
        arr[0] = n;

        arr = heaptree.heapBubbleDown(arr, n, type);
    }

    return arr;
}




function HeapArray (type, cmpFn) {
    var self = this,
        api = heaptree.HeapTree.call(self, type, cmpFn),
        arr = [];

    api.name = "Heap Array (" + type + ")";

    self.Node = function(val, opts) {
        var node = this;
        opts = opts || {};
        opts.arr = arr;
        return binarytree.Node.call(node, val, opts);
    };

    self.__defineGetter__('root', function() {
        if (arr.length > 0) {
            return arr[0];
        } else {
            return NIL;
        }
    });
    self.__defineSetter__('root', function() {
        // No-op
    });

    self.removeFn = function(tree, node) {
        return heapArrayRemove(arr, node, type);
    }
    self.insertFn = function(tree, node) {
        return heapArrayInsert(arr, node, type);
    }

    return api;
}

exports.heapArrayInsert = heapArrayInsert;
exports.heapArrayRemove = heapArrayRemove;
exports.HeapArray = HeapArray;

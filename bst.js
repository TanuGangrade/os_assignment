"use strict";

if (typeof module !== 'undefined') {
    var binarytree = require('./binarytree'),
        NIL = binarytree.NIL;
} else {
    var bst = {},
        exports = bst;
}

function bstSearch (tree, value) {
    if (tree === NIL) {
        return null;
    } else if (tree.cmp({val:value}) === 0) {
        return tree;
    } else if (tree.cmp({val:value}) > 0) {
        return bstSearch(tree.left, value);
    } else {
        return bstSearch(tree.right, value);
    }
}

function bstMin(tree) {
    if (tree === NIL) {
        return null;
    }
    while (tree.left !== NIL) {
        tree = tree.left;
    }
    return tree;
}

function bstMax(tree) {
    if (tree === NIL) {
        return null;
    }
    while (tree.right !== NIL) {
        tree = tree.right;
    }
    return tree;
}

function bstInsert (tree, node) {
    var x = tree,
        y = NIL,
        z = node;

    while (x !== NIL) {
        y = x;
        if (z.cmp(x) < 0) {
            x = x.left;
        } else {
            x = x.right;
        }
    }

    z.p = y;
    if (y === NIL) {
        tree = z;
    } else if (z.cmp(y) < 0) {
        y.left = z;
    } else {
        y.right = z;
    }
    return tree;
}

function bstTransplant(tree, dst, src) {
    var u = dst, v = src;
    if (u.p === NIL) {
        tree = v;
    } else if (u === u.p.left) {
        u.p.left = v;
    } else {
        u.p.right = v;
    }
    if (v !== NIL) {
        v.p = u.p;
    }
    return tree;
}

function bstRemove (tree, node) {
    var z = node,
        y;
    if (z.left === NIL) {
        tree = bstTransplant(tree,z,z.right);
    } else if (z.right === NIL) {
        tree = bstTransplant(tree,z,z.left);
    } else {
        y = bstMin(z.right);
        if (y.p !== z) {
            tree = bstTransplant(tree,y,y.right);
            y.right = z.right;
            y.right.p = y;
        }
        tree = bstTransplant(tree,z,y);
        y.left = z.left;
        y.left.p = y;
    }
    return tree;
}

function BST (cmpFn) {
    var self = this,
        api = binarytree.BinaryTree.call(self, cmpFn);

    api.name   = "Binary Search Tree";

    self.insertFn = bstInsert;
    self.removeFn = bstRemove;

    api.search = function(val)   { return bstSearch(self.root, val, cmpFn); };
    api.min    = function()      { return bstMin(self.root); };
    api.max    = function()      { return bstMax(self.root); };

    return api;
}

exports.bstSearch = bstSearch;
exports.bstMin = bstMin;
exports.bstMax = bstMax;
exports.bstInsert = bstInsert;
exports.bstTransplant = bstTransplant;
exports.bstRemove = bstRemove;
exports.BST = BST;

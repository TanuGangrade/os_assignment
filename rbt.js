"use strict";

if (typeof module !== 'undefined') {
    var binarytree = require('./binarytree'),
        NIL = binarytree.NIL,
        bst = require('./bst');
} else {
    var rbt = {},
        exports = rbt;
}

function treeLeftRotate(tree,node) {
    var x = node,
        y = x.right;     
    x.right = y.left;    
    if (y.left !== NIL) {
        y.left.p = x;
    }
    y.p = x.p;           
    if (x.p === NIL) {
        tree = y;
    } else if (x === x.p.left) {
        x.p.left = y;
    } else {
        x.p.right = y;
    }
    y.left = x;        
    x.p = y;

    return tree;
}

function treeRightRotate(tree,node) {
    var x = node,
        y = x.left;      
    x.left = y.right;    
    if (y.right !== NIL) {
        y.right.p = x;
    }
    y.p = x.p;           
    if (x.p === NIL) {
        tree = y;
    } else if (x === x.p.right) {
        x.p.right = y;
    } else {
        x.p.left = y;
    }
    y.right = x;        
    x.p = y;

    return tree;
}


function redblackInsertFixup(tree, node) {
    var y, z = node;
    while (z.p.color === 'r') {
        if (z.p === z.p.p.left) {
            y = z.p.p.right;
            if (y.color === 'r') {
                // case 1
                z.p.color = 'b';
                y.color = 'b';
                z.p.p.color = 'r';
                z = z.p.p;
            } else {
                if (z === z.p.right) {
                    // case 2
                    z = z.p;
                    tree = treeLeftRotate(tree,z);
                }
                z.p.color = 'b';
                z.p.p.color = 'r';
                tree = treeRightRotate(tree,z.p.p);
            }
        } else {
            // same but mirror image
            y = z.p.p.left;
            if (y.color === 'r') {
                // case 1
                z.p.color = 'b';
                y.color = 'b';
                z.p.p.color = 'r';
                z = z.p.p;
            } else {
                if (z === z.p.left) {
                    // case 2
                    z = z.p;
                    tree = treeRightRotate(tree,z);
                }
                z.p.color = 'b';
                z.p.p.color = 'r';
                tree = treeLeftRotate(tree,z.p.p);
            }
        }
    }
    tree.color = 'b';
    return tree;
}

function redblackInsert(tree, node) {
    node.color = 'r';

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
    z.left = NIL;
    z.right = NIL;
    z.color = 'r';
    tree = redblackInsertFixup(tree, node); // red/black fixup

    return tree;
}

function redblackTransplant(tree, dst, src) {
    var u = dst, v = src;
    if (u.p === NIL) {
        tree = v;
    } else if (u === u.p.left) {
        u.p.left = v;
    } else {
        u.p.right = v;
    }
    v.p = u.p;
    return tree;
}

function redblackRemoveFixup(tree, node) {
    var x = node,
        w;
    while (x !== tree && x.color === 'b') {
        if (x === x.p.left) {
            w = x.p.right;
            if (w.color === 'r') {
                // case 1
                w.color = 'b';
                x.p.color = 'r';
                tree = treeLeftRotate(tree,x.p);
                w = x.p.right;
            }
            if (w.left.color === 'b' && w.right.color ==='b') {
                // case 2
                w.color = 'r';
                x = x.p;
            } else {
                if (w.right.color === 'b') {
                    // case 3
                    w.left.color = 'b';
                    w.color = 'r';
                    tree = treeRightRotate(tree,w);
                    w = x.p.right;
                }
                // case 4
                w.color = x.p.color;
                x.p.color = 'b';
                w.right.color = 'b';
                tree = treeLeftRotate(tree,x.p);
                x = tree;
            }
        } else {
            w = x.p.left;
            if (w.color === 'r') {
                // case 1
                w.color = 'b';
                x.p.color = 'r';
                tree = treeRightRotate(tree,x.p);
                w = x.p.left;
            }
            if (w.right.color === 'b' && w.left.color ==='b') {
                // case 2
                w.color = 'r';
                x = x.p;
            } else {
                if (w.left.color === 'b') {
                    // case 3
                    w.right.color = 'b';
                    w.color = 'r';
                    tree = treeLeftRotate(tree,w);
                    w = x.p.left;
                }
                // case 4
                w.color = x.p.color;
                x.p.color = 'b';
                w.left.color = 'b';
                tree = treeRightRotate(tree,x.p);
                x = tree;
            }
        }
    }
    x.color = 'b';
    return tree;
}

function redblackRemove(tree, node) {
    var z = node,
        y = z,
        x,
        origColor = y.color;
    if (z.left === NIL) {
        x = z.right;
        tree = redblackTransplant(tree,z,z.right);
    } else if (z.right === NIL) {
        x = z.left;
        tree = redblackTransplant(tree,z,z.left);
    } else {
        y = bst.bstMin(z.right);
        origColor = y.color;
        x = y.right;
        if (x && y.p === z) {
            x.p = y;
        } else {
            tree = redblackTransplant(tree,y,y.right);
            y.right = z.right;
            if (y.right) { y.right.p = y; }
        }
        tree = redblackTransplant(tree,z,y);
        y.left = z.left;
        y.left.p = y;
        y.color = z.color;
    }
    if (x && origColor === 'b') {
        tree = redblackRemoveFixup(tree,x);
    }
    return tree;
}


function RBT(cmpFn) {
    var self = this, api;
    api = bst.BST.call(self, cmpFn);

    api.name = "Red-Black Tree";

    self.insertFn = redblackInsert;
    self.removeFn = redblackRemove;

    return api;
}

exports.treeLeftRotate = treeLeftRotate;
exports.treeRightRotate = treeRightRotate;
exports.redblackInsertFixup = redblackInsertFixup;
exports.redblackInsert = redblackInsert;
exports.redblackRemoveFixup = redblackRemoveFixup;
exports.redblackRemove = redblackRemove;
exports.RBT = RBT;

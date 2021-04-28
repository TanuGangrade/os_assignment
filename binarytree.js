"use strict";

if (typeof module === 'undefined') {
    var binarytree = {},
        exports = binarytree;
}

function defaultCompareFn (node1, node2) {
    return node1.val - node2.val;
}

var STATS = {};
function GET_STATS () {
    return STATS;
}
function RESET_STATS (vals) {
    vals = vals || {read:  {c: 0, p: 0, l: 0, r: 0, idx: 0, v: 0},
                    write: {c: 0, p: 0, l: 0, r: 0, idx: 0},
                    compare: 0,
                    swap: 0}
    STATS = vals;
}
RESET_STATS();

var NIL;


function Node(val, opts) {
    var id = Node.nextId++;

    var opts = opts || {},
        cmpFn = opts.cmpFn || defaultCompareFn,
        isNIL = opts.isNIL ? true : false,
        color = opts.color || null,
        p = opts.p || NIL,
        left = opts.left || NIL,
        right = opts.right || NIL,

        // Binary tree stored in an array
        arr = opts.arr || null,
        idx = 0;


    this.__defineGetter__('id', function() {
        return id;
    });
    this.__defineGetter__('isNIL', function() {
        return isNIL;
    });

    this.__defineGetter__('val', function() {
        STATS.read.v++;
        return val;
    });
    this.__defineSetter__('val', function(arg) {
        throw Error("Cannot set val after insert");
    });

    this.__defineGetter__('color', function() {
        STATS.read.c++;
        return color;
    });
    this.__defineSetter__('color', function(arg) {
        STATS.write.c++;
        color = arg;
    });

    this.__defineGetter__('idx', function() {
        STATS.read.idx++;
        return idx;
    });
    this.__defineSetter__('idx', function(arg) {
        STATS.write.idx++;
        idx = arg;
    });



    this.cmp = function(other) {
        STATS.compare++;
        return cmpFn(this, other);
    }

    
    if (arr) {
        this.__defineGetter__('p', function() {
            STATS.read.p++;
            var pidx = Math.floor((idx-1)/2);
            if (pidx < 0) {
                return NIL;
            } else {
                return arr[pidx];
            }
        });
        this.__defineSetter__('p', function(arg) {
            throw Error("Cannot set p of array based tree");
        });

        this.__defineGetter__('left', function() {
            STATS.read.l++;
            var lidx = 2*idx+1;
            if (lidx > arr.length-1) {
                return NIL;
            } else {
                return arr[lidx];
            }
        });
        this.__defineSetter__('left', function(arg) {
            throw Error("Cannot set left of array based tree");
        });

        this.__defineGetter__('right', function() {
            STATS.read.r++;
            var ridx = 2*idx+2;
            if (ridx > arr.length-1) {
                return NIL;
            } else {
                return arr[ridx];
            }
        });
        this.__defineSetter__('right', function(arg) {
            throw Error("Cannot set right of array based tree");
        });

        this.swap = function(arr, other) {
            STATS.swap++;
            STATS.write.p += 2; 
            var nidx = this.idx,
                oidx = other.idx,
                ntmp = this,
                otmp = other;
            arr[nidx] = otmp;
            arr[oidx] = ntmp;
            this.idx = oidx;
            other.idx = nidx;
            return arr;
        };

    } else {
        this.__defineGetter__('p', function() {
            STATS.read.p++;
            return p;
        });
        this.__defineSetter__('p', function(arg) {
            STATS.write.p++;
            p = arg;
        });

        this.__defineGetter__('left', function() {
            STATS.read.l++;
            return left;
        });
        this.__defineSetter__('left', function(arg) {
            STATS.write.l++;
            left = arg;
        });

        this.__defineGetter__('right', function() {
            STATS.read.r++;
            return right;
        });
        this.__defineSetter__('right', function(arg) {
            STATS.write.r++;
            right = arg;
        });

        this.swap = function(tree, other) {
            STATS.swap++;
            var n1 = this, n2 = other;

            if (n1 === NIL || n2 === NIL) {
                throw new Error("Node.swap called with NIL node");
            }

         
            if (n1.p === n2) {
                var tmp = n1;
                n1 = n2;
                n2 = tmp;
            }

            var p1 = n1.p,
                p2 = n2.p,
                n1left = n1.left,
                n1right = n1.right,
                n2left = n2.left,
                n2right = n2.right;

            if (n1 === p2) {
                // Adjacent: n1 is immediate parent of n2
                n1.p = n2;
                n2.p = p1;
                n1.left = n2left;
                n1.right = n2right;
                if (n2left !== NIL) {
                    n2left.p = n1;
                }
                if (n2right !== NIL) {
                    n2right.p = n1;
                }
                if (p1 !== NIL) {
                    if (p1.left === n1) {
                        p1.left = n2;
                    } else {
                        p1.right = n2;
                    }
                }
                if (n1left === n2) {
                    n2.left = n1;
                    n2.right = n1right;
                    if (n1right !== NIL) {
                        n1right.p = n2;
                    }
                } else {
                    n2.left = n1left;
                    n2.right = n1;
                    if (n1left !== NIL) {
                        n1left.p = n2;
                    }
                }
            } else {
                // Non-adjacent
                n1.p = p2;
                n2.p = p1;
                n1.left = n2left;
                n1.right = n2right;
                n2.left = n1left;
                n2.right = n1right;
                if (p1 !== NIL) {
                    if (p1.left === n1) {
                        p1.left = n2;
                    } else {
                        p1.right = n2;
                    }
                }
                if (p2 !== NIL) {
                    if (p2.left === n2) {
                        p2.left = n1;
                    } else {
                        p2.right = n1;
                    }
                }
                if (n1left !== NIL) {
                    n1left.p = n2;
                }
                if (n1right !== NIL) {
                    n1right.p = n2;
                }
                if (n2left !== NIL) {
                    n2left.p = n1;
                }
                if (n2right !== NIL) {
                    n2right.p = n1;
                }
            }

            if (tree === n1) {
                return n2;
            } else if (tree === n2) {
                return n1;
            } else {
                return tree;
            }
        }
    }
}
Node.nextId = 0;

NIL = new Node('NIL', {p: NIL, color: 'b'});


function treeTuple (tree) {
    if (tree === NIL) {
        return 'NIL';
    }

    var res = [];
    res.push(tree.val);
    if (tree.color) {
        res.push(tree.color);
    }
    res.push(treeTuple(tree.left));
    res.push(treeTuple(tree.right));
    return res;
}


function treeReduce (result, node, action, order) {
    order = order||"in";  // pre, in, or post

    if (node !== NIL) {
        if (order === 'pre') { result = action(result, node); }
        result = treeReduce(result, node.left, action, order);
        if (order === 'in') { result = action(result, node); }
        result = treeReduce(result, node.right, action, order);
        if (order === 'post') { result = action(result, node); }
    }
    return result;
}


function treeWalk (tree, order) {
    return treeReduce([], tree, function(res, node) {
        return res.concat([node.val]);
    }, order);
}


function treeLinks (tree) {
    return treeReduce([], tree, function(res, n) {
        var links = [];
        if (n.left !== NIL) {
            links.push([n.id+"."+n.val, n.left.id+"."+n.left.val]);
        }
        if (n.right !== NIL) {
            links.push([n.id+"."+n.val, n.right.id+"."+n.right.val]);
        }
        return res.concat(links);
    }, 'pre');
}

function treeDOT(tree) {
    var dot;
    if ('color' in tree) {
        dot = "digraph Red_Black_Tree {\n";
    } else {
        dot = "digraph Binary_Search_Tree {\n";
    }
    treeReduce(null, tree, function(_,n) {
        dot += "  " + n.id + " [label=" + n.val;
        if (n.color === 'r') {
            dot += " color=red];\n";
        } else {
            dot += " color=black];\n";
        }
        if (n.left !== NIL) {
            dot += "  " + n.id + " -> " + n.left.id + ";\n";
        }
        if (n.right !== NIL) {
            dot += "  " + n.id + " -> " + n.right.id + ";\n";
        }
    }, 'pre');
    dot += "}";
    return dot;
}



function BinaryTree (cmpFn) {
    if (typeof cmpFn === 'undefined') {
        cmpFn = defaultCompareFn;
    }

    var self = this,
        api = {name: "Generic Binary Tree"},
        hashId = 1;

    self.cmpFn = cmpFn;
    self.Node = Node;
    self.root = NIL;
    self.size = 0;
    self.insertFn = function() { throw new Error("No insertFn defined"); };
    self.removeFn = function() { throw new Error("No removeFn defined"); };

    api.root   = function()      { return self.root; };
    api.size   = function()      { return self.size; };
    api.reduce = function(r,f,o) { return treeReduce(r, self.root, f, o); };
    api.tuple  = function()      { return treeTuple(self.root); };
    api.walk   = function(order) { return treeWalk(self.root, order); };
    api.links  = function()      { return treeLinks(self.root); };
    api.DOT    = function()      { return treeDOT(self.root); };
    api.remove = function(node)  {
        self.root = self.removeFn(self.root, node);
        self.size--;
    };
    api.insert = function() {
        if (arguments.length === 1) {
            var node = new self.Node(arguments[0], {cmpFn: self.cmpFn});
            self.root = self.insertFn(self.root, node);
            self.size++;
        } else {
            for (var i = 0; i < arguments.length; i++) {
                var node = new self.Node(arguments[i], {cmpFn: self.cmpFn});
                self.root = self.insertFn(self.root, node);
                self.size++;
            }
        }
    };

    return api;
}

exports.defaultCompareFn = defaultCompareFn;
exports.GET_STATS = GET_STATS;
exports.RESET_STATS = RESET_STATS;
exports.Node = Node;
exports.NIL = NIL;
exports.treeTuple = treeTuple;
exports.treeReduce = treeReduce;
exports.treeWalk = treeWalk;
exports.treeLinks = treeLinks;
exports.treeDOT = treeDOT;
exports.BinaryTree = BinaryTree;

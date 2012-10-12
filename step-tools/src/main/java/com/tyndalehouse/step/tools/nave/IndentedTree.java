package com.tyndalehouse.step.tools.nave;

public class IndentedTree {
    int indent;
    Tree<String> t;

    public IndentedTree(final Tree<String> t, final int indent) {
        this.t = t;
        this.indent = indent;
    }

    @Override
    public String toString() {
        return this.t.root + " " + this.indent;
    }

}
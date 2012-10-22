package com.tyndalehouse.step.tools;

public class Trie {
    public static class Node {
        char c;
        Node left;
        Node right;
    }

    public static void main(final String[] args) {
        final Node n = new Trie.Node();
        n.c = 'm';

        final Trie trie = new Trie();
        trie.insert(n, 0, "banana".toCharArray());
        trie.insert(n, 0, "ape".toCharArray());
        trie.insert(n, 0, "apple".toCharArray());
        trie.insert(n, 0, "baby".toCharArray());
        trie.insert(n, 0, "ball".toCharArray());
        trie.search(n, 0, "ba".toCharArray(), new StringBuilder());
    }

    public void print(final Node n, final StringBuilder prefix) {
        if (n.left == null && n.right == null) {
            System.out.println(prefix.toString() + n.c);
        }

        if (n.left != null) {
            print(n.left, new StringBuilder(prefix).append(n.c));
        }

        if (n.right != null) {
            print(n.right, prefix.append(n.c));
        }
    }

    public void search(final Node n, final int pos, final char[] word, final StringBuilder currentPrefix) {
        if (pos >= word.length) {
            // start reading the tree and output
            print(n, currentPrefix);
        }

        // navigate down the tree
        if (word[pos] > n.c) {
            if (n.right == null) {
                // nothing found, so exit
                return;
            }

            search(n.right, pos + 1, word, currentPrefix.append(n.c));
        } else {
            if (n.left == null) {
                return;
            }
            search(n.left, pos + 1, word, currentPrefix.append(n.c));
        }
    }

    public void insert(final Node n, final int pos, final char[] word) {
        if (pos >= word.length) {
            // we're done
            return;
        }

        if (word[pos] > n.c) {
            // go down the right hand side
            if (n.right == null) {
                n.right = new Node();
                n.c = word[pos];
            }

            insert(n.right, pos + 1, word);
        } else {
            if (n.left == null) {
                n.left = new Node();
                n.c = word[pos];
            }
            insert(n.left, pos + 1, word);
        }
    }
}

/******************************************************************************
 *
 * treekeyidx.h -	class TreeKeyIdx: a TreeKey implementation which
 * 			grabs its structure from an index data file
 *
 * $Id: treekeyidx.h 3808 2020-10-02 13:23:34Z scribe $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
 *	CrossWire Bible Society
 *	P. O. Box 2528
 *	Tempe, AZ  85280-2528
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation version 2.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 */


#ifndef TREEKEYIDX_H
#define TREEKEYIDX_H

#include <treekey.h>
#include <sysdata.h>

SWORD_NAMESPACE_START

class FileDesc;

/**
 * Class TreeKeyIdx
 * The TreeKey implementation used for tree-based modules in SWORD, such as GenBooks.
 */
class SWDLLEXPORT TreeKeyIdx : public TreeKey {
		
private:
	class TreeNode {
	public:
		TreeNode();
		~TreeNode();
		void clear();
		SW_s32 offset;
		SW_s32 parent;
		SW_s32 next;
		SW_s32 firstChild;
		char *name;
		SW_u16 dsize;
		char *userData;
	} currentNode;

	char *path;

	FileDesc *idxfd;
	FileDesc *datfd;

	void init();

	void getTreeNodeFromDatOffset(long ioffset, TreeNode *buf) const;
	char getTreeNodeFromIdxOffset(long ioffset, TreeNode *node) const;
	void saveTreeNode(TreeNode *node);
	void saveTreeNodeOffsets(TreeNode *node);

public:
	TreeKeyIdx(const TreeKeyIdx &ikey);
	TreeKeyIdx(const char *idxPath, int fileMode = -1);
	virtual ~TreeKeyIdx();

	virtual SWKey *clone() const;

	virtual const char *getLocalName();
	virtual const char *setLocalName(const char *);

	virtual const char *getUserData(int *size = 0) const;
	virtual void setUserData(const char *userData, int size = 0);

	virtual void root();
	virtual bool parent();

	virtual bool firstChild();
	virtual bool nextSibling();
	virtual bool previousSibling();

	virtual bool hasChildren();

	virtual void append();
	virtual void appendChild();
	virtual void insertBefore();

	virtual void remove();
	virtual void save();

	virtual void copyFrom(const TreeKeyIdx &ikey);
	virtual void copyFrom(const SWKey &ikey);

	void setOffset(unsigned long offset);
	unsigned long getOffset() const;

	virtual int getLevel();


	// OPERATORS ------------------------------------------------------------


	virtual SWKey &operator = (const TreeKeyIdx &ikey) { copyFrom(ikey); return *this; }
	SWKEY_OPERATORS

	virtual void setText(const char *ikey);
	virtual void setPosition(SW_POSITION p);
	virtual const char *getText() const;
	virtual int _compare(const TreeKeyIdx & ikey);
	virtual int compare(const SWKey &ikey);
	virtual void decrement(int steps = 1);
	virtual void increment(int steps = 1);
	virtual bool isTraversable() const { return true; }

	static signed char create(const char *path);
};

SWORD_NAMESPACE_END

#endif

/******************************************************************************
 *
 *  entriesblk.cpp -	EntriesBlock facilitates compressed lex/dict modules
 *
 * $Id: entriesblk.cpp 3749 2020-07-06 23:51:56Z scribe $
 *
 * Copyright 2001-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <entriesblk.h>
#include <stdlib.h>
#include <string.h>

SWORD_NAMESPACE_START

const int EntriesBlock::METAHEADERSIZE = 4;
	// count(4);
const int EntriesBlock::METAENTRYSIZE = 8;
	// offset(4); size(4);

EntriesBlock::EntriesBlock(const char *iBlock, unsigned long size) {
	if (size) {
		block = (char *)calloc(1, size);
		memcpy(block, iBlock, size);
	}
	else {
		block = (char *)calloc(1, sizeof(SW_u32));
	}
}


EntriesBlock::EntriesBlock() {
	block = (char *)calloc(1, sizeof(SW_u32));
}


EntriesBlock::~EntriesBlock() {
	free(block);
}


void EntriesBlock::setCount(int count) {
	SW_u32 rawCount = archtosword32(count);
	memcpy(block, &rawCount, sizeof(SW_u32));
}


int EntriesBlock::getCount() {
	SW_u32 count = 0;
	memcpy(&count, block, sizeof(SW_u32));
	count = swordtoarch32(count);
	return count;
}


void EntriesBlock::getMetaEntry(int index, unsigned long *offset, unsigned long *size) {
	SW_u32 rawOffset = 0;
	SW_u32 rawSize = 0;
	*offset = 0;
	*size = 0;
	if (index >= getCount())	// assert index < count
		return;

	// first 4 bytes is count, each 6 bytes after is each meta entry
	memcpy(&rawOffset, block + METAHEADERSIZE + (index * METAENTRYSIZE), sizeof(rawOffset));
	memcpy(&rawSize, block + METAHEADERSIZE + (index * METAENTRYSIZE) + sizeof(rawOffset), sizeof(rawSize));

	*offset = (unsigned long)swordtoarch32(rawOffset);
	*size   = (unsigned long)swordtoarch32(rawSize);
}


void EntriesBlock::setMetaEntry(int index, unsigned long offset, unsigned long size) {
	SW_u32 rawOffset = (SW_u32)archtosword32(offset);
	SW_u32 rawSize = (SW_u32)archtosword32(size);

	if (index >= getCount())	// assert index < count
		return;

	// first 4 bytes is count, each 6 bytes after is each meta entry
	memcpy(block + METAHEADERSIZE + (index * METAENTRYSIZE), &rawOffset, sizeof(rawOffset));
	memcpy(block + METAHEADERSIZE + (index * METAENTRYSIZE) + sizeof(rawOffset), &rawSize, sizeof(rawSize));
}


const char *EntriesBlock::getRawData(unsigned long *retSize) {
	unsigned long max = 4;
	int loop;
	unsigned long offset;
	unsigned long size;
	for (loop = 0; loop < getCount(); loop++) {
		getMetaEntry(loop, &offset, &size);
		max = ((offset + size) > max) ? (offset + size) : max;
	}
	*retSize = max;
	return block;
}


int EntriesBlock::addEntry(const char *entry) {
	unsigned long dataSize;
	getRawData(&dataSize);
	unsigned long  len = strlen(entry);
	unsigned long offset;
	unsigned long size;
	int count = getCount();
	unsigned long dataStart = METAHEADERSIZE + (count * METAENTRYSIZE);
	// new meta entry + new data size + 1 because null 
	block = (char *)realloc(block, dataSize + METAENTRYSIZE + len + 1);
	// shift right to make room for new meta entry
	memmove(block + dataStart + METAENTRYSIZE, block + dataStart, dataSize - dataStart);

	for (int loop = 0; loop < count; loop++) {
		getMetaEntry(loop, &offset, &size);
		if (offset) {	// if not a deleted entry
			offset += METAENTRYSIZE;
			setMetaEntry(loop, offset, size);
		}
	}

	offset = dataSize;	// original dataSize before realloc
	size = len + 1;
	// add our text to the end
	memcpy(block + offset + METAENTRYSIZE, entry, size);
	// increment count
	setCount(count + 1);
	// add our meta entry
	setMetaEntry(count, offset + METAENTRYSIZE, size);
	// return index of our new entry
	return count;
}


const char *EntriesBlock::getEntry(int entryIndex) {
	unsigned long offset;
	unsigned long size;
	static const char *empty = "";

	getMetaEntry(entryIndex, &offset, &size);
	return (offset) ? block+offset : empty;
}


unsigned long EntriesBlock::getEntrySize(int entryIndex) {
	unsigned long offset;
	unsigned long size;

	getMetaEntry(entryIndex, &offset, &size);
	return (offset) ? size : 0;
}


void EntriesBlock::removeEntry(int entryIndex) {
	unsigned long offset;
	unsigned long size, size2;
	unsigned long dataSize;
	getRawData(&dataSize);
	getMetaEntry(entryIndex, &offset, &size);
	int count = getCount();

	if (!offset)	// already deleted
		return;

	// shift left to retrieve space used for old entry
	memmove(block + offset, block + offset + size, dataSize - (offset + size));

	// fix offset for all entries after our entry that were shifted left
	for (int loop = entryIndex + 1; loop < count; loop++) {
		getMetaEntry(loop, &offset, &size2);
		if (offset) {	// if not a deleted entry
			offset -= size;
			setMetaEntry(loop, offset, size2);
		}
	}

	// zero out our meta entry
	setMetaEntry(entryIndex, 0L, 0);
}


SWORD_NAMESPACE_END

/******************************************************************************
 *
 *  introtest.cpp -	
 *
 * $Id: introtest.cpp 2931 2013-07-31 13:07:26Z scribe $
 *
 * Copyright 2000-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <swmgr.h>
#include <iostream>
#include <versekey.h>
#include <rawtext.h>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

int main(int argc, char **argv) {
	SWMgr mymgr;

	RawText::createModule(".");
	RawText mod(".");

	VerseKey vk;
	vk.setIntros(true);
	vk.setAutoNormalize(false);
	vk.setPersist(true);
	mod.setKey(vk);

	vk.setVerse(0);
	vk.setChapter(0);
	vk.setBook(0);
	vk.setTestament(0);

	mod << "Module heading text";

	vk.setVerse(0);
	vk.setChapter(0);
	vk.setBook(0);
	vk.setTestament(1);

	mod << "OT heading text";

	vk.setTestament(1);
	vk.setBook(1);
	vk.setChapter(0);
	vk.setVerse(0);

	mod << "Gen heading text";

	vk.setTestament(1);
	vk.setBook(1);
	vk.setChapter(1);
	vk.setVerse(0);

	mod << "Gen 1 heading text";

	vk.setTestament(1);
	vk.setBook(1);
	vk.setChapter(1);
	vk.setVerse(1);

	mod << "Gen 1:1 text";

	
	vk.setTestament(0);
	vk.setBook(0);
	vk.setChapter(0);
	vk.setVerse(0);

	std::cout << "Module heading text ?= " << mod.renderText() << std::endl;

	vk.setTestament(1);
	vk.setBook(0);
	vk.setChapter(0);
	vk.setVerse(0);

	std::cout << "OT heading text ?= " << mod.renderText() << std::endl;

	vk.setTestament(1);
	vk.setBook(1);
	vk.setChapter(0);
	vk.setVerse(0);

	std::cout << "Gen heading text ?= " << mod.renderText() << std::endl;

	vk.setTestament(1);
	vk.setBook(1);
	vk.setChapter(1);
	vk.setVerse(0);

	std::cout << "Gen 1 heading text ?= " << mod.renderText() << std::endl;

	vk.setTestament(1);
	vk.setBook(1);
	vk.setChapter(1);
	vk.setVerse(1);

	std::cout << "Gen 1:1 text ?= " << mod.renderText() << std::endl;

	  /* old introtest
	SWModule *mhc = mymgr.Modules["MHC"];

	if (mhc) {
		VerseKey vk;
		vk.setIntros(true);
		vk.setAutoNormalize(false);
		vk.setPersist(true);
		vk = "jas 0:0";
		std::cout << vk << ":\n";
		mhc->setKey(vk);
		std::cout << (const char *) mhc->Key() << ":\n";
		std::cout << (const char *) *mhc << "\n";
	}
	  */
	return 0;
}



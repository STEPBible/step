/******************************************************************************
 *
 *  threaded_search.cpp -	This example shows how to do a thread search
 *
 * $Id: threaded_search.cpp 2923 2013-07-28 20:05:37Z scribe $
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

#include <stdio.h>
#include <rawtext.h>
#include <swmgr.h>
#include <regex.h> // GNU
#include <listkey.h>
#include <versekey.h>
#include <iostream>

#include <pthread.h>

#ifndef NO_SWORD_NAMESPACE
using sword::SWMgr;
using sword::ListKey;
using sword::SWModule;
using sword::VerseKey;
using sword::SWKey;
using sword::ModMap;
#endif

int cms_currentProgress;

class SearchThread {
public:
	SearchThread();	
	~SearchThread();

	char* searchedText;
	SWModule* module;
	ListKey searchResult;
	bool isSearching;

	void startThread();
	void search();
};

void* dummy(void* p) {
	SearchThread* searchThread = (SearchThread*)p;		
	searchThread->search();	

	return NULL;
}

void percentUpdate(char percent, void* userData)  {
	cms_currentProgress = (int)percent;
	std::cout << cms_currentProgress << "% ";
}

SearchThread::SearchThread() {
	isSearching = false;
	module = 0;
	searchedText = 0;
	cms_currentProgress = -1;
}

SearchThread::~SearchThread() {
}

void SearchThread::startThread()  {
	std::cout << "startThread" << std::endl;
	std::cout.flush();

	pthread_attr_t* attr = new pthread_attr_t;
	pthread_attr_init(attr);
	pthread_attr_setdetachstate(attr, PTHREAD_CREATE_DETACHED);

	pthread_t *thread= new pthread_t;
	isSearching = true;
	int i = pthread_create(thread, attr, &dummy, this); 

	std::cout << "Created the thread: " << i << std::endl;
	std::cout.flush();
}	

void SearchThread::search()  {
	
	if (!module) {
		std::cout << "Return." << std::endl;
		return;
	}

	ListKey scopeList = VerseKey().parseVerseList("Luke;John;Revelation","", true);
	for (int i=0; i < scopeList.getCount(); ++i) {
		std::cout << (const char*)*scopeList.getElement(i) << std::endl;
	}
	SWKey* scope = &scopeList;

	searchResult = module->search(searchedText, -2, REG_ICASE, scope, 0, &percentUpdate);

	if (!scope)
		std::cout << "bad scope!" << std::endl;
	isSearching = false;
}

int main(int argc, char **argv) {
	SWMgr manager;
	ModMap::iterator it;

	SearchThread* searchThread = new SearchThread();

	if (argc != 3) {
		fprintf(stderr, "usage: %s <modname> <searched text>\n", argv[0]);
		exit(-1);
	}

	it = manager.Modules.find(argv[1]);
	if (it == manager.Modules.end()) {
		fprintf(stderr, "Could not find module [%s].  Available modules:\n",  argv[1]);
		for (it = manager.Modules.begin(); it != manager.Modules.end(); ++it) {
			fprintf(stderr, "[%s]\t - %s\n", (*it).second->getName(), (*it).second->getDescription());
		}
		exit(-1);
	}
	
	searchThread->searchedText = argv[2];
	searchThread->module = (*it).second;
	searchThread->startThread();
	
	std::cout << "Start loop" << std::endl;
	std::cout.flush();
	while (true) {
		if (!searchThread->isSearching)
			break;
		else 
			std::cout.flush();
	};

	std::cout << std::endl << "Number of found items: " << searchThread->searchResult.getCount() << std::endl;
	std::cout << "Finished program" << std::endl;
	std::cout.flush();

	delete searchThread;
	exit(0);
}


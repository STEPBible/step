/******************************************************************************
 *
 *  gsoapsword.cpp -	
 *
 * $Id: gsoapsword.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include "soapH.h"
#include <flatapi.h>
#include <swmgr.h>
#include <markupfiltmgr.h>


SWMgr *mgr;

int sword__ModList_iterator_next(xsd__int hmmi, xsd__int &noop) {
	ModList_iterator_next(hmmi);
	return SOAP_OK;
}

int sword__ModList_iterator_val(xsd__int hmmi, xsd__int &hmodule) {
	hmodule = ModList_iterator_val(hmmi);
	return SOAP_OK;
}

int sword__SWMgr_new(xsd__int &retVal) {
	retVal = SWMgr_new();
	return SOAP_OK;
}

int sword__SWMgr_delete(xsd__int hmgr, xsd__int &noop) {
	SWMgr_delete(hmgr);
	return SOAP_OK;
}

int sword__SWMgr_getModulesIterator(xsd__int hmgr, xsd__int &hmodIterator) {
	hmodIterator = SWMgr_getModulesIterator(hmgr);
	return SOAP_OK;
}

int sword__SWMgr_getModuleByName(xsd__int hmgr, xsd__string name, xsd__int &hmodule) {
	hmodule = SWMgr_getModuleByName(hmodule, name);
	return SOAP_OK;
}



int sword__SWModule_getName(xsd__int hmodule, xsd__string &name) {
	name = (char *)SWModule_getName(hmodule);
	return SOAP_OK;
}

int sword__SWModule_getDescription(xsd__int hmodule, xsd__string &description) {
	description = (char *)SWModule_getDescription(hmodule);
	return SOAP_OK;
}


int sword__Quick_getModuleRawEntry(xsd__string modName, xsd__string modKey, xsd__string &modText) {
	SWModule *mod = mgr->Modules[modName];
	if (mod) {
		mod->setKey(modKey);
		modText = mod->getRawEntry();
	}
	return SOAP_OK;
}


int sword__Quick_setModuleRawEntry(xsd__string modName, xsd__string modKey, xsd__string modText, xsd__int &noop) {
	SWModule *mod = mgr->Modules[modName];
	if (mod) {
		mod->setKey(modKey);
		(*mod) << modText;
	}
	return SOAP_OK;
}


int sword__Quick_getModuleRenderText(xsd__string modName, xsd__string modKey, xsd__string &modText) {
	SWModule *mod = mgr->Modules[modName];
	if (mod) {
		mod->setKey(modKey);
		modText = (char *)mod->RenderText();
	}
	return SOAP_OK;
}


int sword__Quick_getJScriptAttribArray(xsd__string modName, xsd__string modKey, xsd__string &arrayText) {
	SWModule *mod = mgr->Modules[modName];
	if (mod) {
		mod->setKey(modKey);
		AttributeTypeList::iterator i1;
		AttributeList::iterator i2;
		AttributeValue::iterator i3;
		int l1, l2, l3;
		char lbuf1[20], lbuf2[20], lbuf3[20];
		static string retVal = "";
		retVal = "var entryAttribs = new Array();\n";
		string l1keys = "entryAttribs[0] = new Array(";
		for (l1=0,i1 = target->getEntryAttributes().begin(); i1 != target->getEntryAttributes().end(); ++i1,++l1) {
			sprintf(lbuf1, "%d", l1+1);
			retVal += "entryAttribs["+lbuf1+"] = new Array();\n";
			string l2keys = "entryAttribs["+lbuf1+"][0] = new Array(";
			cout << "[ " << i1->first << " ]\n";
			for (l2=0,i2 = i1->second.begin(); i2 != i1->second.end(); ++i2,++l2) {
				sprintf(lbuf2, "%d", l2+1);
				retVal += "entryAttribs["+lbuf1+"]["+lbuf2+"][0] = new Array();\n";
				string l3keys = "entryAttribs["+lbuf1+"]["+lbuf2+"][0] = new Array(";
				cout << "\t[ " << i2->first << " ]\n";
				for (l3=0,i3 = i2->second.begin(); i3 != i2->second.end(); ++i3,++l3) {
					cout << "\t\t" << i3->first << " = " << i3->second << "\n";
				}
			}
		}
	}
	return SOAP_OK;
}




main() {


	int m, s;
	mgr = new SWMgr(new MarkupFilterMgr());
     m = soap_bind("localhost", 18083, 100);
	if (m < 0) {
		soap_print_fault(stderr);
		exit(-1);
	}
	fprintf(stderr, "Socket connection successful: master socket = %d\n", m);
	for (int i = 1; ; i++) {
		s = soap_accept();
		if (s < 0) {
			soap_print_fault(stderr);
			exit(-1);
		}
		fprintf(stderr, "%d: accepted connection from IP = %d.%d.%d.%d socket = %d", i, (soap_ip<<24)&0xFF, (soap_ip<<16)&0xFF, (soap_ip<<8)&0xFF, soap_ip&0xFF, s);
		soap_serve(); // process RPC skeletons
		fprintf(stderr, "request served\n");
		soap_end(); // clean up everything and close socket
	}
	delete mgr;
}

#include "sword.nsmap"


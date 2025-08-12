/******************************************************************************
 *
 *  MainTest.cpp -	This is part of a program to test CLX bindings
 *
 * $Id: MainTest.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

//---------------------------------------------------------------------------

#include <vcl.h>
#pragma hdrstop

#include "MainTest.h"
extern "C" {
#include <flatapi.h>
}
//using namespace sword;
//---------------------------------------------------------------------------
#pragma package(smart_init)
#pragma resource "*.dfm"
TForm1 *Form1;
//---------------------------------------------------------------------------
__fastcall TForm1::TForm1(TComponent* Owner)
	: TForm(Owner)
{
}
//---------------------------------------------------------------------------
void __fastcall TForm1::FormShow(TObject *Sender)
{
	SWHANDLE mgr = SWMgr_new();
	SWHANDLE it = SWMgr_getModulesIterator(mgr);
	SWHANDLE module = 0;
	String modlist;
	do {
		module = ModList_iterator_val(it);
		if (module) {
			modlist += SWModule_getName(module) + (String)"\r\n";
			ModList_iterator_next(it);
		}
	} while (module);
	Memo1->Text = modlist;
	SWMgr_delete(mgr);
}
//---------------------------------------------------------------------------

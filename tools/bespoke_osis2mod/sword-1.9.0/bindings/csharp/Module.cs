// Copyright 2014  CrossWire Bible Society (http://www.crosswire.org)
//  	CrossWire Bible Society
//  	P. O. Box 2528
//  	Tempe, AZ  85280-2528
//  
//  This program is free software; you can redistribute it and/or modify it
//  under the terms of the GNU General Public License as published by the
//  Free Software Foundation version 2.
//  
//  This program is distributed in the hope that it will be useful, but
//  WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
//  General Public License for more details.
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;

namespace Sword
{
	public class Module
	{
		IntPtr _handle;
		
		internal Module(IntPtr handle)
		{
			_handle = handle;
		}
		
		public string Name
		{
			get
			{
				IntPtr namePtr = NativeMethods.org_crosswire_sword_SWModule_getName(_handle);
				return Marshal.PtrToStringAnsi(namePtr);
			}
		}
		
		public string Description
		{
			get
			{
				IntPtr descriptionPtr = NativeMethods.org_crosswire_sword_SWModule_getDescription(_handle);
				return Marshal.PtrToStringAnsi(descriptionPtr);
			}
		}
		
		public string Category
		{
			get
			{
				IntPtr categoryPtr = NativeMethods.org_crosswire_sword_SWModule_getCategory(_handle);
				return Marshal.PtrToStringAnsi(categoryPtr);
			}
		}
		
		
		/// <summary>
		/// Special values handled for VerseKey modules:
		///	[+-][book|chapter]	- [de|in]crement by chapter or book
		///	(e.g.	"+chapter" will increment the VerseKey 1 chapter)
		///	[=][key]		- position absolutely and don't normalize
		///	(e.g.	"jn.1.0" for John Chapter 1 intro; "jn.0.0" For Book of John Intro)
		/// </summary>
		public string KeyText
		{
			get
			{
				IntPtr keyTextPtr = NativeMethods.org_crosswire_sword_SWModule_getKeyText(_handle);
				return Marshal.PtrToStringAnsi(keyTextPtr);
			}
			set
			{
				NativeMethods.org_crosswire_sword_SWModule_setKeyText(_handle, value);
			}
		}
		
		public string RenderText()
		{
			IntPtr keyTextPtr = NativeMethods.org_crosswire_sword_SWModule_renderText(_handle);
			return Marshal.PtrToStringAnsi(keyTextPtr);
		}
		
		public string RawEntry
		{
			get
			{
				IntPtr keyTextPtr = NativeMethods.org_crosswire_sword_SWModule_getRawEntry(_handle);
				return Marshal.PtrToStringAnsi(keyTextPtr);
			}
			set
			{
				NativeMethods.org_crosswire_sword_SWModule_setRawEntry(_handle, value);
			}
		}
		
		public string StripText()
		{
			IntPtr keyTextPtr = NativeMethods.org_crosswire_sword_SWModule_stripText(_handle);
			return Marshal.PtrToStringAnsi(keyTextPtr);
		}
		
		public IEnumerable<SearchHit> Search(string searchString, SearchType searchType, long flags, string scope)
		{
			IntPtr searchHitPtr = NativeMethods.org_crosswire_sword_SWModule_search(_handle, searchString, (int)searchType, flags, scope, IntPtr.Zero);
			SearchHit searchHit = (SearchHit)Marshal.PtrToStructure(searchHitPtr, typeof(SearchHit));
			while (!searchHit.IsNull()) 
			{
				yield return searchHit;
				searchHitPtr = new IntPtr(searchHitPtr.ToInt64() + Marshal.SizeOf(typeof(SearchHit)));
				searchHit = (SearchHit)Marshal.PtrToStructure(searchHitPtr, typeof(SearchHit));
			}
		}
		
		public void TerminateSearch()
		{
			NativeMethods.org_crosswire_sword_SWModule_terminateSearch(_handle);	
		}
		
		public char PopError()
		{
			return NativeMethods.org_crosswire_sword_SWModule_popError(_handle);	
		}

		public long EntrySize
		{
			get
			{
				return NativeMethods.org_crosswire_sword_SWModule_getEntrySize(_handle);	
			}
		}
		
		public IEnumerable<string> GetEntryAttribute(string level1, string level2, string level3, char filteredBool)
		{
			IntPtr attributePtrs = NativeMethods.org_crosswire_sword_SWModule_getEntryAttribute(_handle, level1, level2, level3, filteredBool);
			return NativeMethods.MarshalStringArray(attributePtrs);
		}
		
		public IEnumerable<string> ParseKeyList(string keyText)
		{
			IntPtr keyListPtrs = NativeMethods.org_crosswire_sword_SWModule_parseKeyList(_handle, keyText);
			return NativeMethods.MarshalStringArray(keyListPtrs);
		}
		
		public bool HasKeyChildren()
		{
			char hasChildren = NativeMethods.org_crosswire_sword_SWModule_hasKeyChildren(_handle);
			return hasChildren == 1 ? true : false;
		}

		/// <summary>
		/// This method returns child nodes for a genbook,
		/// but has special handling if called on a VerseKey module:
		/// [0..7] [testament, book, chapter, verse, chapterMax, verseMax, bookName, osisRef]
		/// </summary>
		public IEnumerable<string> KeyChildren
		{
			get
			{
				IntPtr childrenPtr = NativeMethods.org_crosswire_sword_SWModule_getKeyChildren(_handle);
				return NativeMethods.MarshalStringArray(childrenPtr);
			}
		}
		
		public string KeyParent
		{
			get
			{
				IntPtr keyPtr = NativeMethods.org_crosswire_sword_SWModule_getKeyChildren(_handle);
				return Marshal.PtrToStringAnsi(keyPtr);
			}
		}
		
		public void Prevous()
		{
			NativeMethods.org_crosswire_sword_SWModule_previous(_handle);
		}
		
		public void Next()
		{
			NativeMethods.org_crosswire_sword_SWModule_next(_handle);
		}
		
		public void Begin()
		{
			NativeMethods.org_crosswire_sword_SWModule_begin(_handle);
		}
		
		public string RenderHeader
		{
			get
			{
				IntPtr headerPtr = NativeMethods.org_crosswire_sword_SWModule_getRenderHeader(_handle);
				return Marshal.PtrToStringAnsi(headerPtr);
			}
		}
		
		public string GetConfigEntry(string key)
		{
			IntPtr entryPtr = NativeMethods.org_crosswire_sword_SWModule_getConfigEntry(_handle, key);
			return Marshal.PtrToStringAnsi(entryPtr);
		}
		
		public void DeleteSearchFramework()
		{
			NativeMethods.org_crosswire_sword_SWModule_deleteSearchFramework(_handle);	
		}
		
		public bool HasSearchFramework()
		{
			return NativeMethods.org_crosswire_sword_SWModule_hasSearchFramework(_handle);
		}
	}
}


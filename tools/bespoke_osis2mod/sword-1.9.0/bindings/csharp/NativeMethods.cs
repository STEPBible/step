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
	public enum SearchType 
	{
		REGEX = 1,
		PHRASE = -1,
		MULTIWORD = -2,
		ENTRYATTR = -3,
		LUCENE = -4
	};
	
	[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
	public struct ModInfo 
	{
		public string Name;
		public string Description;
		public string Category;
		public string Language;
		public string Version;
		public string Delta;
	};
	
	[StructLayout(LayoutKind.Sequential)]
	public struct SearchHit
	{
		IntPtr _modName;
		IntPtr _key;
		long Score;
		
		public bool IsNull()
		{
			return _key == IntPtr.Zero;
		}
		public string Key 
		{ 
			get 
			{
				if(_key == IntPtr.Zero)
				{
					return null;	
				}
				return Marshal.PtrToStringAnsi(_key); 
			} 
		}
		
		public string ModName 
		{ 
			get 
			{ 
				if(_modName == IntPtr.Zero)
				{
					return null;	
				}
				return Marshal.PtrToStringAnsi(_modName); 
			} 
		}
	};
	
	public static class NativeMethods
	{
		public const string DLLNAME = "libsword";
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_new();
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_newWithPath(string path);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_getModuleByName(IntPtr hSWMgr, string moduleName);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWModule_setKeyText(IntPtr hSWModule, string key);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_renderText(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getRawEntry(IntPtr hSWModule);

		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getKeyText(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWMgr_delete(IntPtr hSWMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_getModInfoList(IntPtr hSWMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_stripText(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWModule_setRawEntry(IntPtr hSWModule, string entryBuffer);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWModule_terminateSearch(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern char org_crosswire_sword_SWModule_popError(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern long org_crosswire_sword_SWModule_getEntrySize(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getEntryAttribute(IntPtr hSWModule, string level1, string level2, string level3, char filteredBool);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_parseKeyList(IntPtr hSWModule, string keyText);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_search(IntPtr hSWModule, string searchString, int searchType, long flags, string scope, IntPtr progressReporter);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern char org_crosswire_sword_SWModule_hasKeyChildren(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getKeyChildren(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getName(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getDescription(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getCategory(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getKeyParent(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWModule_previous(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWModule_next(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWModule_begin(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getRenderHeader(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWModule_getConfigEntry(IntPtr hSWModule, string key);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWModule_deleteSearchFramework(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern bool org_crosswire_sword_SWModule_hasSearchFramework(IntPtr hSWModule);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_version(IntPtr hSWMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_getPrefixPath(IntPtr hSWMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_getConfigPath(IntPtr hSWMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWMgr_setGlobalOption(IntPtr hSWMgr, string option, string val);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_getGlobalOptionValues(IntPtr hSWMgr, string option);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWMgr_setCipherKey(IntPtr hSWMgr, string modName, byte[] key);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWMgr_setJavascript(IntPtr hSWMgr, bool valueBool);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_getAvailableLocales(IntPtr hSWMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_SWMgr_setDefaultLocale(IntPtr hSWMgr, string name);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_SWMgr_translate(IntPtr hSWMgr, string text, string localeName);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_InstallMgr_reInit(IntPtr hInstallMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_InstallMgr_new(string baseDir, IntPtr statusReporter);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_InstallMgr_setUserDisclaimerConfirmed(IntPtr hInstallMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern int org_crosswire_sword_InstallMgr_syncConfig(IntPtr hInstallMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_InstallMgr_getRemoteSources(IntPtr hInstallMgr);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern IntPtr org_crosswire_sword_InstallMgr_getRemoteModInfoList(IntPtr hInstallMgr, IntPtr hSWMgr_deltaCompareTo, string sourceName);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern int org_crosswire_sword_InstallMgr_refreshRemoteSource(IntPtr hInstallMgr, string sourceName);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern int org_crosswire_sword_InstallMgr_remoteInstallModule(IntPtr hInstallMgr_from, IntPtr hSWMgr_to, string sourceName, string modName);
		
		[DllImport(DLLNAME, CallingConvention = CallingConvention.Cdecl)]
		public static extern void org_crosswire_sword_InstallMgr_delete(IntPtr hInstallMgr);

		public static IEnumerable<string> MarshalStringArray(IntPtr arrayPtr)
		{
			if(arrayPtr == IntPtr.Zero)
			{
				yield break;
			}
			
			while(arrayPtr != IntPtr.Zero)
			{
				IntPtr ptr = Marshal.ReadIntPtr(arrayPtr);
				if(ptr == IntPtr.Zero)
				{
					yield break;
				}
				string key = Marshal.PtrToStringAnsi(ptr);
			 	yield return key;
				arrayPtr = new IntPtr(arrayPtr.ToInt64() + IntPtr.Size);
			}
		}
		
		public static IEnumerable<ModInfo> MarshallModInfoArray(IntPtr pointer)
		{
			ModInfo modInfo = (ModInfo)Marshal.PtrToStructure(pointer, typeof(ModInfo));
			
			while (modInfo.Name != null) 
			{
				yield return modInfo;
				pointer = new IntPtr(pointer.ToInt64() + Marshal.SizeOf(typeof(ModInfo)));
				modInfo = (ModInfo)Marshal.PtrToStructure(pointer, typeof(ModInfo));
			}	
		}
	}
}


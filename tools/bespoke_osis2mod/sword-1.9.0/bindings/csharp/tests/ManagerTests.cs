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
using NUnit.Framework;
using System.IO;
using System.Collections.Generic;
using System.Linq;

namespace Sword.Tests
{
	[TestFixture]
	public class ManagerTests
	{
		Manager _manager;
		
		[TestFixtureSetUp]
		public void Setup()
		{
			_manager = new Manager();
		}
		
		[TestFixtureTearDown]
		public void TearDown()
		{
			_manager.Dispose();	
		}
		
		[Test]
		public void Version_Get_ReturnsAVersion()
		{
			//act
			string swordVersion = _manager.Version;
			
			//assert
			Version version;
			Assert.That (Version.TryParse(swordVersion, out version));
		}
		
		[Test]
		public void PrefixPath_Get_ReturnsValidPath()
		{
			//act
			string prefixPath = _manager.PrefixPath;
			
			//assert
			Assert.That (Directory.Exists(prefixPath), Is.True);
		}
		
		[Test]
		public void ConfigPath_Get_ReturnsValidPath()
		{
			//act
			string configPath = _manager.ConfigPath;
			
			//assert
			Assert.That (Directory.Exists(configPath), Is.True);
		}
		
		[Test]
		public void SetCipherKey_Called_DoesntCrash()
		{
			//act
			_manager.SetCipherKey("ESV", new byte[32]);
		}
		
		[Test]
		public void Javascript_Set_DoesntCrash()
		{
			//act
			_manager.Javascript = true;
		}
		
		[Test]
		public void AvailableLocales_Get_DoesntCrash()
		{
			//act
			string[] availableLocales = _manager.AvailableLocales.ToArray();
			
			//Assert
			Assert.That (availableLocales.Length > 0);
		}
		
		[Test]
		public void AvailableLocales_Get_ContainsEnglish()
		{
			//act
			string[] availableLocales = _manager.AvailableLocales.ToArray();
			
			//Assert
			Assert.That (availableLocales.Any(locale => locale == "en"));
		}
		
		[Test]
		public void DefaultLocale_SetToEn_DoesntCrash()
		{
			//act
			_manager.DefaultLocale = "en";
		}
		
		[Test]
		public void Translate_EnglishToEnglish_ReturnsOrginal()
		{
			//act
			var result = _manager.Translate("love", "en");
				
			//assert
			Assert.That (result, Is.EqualTo("love"));
		}
	}
}


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

namespace Sword.Tests
{
	[TestFixture]
	public class ModuleTests
	{
		Module _swordModule;
		Manager _swordManager;
		
		[TestFixtureSetUp]
		public void Setup()
		{
			_swordManager = new Manager("LocalManager");
			_swordModule = _swordManager.GetModuleByName("ESV");
			
			if(_swordModule != null)
			{
				return;	
			}
			using(var installManager = new InstallManager("baseDirectory"))
			{
				installManager.SetUserDisclaimerConfirmed();
				installManager.SyncConfig();
				installManager.RefreshRemoteSource("CrossWire");
			
				installManager.RemoteInstallModule(_swordManager, "CrossWire", "ESV");
				_swordModule = _swordManager.GetModuleByName("ESV");
			}
		}
		
		[TestFixtureTearDown]
		public void TearDown()
		{
			_swordManager.Dispose();
		}
		
		[Test]
		public void Name_Get_Esv()
		{
			//arrange
			//act
			string name =_swordModule.Name;
			
			//assert
			Assert.That (name, Is.EqualTo ("ESV"));
		}
		
		[Test]
		public void Description_Get_DescriptionCorrect()
		{
			//arrange
			//act
			string description =_swordModule.Description;
			
			//assert
			Assert.That (description, Is.EqualTo ("English Standard Version"));
		}
		
		[Test]
		public void Catagory_Get_CatagoryCorrect()
		{
			//arrange
			//act
			string catagory =_swordModule.Category;
			
			//assert
			Assert.That (catagory, Is.EqualTo ("Biblical Texts"));
		}
		
		[Test]
		public void Previous_John3v16_John3v15()
		{
			//arrange
			_swordModule.KeyText = "jn.3.16";
			
			//act
			_swordModule.Prevous();
			
			//assert
			Assert.That (_swordModule.KeyText, Is.EqualTo( "John 3:15"));
		}
		
		[Test]
		public void Next_John3v15_John3v16()
		{
			//arrange
			_swordModule.KeyText = "jn.3.15";
			
			//act
			_swordModule.Next();
			
			//assert
			Assert.That (_swordModule.KeyText, Is.EqualTo( "John 3:16"));
		}
		
		[Test]
		public void Begin_John3v15_Genesis1v1()
		{
			//arrange
			_swordModule.KeyText = "jn.3.15";
			
			//act
			_swordModule.Begin();
			
			//assert
			Assert.That (_swordModule.KeyText, Is.EqualTo( "Genesis 1:1"));
		}
		
		[Test]
		public void RenderHeader_John3v16_ReturnsNonNullOrEmpty()
		{
			//arrange
			_swordModule.KeyText = "jn.3.16";
			
			//act
			string header = _swordModule.RenderHeader;
			
			//assert
			Assert.That (!string.IsNullOrEmpty(header));
		}
		
		[Test]
		public void RawEntry_Get_ContainsVerse()
		{
			//arrange
			_swordModule.KeyText = "jn.3.16";

			//act
			string rawEntry = _swordModule.RawEntry;
			
			//assert
			Assert.That (rawEntry.Contains ("God so loved"));
		}
		
		public void HasSearchFramework_Doesnt_ReturnsFalse()
		{
			//arrange
			//act
			bool hasSearchFramework = _swordModule.HasSearchFramework();
			
			//assert
			Assert.That (hasSearchFramework, Is.False);
		}
	}
}


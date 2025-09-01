/*	SwordModule.mm - Sword API wrapper for Modules.

	Copyright 2008 Manfred Bergmann
	Based on code by Will Thimbleby

	This program is free software; you can redistribute it and/or modify it under the terms of the
	GNU General Public License as published by the Free Software Foundation version 2.

	This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
	even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	General Public License for more details. (http://www.gnu.org/licenses/gpl.html)
*/

#import "ObjCSword_Prefix.pch"
#import "SwordModule.h"
#import "SwordManager.h"
#import "SwordModuleTextEntry.h"
#import "SwordVerseKey.h"
#import "SwordBible.h"
#import "SwordCommentary.h"
#import "SwordUtil.h"

@interface SwordModule ()

@end

@implementation SwordModule

+ (id)moduleForSWModule:(sword::SWModule *)aModule {
    return [[SwordModule alloc] initWithSWModule:aModule];
}

+ (id)moduleForType:(ModuleType)aType swModule:(sword::SWModule *)swModule {
    SwordModule *sm;
    if(aType == Bible) {
        sm = [[SwordBible alloc] initWithSWModule:swModule];
    } else if(aType == Commentary) {
        sm = [[SwordCommentary alloc] initWithSWModule:swModule];
    } else if(aType == Dictionary) {
        sm = [[SwordDictionary alloc] initWithSWModule:swModule];
    } else if(aType == Genbook) {
        sm = [[SwordBook alloc] initWithSWModule:swModule];
    } else {
        sm = [[SwordModule alloc] initWithSWModule:swModule];
    }
    
    return sm;
}

+ (ModuleType)moduleTypeForModuleTypeString:(NSString *)typeStr {
     ModuleType ret = Bible;
    
    if(typeStr == nil) {
        ALog(@"have a nil typeStr!");
        return ret;
    }
    
    if([typeStr isEqualToString:SWMOD_TYPES_BIBLES]) {
        ret = Bible;
    } else if([typeStr isEqualToString:SWMOD_TYPES_COMMENTARIES]) {
        ret = Commentary;
    } else if([typeStr isEqualToString:SWMOD_TYPES_DICTIONARIES]) {
        ret = Dictionary;
    } else if([typeStr isEqualToString:SWMOD_TYPES_GENBOOKS]) {
        ret = Genbook;
    }
    
    return ret;
}

+ (ModuleCategory)moduleCategoryForModuleCategoryString:(NSString *)categoryStr {
    ModuleCategory ret = NoCategory;
    
    if(categoryStr == nil) {
        ALog(@"have a nil categoryStr!");
        return ret;
    }
    
    if([categoryStr isEqualToString:SWMOD_CATEGORY_MAPS]) {
        ret = Maps;
    } else if([categoryStr isEqualToString:SWMOD_CATEGORY_IMAGES]) {
        ret = Images;
    } else if([categoryStr isEqualToString:SWMOD_CATEGORY_DAILYDEVS]) {
        ret = DailyDevotion;
    } else if([categoryStr isEqualToString:SWMOD_CATEGORY_ESSEYS]) {
        ret = Essays;
    } else if([categoryStr isEqualToString:SWMOD_CATEGORY_GLOSSARIES]) {
        ret = Glossary;
    } else if([categoryStr isEqualToString:SWMOD_CATEGORY_CULTS]) {
        ret = Cults;
    }
    
    return ret;    
}

#pragma mark - Initializer

- (void)mainInit {
    category = Unset;

    self.type = [SwordModule moduleTypeForModuleTypeString:[self typeString]];
    self.moduleLock = [[NSRecursiveLock alloc] init];
    self.indexLock = [[NSLock alloc] init];
    self.configEntries = [NSMutableDictionary dictionary];
}

- (id)initWithSWModule:(sword::SWModule *)aModule {
    self = [super init];
    if(self) {
        swModule = aModule;
        
        [self mainInit];
    }
    
    return self;
}

#pragma mark - Filters

- (void)addRenderFilter:(SwordFilter *)aFilter {
    swModule->removeRenderFilter([aFilter swFilter]);
    swModule->addRenderFilter([aFilter swFilter]);
}

- (void)addStripFilter:(SwordFilter *)aFilter {
    swModule->addStripFilter([aFilter swFilter]);
}

#pragma mark - Module access semaphores

- (void)lockModuleAccess {
    [self.moduleLock lock];
}

- (void)unlockModuleAccess {
    [self.moduleLock unlock];
}

- (NSString *)name {
    NSString *str = [NSString stringWithCString:swModule->getName() encoding:NSUTF8StringEncoding];
    if(!str) {
        str = [NSString stringWithCString:swModule->getName() encoding:NSISOLatin1StringEncoding];
    }
    return str;
}

- (NSString *)descr {
    NSString *str = [NSString stringWithCString:swModule->getDescription() encoding:NSUTF8StringEncoding];
    if(!str) {
        str = [NSString stringWithCString:swModule->getDescription() encoding:NSISOLatin1StringEncoding];
    }
    return str;
}

- (NSString *)lang {
    NSString *str = [NSString stringWithCString:swModule->getLanguage() encoding:NSUTF8StringEncoding];
    if(!str) {
        str = [NSString stringWithCString:swModule->getLanguage() encoding:NSISOLatin1StringEncoding];
    }
    return str;
}

- (NSString *)typeString {
    NSString *str = [NSString stringWithCString:swModule->getType() encoding:NSUTF8StringEncoding];
    if(!str) {
        str = [NSString stringWithCString:swModule->getType() encoding:NSISOLatin1StringEncoding];
    }
    return str;
}

- (NSAttributedString *)fullAboutText {
    return [[NSAttributedString alloc] initWithString:@""];
}

- (NSInteger)error {
    return swModule->popError();
}

#pragma mark - Conf entries

- (NSString *)categoryString {
    NSString *cat = self.configEntries[SWMOD_CONFENTRY_CATEGORY];
    if(cat == nil) {
        cat = [self configFileEntryForConfigKey:SWMOD_CONFENTRY_CATEGORY];
        if(cat != nil) {
            self.configEntries[SWMOD_CONFENTRY_CATEGORY] = cat;
        }
    }
    
    return cat;
}

- (ModuleCategory)category {
    if(category == Unset) {
        category = [SwordModule moduleCategoryForModuleCategoryString:[self categoryString]];
    }
    return category;
}

- (NSString *)cipherKey {
    NSString *cipherKey = self.configEntries[SWMOD_CONFENTRY_CIPHERKEY];
    if(cipherKey == nil) {
        cipherKey = [self configFileEntryForConfigKey:SWMOD_CONFENTRY_CIPHERKEY];
        if(cipherKey != nil) {
            self.configEntries[SWMOD_CONFENTRY_CIPHERKEY] = cipherKey;
        }
    }
    
    return cipherKey;
}

- (NSString *)version {
    NSString *version = self.configEntries[SWMOD_CONFENTRY_VERSION];
    if(version == nil) {
        version = [self configFileEntryForConfigKey:SWMOD_CONFENTRY_VERSION];
        if(version != nil) {
            self.configEntries[SWMOD_CONFENTRY_VERSION] = version;
        }
    }
    
    return version;
}

- (NSString *)minVersion {
    NSString *minVersion = self.configEntries[SWMOD_CONFENTRY_MINVERSION];
    if(minVersion == nil) {
        minVersion = [self configFileEntryForConfigKey:SWMOD_CONFENTRY_MINVERSION];
        if(minVersion != nil) {
            self.configEntries[SWMOD_CONFENTRY_MINVERSION] = minVersion;
        }
    }
    
    return minVersion;
}

/** this might be RTF string  but the return value will be converted to UTF8 */
- (NSString *)aboutText {
    NSMutableString *aboutText = self.configEntries[SWMOD_CONFENTRY_ABOUT];
    if(aboutText == nil) {
        aboutText = [NSMutableString stringWithString:[self configFileEntryForConfigKey:SWMOD_CONFENTRY_ABOUT]];
        if(aboutText != nil) {
			//search & replace the RTF markup:
			// "\\qc"		- for centering							--->>>  ignore these
			// "\\pard"		- for resetting paragraph attributes	--->>>  ignore these
			// "\\par"		- for paragraph breaks					--->>>  honour these
			// "\\u{num}?"	- for unicode characters				--->>>  honour these
			[aboutText replaceOccurrencesOfString:@"\\qc" withString:@"" options:0 range:NSMakeRange(0, [aboutText length])];
			[aboutText replaceOccurrencesOfString:@"\\pard" withString:@"" options:0 range:NSMakeRange(0, [aboutText length])];
			[aboutText replaceOccurrencesOfString:@"\\par" withString:@"\n" options:0 range:NSMakeRange(0, [aboutText length])];
            
			NSMutableString *retStr = [@"" mutableCopy];
			for(NSUInteger i=0; i<[aboutText length]; i++) {
				unichar c = [aboutText characterAtIndex:i];
                
				if(c == '\\' && ((i+1) < [aboutText length])) {
					unichar d = [aboutText characterAtIndex:(i+1)];
					if (d == 'u') {
						//we have an unicode character!
						@try {
							NSInteger unicodeChar = 0;
							NSMutableString *unicodeCharString = [@"" mutableCopy];
							int j = 0;
							BOOL negative = NO;
							if ([aboutText characterAtIndex:(i+2)] == '-') {
								//we have a negative unicode char
								negative = YES;
								j++;//skip past the '-'
							}
							while(isdigit([aboutText characterAtIndex:(i+2+j)])) {
								[unicodeCharString appendFormat:@"%C", [aboutText characterAtIndex:(i+2+j)]];
								j++;
							}
							unicodeChar = [unicodeCharString integerValue];
							if (negative) unicodeChar = 65536 - unicodeChar;
							i += j+2;
							[retStr appendFormat:@"%C", (unichar)unicodeChar];
						}
						@catch (NSException * e) {
							[retStr appendFormat:@"%C", c];
						}
						//end dealing with the unicode character.
					} else {
						[retStr appendFormat:@"%C", c];
					}
				} else {
					[retStr appendFormat:@"%C", c];
				}
			}
			
			aboutText = retStr;
        } else {
            aboutText = [NSMutableString string];
        }
        self.configEntries[SWMOD_CONFENTRY_ABOUT] = aboutText;
    }
    
    return aboutText;    
}

/** this is only relevant for bible and commentaries */
- (NSString *)versification {
    return @"";
}

- (BOOL)isEditable {
    BOOL ret = NO;
    NSString *editable = self.configEntries[SWMOD_CONFENTRY_EDITABLE];
    if(editable == nil) {
        editable = [self configFileEntryForConfigKey:SWMOD_CONFENTRY_EDITABLE];
        if(editable != nil) {
            self.configEntries[SWMOD_CONFENTRY_EDITABLE] = editable;
        }
    }
    
    if(editable) {
        if([editable isEqualToString:@"YES"]) {
            ret = YES;
        }
    }
    
    return ret;
}

- (BOOL)isRTL {
    BOOL ret = NO;
    NSString *direction = self.configEntries[SWMOD_CONFENTRY_DIRECTION];
    if(direction == nil) {
        direction = [self configFileEntryForConfigKey:SWMOD_CONFENTRY_DIRECTION];
        if(direction != nil) {
            self.configEntries[SWMOD_CONFENTRY_DIRECTION] = direction;
        }
    }
    
    if(direction) {
        if([direction isEqualToString:SW_DIRECTION_RTL]) {
            ret = YES;
        }
    }
    
    return ret;    
}

- (BOOL)isUnicode {    
    return swModule->isUnicode();
}

- (BOOL)isEncrypted {
    BOOL encrypted = YES;
    if([self cipherKey] == nil) {
        encrypted = NO;
    }
    
    return encrypted;
}

- (BOOL)isLocked {
    /** is module locked/has cipherkey config entry but cipherkey entry is empty */
    BOOL locked = NO;
    NSString *key = [self cipherKey];
    if(key != nil) {
        // check user defaults, that's where we store the entered keys
        NSDictionary *cipherKeys = [[NSUserDefaults standardUserDefaults] objectForKey:DefaultsModuleCipherKeysKey];
        if([key length] == 0 && ![[cipherKeys allKeys] containsObject:[self name]]) {
            locked = YES;
        }
    }
    
    return locked;
}

// general feature access
- (BOOL)hasFeature:(NSString *)feature {
	BOOL has = NO;
	
	if(swModule->getConfig().has("Feature", [feature UTF8String])) {
		has = YES;
    } else if (swModule->getConfig().has("GlobalOptionFilter", [[NSString stringWithFormat:@"GBF%@", feature] UTF8String])) {
 		has = YES;
    } else if (swModule->getConfig().has("GlobalOptionFilter", [[NSString stringWithFormat:@"ThML%@", feature] UTF8String])) {
 		has = YES;
    } else if (swModule->getConfig().has("GlobalOptionFilter", [[NSString stringWithFormat:@"UTF8%@", feature] UTF8String])) {
 		has = YES;
    } else if (swModule->getConfig().has("GlobalOptionFilter", [[NSString stringWithFormat:@"OSIS%@", feature] UTF8String])) {
 		has = YES;
    } else if (swModule->getConfig().has("GlobalOptionFilter", [feature UTF8String])) {
 		has = YES;
    }
	
	return has;
}

- (NSString *)configFileEntryForConfigKey:(NSString *)entryKey {
	NSString *result = nil;
    
	[self.moduleLock lock];
    const char *entryStr = swModule->getConfigEntry([entryKey UTF8String]);
	if(entryStr) {
		result = [NSString stringWithUTF8String:entryStr];
        if(!result) {
            result = [NSString stringWithCString:entryStr encoding:NSISOLatin1StringEncoding];
        }
    }
	[self.moduleLock unlock];
	
	return result;
}

#pragma mark - Module positioning

- (void)incKeyPosition {
    swModule->increment(1);
}

- (void)decKeyPosition {
    swModule->decrement(1);
}

- (void)setKeyString:(NSString *)aKeyString {
    swModule->setKey([aKeyString UTF8String]);
}

- (void)setSwordKey:(SwordKey *)aKey {
    swModule->getKey()->setPersist(true);
    swModule->setKey([aKey swKey]);
}

- (SwordKey *)createKey {
    sword::SWKey *sk = swModule->createKey();
    SwordKey *newKey = [SwordKey swordKeyWithSWKey:sk makeCopy:YES];
    delete sk;
    
    return newKey;
}

- (SwordKey *)getKey {
    return [SwordKey swordKeyWithSWKey:swModule->getKey()];
}

- (SwordKey *)getKeyCopy {
    return [SwordKey swordKeyWithSWKey:swModule->getKey() makeCopy:YES];
}

#pragma mark - Module metadata processing

- (id)attributeValueForParsedLinkData:(NSDictionary *)data {
    return [self attributeValueForParsedLinkData:data withTextRenderType:TextTypeStripped];
}

- (id)attributeValueForParsedLinkData:(NSDictionary *)data withTextRenderType:(TextPullType)textType {
    id ret = nil;
    
    NSString *passage = data[ATTRTYPE_PASSAGE];
    if(passage) {
        passage = [[passage stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    } 
    NSString *attrType = data[ATTRTYPE_TYPE];
    if([attrType isEqualToString:@"n"]) {
        NSString *footnoteText = [self entryAttributeValueFootnoteOfType:attrType 
                                                              indexValue:data[ATTRTYPE_VALUE]
                                                                  forKey:[SwordKey swordKeyWithRef:passage]];
        ret = footnoteText;
    } else if([attrType isEqualToString:@"x"] || [attrType isEqualToString:@"scriptRef"] || [attrType isEqualToString:@"scripRef"]) {
        NSString *key = @"";
        if([attrType isEqualToString:@"x"]) {
            key = [self entryAttributeValueFootnoteOfType:attrType
                                               indexValue:data[ATTRTYPE_VALUE]
                                                   forKey:[SwordKey swordKeyWithRef:passage]];            
        } else {
            key = [[data[ATTRTYPE_VALUE] stringByReplacingOccurrencesOfString:@"+"
                                                                   withString:@" "] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        }
        if(textType == TextTypeRendered) {
            ret = [self renderedTextEntriesForRef:key];
        } else {
            ret = [self strippedTextEntriesForRef:key];
        }
    }
    
    return ret;
}

- (void)setProcessEntryAttributes:(BOOL)flag {
    swModule->setProcessEntryAttributes(flag);
}

- (BOOL)processEntryAttributes {
    return swModule->isProcessEntryAttributes();
}

- (NSString *)entryAttributeValuePreverse {
    NSString *ret = [NSString stringWithUTF8String:swModule->getEntryAttributes()["Heading"]["Preverse"]["0"].c_str()];
    
    return ret;
}

- (NSString *)entryAttributeValueFootnoteOfType:(NSString *)fnType indexValue:(NSString *)index {
    NSString *ret = @"";    
    if([fnType isEqualToString:@"x"]) {
        ret = [NSString stringWithUTF8String:swModule->getEntryAttributes()["Footnote"][[index UTF8String]]["refList"].c_str()];        
    } else if([fnType isEqualToString:@"n"]) {
        ret = [NSString stringWithUTF8String:swModule->getEntryAttributes()["Footnote"][[index UTF8String]]["body"].c_str()];
    }
    return ret;
}

- (NSArray *)entryAttributeValuesLemma {
    NSMutableArray *array = [NSMutableArray array];
    
    swModule->stripText(); // force processing of key, if it hasn't been done already
    
    // parse entry attributes and look for Lemma (Strong's numbers)
    sword::AttributeTypeList::iterator words;
    sword::AttributeList::iterator word;
    sword::AttributeValue::iterator strongVal;
    words = swModule->getEntryAttributes().find("Word");
    if(words != swModule->getEntryAttributes().end()) {
        for(word = words->second.begin();word != words->second.end(); word++) {
            strongVal = word->second.find("Lemma");
            if(strongVal != word->second.end()) {
                // pass empty "Text" entries
                if(strongVal->second == "G3588") {
                    if (word->second.find("Text") == word->second.end())
                        continue;	// no text? let's skip
                }
                NSMutableString *stringValStr = [NSMutableString stringWithUTF8String:(const char *)strongVal->second];
                if(stringValStr) {
                    [stringValStr replaceOccurrencesOfString:@"|x-Strongs:" withString:@" " options:0 range:NSMakeRange(0, [stringValStr length])];                    
                    [array addObject:stringValStr];
                }
            }
        }
    }
    return [NSArray arrayWithArray:array];
}

- (NSArray *)entryAttributeValuesLemmaNormalized {
    NSArray *lemmas = [self entryAttributeValuesLemma];
    // post process all codes and mormalize the number
    // Hebrew keys should have 5 number digits
    return [SwordUtil padStrongsNumbers:lemmas];
}

- (NSString *)entryAttributeValuePreverseForKey:(SwordKey *)aKey {
    [self.moduleLock lock];
    [self setSwordKey:aKey];
    swModule->renderText(); // force processing of key
    NSString *value = [self entryAttributeValuePreverse];
    [self.moduleLock unlock];
    return value;
}

- (NSString *)entryAttributeValueFootnoteOfType:(NSString *)fnType indexValue:(NSString *)index forKey:(SwordKey *)aKey {
    [self.moduleLock lock];
    [self setSwordKey:aKey];
    swModule->renderText(); // force processing of key
    NSString *value = [self entryAttributeValueFootnoteOfType:fnType indexValue:index];
    [self.moduleLock unlock];
    return value;
}


- (NSString *)description {
    return [self name];
}

#pragma mark - Module text access

- (NSString *)renderedText {
    NSString *ret = @"";
    ret = [NSString stringWithUTF8String:swModule->renderText()];
    if(!ret) {
        ret = [NSString stringWithCString:swModule->renderText() encoding:NSISOLatin1StringEncoding];
    }
    return ret;
}

- (NSString *)renderedTextFromString:(NSString *)aString {
    NSString *ret = @"";
    ret = [NSString stringWithUTF8String:swModule->renderText([aString UTF8String])];
    if(!ret) {
        ret = [NSString stringWithCString:swModule->renderText([aString UTF8String]) encoding:NSISOLatin1StringEncoding];
    }
    return ret;
}

- (NSString *)strippedText {
    NSString *ret = @"";
    ret = [NSString stringWithUTF8String:swModule->stripText()];
    if(!ret) {
        ret = [NSString stringWithCString:swModule->stripText() encoding:NSISOLatin1StringEncoding];
    }
    return ret;
}

- (NSString *)strippedTextFromString:(NSString *)aString {
    NSString *ret = @"";
    ret = [NSString stringWithUTF8String:swModule->renderText([aString UTF8String])];
    if(!ret) {
        ret = [NSString stringWithCString:swModule->renderText([aString UTF8String]) encoding:NSISOLatin1StringEncoding];
    }
    return ret;
}

- (NSArray *)strippedTextEntriesForRef:(NSString *)reference {
    return [self textEntriesForReference:reference textType:TextTypeStripped];
}

- (NSArray *)renderedTextEntriesForRef:(NSString *)reference {
    return [self textEntriesForReference:reference textType:TextTypeRendered];
}

- (NSArray *)textEntriesForReference:(NSString *)aReference textType:(TextPullType)textType {
    NSArray *ret = nil;
    
    SwordModuleTextEntry *entry = [self textEntryForKey:[SwordKey swordKeyWithRef:aReference]
                                               textType:textType];
    if(entry) {
        ret = @[entry];
    }
    
    return ret;
}

- (SwordModuleTextEntry *)renderedTextEntryForRef:(NSString *)reference {
    return [self textEntryForKeyString:reference textType:TextTypeRendered];
}

- (SwordModuleTextEntry *)strippedTextEntryForRef:(NSString *)reference {
    return [self textEntryForKeyString:reference textType:TextTypeStripped];
}

- (SwordModuleTextEntry *)textEntryForKeyString:(NSString *)aKeyString textType:(TextPullType)aType {
    return [self textEntryForKey:[SwordKey swordKeyWithRef:aKeyString] textType:aType];
}

- (SwordModuleTextEntry *)textEntryForKey:(SwordKey *)aKey textType:(TextPullType)aType {
    SwordModuleTextEntry *ret = nil;
    
    if(aKey) {
        [self.moduleLock lock];
        [self setSwordKey:aKey];
        if(![self error]) {
            NSString *txt = @"";
            if(aType == TextTypeRendered) {
                txt = [self renderedText];
            } else {
                txt = [self strippedText];
            }
            
            if(txt) {
                ret = [SwordModuleTextEntry textEntryForKey:[aKey keyText] andText:txt];
            } else {
                ALog(@"Nil key");
            }
        }
        [self.moduleLock unlock];
    }
    
    return ret;
}

- (void)writeEntry:(SwordModuleTextEntry *)anEntry {}

- (long)entryCount {
    return 0;
}

- (sword::SWModule *)swModule {
	return swModule;
}

@end

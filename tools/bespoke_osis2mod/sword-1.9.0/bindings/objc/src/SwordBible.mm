/*	SwordBible.mm - Sword API wrapper for Biblical Texts.

    Copyright 2008 Manfred Bergmann
    Based on code by Will Thimbleby

	This program is free software; you can redistribute it and/or modify it under the terms of the
	GNU General Public License as published by the Free Software Foundation version 2.

	This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
	even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	General Public License for more details. (http://www.gnu.org/licenses/gpl.html)
*/

#import <ObjCSword/ObjCSword.h>

using sword::AttributeTypeList;
using sword::AttributeList;
using sword::AttributeValue;

@interface SwordBible ()

- (NSDictionary *)buildBookList;
- (BOOL)containsBookNumber:(int)aBookNum;
- (NSArray *)textEntriesForReference:(NSString *)aReference context:(int)context textType:(TextPullType)textType;

@end

@implementation SwordBible

@dynamic books;

#pragma mark - class methods

NSLock *bibleLock = nil;

// changes an abbreviated reference into a full
// eg. Dan4:5-7 => Daniel4:5
+ (void)decodeRef:(NSString *)ref intoBook:(NSString **)bookName book:(int *)book chapter:(int *)chapter verse:(int *)verse {
    
	if(!bibleLock) bibleLock = [[NSLock alloc] init];
	[bibleLock lock];
	
    SwordVerseKey *key = [SwordVerseKey verseKeyWithRef:ref];

    if(bookName != NULL) {
        *bookName = [key bookName];        
    }
    if(book != NULL) {
        *book = [key book];        
    }
    if(chapter != NULL) {
        *chapter = [key chapter];        
    }
    if(verse != NULL) {
        *verse = [key verse];
    }
    
	[bibleLock unlock];
}

+ (NSString *)firstRefName:(NSString *)abbr {
	if(!bibleLock) bibleLock = [[NSLock alloc] init];
	[bibleLock lock];
	
	sword::VerseKey vk([abbr UTF8String]);
	NSString *result = [NSString stringWithUTF8String:vk];
    
	[bibleLock unlock];
	
	return result;
}

+ (NSString *)context:(NSString *)abbr {

	//get parsed simple ref
	NSString *first = [SwordBible firstRefName:abbr];
	NSArray *firstBits = [first componentsSeparatedByString:@":"];
	
	//if abbr contains : or . then we are a verse so return a chapter
	if([abbr rangeOfString:@":"].location != NSNotFound || [abbr rangeOfString:@"."].location != NSNotFound) {
		return firstBits[0];
    }
	
	//otherwise return a book
	firstBits = [first componentsSeparatedByString:@" "];
	
	if([firstBits count] > 0) {
		return firstBits[0];
    }
	
	return abbr;
}

/**
 get book index for verseKey
 that is: book number + testament * 100
 */
+ (int)bookIndexForSWKey:(sword::VerseKey *)key {
    return key->getBookMax() + key->getTestamentMax() * 100;
}

#pragma mark - Initializers

- (id)initWithSWModule:(sword::SWModule *)aModule swordManager:(SwordManager *)aManager {
    self = [super initWithSWModule:aModule];
    if(self) {
        [self setBooks:nil];    
    }
    
    return self;
}



#pragma mark - Bible information

- (NSDictionary *)buildBookList {
    sword::VersificationMgr *vmgr = sword::VersificationMgr::getSystemVersificationMgr();
    const sword::VersificationMgr::System *system = vmgr->getVersificationSystem([[self versification] UTF8String]);

    NSMutableDictionary *buf = [NSMutableDictionary dictionary];
    int bookCount = system->getBookCount();
    for(int i = 0;i < bookCount;i++) {
        sword::VersificationMgr::Book *book = (sword::VersificationMgr::Book *)system->getBook(i);
        
        SwordBibleBook *bb = [[SwordBibleBook alloc] initWithBook:book];
        [bb setNumber:i+1];
        
        NSString *bookName = [bb name];
        buf[bookName] = bb;
    }
    return [NSDictionary dictionaryWithDictionary:buf];
}

- (BOOL)containsBookNumber:(int)aBookNum {
    for(SwordBibleBook *bb in [self books]) {
        if([bb number] == aBookNum) {
            return YES;
        }
    }
    return NO;
}

- (NSDictionary *)books {
    if(_books == nil) {
        _books = [self buildBookList];
    }
    return _books;
}

- (void)setBooks:(NSDictionary *)aBooks {
    _books = aBooks;
}

- (NSArray *)bookList {
    NSDictionary *b = [self books];
    NSArray *bl = [[b allValues] sortedArrayUsingSelector:@selector(compare:)];
    return bl;
}

- (BOOL)hasReference:(NSString *)ref {
	[self.moduleLock lock];
	
	sword::VerseKey	*key = (sword::VerseKey *)(swModule->createKey());
	(*key) = [ref UTF8String];
    NSString *bookName = [NSString stringWithUTF8String:key->getBookName()];
    int chapter = key->getChapterMax();
    int verse = key->getVerseMax();
    
    SwordBibleBook *bb = [self books][bookName];
    if(bb) {
        if(chapter > 0 && chapter < [bb numberOfChapters]) {
            if(verse > 0 && verse < [bb numberOfVersesForChapter:chapter]) {
                return YES;
            }
        }
    }    
    
	[self.moduleLock unlock];
	
	return NO;
}

- (int)numberOfVerseKeysForReference:(NSString *)aReference {
    int ret = 0;
    
    if(aReference && [aReference length] > 0) {
        sword::VerseKey vk;
        sword::ListKey listKey = vk.parseVerseList([aReference UTF8String], "Gen1", true);
        // unfortunately there is no other way then loop though all verses to know how many
        for(listKey = sword::TOP; !listKey.popError(); listKey++) ret++;
    }
    
    return ret;
}

- (int)chaptersForBookName:(NSString *)bookName {
    SwordBibleBook *book = [self bookForName:bookName];
    if(book != nil) {
        return [book numberOfChapters];
    }
	return -1;
}

- (int)versesForChapter:(int)chapter bookName:(NSString *)bookName {
    int ret = -1;
    
    SwordBibleBook *bb = [self books][bookName];
    if(bb) {
        ret = [bb numberOfVersesForChapter:chapter];
    }
	return ret;
}

- (int)versesForBible {
    int ret = 0;

    for(SwordBibleBook *bb in [self books]) {
        int chapters = [bb numberOfChapters];
        int verses = 0;
        for(int j = 1;j <= chapters;j++) {
            verses += [bb numberOfVersesForChapter:j];
        }
        ret += verses;
    }
    
    return ret;
}

- (SwordBibleBook *)bookForName:(NSString *)bookName {
    for(SwordBibleBook *book in [[self books] allValues]) {
        if([[book localizedName] isEqualToString:bookName] || [[book name] isEqualToString:bookName]) {
            return book;
        }
    }
    return nil;
}

- (SwordBibleBook *)bookWithNamePrefix:(NSString *)aPrefix {
    for(SwordBibleBook *book in [[self books] allValues]) {
        if([[book localizedName] hasPrefix:aPrefix] || [[book name] hasPrefix:aPrefix]) {
            return book;
        }
    }
    return nil;
}

- (NSString *)moduleIntroduction {
    NSString *ret;
    
    [self.moduleLock lock];

    // save key
    SwordVerseKey *save = (SwordVerseKey *)[self getKeyCopy];
    
    SwordVerseKey *key = [SwordVerseKey verseKeyWithVersification:[self versification]];
    [key setHeadings:YES];
    [key setTestament:0];
    [self setSwordKey:key];
    ret = [self renderedText];
    
    // restore old key
    [self setSwordKey:save];
    
    [self.moduleLock unlock];

    return ret;
}

- (NSString *)bookIntroductionFor:(SwordBibleBook *)aBook {
    NSString *ret;
    
    [self.moduleLock lock];

    // save key
    SwordVerseKey *save = (SwordVerseKey *)[self getKeyCopy];

    SwordVerseKey *key = [SwordVerseKey verseKeyWithVersification:[self versification]];
    [key setHeadings:YES];
    [key setTestament:(char) [aBook testament]];
    [key setBook:(char) [aBook numberInTestament]];
    [self setSwordKey:key];
    ret = [self renderedText];
    
    // restore old key
    [self setSwordKey:save];

    [self.moduleLock unlock];

    return ret;
}

- (NSString *)chapterIntroductionIn:(SwordBibleBook *)aBook forChapter:(int)chapter {
    NSString *ret;

    [self.moduleLock lock];

    // save key
    SwordVerseKey *save = (SwordVerseKey *)[self getKeyCopy];

    SwordVerseKey *key = [SwordVerseKey verseKeyWithVersification:[self versification]];
    [key setHeadings:YES];
    [key setTestament:(char) [aBook testament]];
    [key setBook:(char) [aBook numberInTestament]];
    [key setChapter:chapter];
    [self setSwordKey:key];
    ret = [self renderedText];
    
    // restore old key
    [self setSwordKey:save];

    [self.moduleLock unlock];

    return ret;    
}

- (SwordModuleTextEntry *)textEntryForKey:(SwordKey *)aKey textType:(TextPullType)aType {
    SwordBibleTextEntry *ret = nil;
    
    if(aKey) {
        [self.moduleLock lock];
        [self setSwordKey:aKey];
        if(![self error]) {
            NSString *txt;
            if(aType == TextTypeRendered) {
                txt = [self renderedText];
            } else {
                txt = [self strippedText];
            }
            
            if(txt) {
                ret = [SwordBibleTextEntry textEntryForKey:[aKey keyText] andText:txt];
            } else {
                ALog(@"nil key");
            }

            if([self.swManager globalOption:SW_OPTION_HEADINGS] && [self hasFeature:SWMOD_FEATURE_HEADINGS]) {
                NSString *preverseHeading = [self entryAttributeValuePreverse];
                if(preverseHeading && [preverseHeading length] > 0) {
                    [ret setPreVerseHeading:preverseHeading];
                }
            }        
        }
        [self.moduleLock unlock];
    }
    
    return ret;
}

- (NSString *)versification {
    NSString *versification = self.configEntries[SWMOD_CONFENTRY_VERSIFICATION];
    if(versification == nil) {
        versification = [self configFileEntryForConfigKey:SWMOD_CONFENTRY_VERSIFICATION];
        if(versification != nil) {
            self.configEntries[SWMOD_CONFENTRY_VERSIFICATION] = versification;
        }
    }
    
    // if still nil, use KJV versification
    if(versification == nil) {
        versification = @"KJV";
        self.configEntries[SWMOD_CONFENTRY_VERSIFICATION] = versification;
    }
    
    return versification;    
}

#pragma mark - SwordModuleAccess

- (SwordKey *)createKey {
    sword::VerseKey *vk = (sword::VerseKey *)swModule->createKey();
    SwordVerseKey *newKey = [SwordVerseKey verseKeyWithSWVerseKey:vk makeCopy:YES];
    delete vk;
    
    return newKey;
}

- (SwordKey *)getKey {
    return [SwordVerseKey verseKeyWithSWVerseKey:(sword::VerseKey *)swModule->getKey()];
}

- (SwordKey *)getKeyCopy {
    return [SwordVerseKey verseKeyWithSWVerseKey:(sword::VerseKey *)swModule->getKey() makeCopy:YES];
}

- (long)entryCount {
    swModule->setPosition(sword::TOP);
    long verseLowIndex = swModule->getIndex();
    swModule->setPosition(sword::BOTTOM);
    long verseHighIndex = swModule->getIndex();
    
    return verseHighIndex - verseLowIndex;
}

- (NSArray *)strippedTextEntriesForRef:(NSString *)reference {
    return [self strippedTextEntriesForRef:reference context:0];
}

- (NSArray *)strippedTextEntriesForRef:(NSString *)reference context:(int)context {
    return [self textEntriesForReference:reference context:context textType:TextTypeStripped];
}

- (NSArray *)renderedTextEntriesForRef:(NSString *)reference {
    return [self renderedTextEntriesForRef:reference context:0];
}

- (NSArray *)renderedTextEntriesForRef:(NSString *)reference context:(int)context {
    return [self textEntriesForReference:reference context:context textType:TextTypeRendered];
}

- (NSArray *)textEntriesForReference:(NSString *)aReference textType:(TextPullType)textType {
    return [self textEntriesForReference:aReference context:0 textType:textType];
}

- (NSArray *)textEntriesForReference:(NSString *)aReference context:(int)context textType:(TextPullType)textType {
    NSMutableArray *ret = [NSMutableArray array];
    
    SwordListKey *lk = [SwordListKey listKeyWithRef:aReference v11n:[self versification]];
    [lk setPosition:SWPOS_TOP];
    SwordVerseKey *vk = [SwordVerseKey verseKeyWithRef:[lk keyText] v11n:[self versification]];
    while(![lk error]) {
        // set current key to vk
        [vk setKeyText:[lk keyText]];
        if(context != 0) {
            long lowVerse = [vk verse] - context;
            long highVerse = lowVerse + (context * 2);
            for(;lowVerse <= highVerse;lowVerse++) {
                [vk setVerse:lowVerse];
                SwordBibleTextEntry *entry = (SwordBibleTextEntry *) [self textEntryForKey:vk textType:textType];
                if(entry) {
                    [ret addObject:entry];
                }
                [vk increment];
            }
        } else {
            SwordBibleTextEntry *entry = (SwordBibleTextEntry *) [self textEntryForKey:vk textType:textType];
            if(entry) {
                [ret addObject:entry];
            }            
        }
        [lk increment];
    }
    
    return ret;    
}

- (void)writeEntry:(SwordModuleTextEntry *)anEntry {
	
    const char *data = [[anEntry text] UTF8String];
    size_t dLen = strlen(data);

	[self.moduleLock lock];
    [self setKeyString:[anEntry key]];
    if(![self error]) {
        swModule->setEntry(data, dLen);	// save text to module at current position    
    } else {
        ALog(@"error at positioning module!");
    }
	[self.moduleLock unlock];
}

@end

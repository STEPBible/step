/*	SwordDict.mm - Sword API wrapper for lexicons and Dictionaries.

    Copyright 2008 Manfred Bergmann
    Based on code by Will Thimbleby

	This program is free software; you can redistribute it and/or modify it under the terms of the
	GNU General Public License as published by the Free Software Foundation version 2.

	This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
	even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	General Public License for more details. (http://www.gnu.org/licenses/gpl.html)
*/

#import <ObjCSword/ObjCSword.h>

@interface SwordDictionary (/* Private, class continuation */)
/** private property */
@property(readwrite, strong) NSMutableArray *keys;
@end

@interface SwordDictionary (PrivateAPI)

- (void)readKeys;
- (void)readFromCache;
- (void)writeToCache;

@end

@implementation SwordDictionary (PrivateAPI)

/**
 only the keys are stored here in an array
 */
- (void)readKeys {    
	if(keys == nil) {
        [self readFromCache];
    }
    
    // still no entries?
	if([keys count] == 0) {
        NSMutableArray *arr = [NSMutableArray array];

        [self.moduleLock lock];
        
        swModule->setSkipConsecutiveLinks(true);
        *swModule = sword::TOP;
        swModule->getRawEntry();        
        while(![self error]) {
            char *cStrKeyText = (char *)swModule->getKeyText();
            if(cStrKeyText) {
                NSString *keyText = [NSString stringWithUTF8String:cStrKeyText];
                if(!keyText) {
                    keyText = [NSString stringWithCString:swModule->getKeyText() encoding:NSISOLatin1StringEncoding];
                    if(!keyText) {
                        ALog(@"Unable to create NSString instance from string: %s", cStrKeyText);
                    }
                }
                
                if(keyText) {
                    [arr addObject:[keyText capitalizedString]];
                }
            } else {
                ALog(@"Could not get keytext from sword module!");                
            }
            
            (*swModule)++;
        }

        [self.moduleLock unlock];
        
        self.keys = arr;        
        [self writeToCache];
    }
}

- (void)readFromCache {
	//open cached file
    NSString *cachePath = [[[Configuration config] defaultAppSupportPath] stringByAppendingPathComponent:[NSString stringWithFormat:@"cache-%@", [self name]]];
	NSMutableArray *data = [NSMutableArray arrayWithContentsOfFile:cachePath];
    if(data != nil) {
        self.keys = data;
    } else {
        self.keys = [NSMutableArray array];
    }
}

- (void)writeToCache {
	// save cached file
    NSString *cachePath = [[[Configuration config] defaultAppSupportPath] stringByAppendingPathComponent:[NSString stringWithFormat:@"cache-%@", [self name]]];
	[keys writeToFile:cachePath atomically:NO];
}

@end

@implementation SwordDictionary

@synthesize keys;

/** init with given SWModule */
- (id)initWithSWModule:(sword::SWModule *)aModule swordManager:(SwordManager *)aManager {
    self = [super initWithSWModule:aModule];
    if(self) {
        self.keys = nil;
    }
    
    return self;
}



- (NSArray *)allKeys {
    NSArray *ret = self.keys;
    if(ret == nil) {
        [self readKeys];
        ret = self.keys;
    }
	return ret;    
}

/**
 returns stripped text for key.
 nil if the key does not exist.
 */
- (NSString *)entryForKey:(NSString *)aKey {
    NSString *ret = nil;
    
	[self.moduleLock lock];
    [self setKeyString:aKey];    
	if([self error]) {
        ALog(@"Error on setting key!");
    } else {
        ret = [self strippedText];
    }
	[self.moduleLock unlock];
	
	return ret;
}

- (id)attributeValueForParsedLinkData:(NSDictionary *)data {
    return [self attributeValueForParsedLinkData:data withTextRenderType:TextTypeStripped];
}

- (id)attributeValueForParsedLinkData:(NSDictionary *)data withTextRenderType:(TextPullType)textType {
    id ret = nil;
    
    NSString *attrType = data[ATTRTYPE_TYPE];
    if([attrType isEqualToString:@"scriptRef"] || 
       [attrType isEqualToString:@"scripRef"] ||
       [attrType isEqualToString:@"Greek"] ||
       [attrType isEqualToString:@"Hebrew"] ||
       [attrType hasPrefix:@"strongMorph"] || [attrType hasPrefix:@"robinson"]) {
        NSString *key = data[ATTRTYPE_VALUE];
        ret = [self strippedTextEntriesForRef:key];
    }
    
    return ret;
}

#pragma mark - SwordModuleAccess


- (long)entryCount {
    return [[self allKeys] count];    
}

@end

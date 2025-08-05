/*	SwordBook.mm - Sword API wrapper for GenBooks.

    Copyright 2008 Manfred Bergmann
    Based on code by Will Thimbleby

	This program is free software; you can redistribute it and/or modify it under the terms of the
	GNU General Public License as published by the Free Software Foundation version 2.

	This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
	even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	General Public License for more details. (http://www.gnu.org/licenses/gpl.html)
*/

#import "SwordBook.h"
#import "SwordModuleTreeEntry.h"

@interface SwordBook ()

- (SwordModuleTreeEntry *)_treeEntryForKey:(sword::TreeKeyIdx *)treeKey;

@end

@implementation SwordBook

@synthesize contents;

- (id)initWithSWModule:(sword::SWModule *)aModule swordManager:(SwordManager *)aManager {
    self = [super initWithSWModule:aModule];
    if(self) {
        [self setContents:[NSMutableDictionary dictionary]];
    }
    
    return self;
}

- (SwordModuleTreeEntry *)treeEntryForKey:(NSString *)treeKey {
    SwordModuleTreeEntry * ret;
    
    [self.moduleLock lock];
    if(treeKey == nil) {
        ret = contents[@"root"];
        if(ret == nil) {
            sword::TreeKeyIdx *tk = dynamic_cast<sword::TreeKeyIdx*>((sword::SWKey *)*(swModule));
            ret = [self _treeEntryForKey:tk];
            // add to content
            contents[@"root"] = ret;
        }
    } else {
        ret = contents[treeKey];
        if(ret == nil) {
            const char *keyStr = [treeKey UTF8String];
            if(![self isUnicode]) {
                keyStr = [treeKey cStringUsingEncoding:NSISOLatin1StringEncoding];
            }
            // position module
            sword::SWKey *mkey = new sword::SWKey(keyStr);
            swModule->setKey(mkey);
            sword::TreeKeyIdx *key = dynamic_cast<sword::TreeKeyIdx*>((sword::SWKey *)*(swModule));
            ret = [self _treeEntryForKey:key];
            // add to content
            contents[treeKey] = ret;
        }
    }
    [self.moduleLock unlock];
    
    return ret;
}

- (SwordModuleTreeEntry *)_treeEntryForKey:(sword::TreeKeyIdx *)treeKey {
    SwordModuleTreeEntry *ret = [[SwordModuleTreeEntry alloc] init];
    
	char *treeNodeName = (char *)treeKey->getText();
	NSString *nName;
    
    if(strlen(treeNodeName) == 0) {
        nName = @"root";
    } else {    
        // key encoding depends on module encoding
        nName = [NSString stringWithUTF8String:treeNodeName];
        if(!nName) {
            nName = [NSString stringWithCString:treeNodeName encoding:NSISOLatin1StringEncoding];
        }
    }
    // set name
    [ret setKey:nName];
    NSMutableArray *c = [NSMutableArray array];
    [ret setContent:c];
	
    // if this node has children, walk them
	if(treeKey->hasChildren()) {
        // get first child
		treeKey->firstChild();
        do {
            NSString *subName;
            // key encoding depends on module encoding
            const char *textStr = treeKey->getText();
            subName = [NSString stringWithUTF8String:textStr];
            if(!subName) {
                subName = [NSString stringWithCString:textStr encoding:NSISOLatin1StringEncoding];
            }
            if(subName) {
                [c addObject:subName];
            }
        }
        while(treeKey->nextSibling());            
	}
	
	return ret;
}

- (void)testLoop {
    SwordModuleTreeEntry *entry = [self treeEntryForKey:nil];
    if([[entry content] count] > 0) {
        for(NSString *subKey in [entry content]) {
            entry = [self treeEntryForKey:subKey];
            if([[entry content] count] > 0) {
            } else {
                DLog(@"Entry: %@", [entry key]);
            }    
        }
    } else {
        DLog(@"Entry: %@", [entry key]);
    }    
}

#pragma mark - SwordModuleAccess

- (long)entryCount {
    // TODO: set value according to maximum entries here
    return 1000;
}

@end

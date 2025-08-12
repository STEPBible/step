//
//  SwordModuleTest.m
//  MacSword2
//
//  Created by Manfred Bergmann on 14.12.08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

#import "ObjCSword/ObjCSword.h"
#import "SwordModuleLongRunTest.h"
#import "SwordModule+Index.h"

@implementation SwordModuleLongRunTest

- (void)setUp {
    [Configuration configWithImpl:[[OSXConfiguration alloc] init]];
    mod = [[SwordManager defaultManager] moduleWithName:@"GerNeUe"];
}

- (void)testCreateSearchIndex {
    SwordModule *sm = [[SwordManager defaultManager] moduleWithName:@"GerSch"];
    XCTAssertNotNil(sm, @"Module is nil");
    
    NSLog(@"creating clucene search index...");
    [sm createSearchIndex];
    NSLog(@"creating clucene search index...done");
}


- (void)testRenderedTextEntriesForRef {
    NSArray *entries = [(SwordBible *)mod renderedTextEntriesForRef:@"gen1-rev22"];
    NSString *ref = nil;
    NSString *rendered = nil;
    for(SwordBibleTextEntry *entry in entries) {
        ref = [entry key];
        rendered = [entry text];
    }
}

- (void)testRenderedWithEnumerator {
    SwordListKey *lk = [SwordListKey listKeyWithRef:@"gen1-rev22"];
    NSString *ref = nil;
    NSString *rendered = nil;
    VerseEnumerator *iter = [lk verseEnumerator];
    while((ref = [iter nextObject])) {
        [(SwordBible *)mod setKeyString:ref];
        rendered = [mod renderedText];
    }
}

- (void)testCommentarySkipLinksPersist {
    SwordModule *com = [[SwordManager defaultManager] moduleWithName:@"MHC"];
    
    SwordListKey *lk = [SwordListKey listKeyWithRef:@"gen 1:1-2"];
    [lk setPersist:YES];
    [com setSwordKey:lk];
    NSString *ref = nil;
    NSString *rendered = nil;
    int count = 0;
    while(![com error]) {
        ref = [lk keyText];
        rendered = [com renderedText];
        NSLog(@"%@:%@", ref, rendered);
        [com incKeyPosition];
        count++;
    }
    XCTAssertTrue((count == 1), @"");
}

- (void)testCommentarySkipLinksNoPersist {
    SwordModule *com = [[SwordManager defaultManager] moduleWithName:@"MHC"];
    
    SwordListKey *lk = [SwordListKey listKeyWithRef:@"gen 1:1-2"];
    [lk setPersist:NO];
    [lk setPosition:SWPOS_TOP];
    NSString *ref = nil;
    NSString *rendered = nil;
    int count = 0;
    while(![lk error]) {
        ref = [lk keyText];
        [com setSwordKey:lk];
        rendered = [com renderedText];
        NSLog(@"%@:%@", ref, rendered);
        [lk increment];
        count++;
    }
    XCTAssertTrue((count == 1), @"");
}

@end

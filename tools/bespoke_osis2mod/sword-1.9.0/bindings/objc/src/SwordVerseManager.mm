//
//  SwordVerseManager.m
//  MacSword2
//
//  Created by Manfred Bergmann on 19.03.09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import "SwordVerseManager.h"
#import "SwordBibleBook.h"


@interface SwordVerseManager ()

@property (strong, readwrite) NSMutableDictionary *booksPerVersification;

@end

@implementation SwordVerseManager

@synthesize booksPerVersification;

+ (SwordVerseManager *)defaultManager {
    static SwordVerseManager *singleton = nil;
    if(!singleton) {
        singleton = [[SwordVerseManager alloc] init];
    }
    
    return singleton;
}

- (id)init {
    self = [super init];
    if(self) {
        self.booksPerVersification = [NSMutableDictionary dictionary];
        verseMgr = sword::VersificationMgr::getSystemVersificationMgr();
    }
    
    return self;
}



/** convenience method that returns the books for default scheme (KJV) */
- (NSArray *)books {
    return [self booksForVersification:SW_VERSIFICATION_KJV];
}

/** books for a versification scheme */
- (NSArray *)booksForVersification:(NSString *)verseScheme {
    NSArray *ret = booksPerVersification[verseScheme];
    if(ret == nil) {
        // hasn't been initialized yet
        const sword::VersificationMgr::System *system = verseMgr->getVersificationSystem([verseScheme UTF8String]);
        NSUInteger bookCount = (NSUInteger)system->getBookCount();
        NSMutableArray *buf = [NSMutableArray arrayWithCapacity:bookCount];
        for(int i = 0;i < bookCount;i++) {
            sword::VersificationMgr::Book *book = (sword::VersificationMgr::Book *)system->getBook(i);
            
            SwordBibleBook *bb = [[SwordBibleBook alloc] initWithBook:book];
            [bb setNumber:i+1]; // VerseKey-Book() starts at index 1
            
            // add to array
            [buf addObject:bb];
        }
        booksPerVersification[verseScheme] = buf;
        ret = buf;
    }
    
    return ret;
}

- (sword::VersificationMgr *)verseMgr {
    return verseMgr;
}

@end

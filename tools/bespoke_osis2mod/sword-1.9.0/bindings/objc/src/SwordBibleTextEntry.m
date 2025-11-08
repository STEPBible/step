//
//  SwordBibleTextEntry.m
//  MacSword2
//
//  Created by Manfred Bergmann on 01.02.10.
//  Copyright 2010 Software by MABE. All rights reserved.
//

#import "SwordBibleTextEntry.h"

@implementation SwordBibleTextEntry

@synthesize preVerseHeading;

+ (id)textEntryForKey:(NSString *)aKey andText:(NSString *)aText {
    return [[SwordBibleTextEntry alloc] initWithKey:aKey andText:aText];
}

- (id)initWithKey:(NSString *)aKey andText:(NSString *)aText {
    self = [super init];
    if(self) {
        self.key = aKey;
        self.text = aText;
        self.preVerseHeading = @"";
    }    
    return self;
}



@end

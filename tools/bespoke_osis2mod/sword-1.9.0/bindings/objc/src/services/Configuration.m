//
//  Configuration.m
//  ObjCSword
//
//  Created by Manfred Bergmann on 13.06.10.
//  Copyright 2010 Software by MABE. All rights reserved.
//

#import "Configuration.h"

@implementation Configuration

+ (Configuration *)config {
    static Configuration *instance = nil;
    if(instance == nil) {
        instance = [[Configuration alloc] init];
    }
    return instance;
}

+ (Configuration *)configWithImpl:(id<Configuration>)configImpl {
    [[Configuration config] setImpl:configImpl];
    return [Configuration config];
}

- (id)init {
    return [super init];
}



- (void)setImpl:(id<Configuration>)configImpl {
    impl = (Configuration *)configImpl;
}

#pragma mark Configuration implementation

- (NSString *)osVersion {return [impl osVersion];}
- (NSString *)bundleVersion {return [impl bundleVersion];}
- (NSString *)defaultModulePath {return [impl defaultModulePath];}
- (NSString *)defaultAppSupportPath {return [impl defaultAppSupportPath];}
- (NSString *)tempFolder {return [impl tempFolder];}
- (NSString *)logFile {return [impl logFile];}

@end

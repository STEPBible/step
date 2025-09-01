//
//  iOSConfiguration.h
//  ObjCSword-iOS
//
//  Created by Manfred Bergmann on 10.03.11.
//  Copyright 2011 Software by MABE. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#import "Configuration.h"


@interface iOSConfiguration : Configuration <Configuration> {
}

- (NSString *)osVersion;
- (NSString *)bundleVersion;
- (NSString *)defaultModulePath;
- (NSString *)defaultAppSupportPath;
- (NSString *)tempFolder;
- (NSString *)logFile;

@end

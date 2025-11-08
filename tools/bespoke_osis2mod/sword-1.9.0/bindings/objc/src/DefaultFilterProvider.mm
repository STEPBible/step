//
// Created by mbergmann on 18.12.12.
//
//


#import "DefaultFilterProvider.h"

@implementation DefaultFilterProvider

- (SwordFilter *)newOsisRenderFilter {
//    return [SwordOsisXHtmlFilter filter];
    return [SwordOsisHtmlRefFilter filter];
}

- (SwordFilter *)newOsisPlainFilter {
    return [SwordOsisPlainFilter filter];
}

- (SwordFilter *)newGbfRenderFilter {
    return [SwordGbfHtmlFilter filter];
}

- (SwordFilter *)newGbfPlainFilter {
    return [SwordGbfPlainFilter filter];
}

- (SwordFilter *)newThmlRenderFilter {
    return [SwordThmlHtmlFilter filter];
}

- (SwordFilter *)newThmlPlainFilter {
    return [SwordThmlPlainFilter filter];
}

- (SwordFilter *)newTeiRenderFilter {
    return [SwordTeiHtmlFilter filter];
}

- (SwordFilter *)newTeiPlainFilter {
    return [SwordTeiPlainFilter filter];
}

@end
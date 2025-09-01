%{
#include "swsearchable.h"
%}

%ignore sword::SWSearchable::search;
%ignore sword::SWSearchable::createSearchFramework;
%ignore sword::SWSearchable::nullPercent;

%include "swsearchable.h"

%extend sword::SWSearchable {
        bool isSearchSupported(const char *istr, int searchType = 0,
                                  int flags = 0,
                SWKey * scope = 0) {
                bool checksupported = true;
                self->search(istr, searchType, flags, scope, &checksupported);
                return checksupported;
        }

        ListKey &doSearch(const char *istr, int searchType = 0, int flags = 0,
                          SWKey *scope = 0) {
                return self->search(istr, searchType, flags, scope);
        }
};


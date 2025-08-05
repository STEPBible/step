%{
#include <swfiltermgr.h>
%}

%ignore sword::SWFilterMgr::AddGlobalOptions;
%ignore sword::SWFilterMgr::AddLocalOptions;
%ignore sword::SWFilterMgr::AddEncodingFilters;
%ignore sword::SWFilterMgr::AddRenderFilters;
%ignore sword::SWFilterMgr::AddStripFilters;
%ignore sword::SWFilterMgr::AddRawFilters;

%include "swfiltermgr.h"

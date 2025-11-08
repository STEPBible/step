%{
#include "encfiltmgr.h"
%}

%include "encfiltmgr.h"

%extend sword::EncodingFilterMgr {
	static sword::EncodingFilterMgr *castTo(sword::SWFilterMgr *o) {
		return dynamic_cast<sword::EncodingFilterMgr*>(o);
	}
}
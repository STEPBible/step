%{
#include "rawld4.h"
%}

%include "rawld4.h"

%extend sword::RawLD4 {
	static sword::RawLD4 *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::RawLD4*>(o);
	}

}

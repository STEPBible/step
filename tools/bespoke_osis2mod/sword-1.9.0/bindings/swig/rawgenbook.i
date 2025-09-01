%{
#include "rawgenbook.h"
%}

%include "rawgenbook.h"

%extend sword::RawGenBook {
	static sword::RawGenBook *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::RawGenBook*>(o);
	}
	
}

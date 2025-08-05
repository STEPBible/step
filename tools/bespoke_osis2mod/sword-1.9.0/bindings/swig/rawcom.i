%{
#include "rawcom.h"
%}


%include "rawcom.h"



%extend sword::RawCom {
	static sword::RawCom *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::RawCom*>(o);
	}
}

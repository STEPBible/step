%{
#include <zipcomprs.h>
%}

%include "zipcomprs.h"

%extend sword::ZipCompress {
	static sword::ZipCompress *castTo(sword::SWCompress *o) {
		return dynamic_cast<sword::ZipCompress*>(o);
	}
}
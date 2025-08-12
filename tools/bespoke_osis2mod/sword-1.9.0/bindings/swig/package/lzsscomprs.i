%{
#include <lzsscomprs.h>
%}

%include "lzsscomprs.h"

%extend sword::LZSSCompress {
	static sword::LZSSCompress *castTo(sword::SWCompress *o) {
		return dynamic_cast<sword::LZSSCompress*>(o);
	}
}
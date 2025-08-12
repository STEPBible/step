#include <swmodule.h>
#include <swkey.h>
#include <listkey.h>

using namespace sword;
class SWSearcher{
public:
	sword::SWModule* mod;
	int percent;

	static void Callback(char status, void *me){
		SWSearcher* searcher = (SWSearcher*)me;
		searcher->PercentFunction((int) status);
	}

	virtual void PercentFunction(int value){
		percent=value;
	}
	
	SWSearcher(sword::SWModule* Mod){mod=Mod;}
	virtual ~SWSearcher(){}

	int GetPercent(){return percent;}

	bool isSearchSupported(const char *istr, int searchType = 0,
							  int flags = 0,
			SWKey * scope = 0) {
			bool checksupported = true;
			mod->search(istr, searchType, flags, scope, &checksupported);
			return checksupported;
	}

	ListKey &doSearch(const char *istr, int searchType = 0, int flags = 0,
					  SWKey *scope = 0) {
			return mod->search(istr, searchType, flags, scope,
				   0, this->Callback, (void *) this);
	}

	void TerminateSearch(){
		mod->terminateSearch=true;
	}
};


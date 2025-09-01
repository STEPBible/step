#include <swmodule.h>
#include <swmgr.h>
#include <iostream>
#include <stdio.h>

using namespace sword;
using namespace std;

int main(int argc, char **argv) {

	if (argc < 2) {
		fprintf(stderr, "usage: %s <lexdict_name>\n", *argv);
		exit(-1);
	}

	SWMgr library;
	SWModule *module = library.getModule(argv[1]);
	if (!module) {
		cerr << "\nCouldn't find module: " << argv[1] << "\n" << endl;
		exit(-2);
	}
	int i = 0;
	for ((*module) = TOP; !module->popError(); module->increment()) {
		cout << module->getKeyText() << ": " << module->stripText() << "\n";
		if (++i > 10) {
			cout << "ERROR: more than 10 iterations. stopping.\n";
			break;
		}

	}
	return 0;
}

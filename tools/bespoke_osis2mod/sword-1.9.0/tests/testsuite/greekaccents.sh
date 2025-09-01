#/bin/sh

# there is an iteration value as the last parameter and can be used
# for testing speed. Set to 999999 my results on my Dell Precision 5510
# real	0m8.952s
# user	0m8.939s
# sys	0m0.004s
../utf8norm -ga 999 < greekaccents.txt

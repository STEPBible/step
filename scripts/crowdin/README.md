# Description
## Purpose
To be ran in 

## What it does
Executes process to:
1) Download zip file from Crowdin with translation files for all languages
2) Unzip crowdin file 
3) Rename files to match expected filenames for our STEP Bible process


# Instructions
## 1) Setup env
### 1a) Acquire API Key
See here to learn more: https://support.crowdin.com/enterprise/account-settings/#access-tokens

Basically you just need to sign in and create a token. I named mine "STEP-Bible"
- https://crowdin.com/settings#api-key
    
#### Required Permissions for your API Token: 
I created a token with read-only access to the following (probably more than I needed):
- `Projects (List, Get, Create, Edit)`
- `Translation Status` (probably not needed)

AND read AND write access to the following: 
- `Translations` (needed, so can execute a `build` on the translations)

This is the token you'll use in step `1b` below. 

### 1b) Set Env Vars


#### OPTION #1: Set directly in your terminal

```
export CROWDIN_API_TOKEN=<your API token from previous step>
```

NOTE: Make sure you know what you're doing with this one, since if you don't set it in the right session, the env var might not carry over when you actually run the script. But in general it should work just fine as long as you're only working in a single terminal session and don't restart your computer etc. Otherwise you'll need to do this : 

#### OPTION #2: Use .env file
- First, copy the sample .env file
    ```
    cp .env.sample .env 
    ```
- Next, set the appropriate values
    - `CROWDIN_API_TOKEN` for your crowdin API token from the previous step. 

(TODO if we want to, we can use `python-dotenv` lib instead in the future)

### 1c) Install Python Pre-reqs
**If don't have it already**, install `pip install virtualenv`
```
pip3 install virtualenv
```

Create and activate a virtual env for this subproject
```
python3 -m venv venv
source venv/bin/activate
```

Then install the requirements
```
pip3 install -r requirements.txt
```

## 2) Run the script
```
# probably just `python download.py` should work, but it wasn't on my machine so putting down full path to the venv python. 
./venv/bin/python download_bundle.py
```

### Options:
#### Option: Skip Download
Will not download zip file, but just use existing zip file instead. If this is set, will not run a build either
```
./venv/bin/python download_bundle.py --skip-download
```

#### Option: Force Rebuild
Will not check for existing builds, will just build a new one
```
./venv/bin/python download_bundle.py --force-rebuild
```

#### Option: Path
Specify a path to put `*.properties` files

```
./venv/bin/python download_bundle.py --path ../../step-core/src/main/resources/
```

(This is what we would do during our build process)

#### Option: Skip Existing File Check
Doesn't error out if there's a file in target dir already
```
./venv/bin/python download_bundle.py --skip-existing-file-check
```


### Use Case: Use updated `*.properties` files for project build
Basically make sure to skip existing file check and specify the `resources` dir path
```
./venv/bin/python download_bundle.py --path ../../step-core/src/main/resources/ --skip-existing-file-check
```

# TODOs
- [ ] See download_bundle.py and all the TODOs there

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

## 2) Download Zip
```
# probably just `python download.py` should work, but it wasn't on my machine so putting down full path to the venv python. 
./venv/bin/python download.py
```


## 3) Unzip and Move files
```
# probably just `python unzip_and_move_bundle.py` should work, but it wasn't on my machine so putting down full path to the venv python. 
 ./venv/bin/python unzip_and_move_bundle.py
```


# TODOs
- [ ] See download_bundle.py and all the TODOs there

from crowdin_api import CrowdinClient
from dotenv import load_dotenv
import os
import json

load_dotenv()    # take environment variables from .env.
STEP_CROWDIN_PROJECT_ID=os.environ['STEP_CROWDIN_PROJECT_ID']

class STEPCrowdinClient(CrowdinClient):
    TOKEN = os.environ['CROWDIN_API_TOKEN']

    PROJECT_ID = STEP_CROWDIN_PROJECT_ID
    # ORGANIZATION = "organizationName" # Optional, for Crowdin Enterprise only
    # TIMEOUT = 60  # Optional, sets http request timeout.
    # RETRY_DELAY = 0.1  # Optional, sets the delay between failed requests 
    # MAX_RETRIES = 5  # Optional, sets the number of retries
    # HEADERS = {"Some-Header": ""}  # Optional, sets additional http request headers
    # PAGE_SIZE = 25  # Optional, sets default page size
    # EXTENDED_REQUEST_PARAMS = {"some-parameters": ""}  # Optional, sets additional parameters for request

client = STEPCrowdinClient()


class BuildJob:
    def __init__(self): 
        self.buildId = None
        self.progress = None
        self.status = "not yet started"

    def run_build(self):
        """
        Executes a "project build", which creates a snapshot of translations at current point of time, in preparation for a download.
        - Currently, we're doing all target languages, so don't need to specify. 
        - https://support.crowdin.com/developer/api/v2/#tag/Translations/operation/api.projects.translations.builds.post
        - This will make the build integer which will be used when doing the download. 
        """
        print("\n***********")
        print("running a build for STEP Bible project (project id:", STEP_CROWDIN_PROJECT_ID, ")...")
        # setting this initial status, then after that, all statuses will be from CrowdIn's API
        self.status = "about to request build"


        build_result = client.translations.build_crowdin_project_translation(
            projectId=STEP_CROWDIN_PROJECT_ID,
            #skipUntranslatedStrings=True,
            skipUntranslatedFiles=True,
            exportApprovedOnly=True,
        )

        print(build_result)
        with open('tmp.build-result.json', 'w', encoding='utf-8') as f:
            json.dump(build_result, f, 
                      ensure_ascii=False, 
                      indent=4,
                      # for the datetime obj
                      default=str)

        data = build_result["data"]

        self.buildId = data["id"]
        self.status = data["status"]
        self.progress = data["progress"]

        print("done.")

    def check_build_status(self):
        """
        Checks build status
        - Will just keep running this until build is complete and ready to download
        - https://support.crowdin.com/developer/api/v2/#tag/Translations/operation/api.projects.translations.builds.get
        """
        print("\n***********")
        print("checking build status ...(Build id:", self.buildId, ")")

        result = client.translations.check_project_build_status(buildId)

        with open("tmp.build-status.json", 'w', encoding='utf-8') as f:
            json.dump(builds, f,
                      ensure_ascii=False,
                      indent=4,
                      # for the datetime obj
                      default=str)

        data = build_result["data"]

        self.buildId = data["id"]
        # will return one of: "created" "inProgress" "canceled" "failed" "finished"
        self.status = data["status"]
        # percentage
        self.progress = data["progress"]
        print("done.")




def list_builds():
    """
    List builds for STEP Crowdin project
    - Required to download the translations
    - https://support.crowdin.com/developer/api/v2/#tag/Translations/operation/api.projects.translations.builds.getMany
    """
    print("\n***********")
    print("listing builds for STEP Bible project...(id:", STEP_CROWDIN_PROJECT_ID, ")")

    builds = client.translations.list_project_builds(STEP_CROWDIN_PROJECT_ID)

    with open('tmp.builds.json', 'w', encoding='utf-8') as f:
        json.dump(builds, f, 
                  ensure_ascii=False, 
                  indent=4,
                  # for the datetime obj
                  default=str)

    print("done.")


def download():
    """
    downloads the zip of all translations for all languages from Crowdin's File API (v2)
    """
    print("\n***********")
    print("downloading translations for STEP Bible project...(id:", STEP_CROWDIN_PROJECT_ID, ")")


    result = client.translations.download_project_translations()
    print(result)

    print("done.")



if __name__ == '__main__':
    buildJob = BuildJob()

    buildJob.run_build()
    buildJob.check_build_status()

    list_builds()
    # download()


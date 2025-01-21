from crowdin_api import CrowdinClient
from dotenv import load_dotenv
import os
import json
import time
import requests
import zipfile
import glob
import sys
import shutil
from tqdm import tqdm
import pytz
utc=pytz.UTC
from datetime import datetime, timedelta

from pathlib import Path

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
    # PAGE_SIZE = 25  # Optional, sets default page siKe
    # EXTENDED_REQUEST_PARAMS = {"some-parameters": ""}  # Optional, sets additional parameters for request

client = STEPCrowdinClient()


class BuildJob:
    def __init__(self): 
        self.projectId = STEP_CROWDIN_PROJECT_ID
        self.buildId = None
        self.progress = None
        self.status = "not yet started"
        self.download_url = None
        self.existing_builds = None

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
            projectId=self.projectId,
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
        print(data)

        self.buildId = data["id"]
        self.status = data["status"]
        self.progress = data["progress"]

        print("done.")

    def build_is_done(self):
        return str(self.progress) == "100"

    def check_build_status(self):
        """
        Checks build status
        - Will just keep running this until build is complete and ready to download
        - https://support.crowdin.com/developer/api/v2/#tag/Translations/operation/api.projects.translations.builds.get
        """
        print("\n***********")
        print("checking build status ...(Build id:", self.buildId, ")")

        result = client.translations.check_project_build_status(
            buildId=self.buildId,
            projectId=self.projectId,
        )

        with open("tmp.build-status.json", 'w', encoding='utf-8') as f:
            json.dump(result, f,
                      ensure_ascii=False,
                      indent=4,
                      # for the datetime obj
                      default=str)

        data = result["data"]

        # print(data)
        # will return one of: "created" "inProgress" "canceled" "failed" "finished"
        self.status = data["status"]
        print("Status:", self.status)
        # percentage
        self.progress = data["progress"]
        print("Progress:", self.progress, "%")


    def get_download_url(self):
        """
        returns link to download the zip of all translations for all languages from Crowdin's File API (v2)
        @return str download_url to download the zip
        """
        print("\n***********")
        print("downloading translations for STEP Bible project...(id:", STEP_CROWDIN_PROJECT_ID, ")")


        result = client.translations.download_project_translations(
            buildId=self.buildId,
            projectId=self.projectId
        )
        print(result)
        self.download_url = result["data"]["url"]

        return self.download_url


    def get_zip_filename_base(self):
        return f"crowdin-step.build_{self.buildId}"

    def get_zip_filename(self):
        return f"{self.get_zip_filename_base()}.zip"

    def get_zip_dir_path(self):
        # just using a tmp dir
        return Path.joinpath(Path().resolve(), "tmp")

    def get_zip_filepath(self):
        return Path.joinpath(self.get_zip_dir_path(), self.get_zip_filename())

    def get_unzipped_dir_path(self):
        return Path.joinpath(self.get_zip_dir_path(), "unzipped")


    def download(self):
        """
        downloads the zip of all translations for all languages from Crowdin's File API (v2)
        """

        response = requests.get(self.download_url, stream=True)

        print(f"now downloading to {self.get_zip_filepath()}\n")
        with open(self.get_zip_filepath(), "wb") as handle:
            for data in tqdm(response.iter_content()):
                handle.write(data)

        print("\n")

    def unzip(self):
        print(f"now unzipping to {self.get_unzipped_dir_path()}")

        with zipfile.ZipFile(self.get_zip_filepath(), 'r') as zip_ref:
            zip_ref.extractall(self.get_unzipped_dir_path())

        return

    def move(self, newPath):
        """
        move unzipped files to target folder (final step!)
        """

        # TODO make windows compatible
        crowdin_export_path_to_glob = f"{self.get_unzipped_dir_path()}/**"
        print("checking", crowdin_export_path_to_glob)

        for lang_folder_path in glob.glob(crowdin_export_path_to_glob, recursive=False):
            # TODO make windows compatible
            print(lang_folder_path)
            lang_folder_path_list = lang_folder_path.split('/')

            # skipping this precaution for now 
            # TODO find out why it was here originally, and how to best implement now
            # if len(lang_folder_path_list) != 3:
            #     print("This folder name is not in the expected format", lang_folder_path, len(lang_folder_path_list), "Exit program")
            #     sys.exit()

            # gets the top level dir, and that's the langname base
            langName_list = lang_folder_path_list[-1].split('-')

            # change crowdin language codes to STEP Bible standards

            # TODO check with patrick - how does this logic work? Doesn't match existing folder names
            if langName_list == "zh-TW":
                langName = "zh_TW"
            elif langName_list == "he":
                langName = "iw"
            elif langName_list == "id":
                langName = "in"
            else:
                langName = langName_list[0]

            for property_file_path in glob.iglob(f"{lang_folder_path}/*.properties"):
                print("now on property file", property_file_path)
                # TODO fix this, it's broken
                folder2_path_list = property_file_path.split('/')
                targetFilePrefix = folder2_path_list[2].split("_")[0]
                targetFile = targetFilePrefix + "_" + langName + ".properties"

                targetPath = Path.joinpath(newPath, targetFile)

                if os.path.exists(targetPath):
                    print("already exist", targetPath, "Exit program")
                    sys.exit()
                else:
                    print("\n******")
                    print("now trying to moving to:", targetPath)
                    if targetFilePrefix == "LangSpecificBundle" or targetFilePrefix == "MorphologyBundle":
                        appendToFile = Path.joinpath(newPath, "InteractiveBundle_" + langName + ".properties")
                        print("Found", property_file_path, "will append to", appendToFile)
                        my_file = Path(appendToFile)
                        if my_file.is_file():
                            f1 = open(appendToFile, 'a+')
                            f2 = open(property_file_path, 'r')
                            f1.write(f2.read())
                            f1.write("\n");
                            f1.close()
                            f2.close()
                        else:
                            print("Cannot find correspond InteractiveBundle file")
                            sys.exit()
                    else:
                        print("copying", property_file_path, "to", targetPath)
                        shutil.copyfile(property_file_path, targetPath)
                continue






    def list_builds(self):
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

        data = builds["data"]

        self.existing_builds = data



    def check_builds_for_existing(self):
        """
        Iterate over builds and see if there's any that aren't expired.
        """

        # a build that is done, and not yet expired
        now = utc.localize(datetime.now())
        thirty_min_ago = now + timedelta(minutes = -30)

        for build in self.existing_builds:
            data = build["data"]
            print("checking build:", data)
            # completed_at_str = data["finishedAt"]
            # completed_at = datetime.strptime(completed_at_str, "%Y-%m-%d %H:%M:%S+00:00")

            # this should already be a datetime obj
            completed_at = data["finishedAt"]

            if thirty_min_ago < completed_at:
                available_build = True
                self.status = data["status"]
                self.progress = data["progress"]
                self.buildId = data["id"]

                print("found available build")
                print(data)
                return data

            else:
                print("checking next build")

        return data


if __name__ == '__main__':
    if len(sys.argv) == 2:
        newPath = Path().resolve(sys.argv[1])
        # TODO need to test this
        print("new path", newPath)

    else:
        # set default target bundle dir
        # newPath = "../../step-core/src/main/resources/"
        newPath = Path.joinpath(Path().resolve(), "tmp", "bundle_out")
        print("new path", newPath)


    buildJob = BuildJob()

    buildJob.list_builds()
    available_build = buildJob.check_builds_for_existing()

    if available_build:
        print("found available build", buildJob.buildId)
        print("not making a new build, just using previous build")
    else:
        buildJob.run_build()


    while buildJob.build_is_done() != True:
        print("waiting 3 seconds...")
        time.sleep(3) # Sleep for 3 seconds
        buildJob.check_build_status()

        if buildJob.build_is_done():
            break
        else:
            print("not yet done, waiting 3 seconds...")

    buildJob.get_download_url()

    buildJob.download()
    buildJob.unzip()


    print("Files will be output to", newPath, "folder")
    buildJob.move(newPath)

    print("\n***********")
    print("ALL DONE")
    print("\n***********")


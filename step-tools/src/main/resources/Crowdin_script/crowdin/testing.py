from crowdin_api import CrowdinClient
from dotenv import load_dotenv
import os
import json

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)    # take environment variables from .env.
STEP_CROWDIN_PROJECT_ID=os.environ['STEP_CROWDIN_PROJECT_ID']

class STEPCrowdinClient(CrowdinClient):
    TOKEN = os.environ['CROWDIN_API_TOKEN']
    # PROJECT_ID = STEP_CROWDIN_PROJECT_ID # Optional, set project id for all API's

    # ORGANIZATION = "organizationName" # Optional, for Crowdin Enterprise only
    # TIMEOUT = 60  # Optional, sets http request timeout.
    # RETRY_DELAY = 0.1  # Optional, sets the delay between failed requests 
    # MAX_RETRIES = 5  # Optional, sets the number of retries
    # HEADERS = {"Some-Header": ""}  # Optional, sets additional http request headers
    # PAGE_SIZE = 25  # Optional, sets default page size
    # EXTENDED_REQUEST_PARAMS = {"some-parameters": ""}  # Optional, sets additional parameters for request

client = STEPCrowdinClient()

def run():
    # list_projects()
    # get_project()
    get_project_branches()

def list_projects():
    """
    writes to file metadata for all projects for current user
    """
    print("\n***********")
    print("listing projects...")

    # Get list of Projects
    # (assumes you don't have TOO many projects...)
    projects = client.projects.with_fetch_all().list_projects()

    with open('tmp.all_projects.json', 'w', encoding='utf-8') as f:
        json.dump(projects, f, 
                  ensure_ascii=False, 
                  indent=4,
                  # for the datetime obj
                  default=str)

    print("done.")

def get_project():
    """
    writes to file metadata for STEP Bible Crowdin project
    """
    print("\n***********")
    print("getting STEP CrowdIn project data...")
    step_project_data = client.projects.get_project(STEP_CROWDIN_PROJECT_ID)

    print("writing to step_project.json...")
    with open('step_project.json', 'w', encoding='utf-8') as f:
        json.dump(step_project_data, f, 
                  ensure_ascii=False, 
                  indent=4,
                  # for the datetime obj
                  default=str)

    print("done.")

def get_project_branches():
    """
    writes to file metadata for all branches of STEP Bible Crowdin project
    """
    print("\n***********")
    print("getting STEP CrowdIn project Branches data...")
    branches_data = client.projects.branches(STEP_CROWDIN_PROJECT_ID)

    print("writing to step_project.json...")
    with open('branches_data.json', 'w', encoding='utf-8') as f:
        json.dump(branches_data, f, 
                  ensure_ascii=False, 
                  indent=4,
                  # for the datetime obj
                  default=str)

    print("done.")

if __name__ == '__main__':
    run()


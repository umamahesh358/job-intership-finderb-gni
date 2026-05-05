import sys
import json
from jobspy import scrape_jobs

def main():
    try:
        # Read args passed from node
        args_json = sys.argv[1]
        options = json.loads(args_json)

        # Scrape jobs using jobspy
        # Note: jobspy might be rate-limited or blocked, this is just a wrapper.
        jobs = scrape_jobs(
            site_name=options.get("sites", ["linkedin", "indeed"]),
            search_term=options.get("search_term", "software engineer"),
            location=options.get("location", "remote"),
            results_wanted=options.get("results_wanted", 5),
            country_linkedin=options.get("country", "usa")
        )

        # Output as JSON for node to consume
        # The result from scrape_jobs is a pandas dataframe, convert to dict
        print(jobs.to_json(orient="records"))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()

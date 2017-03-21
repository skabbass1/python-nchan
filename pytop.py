import time

import psutil
import pandas as pd
import requests

PUB_ENDPOINT = 'http://localhost:8080/pub'
STATS_CHANNEL = 'system_stats'


def top(sort_by='cpu_percent', return_as_dict=True):
    """
    A function that simulates the unix top command
    :return:
    """
    dfs = []
    for proc in psutil.process_iter():
        try:
            # extract metrics and put them in a pandas dataframe. This is convenient since we
            # can sort / slice and dice the data as necessary later easily
            pinfo = proc.as_dict(
                attrs=['username', 'name', 'pid', 'cmdline', 'memory_percent', 'cpu_percent', 'memory_info'])
            df = pd.DataFrame(dict(
                username=[pinfo['username']],
                name=[pinfo['name']],
                pid=[pinfo['pid']],
                resident_memory=[pinfo['memory_info'].rss],
                virtual_memory=[pinfo['memory_info'].vms],
                memory_percent=[pinfo['memory_percent']],
                cpu_percent=[pinfo['cpu_percent']],
            )
            )
            dfs.append(df)

        except Exception as ex:
            print(ex)
            continue

    df = pd.concat(dfs)
    df = df.sort_values(by=sort_by, ascending=False)

    if return_as_dict:
        return {col: df[col].values.tolist() for col in df.columns}

    return df


def main():
    # create a session to enable persistent http connection
    s = requests.Session()

    while True:
        stats = top()
        s.post(PUB_ENDPOINT, params={'id': STATS_CHANNEL}, json=stats)
        time.sleep(2)


if __name__ == '__main__':
    main()


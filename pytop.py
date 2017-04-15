import time
import logging
import operator
import collections
import os

import psutil
import requests

PUB_ENDPOINT = 'http://localhost:8080/pub'
STATS_CHANNEL = 'system_stats'

SystemInfo = collections.namedtuple(
    'SystemInfo',
    ['procs', 'load_average', 'cpu_count', 'mem_total', 'mem_used', 'swap_total', 'swap_used'])

CPU_COUNT = psutil.cpu_count()


def top(sort_by='cpu_percent', top_n_procs=20):
    """
    A function that simulates the unix top command
    :return:
    """
    l = []
    logger = logging.getLogger('PYTOP')
    for proc in psutil.process_iter():
        try:
            pinfo = proc.as_dict(
                attrs=['username', 'name', 'pid', 'cmdline', 'memory_percent', 'cpu_percent', 'memory_info'])

            d = dict(
                username=pinfo['username'],
                name=pinfo['name'],
                pid=pinfo['pid'],
                resident_memory=round(pinfo['memory_info'].rss / 1e9, 2),  # Size in GB
                virtual_memory=round(pinfo['memory_info'].vms / 1e9, 2),  # Size in GB
                memory_percent=round(pinfo['memory_percent'], 2),
                cpu_percent=round(pinfo['cpu_percent'], 2),
                id=pinfo['pid'],
            )

            l.append(d)

        except Exception as ex:
            logger.exception(ex)
            continue
    return SystemInfo(
        procs=sorted(l, key=operator.itemgetter(sort_by), reverse=True)[:top_n_procs],
        load_average=os.getloadavg(),
        cpu_count=CPU_COUNT,
        mem_total=psutil.virtual_memory().total / 1e9,  # Size in GB,
        mem_used=psutil.virtual_memory().used / 1e9,
        swap_total=psutil.swap_memory().total / 1e9,  # Size in GB,
        swap_used=psutil.swap_memory().used / 1e9,
    )


def main():
    # create a session to enable persistent http connection
    s = requests.Session()

    logger = logging.getLogger('PYTOP')
    while True:
        stats = top()
        s.post(PUB_ENDPOINT, params={'id': STATS_CHANNEL}, json=stats._asdict())
        logger.debug('Posted stats:{}'.format(stats))
        time.sleep(2)


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    main()

import time
import logging
import operator

import psutil
import requests

PUB_ENDPOINT = 'http://localhost:8080/pub'
STATS_CHANNEL = 'system_stats'


def top(sort_by='cpu_percent'):
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
                resident_memory=pinfo['memory_info'].rss,
                virtual_memory=pinfo['memory_info'].vms,
                memory_percent=pinfo['memory_percent'],
                cpu_percent=pinfo['cpu_percent'],
                id=pinfo['pid'],
            )

            l.append(d)

        except Exception as ex:
            logger.exception(ex)
            continue
    return sorted(l, key=operator.itemgetter(sort_by))


def main():
    # create a session to enable persistent http connection
    s = requests.Session()

    logger = logging.getLogger('PYTOP')
    while True:
        stats = top()
        s.post(PUB_ENDPOINT, params={'id': STATS_CHANNEL}, json=stats)
        logger.debug('Posted stats:{}'.format(stats))
        time.sleep(2)


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    main()

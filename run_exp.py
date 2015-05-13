import pandas as pd
import math
import json
import csv

LEN=10

def is_number(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

def is_nan(x):
    return isinstance(x, float) and math.isnan(x)


def nf(x):
    if x is None:
        return 0
    if isinstance(x, str):
        x = x.lstrip('$')
        x = x.lstrip().rstrip()
        x = x.lstrip('(').rstrip(')')
        if len(x) ==0:
            return 0
        if x == "-":
            return 0
        if "#" in x:
            return 0
        else:
            return int(x.replace(",", ""))
    elif isinstance(x, int):
        print x
        return x

def string_format(x):
    x = x.lstrip().rstrip()
    x = ' '.join(x.split())
    return x

def parts(x):
    x = string_format(x)
    try:
        n = int(x.split()[0])
    except Exception:
        return (-1, "")
    name = ' '.join(x.split()[1:])
    return (n, name)

spo = {}

with open("raw_data/rexp14.csv", 'rU') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='"')
# f = pd.read_csv("raw_data/rexp14.csv", names=range(LEN), engine="python")
    # for row in f.itertuples():
    reader.next()
    for row in reader:
        n, name = parts(row[0])
        if n == -1: continue
        real = [n, name, row[1], row[2]] + [nf(x) for x in row[3:]]
        if name not in spo:
            spo[name] = [real]
        else:
            spo[name].append(real)

# print json.dumps(spo)
# print json.dumps(spo.keys())

def get_item(x):
    return x[-1][-1]

p = sorted(spo.values(), key=get_item, reverse=True)
a = [(x[-1][1], x[-1][-1]) for x in p]
# print json.dumps(a)
print json.dumps([{"name": x[0], "value": x[1]} for x in a])

    


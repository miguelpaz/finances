import pandas as pd
import math
import json
import csv

LEN=9

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

class Dept:
    def __init__(self, name):
        self.name = name
        self.on_campus = []
        self.off_campus = []
        self.total = []

class Office:
    def __init__(self, name):
        self.name = name
        self.on_campus = []
        self.off_campus = []
        self.total = []
        self.depts = []


def collect_data(y):
    print y
    # f = pd.read_csv("raw_data/sV"+ str(y) +".csv", names=range(LEN), engine="python")
    with open("raw_data/sV"+ str(y) +".csv", 'rU') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quotechar='"')
        depts = {}
        offices = {}
        dept = ""
        office_sum = {}
        l_depts = []
        for row in reader:
            assert len(row) == 9
            first = string_format(row[0])
            if "Total" in first and "Totals" not in first:
                if "Off" in first:
                    office_sum["off"] = [nf(x) for x in row[1:]]
                elif "On" in first:
                    office_sum["on"] = [nf(x) for x in row[1:]]
            elif "Totals" in first:
                o_n = row[0][:7]
                offices[o_n] = Office(o_n)
                if "on" in office_sum:
                    offices[o_n].on_campus = office_sum["on"]
                if "off" in office_sum:
                    offices[o_n].off_campus = office_sum["off"]
                offices[o_n].depts = l_depts   
                office_sum = {}
                l_depts = []
            elif "On" in row[1]:
                dept = string_format(row[0])
                if not dept in depts:
                    depts[dept] = Dept(dept)
                depts[dept].on_campus = [nf(x) for x in row[2:]]
            elif "Off" in row[1]:
                dept = string_format(row[0])
                if not dept in depts:
                    depts[dept] = Dept(dept)
                depts[dept].off_campus = [nf(x) for x in row[2:]]
            elif "Total" in row[1]:
                dept = string_format(row[0])
                l_depts.append(dept)
                if not dept in depts:
                    print dept
                    depts[dept] = Dept(dept)
                depts[dept].total = [nf(x) for x in row[2:]]
                dept = ""
    return (depts, offices)

dd = {}
oo = {}
for y in [10, 11, 12, 13, 14]:
    ds, os = collect_data(y)
    for d in ds:
        if d in dd:
            dd[d].append({"on": ds[d].on_campus, "off": ds[d].off_campus, "total": ds[d].total})
        else:
            dd[d] = [{"on": ds[d].on_campus, "off": ds[d].off_campus, "total": ds[d].total}]

    # dd.append(ds)
    # oo.append(os)
print json.dumps(dd)
p = 0
for d in dd:
    if len(dd[d]) == 2:
        print d
        p+=1
print p
print len(dd)

import pandas as pd
import math
import json

f = pd.read_csv("school_of_science", names=range(18), engine="python")

def is_number(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

def is_nan(x):
    return isinstance(x, float) and math.isnan(x)

def is_dept(row):
    for x in row:
        if isinstance(x, str):
            if "Department:" in x:
                return x
    return False

class Supervisor:
    def __init__(self, name):
        im = name.split(" /")
        self.name = im[1] + " " + im[0]
        self.projects = []
        self.school = "Science"
        self.dept = ""
        self.supervisor_total = []

    def get_num_projects(self):
        return len(self.projects)

    def get_sponsors_to_contrib(self):
        res = {}
        for p in self.projects:
            org = str(p[3])
            print p
            if is_nan(p[6]):
                p.pop(6)
                p.append(None)
            if is_nan(p[-1]) or p[-1] == None:
                it = p[-6]
            else:
                it = p[-5]
            print it
            val = int(it.replace(",", ""))
            if org in res:
                res[org] += val
            else:
                res[org] = val
        return res

    def get_summed_contrib(self):
        res = self.get_sponsors_to_contrib()
        return sum(res.values())

all_supervisors = []
current_row = []

sup = None
dept = ""
for row in f.itertuples():
    if is_dept(row):
        dept = is_dept(row)[12:]
    elif 'Supervisor:' in str(row[1]):
            # Set new supervisor
            name = row[1][12:]
            # Since some rows are bad, add it
            if sup and len(current_row) > 0:
                sup.projects.append(current_row)
            current_row = []
            if sup:
                all_supervisors.append(sup)
            sup = Supervisor(name)
            sup.dept = dept
    elif 'Supervisor Total:' in row:
        # End of this supervisor
        # print current_row
        sup.projects.append(current_row)
        current_row = []
        sup.supervisor_total = row
        all_supervisors.append(sup)
        sup = None
    else:
        # Should just be continuation of a normal project row
        try:
            value = int(row[1])
            # It's a new project
            if len(current_row) > 0:
                sup.projects.append(current_row)
            current_row = list(row)

        except Exception:
            if len(row) == len(current_row):
                # enforce first col NaN
                if row[1] != row[1]:
                    for i in range(1, len(current_row)):
                        if isinstance(row[i], str) and isinstance(current_row[i], str):
                            if not is_number(row[i]) and not is_number(current_row[i]):
                                # prevent repeats from unmarked total rows
                                space = " " if str(row[i][0]).isupper() else ""
                                current_row[i] += " "+row[i]
            continue

sponsors = {}
sups = {}
data = []
print len(all_supervisors)
for sup in all_supervisors:
    print sup.dept
    print sup.name
    print len(sup.projects)
    for p in sup.projects:
        print p
    contrib = sup.get_summed_contrib()
    k = sup.name
    if k in sups:
        sups[k] += contrib
    else:
        sups[k] = contrib

    spo =  sup.get_sponsors_to_contrib()
    for k in spo:
        v = spo[k]
        if k in sponsors:
            sponsors[k] += v
        else:
            sponsors[k] = v

    print sup.get_summed_contrib()
    print "\n\n\n\n"
    if contrib > 30000: 
        data.append({"sup": sup.name, "num_projects": len(sup.projects), "school": "Science", "dept": sup.dept, "contrib": contrib})
print json.dumps(data)
# d_view = [ (v,k) for k,v in sponsors.iteritems() ]
# # d_view = [ (s.)]
# d_view.sort(reverse=True) # natively sort tuples by first element
# for v,k in d_view:
#     print "%s: %d" % (k,v)
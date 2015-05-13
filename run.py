import pandas as pd
import math
import json

# globals
config = {"sap": [17, "Architecture and Planning"], "eng": [19, "Engineering"], 
"shass": [19, "Humanities, Arts, Social Sciences"], "sloan": [19, "Sloan"], "science": [18, "Science"]}
# p_key = "science"
# LEN = config[p_key][0]
# f = pd.read_csv("raw_data/"+ p_key+".csv", names=range(LEN), engine="python")

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
        # print im
        self.name = im[1] + " " + im[0]
        self.projects = []
        self.school = config[p_key][1]
        self.dept = ""
        self.supervisor_total = []

    def get_num_projects(self):
        return len(self.projects)

    def get_sponsors_to_contrib(self):
        res = {}
        for p in self.projects:
            org = str(p[3])
            # print p
            if is_nan(p[6]):
                p.pop(6)
                p.append(None)
            if not len(p) == LEN + 1:
                # print p
                # print len(p)
                raise Exception
            val = int(p[13].replace(",", ""))
            if org in res:
                res[org] += val
            else:
                res[org] = val
        return res

    def get_summed_contrib(self):
        res = self.get_sponsors_to_contrib()
        return sum(res.values())

def collect_data():
    all_supervisors = []
    current_row = []

    sup = None
    dept = ""
    for row in f.itertuples():
        if is_dept(row):
            dept = is_dept(row)[12:]
        elif 'Supervisor:' in str(row[1]):
                # print "created"
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
    return all_supervisors

def summarize_data(all_supervisors, full_list=True):
    sponsors = {}
    sups = {}
    data = []
    for sup in all_supervisors:
        # print sup.dept
        # print sup.name
        # print len(sup.projects)
        # for p in sup.projects:
        #     print p

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

        if full_list:
            projects = []
            for p in sup.projects:
                print p
                projects.append({"gov_num": p[2], 
                        "sponsor_name": p[3], 
                        "title": p[5],
                        "fytd14": int(p[13].replace(",", "")), 
                        "auth": 0 if is_nan(p[14]) else int(p[14].replace(",", "")),
                        "cumulative": int(p[15].replace(",", ""))})
            data.append({"sup": sup.name, "num_projects": len(sup.projects), 
                "school": config[p_key][1], "dept": sup.dept, "contrib": contrib,
                "projects": projects})

        elif contrib > 100000: 
            data.append({"sup": sup.name, "num_projects": len(sup.projects), 
                "school": config[p_key][1], "dept": sup.dept, "contrib": contrib})

    # print json.dumps(data)
    # d_view = [ (v,k) for k,v in sponsors.iteritems() ]
    # d_view.sort(reverse=True) # natively sort tuples by first element
    # for v,k in d_view:
        # print "%s: %d" % (k,v)
    return data
 
total_data = []
for k in config.keys():
    p_key = k
    LEN = config[p_key][0]
    f = pd.read_csv("raw_data/"+ p_key+".csv", names=range(LEN), engine="python")
    all_supervisors = collect_data()
    total_data.extend(summarize_data(all_supervisors))
    # total_data.extend(summarize_data(all_supervisors, full_list=False))

# print total_data

sup_d = {}
for s in total_data:
    sup = ' '.join(s['sup'].lstrip().rstrip().split())
    if sup not in sup_d:
        sup_d[sup] = [s]
    else:
        sup_d[sup].append(s)

sup_names = sup_d.keys()

print sup_names

# print total_data
with open('full_sup_data.json', 'wb') as f:
    f.write(json.dumps(sup_d))

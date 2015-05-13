import requests
files = {'f': ('bb_end.pdf', open('bb_end.pdf', 'rb'))}
response = requests.post("https://pdftables.com/api?key=evqfdc27meev", files=files)
response.raise_for_status() # ensure we notice bad responses
f = open('end_out', 'w')
f.write(response.text)
f.close()
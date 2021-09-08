import pandas as pd
import json

dinowars_data = pd.read_csv('trading-cards-asdw.csv', sep=';')

print(dinowars_data.head())

dinowars_full = pd.DataFrame(dinowars_data.values.repeat(dinowars_data.AMOUNT, axis=0), columns=dinowars_data.columns)

dinowars_full.RATE = dinowars_full.AMOUNT/5000

print(dinowars_full.AMOUNT.sum(), dinowars_full.RATE.sum())
print(len(dinowars_full))

# json_dict = json.dumps(dinowars_full[['TYPE', 'CHARACTER']].to_json(orient='index'))

# # open file for writing, "w" 
# f = open("dict.json","w")

# # write json object to file
# f.write(json_dict)

# # close file
# f.close()
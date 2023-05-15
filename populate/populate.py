import pandas as pd
import requests

# Read user, address and account CSVs
user_mock = pd.read_csv("./userMock.csv")
user_mock = user_mock.astype({'phone': 'string', 'document': 'string', 'birthday': 'string'})
address_mock = pd.read_csv("./addressMock.csv")
address_mock = address_mock.astype({'cep': 'string'})
account_mock = pd.read_csv("./accountMock.csv")
account_mock = account_mock.astype({'transaction_password': 'string'})

# Endpoint
url = "http://0.0.0.0:3344/onboarding"

amount = 0

for i in range(100):
    user = user_mock.iloc[i].to_dict()
    address = address_mock.iloc[i].to_dict()
    account = account_mock.iloc[i].to_dict()
    body = {'user': user, 'address': address, 'account': account}
    response = requests.post(url, json=body)
    if response.status_code != 201:
        print(i)
        print(response.status_code)
        if response.status_code == 422:
            print(response.json())
    else:
        amount += 1
        if amount == 3:
            break
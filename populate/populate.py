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

for i in range(len(user_mock)):
    user = user_mock.loc[i].to_dict()
    address = address_mock.loc[i].to_dict()
    account = account_mock.loc[i].to_dict()
    body = {'user': user, 'address': address, 'account': account}
    response = requests.post(url, json=body)
    if response.status_code != 201:
        user_mock = user_mock.drop(i)
        address_mock = address_mock.drop(i)
        account_mock = account_mock.drop(i)

user_mock.to_csv("./userMock2.csv", index=False)
address_mock.to_csv("./addressMock2.csv", index=False)
account_mock.to_csv("./accountMock2.csv", index=False)

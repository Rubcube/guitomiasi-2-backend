import pandas as pd
import requests
import sys

# Read user, address and account CSVs
user_mock = pd.read_csv("./userMock.csv")
user_mock = user_mock.astype({'phone': 'string', 'document': 'string', 'birthday': 'string'})
address_mock = pd.read_csv("./addressMock.csv")
address_mock = address_mock.astype({'cep': 'string'})
account_mock = pd.read_csv("./accountMock.csv")
account_mock = account_mock.astype({'transaction_password': 'string'})

# Endpoint
url = "http://0.0.0.0:3344/onboarding"

def request_for_user_id(id):
    user = user_mock.loc[id].to_dict()
    address = address_mock.loc[id].to_dict()
    account = account_mock.loc[id].to_dict()
    body = {'user': user, 'address': address, 'account': account}
    response = requests.post(url, json=body)
    return response.status_code
    
if __name__ == "__main__":
    for i, arg in enumerate(sys.argv[1:], 0):
        status = request_for_user_id(int(arg))
        if (status == 201):
            print(f"Sucesso para o id: {arg}")
        else:
            print(f"Falha para o id: {arg}")
import base64

def encrypt_data(*, data: str):
    return type('Obj', (), {'data': base64.b64encode(data.encode()).decode()})

def decrypt_data(*, data: str):
    return type('Obj', (), {'data': base64.b64decode(data.encode()).decode()}) 
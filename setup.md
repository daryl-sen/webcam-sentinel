## Setup Environment Variables

```bash
cp example.env .env
```

## Python Environment setup

1. Install virtualenv 
```bash
python3 -m pip install virtualenv
```
2. Create virtualenv
```bash
python3 -m virtualenv venv
```
3. Activate virtualenv
```bash
source venv/bin/activate
```
4. Install dependencies
```bash
pip install -r requirements.txt
```
## PM2 with Python virtualenv

```bash
pm2 start app.py --name optionalName --interpreter=./venv/bin/python3.8
```

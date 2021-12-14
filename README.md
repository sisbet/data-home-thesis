# Timesheet Viz
Deploy: https://romantic-leavitt-7fb949.netlify.app/

Demo: https://drive.google.com/file/d/1tOjp6aBrzRABJQKx2ne8_e-FDE3TPdhI/view?usp=sharing
## Server Backend

- cd server
- python -m venv venv
- . venv/bin/activate
- pip install -r requirements.txt

install dependency:

- . venv/bin/activate
- pip install DEPENDENCYNAME
- pip freeze > requirements.txt

## Run on server (sudo method)

```bash
cd /var/www/thesisbet
sudo bash
FLASK_APP=thesisbet.py venv/bin/flask run --host=0.0.0.0 > /dev/null 2>&1 &
echo $! > thesisbet.pid
disown
# ctrl-D per uscire da root
# ctrl-D ancora per uscire dal raspberry
```

### To kill the server process:

se il pid è salvato:

```bash
cd /var/www/thesisbet
sudo kill $(cat thesisbet.pid)
```

altrimenti a mano come ai vecchi tempi:

```bash
ps -aux | grep flask
# copincolla il pid e lo killi
sudo kill XXXX
```

### Development of python server:

In the local machine run:

```bash
npx chokidar-cli "server/thesisbet.py" -c "scp server/thesisbet.py pi@mo.local:/var/www/thesisbet"
```

On the raspberry, run:

```bash
cd /var/www/thesisbet
FLASK_APP=thesisbet.py venv/bin/flask run --host=0.0.0.0
```

Then send POST messages via CURL.

#### Testing curl:

```bash
for i in {1..10}; do
curl 'http://192.168.30.234:5000/flash/sx/in/100' -X POST; /
curl 'http://192.168.30.234:5000/flash/dx/out/100' -X POST; \
curl 'http://192.168.30.234:5000/flash/dx/in/100' -X POST; /
curl 'http://192.168.30.234:5000/flash/sx/out/100' -X POST; /
done
```

### Raspberry autostart chrome:

```bash
nano /home/pi/.config/lxsession/LXDE-pi/autostart
```

```
# Disable screensaver and blank screens
@xset s off
@xset -dpms
@xset s noblank
@xscreensaver -no-splash

# Hide mouse, must have installed unclutter with `sudo apt-get install unclutter`
@unclutter

# Load chromium and open the website in full screen mode
#@chromium-browser --start-fullscreen --incognito https://accurat-faces.netlify.com/
@chromium-browser --start-fullscreen --incognito https://romantic-leavitt-7fb949.netlify.app/
```

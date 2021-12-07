from flask import Flask, jsonify, request
from flask_cors import CORS
import board
import neopixel
from time import sleep

print('APP REINITIALIZED')

app = Flask(__name__)
CORS(app)

pixelsCount = 2 * 60
pixels = neopixel.NeoPixel(
    board.D18, pixelsCount, brightness=0.3, auto_write=False)

def rgbToPixel(rgb):
    return (rgb.get('red', 0), rgb.get('green', 0), rgb.get('blue', 0))

@app.route('/', methods=['GET', 'POST'])
def test():
    if request.method == 'POST':
        stripColors = request.json

        for i, led in enumerate(stripColors):
            rgb = led['rgb']
            if i < len(pixels): # avoids error when list from request is too long
                pixels[i] = rgbToPixel(rgb)

        print(pixels)
        pixels.show()

    return "{}"

black = {'red': 0, 'green': 0, 'blue': 0}
red = {'red': 255, 'green': 0, 'blue': 0}
green = {'red': 0, 'green': 255, 'blue': 0}
blue = {'red': 0, 'green': 0, 'blue': 255}
rainbow = [{'rgb': red} for _ in range(20)] + [{'rgb': green} for _ in range(20)] + [{'rgb': blue} for _ in range(20)]

@app.route('/flash/<segment>/<direction>/<milliseconds>', methods=['POST'])
def flash(segment, milliseconds, direction):
    milliseconds = int(milliseconds)
    stripColors = request.json if request.data else rainbow
    stripColors = stripColors[:60]

    pixelsStart = 0 if segment == 'sx' else 60
    pixelsEnd = 60 if segment == 'sx' else 120

    reverse = (direction == 'in' and segment == 'sx') or (direction == 'out' and segment == 'dx')
    jRange = range(-60, 62, 2) if not reverse else range(60, -62, -2) # don't ask me whyyyyy

    for j in jRange:
        sleep(milliseconds / 1000 / pixelsCount)
        for i, x in enumerate(range(pixelsStart, pixelsEnd)):
            rgb = stripColors[i+j]['rgb'] if i+j > 0 and i+j < len(stripColors) else black

            pixels[x] = rgbToPixel(rgb)

        pixels.show()

    return "{}"

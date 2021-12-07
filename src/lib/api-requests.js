export const postLeds = async (json, inOrOut, ms = 2000) => {
  const host = `http://192.168.30.234:5000` // `http://127.0.0.1:5000/`
  const path = inOrOut === 'in' ? `flash/sx/in/${ms}` : `flash/dx/out/${ms}`

  await fetch(`${host}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(json),
    mode: 'cors',
  })
    // .then((response) => response.json())
    // .then((response) => console.log(response))
    .catch((error) => console.log(error))

  if (window.DEBUG) {
    const exists = document.querySelector('.asd')

    const div = exists || document.createElement('div')
    div.classList.add('asd')
    div.style.position = 'absolute'
    div.style.bottom = 0
    div.style.left = 0
    div.style.right = 0
    div.style.height = '50px'
    div.style.display = 'flex'
    div.style.backgroundColor = 'rgba(0,0,0,0.8)'
    div.style.justifyContent = 'space-between'
    div.style.alignItems = 'center'

    if (!exists) document.body.appendChild(div)

    const strip = json.map((_, i) => {
      const led = document.createElement('div')
      led.classList.add('led')
      led.style.height = '20px'
      led.style.borderRadius = '20px'
      led.style.width = '20px'
      led.style.backgroundColor = _.color
      return led
    })
    div.innerHTML = ''
    strip.forEach((led) => div.appendChild(led))
  }

  // return new Promise((resolve) => setTimeout(resolve, sleepTime))
}

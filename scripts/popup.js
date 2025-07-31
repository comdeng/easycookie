const form = document.getElementById('setting-form')
const hint = document.getElementById('success-hint')
const redirectButton = document.getElementById('redirect-button')

function onSubmit(e) {
  e.preventDefault()

  chrome.storage.local.set({
    cookieName: this.cookieName.value,
    redirectUrl: this.redirectUrl.value
  }).then(() => {
    hint.style.visibility = 'visible'
    setTimeout(() => {
      hint.style.visibility = 'hidden'
    }, 5_000)
  })

  if (form.cookieName.value && form.redirectUrl.value) {
    redirectButton.style.visibility = 'visible'
  } else {
    redirectButton.style.visibility = 'hidden'
  }
  return false
}

function getHost(referrer) {
  let pos = referrer.indexOf('://')
  let subPos = referrer.indexOf('/', pos + 3)
  if (subPos > 0) {
    return referrer.substring(0, subPos);
  } else {
    return referrer;
  }
}


document.addEventListener('DOMContentLoaded', function() {
  form.addEventListener('submit', onSubmit, false)

  chrome.storage.local.get(['cookieName', 'redirectUrl']).then((result) => {
    if (result.cookieName) {
      form.cookieName.value = result.cookieName
    }
    if (result.redirectUrl) {
      form.redirectUrl.value = result?.redirectUrl
    }
  })
}, false)

redirectButton.addEventListener('click', (e) => {
  e.preventDefault();

  const cookieName = form.cookieName.value
  const redirectUrl = form.redirectUrl.value
  if (!cookieName || !redirectUrl) {
    return
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]
    const currentUrl = tab.url

    if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
      alert(`Illegal URL:${currentUrl}`);
      return;
    }

    const currentHost = getHost(currentUrl)
    const redirectHost = getHost(redirectUrl)

    if (currentHost === redirectHost) {
      alert(`Same domain:${redirectHost}`)
      return
    }

    chrome.cookies.get({
      name: cookieName,
      url: currentUrl
    }, (cookie) => {
      chrome.cookies.set({
        name: cookieName,
        url: redirectHost,
        value: cookie.value,
      }, ()=> {
        chrome.tabs.sendMessage(tab.id, {
          type: 'redirect',
          location: redirectUrl
        })
      })
    })
  })
}, false)

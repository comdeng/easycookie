chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.type) {
      case "redirect":
        location.href = request.location
        break
    }
  }
);

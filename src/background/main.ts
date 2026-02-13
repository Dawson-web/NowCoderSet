chrome.runtime.onInstalled.addListener(() => {
  console.info('[NowCoderSet] Extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'ping') {
    sendResponse('pong');
  }
});

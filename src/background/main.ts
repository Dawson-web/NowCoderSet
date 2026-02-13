chrome.runtime.onInstalled.addListener(() => {
  console.info('[NowCoderSet] Extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'ping') {
    sendResponse('pong');
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (!tab.id) return;
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
  } catch (err) {
    console.error('toggleSidebar failed', err);
  }
});

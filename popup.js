document.addEventListener("DOMContentLoaded", async () => {

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url && tab.url.includes("youtube.com/watch")) {
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapeYouTubeData,
    }, (injectionResults) => {
      const data = injectionResults[0].result;
      document.getElementById("title").innerText = data.title;
      document.getElementById("channel").innerText = "Channel: " + data.channel;
      document.getElementById("videoId").innerText = "Video ID: " + data.videoId;
      document.getElementById("thumbnail").src = data.thumbnailUrl;
    });

  } else {
    document.getElementById("title").innerText = "Please open a YouTube video to use this.";
  }
});

function scrapeYouTubeData() {
  const titleNode = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
  const channelNode = document.querySelector('#owner ytd-channel-name a');
  const videoId = new URL(window.location.href)
    .searchParams
    .get("v");
  const thumbnailUrl =
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  return {
    title: titleNode ? titleNode.innerText : document.title,
    channel: channelNode ? channelNode.innerText : "Channel not found",
    videoId: videoId,
    thumbnailUrl: thumbnailUrl
  };
}
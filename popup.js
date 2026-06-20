document.addEventListener("DOMContentLoaded", async () => {

  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (tab.url && tab.url.includes("youtube.com/watch")) {

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapeYouTubeData,
    }, async (injectionResults) => {

      console.log("SCRIPT CALLBACK STARTED");

      const data = injectionResults[0].result;

      document.getElementById("title").innerText =
        data.title;

      document.getElementById("channel").innerText =
        "Channel: " + data.channel;

      document.getElementById("videoId").innerText =
        "Video ID: " + data.videoId;

      document.getElementById("thumbnail").src =
        data.thumbnailUrl;

      const copyBtn =
        document.getElementById("copyURLBtn");

      const downloadBtn =
        document.getElementById("downloadBtn");

      const formatsSelect =
        document.getElementById("formats");

      const status =
        document.getElementById("status");

      copyBtn.addEventListener("click", () => {

        navigator.clipboard.writeText(tab.url);

        copyBtn.innerText = "Copied!";

        setTimeout(() => {
          copyBtn.innerText = "Copy Video URL";
        }, 1500);

      });

      try {

        status.innerText = "Loading formats...";

        console.log("ABOUT TO FETCH");

        console.log("TAB URL:", tab.url);

        const response = await fetch(
  "http://localhost:3000/metadata",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: `https://www.youtube.com/watch?v=${data.videoId}`
    })
  }
);

console.log("RESPONSE OBJECT:", response);

        const metadata =
          await response.json();

          console.log("FETCH FINISHED");

        formatsSelect.innerHTML =
          '<option value="">Select Format</option>';

        metadata.formats.forEach(f => {

          const option =
            document.createElement("option");

          option.value = f.id;

          option.innerText =
            `${f.id} - ${f.ext} (${f.resolution})`;

          formatsSelect.appendChild(option);

        });

        formatsSelect.style.display =
          "block";

        status.innerText =
          "Formats loaded ✅";

      }

      catch (err) {

        console.error(err);

        status.innerText =
          "Failed to load formats";

      }

      downloadBtn.addEventListener(
        "click",
        async () => {

          const formatId =
            formatsSelect.value;

          if (!formatId) {

            alert(
              "Please select a format first"
            );

            return;
          }

          downloadBtn.disabled = true;

          downloadBtn.innerText =
            "Downloading...";

          try {

            const response =
              await fetch(
                "http://localhost:3000/download",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json"
                  },
                  body: JSON.stringify({
                    url: `https://www.youtube.com/watch?v=${data.videoId}`,
                    formatId: formatId
                  })
                }
              );

            const result =
              await response.json();

            alert(result.message);

            downloadBtn.innerText =
              "Downloaded ✅";

          }

          catch (err) {

            console.error(err);

            alert("Download failed");

            downloadBtn.innerText =
              "Download Video";

          }

          downloadBtn.disabled = false;

        }
      );

    });

  }

  else {

    document.getElementById("title").innerText =
      "Please open a YouTube video first.";

  }

});

function scrapeYouTubeData() {

  const titleNode =
    document.querySelector(
      "h1.ytd-watch-metadata yt-formatted-string"
    );

  const channelNode =
    document.querySelector(
      "#owner ytd-channel-name a"
    );

  const videoId =
    new URL(window.location.href)
      .searchParams
      .get("v");

  const thumbnailUrl =
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return {

    title:
      titleNode
        ? titleNode.innerText
        : document.title,

    channel:
      channelNode
        ? channelNode.innerText
        : "Channel not found",

    videoId,

    thumbnailUrl

  };

}
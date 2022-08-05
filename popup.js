
// Functionality running on the current active tab.
chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
  let rawUrl = tabs[0].url;
  const scrapUrl = rawUrl;
//   console.log(trackingCleanedUrl);
  let raw = tabs[0].title;
  let index = tabs[0].index;
//   console.log(raw);

// Cleaning the Url for more accurate results from the api.
  const changeUrl = scrapUrl.replace(/#.*$/, "");
  let finalUrl = changeUrl.replace(/^https?:\/\//, "");
  finalUrl = finalUrl.replace(/www\./, "");
  finalUrl = finalUrl.replace(/\/$/, "");
  finalUrl = finalUrl.replace(/en-US/, "");
  finalUrl = finalUrl.replace(/.com/, "");

  async function callapi(url) {
    const result = await fetch(url);
    return result;
  }

  async function getresults(finalUrl) {

    const modified_query = `query=${finalUrl}&restrictSearchableAttributes=url&typoTolerance=false`;

    // API call which fetches the stories according to the scraped url.
    const searchUrl = "https://hn.algolia.com/api/v1/search?" + modified_query;

    const res = await callapi(searchUrl)
      .then((res) => res.json())
      .then((result) => {
        // console.log(result.hits);

        if (result.hits.length) {

          let placetocontent = document.getElementById("content");
        
          // Mapping over the array of stories fetched by the callapi.
          result.hits.map((thread) => {
            // The stories are inserted in ordered list with a tags and a button in it.
            let listag = document.createElement("li");
            let anchortag = document.createElement("a");
            let buttontag = document.createElement("button");
            buttontag.innerHTML = "comments";
            let comm_id = thread["objectID"];
            let hrefvalue = thread["url"];
            anchortag.href = hrefvalue;
            anchortag.innerHTML = thread["title"];
            listag.appendChild(anchortag);
            listag.appendChild(buttontag);
            placetocontent.appendChild(listag);

            // This onclick function navigates to the url shared in the story.
            anchortag.onclick = function () {
              chrome.tabs.create({
                active: true,
                url: hrefvalue,
                // The index is used to open up the tab next to the current active tab .
                index: index + 1,
              });
            };
            // Navigates to the discussion threads 
            buttontag.onclick = function () {
                chrome.tabs.create({
                    active: true,
                    // Fetching the comments discussion on a particular story.
                    url: `https://news.ycombinator.com/item?id=${comm_id}`,
                    index: index + 1
                })
            }
          });
        }
      });
  }
  getresults(finalUrl);
});

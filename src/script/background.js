// for api calls to backend
BACKEND_URI = `https://jayneet639.pythonanywhere.com`

async function postData(user, selectedText, activeTab) {

    const url = `${BACKEND_URI}/users/`;

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: user, doc_name: activeTab.title || "extension-doc", data: { content: selectedText } })
    };

    let data;

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        data = { success: true, data: result }
    } catch (error) {
        console.error(error);
        data = { success: false, data: error }
    }

    return data
}

async function getVersionedData(user) {
    const url = `${BACKEND_URI}/users/${user}/`;

    const options = {
        method: 'GET',
        headers: {}
    };

    let data;

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        const versions = result.filter(item => item.doc_name === "extension-doc")[0].versions

        data = { success: true, data: versions[versions.length-1] }

        console.log(result);
    } catch (error) {
        console.error(error);
        data = { success: false, data: error }
    }

    return data
}

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(async (msg) => {
        const { user, selectedText, activeTab } = msg

        const postedData = await postData(user, selectedText, activeTab)
        if(!postedData.success) {
            port.postMessage(postedData)
            return
        }
        
        const selectedData = await getVersionedData(user)
        
        port.postMessage(selectedData)
    })
})
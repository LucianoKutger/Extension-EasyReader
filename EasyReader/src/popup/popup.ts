const leichteSpracheButton = document.getElementById('leichteSprache')

if (leichteSpracheButton) {
    leichteSpracheButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({
            action: 'wait for click',
            mode: "leicht"
        })
        alert("LeichteSprache")
    })
} else {
    throw new Error("there is no Button with the id 'leichteSprache'")
}



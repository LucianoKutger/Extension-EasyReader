const resetButtom = document.getElementById('reset-button')

const resetText = document.getElementById('reset-button-text')


if (resetButtom && resetText) {
    resetButtom.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "reload" })
        window.close();
    })

    resetText.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "reload" })
        window.close();
    })
}
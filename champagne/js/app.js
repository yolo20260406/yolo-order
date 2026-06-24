const gasUrl = "https://script.google.com/macros/s/AKfycbyiMoulKLMG9MTisDZC8jdfQ6KeQwS6ia7R80YZxMHrXoSLC_-zrmL5urpkeWchoezF/exec";

document
    .getElementById("image")
    .addEventListener("change", previewImage);

document
    .getElementById("sendBtn")
    .addEventListener("click", send);

async function send() {
    const button = document.getElementById("sendBtn");
    const result = document.getElementById("result");
    const text = document.getElementById("txt").value;

    if (!text) {
        alert("入力してください");
        return;
    }

    button.disabled = true;
    button.innerText = "送信中...";
    result.innerHTML = "少々お待ちください";

    try {
        const response = await fetch(gasUrl, {
            method: "POST",
            body: JSON.stringify({
                message: text
            })
        });

        const responseText = await response.text();

        console.log(responseText);

        button.innerText = "送信完了！";
        result.innerHTML = "✅ 送信完了！<br>2秒後に閉じます。";

        setTimeout(function () {
            if (typeof liff !== "undefined" && liff.isInClient()) {
                liff.closeWindow();
            }
        }, 2000);

    } catch (error) {
        console.error(error);

        button.disabled = false;
        button.innerText = "送信";
        result.innerHTML = "送信失敗：" + error.message;
    }
}

function previewImage() {
    const file = document
        .getElementById("image")
        .files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const img = document.getElementById("preview");

        img.src = e.target.result;
        img.style.display = "block";
    };

    reader.readAsDataURL(file);
}
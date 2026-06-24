const gasUrl = "https://script.google.com/macros/s/AKfycbyiMoulKLMG9MTisDZC8jdfQ6KeQwS6ia7R80YZxMHrXoSLC_-zrmL5urpkeWchoezF/exec";

document
    .getElementById("image")
    .addEventListener("change", previewImage);

document
    .getElementById("sendBtn")
    .addEventListener("click", send);

async function send() {
    const text = document
        .getElementById("txt")
        .value;

    if (!text) {
        alert("入力してください");
        return;
    }

    await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify({
            message: text
        })
    });

    document
        .getElementById("result")
        .innerHTML = "保存しました：" + text;
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
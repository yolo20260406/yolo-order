const liffId = "2010495117-Yc1KZJ4o";
const gasUrl = "https://script.google.com/macros/s/AKfycbyiMoulKLMG9MTisDZC8jdfQ6KeQwS6ia7R80YZxMHrXoSLC_-zrmL5urpkeWchoezF/exec";

document
    .getElementById("image")
    .addEventListener("change", previewImage);

document
    .getElementById("sendBtn")
    .addEventListener("click", send);

async function initLiff() {
    if (typeof liff !== "undefined") {
        await liff.init({ liffId: liffId });
    }
}

initLiff();

async function send() {
    alert("send");
    // 書き換える要素取得
    const button = document.getElementById("sendBtn");
    const result = document.getElementById("result");

    //入力してもらったデータ取得
    const text = document.getElementById("txt").value;
    const imageFile = document.getElementById("image").files[0];

    if (!text) {
        alert("入力してください");
        return;
    }

    if (!imageFile) {
    alert("画像を選択してください");
    return;
}

    // ボタン連打防止
    button.disabled = true;
    button.innerText = "送信中...";
    result.innerHTML = "少々お待ちください";

    // データ送信
    try {

        let profile = null;
        if (typeof liff !== "undefined" && liff.isLoggedIn()) {
            profile = await liff.getProfile();
        }

        const imageBase64 = await fileToBase64(imageFile);

        const response = await fetch(gasUrl, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({
                message: text,

                imageBase64: imageBase64,
                fileName: imageFile.name,
                mimeType: imageFile.type,

                userId: profile ? profile.userId : "",
                displayName: profile ? profile.displayName : ""
            })
        });

//         no-corsではGASからの返事は読めない
//         const responseText = await response.text();
//         console.log(responseText);


//        if (!response.ok) {
//            throw new Error(responseText);
//        }

        // ボタンのテキスト書き換え & 送信完了の文字を出す
        button.innerText = "送信完了！";
        result.innerHTML = "✅ 送信完了！";

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

function fileToBase64(file) {
    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject("画像読み込み失敗");
        };

        reader.readAsDataURL(file);
    });
}
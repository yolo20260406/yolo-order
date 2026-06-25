const liffId = "2010495117-Yc1KZJ4o";
const gasUrl = "https://script.google.com/macros/s/AKfycbyiMoulKLMG9MTisDZC8jdfQ6KeQwS6ia7R80YZxMHrXoSLC_-zrmL5urpkeWchoezF/exec";

document.getElementById("sendBtn").addEventListener("click", send);

addPreview("mainImage1", "previewMainImage1");
addPreview("mainImage2", "previewMainImage2");
addPreview("mainImage3", "previewMainImage3");

addPreview("neckLabelImage1", "previewNeckLabelImage1");
addPreview("neckLabelImage2", "previewNeckLabelImage2");
addPreview("neckLabelImage3", "previewNeckLabelImage3");

addPreview("keyChainImage1", "previewKeyChainImage1");
addPreview("keyChainImage2", "previewKeyChainImage2");
addPreview("keyChainImage3", "previewKeyChainImage3");

async function initLiff() {
    if (typeof liff !== "undefined") {
        await liff.init({ liffId: liffId });
    }
}

initLiff();

async function send() {
    const button = document.getElementById("sendBtn");
    const result = document.getElementById("result");

    const designRequest = document.getElementById("designRequest").value;
    const contents = document.getElementById("contents").value;
    const capOption = document.getElementById("capOption").value;
    const ledOption = document.getElementById("ledOption").value;
    const shopName = document.getElementById("shopName").value;
    const zip = document.getElementById("zip").value;
    const address = document.getElementById("address").value;
    const telNumber = document.getElementById("telNumber").value;
    const billingName = document.getElementById("billingName").value;
    const remarks = document.getElementById("remarks").value;

    const deliveryTime = document.querySelector('input[name="deliveryTime"]:checked').value;
    const leaveAtDoor = document.querySelector('input[name="leaveAtDoor"]:checked').value;

    if (!designRequest) {
        alert("デザインイメージを入力してください");
        return;
    }

    if (!contents) {
        alert("中身、本数を入力してください");
        return;
    }

    button.disabled = true;
    button.innerText = "送信中...";
    result.innerHTML = "少々お待ちください";

    try {
        let profile = null;

        if (typeof liff !== "undefined" && liff.isLoggedIn()) {
            profile = await liff.getProfile();
        }

        const payload = {
            displayName: profile ? profile.displayName : "",
            userId: profile ? profile.userId : "",

            designRequest: designRequest,
            contents: contents,
            capOption: capOption,
            ledOption: ledOption,
            shopName: shopName,
            zip: zip,
            address: address,
            telNumber: telNumber,
            deliveryTime: deliveryTime,
            leaveAtDoor: leaveAtDoor,
            billingName: billingName,
            remarks: remarks,

            mainImages: await getImageFiles(["mainImage1", "mainImage2", "mainImage3"]),
            neckLabelImages: await getImageFiles(["neckLabelImage1", "neckLabelImage2", "neckLabelImage3"]),
            keyChainImages: await getImageFiles(["keyChainImage1", "keyChainImage2", "keyChainImage3"])
        };

        await fetch(gasUrl, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(payload)
        });

        button.innerText = "送信完了！";
        result.innerHTML = "✅ 送信完了！";

    } catch (error) {
        console.error(error);

        button.disabled = false;
        button.innerText = "送信";
        result.innerHTML = "送信失敗：" + error.message;
    }
}

function addPreview(inputId, previewId) {
    document.getElementById(inputId).addEventListener("change", function () {
        const file = document.getElementById(inputId).files[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.getElementById(previewId);
            img.src = e.target.result;
            img.style.display = "block";
        };

        reader.readAsDataURL(file);
    });
}

async function getImageFiles(inputIds) {
    const images = [];

    for (const inputId of inputIds) {
        const file = document.getElementById(inputId).files[0];

        if (file) {
            images.push({
                inputId: inputId,
                fileName: file.name,
                mimeType: file.type,
                imageBase64: await fileToBase64(file)
            });
        }
    }

    return images;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject(new Error("画像読み込み失敗"));
        };

        reader.readAsDataURL(file);
    });
}
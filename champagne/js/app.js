const liffId = "2010495117-Yc1KZJ4o";
const gasUrl = "https://script.google.com/macros/s/AKfycbyiMoulKLMG9MTisDZC8jdfQ6KeQwS6ia7R80YZxMHrXoSLC_-zrmL5urpkeWchoezF/exec";

document.getElementById("sendBtn").addEventListener("click", send);

addPreview("mainImage1", "previewMainImage1", "removeMainImage1");
addPreview("mainImage2", "previewMainImage2", "removeMainImage2");
addPreview("mainImage3", "previewMainImage3", "removeMainImage3");

addPreview("neckLabelImage1", "previewNeckLabelImage1", "removeNeckLabelImage1");
addPreview("neckLabelImage2", "previewNeckLabelImage2", "removeNeckLabelImage2");
addPreview("neckLabelImage3", "previewNeckLabelImage3", "removeNeckLabelImage3");

addPreview("keyChainImage1", "previewKeyChainImage1", "removeKeyChainImage1");
addPreview("keyChainImage2", "previewKeyChainImage2", "removeKeyChainImage2");
addPreview("keyChainImage3", "previewKeyChainImage3", "removeKeyChainImage3");

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

    if (!validateRequiredFields()) {
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

function addPreview(inputId, previewId, buttonId) {
    document.getElementById(inputId).addEventListener("change", function () {
        previewImage(inputId, previewId, buttonId);
    });
}

function previewImage(inputId, previewId, buttonId) {
    const file = document.getElementById(inputId).files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const img = document.getElementById(previewId);

        img.src = e.target.result;
        img.style.display = "block";

        const button = document.getElementById(buttonId);

        if (button) {
            button.style.display = "inline-block";
        }

        const fileName = document.getElementById(getFileNameId(inputId));

        if (fileName) {
            fileName.textContent = file.name;
        }
    };

    reader.readAsDataURL(file);
}

function removeImage(inputId, previewId, buttonId) {
    document.getElementById(inputId).value = "";

    const img = document.getElementById(previewId);

    if (img) {
        img.src = "";
        img.style.display = "none";
    }

    const button = document.getElementById(buttonId);

    if (button) {
        button.style.display = "none";
    }

    const fileName = document.getElementById(getFileNameId(inputId));

    if (fileName) {
        fileName.textContent = "選択されていません";
    }
}

function getFileNameId(inputId) {
    return "fileName" + inputId.charAt(0).toUpperCase() + inputId.slice(1);
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

        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = function () {
            reject(new Error("画像読み込み失敗"));
        };

        reader.readAsDataURL(file);
    });
}

function validateRequiredFields() {
    const requiredLabels = document.querySelectorAll("label.required");
    const errors = [];

    // メイン画像は1枚以上必須
    const hasMainImage =
        document.getElementById("mainImage1").files.length ||
        document.getElementById("mainImage2").files.length ||
        document.getElementById("mainImage3").files.length;

    if (!hasMainImage) {
        errors.push("メイン画像");
    }

    for (const label of requiredLabels) {
        const inputId = label.getAttribute("for");

        if (!inputId) {
            continue;
        }

        const input = document.getElementById(inputId);

        if (!input) {
            continue;
        }

        if (!input.value.trim()) {
            errors.push(label.textContent);
        }
    }

    if (errors.length > 0) {
        alert("以下の項目を入力してください。\n\n" + errors.join("\n"));
        return false;
    }

    return true;
}
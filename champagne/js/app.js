const liffId = "2010495117-Yc1KZJ4o";
const gasUrl = "https://script.google.com/macros/s/AKfycbyiMoulKLMG9MTisDZC8jdfQ6KeQwS6ia7R80YZxMHrXoSLC_-zrmL5urpkeWchoezF/exec";

const now = new Date();

const dateText =
  now.getFullYear() +
  String(now.getMonth() + 1).padStart(2, "0") +
  String(now.getDate()).padStart(2, "0") +
  "_" +
  String(now.getHours()).padStart(2, "0") +
  String(now.getMinutes()).padStart(2, "0") +
  String(now.getSeconds()).padStart(2, "0") +
  String(now.getMilliseconds()).padStart(3, "0");

const tempOrderId = `TEMP_${dateText}`;

const uploadState = {
  mainImage1: null,
  mainImage2: null,
  mainImage3: null,
  neckLabelImage1: null,
  neckLabelImage2: null,
  neckLabelImage3: null,
  keyChainImage1: null,
  keyChainImage2: null,
  keyChainImage3: null
};

let uploadCount = 0;

const sendBtn = document.getElementById("sendBtn");
const result = document.getElementById("result");

sendBtn.addEventListener("click", send);

addPreview("mainImage1", "previewMainImage1", "removeMainImage1", "main");
addPreview("mainImage2", "previewMainImage2", "removeMainImage2", "main");
addPreview("mainImage3", "previewMainImage3", "removeMainImage3", "main");

addPreview("neckLabelImage1", "previewNeckLabelImage1", "removeNeckLabelImage1", "neckLabel");
addPreview("neckLabelImage2", "previewNeckLabelImage2", "removeNeckLabelImage2", "neckLabel");
addPreview("neckLabelImage3", "previewNeckLabelImage3", "removeNeckLabelImage3", "neckLabel");

addPreview("keyChainImage1", "previewKeyChainImage1", "removeKeyChainImage1", "keyChain");
addPreview("keyChainImage2", "previewKeyChainImage2", "removeKeyChainImage2", "keyChain");
addPreview("keyChainImage3", "previewKeyChainImage3", "removeKeyChainImage3", "keyChain");

async function initLiff() {
  if (typeof liff !== "undefined") {
    await liff.init({ liffId });
  }
}

initLiff();

async function send() {
  if (!validateRequiredFields()) return;

  if (uploadCount > 0) {
    alert("画像をアップロード中です。少し待ってから送信してください。");
    return;
  }

  sendBtn.disabled = true;
  sendBtn.innerText = "送信中...";
  result.innerHTML = "少々お待ちください";

  try {
    let profile = null;

    if (typeof liff !== "undefined" && liff.isLoggedIn()) {
      profile = await liff.getProfile();
    }

    const payload = {
      action: "submitOrder",
      tempOrderId,

      displayName: profile ? profile.displayName : "",
      userId: profile ? profile.userId : "",

      designRequest: getValue("designRequest"),
      contents: getValue("contents"),
      capOption: getValue("capOption"),
      ledOption: getValue("ledOption"),
      shopName: getValue("shopName"),
      zip: getValue("zip"),
      address: getValue("address"),
      telNumber: getValue("telNumber"),
      deliveryTime: getCheckedValue("deliveryTime"),
      leaveAtDoor: getCheckedValue("leaveAtDoor"),
      billingName: getValue("billingName"),
      remarks: getValue("remarks")
    };

    await fetch(gasUrl, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload)
    });

    sendBtn.innerText = "送信完了！";
    result.innerHTML = "✅ 送信完了！";

  } catch (error) {
    console.error(error);

    sendBtn.disabled = false;
    sendBtn.innerText = "送信";
    result.innerHTML = "送信失敗：" + error.message;
  }
}

function addPreview(inputId, previewId, buttonId, imageType) {
  document.getElementById(inputId).addEventListener("change", async function () {
    await prepareAndUploadImage(inputId, previewId, buttonId, imageType);
  });
}

async function prepareAndUploadImage(inputId, previewId, buttonId, imageType) {
  const input = document.getElementById(inputId);
  const file = input.files[0];

  uploadState[inputId] = null;

  if (!file) return;

  uploadCount++;
  updateSendButton();

  try {
    const base64 = await fileToBase64(file);

    showPreview(inputId, previewId, buttonId, base64, file.name);

    const payload = {
      action: "uploadImage",
      tempOrderId,
      imageType,
      inputId,
      fileName: file.name,
      mimeType: file.type,
      imageBase64: base64
    };

    await fetch(gasUrl, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload)
    });

    uploadState[inputId] = {
      uploaded: true,
      imageType,
      inputId,
      fileName: file.name
    };

  } catch (error) {
    console.error(error);
    alert("画像アップロードに失敗しました");

    input.value = "";
    uploadState[inputId] = null;
    clearPreview(inputId, previewId, buttonId);

  } finally {
    uploadCount--;
    updateSendButton();
  }
}

function showPreview(inputId, previewId, buttonId, base64, fileNameText) {
  const img = document.getElementById(previewId);
  img.src = base64;
  img.style.display = "block";

  const button = document.getElementById(buttonId);
  if (button) button.style.display = "inline-block";

  const fileName = document.getElementById(getFileNameId(inputId));
  if (fileName) fileName.textContent = fileNameText;
}

async function removeImage(inputId, previewId, buttonId) {
  document.getElementById(inputId).value = "";

  uploadState[inputId] = null;
  clearPreview(inputId, previewId, buttonId);

  try {
    await fetch(gasUrl, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        action: "deleteImage",
        tempOrderId,
        inputId
      })
    });
  } catch (error) {
    console.error(error);
    alert("Drive上の画像削除に失敗しました");
  }
}

function clearPreview(inputId, previewId, buttonId) {
  const img = document.getElementById(previewId);

  if (img) {
    img.src = "";
    img.style.display = "none";
  }

  const button = document.getElementById(buttonId);
  if (button) button.style.display = "none";

  const fileName = document.getElementById(getFileNameId(inputId));
  if (fileName) fileName.textContent = "選択されていません";
}

function updateSendButton() {
  if (uploadCount > 0) {
    sendBtn.disabled = true;
    sendBtn.innerText = "画像アップロード中...";
  } else {
    sendBtn.disabled = false;
    sendBtn.innerText = "送信";
  }
}

function getValue(id) {
  return document.getElementById(id).value;
}

function getCheckedValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
}

function getFileNameId(inputId) {
  return "fileName" + inputId.charAt(0).toUpperCase() + inputId.slice(1);
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

  const hasMainImage =
    uploadState.mainImage1 ||
    uploadState.mainImage2 ||
    uploadState.mainImage3;

  if (!hasMainImage) {
    errors.push("メイン画像");
  }

  for (const label of requiredLabels) {
    const inputId = label.getAttribute("for");
    if (!inputId) continue;

    const input = document.getElementById(inputId);
    if (!input) continue;

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
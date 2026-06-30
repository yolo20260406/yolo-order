const liffId = "2010495117-Yc1KZJ4o";
const gasUrl = "https://script.google.com/macros/s/AKfycbyiMoulKLMG9MTisDZC8jdfQ6KeQwS6ia7R80YZxMHrXoSLC_-zrmL5urpkeWchoezF/exec";

const imageData = {
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

let processingCount = 0;

const sendBtn = document.getElementById("sendBtn");
const result = document.getElementById("result");

sendBtn.addEventListener("click", send);

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
    await liff.init({ liffId });
  }
}

initLiff();

async function send() {
  if (!validateRequiredFields()) return;

  if (processingCount > 0) {
    alert("画像を準備中です。少し待ってから送信してください。");
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
      remarks: getValue("remarks"),

      mainImages: getPreparedImages(["mainImage1", "mainImage2", "mainImage3"]),
      neckLabelImages: getPreparedImages(["neckLabelImage1", "neckLabelImage2", "neckLabelImage3"]),
      keyChainImages: getPreparedImages(["keyChainImage1", "keyChainImage2", "keyChainImage3"])
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

function addPreview(inputId, previewId, buttonId) {
  document.getElementById(inputId).addEventListener("change", async function () {
    await prepareImage(inputId, previewId, buttonId);
  });
}

async function prepareImage(inputId, previewId, buttonId) {
  const input = document.getElementById(inputId);
  const file = input.files[0];

  imageData[inputId] = null;

  if (!file) return;

  processingCount++;
  updateSendButton();

  try {
    const base64 = await fileToBase64(file);

    imageData[inputId] = {
      inputId,
      fileName: file.name,
      mimeType: file.type,
      imageBase64: base64
    };

    const img = document.getElementById(previewId);
    img.src = base64;
    img.style.display = "block";

    const button = document.getElementById(buttonId);
    if (button) button.style.display = "inline-block";

    const fileName = document.getElementById(getFileNameId(inputId));
    if (fileName) fileName.textContent = file.name;

  } catch (error) {
    console.error(error);
    alert("画像の読み込みに失敗しました");

    input.value = "";
    imageData[inputId] = null;

  } finally {
    processingCount--;
    updateSendButton();
  }
}

function removeImage(inputId, previewId, buttonId) {
  document.getElementById(inputId).value = "";
  imageData[inputId] = null;

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

function getPreparedImages(inputIds) {
  return inputIds
    .map(id => imageData[id])
    .filter(Boolean);
}

function updateSendButton() {
  if (processingCount > 0) {
    sendBtn.disabled = true;
    sendBtn.innerText = "画像を準備中...";
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
    imageData.mainImage1 ||
    imageData.mainImage2 ||
    imageData.mainImage3;

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
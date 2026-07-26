function config(open) {
    const configMenu = document.getElementById("config-menu");
    const parteCinza = document.getElementById("parte-cinza");

    configMenu.style.display = open ? "flex" : "none";
    parteCinza.style.display = open ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const configBtn = document.getElementById("config-btn");
    const configMenu = document.getElementById("config-menu");
    const parteCinza = document.getElementById("parte-cinza");

    configBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        config(true);
    });

    configMenu.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    parteCinza.addEventListener("click", () => {
        config(false);
    });

    document.addEventListener("click", () => {
        config(false);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            config(false);
        }
    });
});
const coresOriginais = [
    "#D8A365",
    "#BA7B3D",
    "#A16224",
    "#6A3501",
    "#422101",
    "#201200"
];

function alterarCor(numero, cor) {
    document.documentElement.style.setProperty(`--color-${numero}`, cor);
}

function salvarCores() {
    const cores = [];

    for (let i = 1; i <= 6; i++) {
        cores.push(document.getElementById(`color${i}`).value);
    }

    localStorage.setItem("coresModbox", JSON.stringify(cores));
}

function carregarCores() {
    const salvas = JSON.parse(localStorage.getItem("coresModbox"));

    const cores = salvas || coresOriginais;

    for (let i = 1; i <= 6; i++) {
        document.getElementById(`color${i}`).value = cores[i - 1];
        alterarCor(i, cores[i - 1]);
    }
}

function restaurarCores() {
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`color${i}`).value = coresOriginais[i - 1];
        alterarCor(i, coresOriginais[i - 1]);
    }

    salvarCores();
}

for (let i = 1; i <= 6; i++) {
    document.getElementById(`color${i}`).addEventListener("input", function () {
        alterarCor(i, this.value);
        salvarCores();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarCores();
});

document.getElementById("restaurar-cores").addEventListener("click", restaurarCores);

const homeScreen = document.getElementById("home-screen-img");
const importBtn = document.getElementById("import-img");
const inputImagem = document.getElementById("import-image-input");
const restaurarFundo = document.getElementById("restaurar-fundo");

const imagemPadrao = "../img/home-screen.jpg";

importBtn.addEventListener("click", () => {
    inputImagem.click();
});

inputImagem.addEventListener("change", function () {
    const arquivo = this.files[0];

    if (!arquivo) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const imagem = e.target.result;

        homeScreen.style.backgroundImage = `url("${imagem}")`;

        localStorage.setItem("imagemHome", imagem);
    };

    reader.readAsDataURL(arquivo);
});

function carregarImagem() {
    const imagem = localStorage.getItem("imagemHome");

    if (imagem) {
        homeScreen.style.backgroundImage = `url("${imagem}")`;
    } else {
        homeScreen.style.backgroundImage = `url("${imagemPadrao}")`;
    }
}

restaurarFundo.addEventListener("click", () => {
    localStorage.removeItem("imagemHome");
    homeScreen.style.backgroundImage = `url("${imagemPadrao}")`;
});

document.addEventListener("DOMContentLoaded", carregarImagem);

const tabs = document.querySelectorAll("#tabs .tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("selected"));
        contents.forEach(c => c.classList.remove("active"));

        tab.classList.add("selected");

        const id = tab.dataset.tab;
        document.getElementById(id).classList.add("active");

    });

});
const btnImportarJson = document.getElementById("importar-json");
const inputImportarJson = document.getElementById("import-json-input");
const statusImport = document.getElementById("import-status");

btnImportarJson.addEventListener("click", () => {
    inputImportarJson.click();
});

inputImportarJson.addEventListener("change", function () {

    const arquivo = this.files[0];

    if (!arquivo) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const json = JSON.parse(e.target.result);

            if (json.name) {

                nomeMod.textContent = json.name;
                inputNomeMod.value = json.name;
                localStorage.setItem("nomeMod", json.name);

            }

            if (!("colors" in json))
                throw new Error("The file does not have a 'colors' property.");

            if (!Array.isArray(json.colors))
                throw new Error("'colors' is not an array.");

            if (json.colors.length < 6)
                throw new Error("The 'colors' array must have at least 6 colors.");

            for (let i = 0; i < 6; i++) {

                const cor = json.colors[i];

                if (typeof cor !== "string")
                    throw new Error(`Color ${i + 1} is not text.`);

                if (!/^#[0-9A-Fa-f]{6}$/.test(cor))
                    throw new Error(`Color ${i + 1} (${cor}) is invalid.`);
            }

            for (let i = 0; i < 6; i++) {

                alterarCor(i + 1, json.colors[i]);

                document.getElementById(`color${i + 1}`).value = json.colors[i];
            }

            salvarCores();

            statusImport.style.color = "var(--color-1)";
            statusImport.textContent = "Colors imported successfully.";

        } catch (erro) {

            statusImport.style.color = "var(--color-1)";
            statusImport.textContent = "Error: " + erro.message;

        }

    };

    reader.readAsText(arquivo);

});
document.getElementById("gerar-cores").addEventListener("click", gerarPaletaDaImagem);
async function gerarPaletaDaImagem() {

    const bg = getComputedStyle(document.getElementById("home-screen-img"))
        .backgroundImage;

    const url = bg.slice(5, -2);

    if (!url || url === "none") {
        alert("No background image loaded yet.");
        return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        let pixelData;

        try {

            const amostraW = Math.min(img.width, 10);
            const amostraH = Math.min(img.height, 10);

            pixelData = ctx.getImageData(
                0,
                img.height - amostraH,
                amostraW,
                amostraH
            ).data;

        } catch (erro) {

            alert("Could not read the image to extract colors (CORS restriction). Try using a local image.");
            return;

        }

        let r = 0, g = 0, b = 0, total = 0;

        for (let i = 0; i < pixelData.length; i += 4) {

            if (pixelData[i + 3] < 20) continue;

            r += pixelData[i];
            g += pixelData[i + 1];
            b += pixelData[i + 2];
            total++;

        }

        if (total === 0) {
            alert("Could not identify a valid color in this region of the image.");
            return;
        }

        r = Math.round(r / total);
        g = Math.round(g / total);
        b = Math.round(b / total);

        criarPaleta(r, g, b);

    };

    img.onerror = function () {
        alert("Could not load the image to generate the palette.");
    };

    img.src = url;
}
function rgbToHsl(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h, s;
    const l = (max + min) / 2;

    if (max === min) {

        h = s = 0;

    } else {

        const d = max - min;

        s = l > 0.5
            ? d / (2 - max - min)
            : d / (max + min);

        switch (max) {

            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;

            case g:
                h = ((b - r) / d + 2) / 6;
                break;

            case b:
                h = ((r - g) / d + 4) / 6;
                break;

        }

    }

    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

function hslToHex(h, s, l) {

    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    const red = Math.round((r + m) * 255);
    const green = Math.round((g + m) * 255);
    const blue = Math.round((b + m) * 255);

    return rgbToHex(red, green, blue);
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b]
        .map(x => x.toString(16).padStart(2, "0"))
        .join("");
}

function criarPaleta(r, g, b) {

    const hsl = rgbToHsl(r, g, b);

    const cores = [
        hslToHex(hsl.h, Math.min(100, hsl.s + 10), Math.min(90, hsl.l + 25)),
        hslToHex(hsl.h, Math.min(100, hsl.s + 16), Math.min(80, hsl.l + 20)),
        hslToHex(hsl.h, Math.min(100, hsl.s + 22), Math.min(70, hsl.l + 15)),
        hslToHex(hsl.h, Math.min(100, hsl.s + 30), Math.min(50, hsl.l + 10)),
        hslToHex(hsl.h, Math.min(100, hsl.s + 38), Math.min(40, hsl.l + 5)),
        rgbToHex(r, g, b)
    ];

    cores.forEach((cor, i) => {

        alterarCor(i + 1, cor);
        document.getElementById(`color${i + 1}`).value = cor;

    });

    salvarCores();

}
async function pegarCorDaTela(input) {

    if (!window.EyeDropper) {
        alert("Your browser does not support the screen Color Picker.");
        return;
    }

    const configMenu = document.getElementById("config-menu");
    const parteCinza = document.getElementById("parte-cinza");

    configMenu.style.display = "none";
    parteCinza.style.display = "none";

    try {

        const eyeDropper = new EyeDropper();
        const resultado = await eyeDropper.open();

        input.value = resultado.sRGBHex;
        input.dispatchEvent(new Event("input"));

    } catch (e) {
    } finally {

        configMenu.style.display = "flex";
        parteCinza.style.display = "block";

    }
}
const nomeMod = document.getElementById("nome-do-mod");
const inputNomeMod = document.getElementById("nome-do-mod-input");

function carregarNomeMod() {

    const nome = localStorage.getItem("nomeMod");

    if (nome) {
        nomeMod.textContent = nome;
        inputNomeMod.value = nome;
    } else {
        inputNomeMod.value = nomeMod.textContent;
    }

}

inputNomeMod.addEventListener("input", function () {

    const nome = this.value.trim();

    if (nome === "") {
        nomeMod.textContent = "Modbox";
        localStorage.removeItem("nomeMod");
    } else {
        nomeMod.textContent = nome;
        localStorage.setItem("nomeMod", nome);
    }

});

document.addEventListener("DOMContentLoaded", carregarNomeMod);
const codigoExport = document.getElementById("codigo-export");
const btnCopiar = document.getElementById("copiar-cores");

function atualizarCodigoExport() {

    const cores = [];

    for (let i = 1; i <= 6; i++) {
        cores.push(document.getElementById(`color${i}`).value);
    }

    codigoExport.value =
        `"colors":[
    "${cores.join('",\n    "')}"
],`;
}

btnCopiar.addEventListener("click", async () => {

    await navigator.clipboard.writeText(codigoExport.value);

    const texto = btnCopiar.textContent;
    btnCopiar.textContent = "Copied!";

    setTimeout(() => {
        btnCopiar.textContent = texto;
    }, 1500);

});
function salvarCores() {
    const cores = [];

    for (let i = 1; i <= 6; i++) {
        cores.push(document.getElementById(`color${i}`).value);
    }

    localStorage.setItem("coresModbox", JSON.stringify(cores));

    atualizarCodigoExport();
}
document.addEventListener("DOMContentLoaded", () => {
    carregarCores();
    atualizarCodigoExport();
});
function voltar() {
    window.location.href = "../index.html";
}
window.addEventListener("load", () => {

    const fade = document.getElementById("fade");

    fade.classList.add("fade-out");

    fade.addEventListener("transitionend", () => {
        fade.remove();
    });

});
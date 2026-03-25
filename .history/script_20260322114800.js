// ========================================================
// GLOBAL CONFIGURATION
// ========================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxe_QoaFiYwuvWcvkoD46iXf9nzCBwihkhnqvVddOMrk04phMlt5rXwQgWJVycMj3s3WQ/exec"
// Helper for Robust Data Mapping (handles space/case variations)
function getInvVal(inv, ...keys) {
    if (!inv) return "";
    for (let key of keys) {
        if (inv[key] !== undefined && inv[key] !== null) return inv[key];
        // Normalize and search
        const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const target = norm(key);
        const actualKey = Object.keys(inv).find(k => norm(k) === target);
        if (actualKey) return inv[actualKey];
    }
    return "";
}

// Helper for Robust Date Parsing
function parseSheetDate(dStr) {
    if (!dStr) return new Date();
    let d = new Date(dStr);
    if (!isNaN(d)) return d;

    // Fallback: Check for dd/mm/yyyy or dd-mm-yyyy formatting commonly output by Sheets
    const parts = String(dStr).split(/[\/\-]/);
    if (parts.length === 3) {
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        d = new Date(year, month, day);
        if (!isNaN(d)) return d;
    }
    return new Date();
}

// ========================================================
document.addEventListener('keydown', function (e) {
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U
    if (e.keyCode == 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) ||
        (e.ctrlKey && e.keyCode == 85)) {
        e.preventDefault();
        showToast("⛔ Security: Source inspection is restricted.");
    }
});

// Deter console log viewing
console.log("%cSTOP! Source code copying is restricted.", "color: red; font-size: 30px; font-weight: bold;");

// ========================================================
// CUSTOM CONTEXT MENU (Copy, Paste, Cut)
// ========================================================
const customMenu = document.getElementById("customContextMenu");
let contextTarget = null;

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    contextTarget = e.target;

    // Position menu
    customMenu.style.top = `${e.pageY}px`;
    customMenu.style.left = `${e.pageX}px`;
    customMenu.classList.add("show");
});

document.addEventListener("click", () => {
    customMenu.classList.remove("show");
});

// Handle Menu Actions
document.getElementById("menu-copy").addEventListener("click", async () => {
    let text = "";
    if (contextTarget && (contextTarget.tagName === "INPUT" || contextTarget.tagName === "TEXTAREA")) {
        text = contextTarget.value.substring(contextTarget.selectionStart, contextTarget.selectionEnd);
    } else {
        text = window.getSelection().toString();
    }

    if (text) {
        await navigator.clipboard.writeText(text);
        showToast("✓ Copied to clipboard");
    }
});

document.getElementById("menu-cut").addEventListener("click", async () => {
    if (contextTarget && (contextTarget.tagName === "INPUT" || contextTarget.tagName === "TEXTAREA")) {
        const start = contextTarget.selectionStart;
        const end = contextTarget.selectionEnd;
        const text = contextTarget.value.substring(start, end);

        if (text) {
            await navigator.clipboard.writeText(text);
            contextTarget.value = contextTarget.value.substring(0, start) + contextTarget.value.substring(end);
            showToast("✓ Cut to clipboard");
            saveFormData(); // trigger save
        }
    }
});

document.getElementById("menu-paste").addEventListener("click", async () => {
    if (contextTarget && (contextTarget.tagName === "INPUT" || contextTarget.tagName === "TEXTAREA")) {
        try {
            const text = await navigator.clipboard.readText();
            const start = contextTarget.selectionStart;
            const end = contextTarget.selectionEnd;
            contextTarget.value = contextTarget.value.substring(0, start) + text + contextTarget.value.substring(end);
            showToast("✓ Pasted from clipboard");
            saveFormData(); // trigger save
        } catch (err) {
            showToast("⚠ Browser blocked clipboard access");
        }
    }
});

const masterColors = [
    "Alpine Green", "Amber Brown", "Amber Orange", "Aqua", "Aqua Green", "Arctic Blue", "Arctic White",
    "Ash Grey", "Aurora Blue", "Aurora Green",
    "Baby Blue", "Baby Pink", "Beige", "Black", "Black Titanium", "Blush Pink", "Blue", "Blue Titanium",
    "Brushed Titanium", "Bronze", "Burgundy", "Burnished Copper",
    "Ceramic White", "Charcoal Black", "Charcoal Grey", "Cherry Red", "Cloud Blue", "Cloud White",
    "Coffee Brown", "Comet Blue", "Cool Blue-Green", "Copper", "Coral Orange", "Coral Pink", "Coral Red",
    "Cream", "Crimson Red", "Crystal Blue", "Cyan",
    "Dark Purple", "Dark Titanium", "Deep Black", "Deep Blue", "Deep Purple", "Desert Brown", "Diamond Black",
    "Diamond Blue", "Dreamy Blue",
    "Ebony Black", "Electric Blue", "Electric Green", "Electric Purple", "Emerald Green", "Eternal Green",
    "Frost White", "Frosted Glass", "Galaxy Blue", "Glacier Blue", "Glacier Green", "Glitter Green", "Gold",
    "Golden Yellow", "Graphite Black", "Graphite Grey", "Grey", "Green",
    "Halo White", "Holographic Blue", "Horizon Blue", "Horizon Silver",
    "Ice Blue", "Ice Mint", "Ice Silver", "Indigo Blue", "Interstellar Blue", "Iron Grey", "Iris Purple",
    "Jade Green", "Jet Black",
    "Lavender", "Lemon Yellow", "Lilac Purple", "Light Titanium", "Liquid Metal Silver", "Lime Green",
    "Marble Black", "Marine Blue", "Maroon", "Matte Black", "Metallic Titanium", "Midnight Black", "Midnight Blue",
    "Mint Green", "Mirror Black", "Mirror Silver", "Mocha Brown", "Moonlit Purple", "Moonstone White",
    "Moss Green", "Mustard Yellow", "Mystic Bronze", "Mystic Purple",
    "Navy Blue", "Nebula Blue", "Nebula Green", "Nebula Purple", "Neon Yellow", "Night Black", "Nordic Green",
    "Ocean Blue", "Ocean Gradient", "Ocean Mint", "Olive Green", "Onyx Black", "Opal Green",
    "Orange", "Orchid Purple",
    "Pastel Green", "Peach Pink", "Pearl White", "Phantom Black", "Phantom Green", "Pink", "Platinum Silver",
    "Poco Yellow", "Polar Blue", "Prism Black", "Prism Blue", "Prism Silver", "Prism White", "Purple",
    "Quartz Silver",
    "Radiant Purple", "Rainbow Spectrum", "Raven Black", "Red", "Reflective Blue", "Rose Gold", "Rose Pink", "Rose Red",
    "Royal Blue", "Ruby Red",
    "Sage Green", "Sakura Pink", "Sandstone Black", "Sapphire Blue", "Sea Green", "Sea Salt", "Shadow Black",
    "Shadow Grey", "Sierra Blue", "Silver", "Sky Blue", "Smoke Grey", "Snow White", "Soft Pink", "Solar Red",
    "Space Black", "Space Grey", "Spectrum Black", "Star Silver", "Starfall Blue", "Starlight", "Starlight Blue",
    "Starry Black", "Starry Gradient", "Stone Grey", "Storm Grey", "Sunrise Gold", "Sunset Orange", "Super Black",
    "Supernova Blue",
    "Teal", "Teal Green", "Titanium", "Titanium Blue", "Titanium Graphite", "Titanium Grey", "Titanium Silver",
    "Titanium Silver Blue", "Titanium Silver Green", "Transparent", "Turquoise",
    "Ultra Violet",
    "Vegan Leather Blue", "Vegan Leather Brown", "Vegan Leather Orange", "Violet", "Volcanic Black",
    "Wine Red", "Winter White",
    "Yellow"
];
const brandSuggestionsData = {
    // ================= MOBILE BRANDS =================
    Mobile: [
        "Apple",
        "Asus",
        "BlackBerry",
        "Google Pixel",
        "Honor",
        "HTC",
        "Huawei",
        "Infinix",
        "iQOO",
        "Lava",
        "Lenovo",
        "LG",
        "Meizu",
        "Micromax",
        "Motorola",
        "Nokia",
        "Nothing",
        "OnePlus",
        "Oppo",
        "Panasonic",
        "Poco",
        "Realme",
        "Redmi",
        "Samsung",
        "Sony",
        "Tecno",
        "Vivo",
        "Xiaomi",
        "ZTE"
    ],
    // ================= LAPTOP BRANDS =================
    Laptop: [
        "Acer Laptop",
        "Alienware Laptop",
        "Apple MacBook",
        "Asus Laptop",
        "Avita Laptop",
        "Chuwi Laptop",
        "Dell Laptop",
        "Gigabyte Laptop",
        "HP Laptop",
        "Huawei Laptop",
        "Infinix Laptop",
        "Lenovo Laptop",
        "LG Laptop",
        "Microsoft Surface",
        "MSI Laptop",
        "Razer Laptop",
        "Samsung Laptop",
        "Sony Vaio",
        "Toshiba Laptop",
        "Xiaomi Laptop"
    ],
    // ================= TABLET BRANDS =================
    Tablet: [
        "Acer Tablet",
        "Alcatel Tablet",
        "Amazon Fire Tablet",
        "Apple iPad",
        "Chuwi Tablet",
        "Dell Tablet",
        "Honor Pad",
        "Huawei MatePad",
        "Lenovo Tablet",
        "Nokia Tablet",
        "OnePlus Pad",
        "Realme Pad",
        "Redmi Pad",
        "Samsung Tablet",
        "Xiaomi Pad"
    ],
    // ================= SMARTWATCH =================
    Smartwatch: [
        "Amazfit Watch",
        "Apple Watch",
        "Boat Watch",
        "CMF Watch",
        "CrossBeats Watch",
        "Fire-Boltt Watch",
        "Fitbit Watch",
        "Fossil Watch",
        "Garmin Watch",
        "Google Pixel Watch",
        "Hammer Watch",
        "Honor Watch",
        "Huami Watch",
        "Huawei Watch",
        "Noise Watch",
        "OnePlus Watch",
        "Oppo Watch",
        "Pebble Watch",
        "Polar Watch",
        "pTron Watch",
        "Realme Watch",
        "Redmi Watch",
        "Samsung Watch",
        "Suunto Watch",
        "Tagg Watch",
        "Vivo Watch",
        "Xiaomi Watch",
        "Zebronics Watch"
    ],
    // ================= EARBUDS =================
    Earbuds: [
        "Ambrane Audio",
        "Anker Soundcore",
        "Apple AirPods",
        "Beats Audio",
        "Boat Audio",
        "Bose Audio",
        "Boult Audio",
        "CrossBeats Audio",
        "Hammer Audio",
        "Intex Audio",
        "JBL Earbuds",
        "Marshall Earbuds",
        "Morbi Audio",
        "Noise Buds",
        "Nothing Ear",
        "OnePlus Buds",
        "Oppo Enco",
        "Philips Earbuds",
        "Portronics Audio",
        "pTron Audio",
        "Realme Buds",
        "Redmi Buds",
        "Samsung Buds",
        "Sennheiser Audio",
        "Skullcandy Earbuds",
        "Sony Earbuds",
        "Syska Audio",
        "Ubon Audio",
        "Vivo TWS",
        "Xiaomi Buds",
        "Zebronics Audio"
    ],
    // ================= SPEAKER =================
    Speaker: [
        "Amazon Echo",
        "Ambrane Speaker",
        "Anker Soundcore Speaker",
        "Artis Speaker",
        "Boat Speaker",
        "Bose Speaker",
        "Dolby Speaker",
        "F&D Speaker",
        "Harman Kardon Speaker",
        "Harman Speaker",
        "iBall Speaker",
        "Infinity Speaker",
        "Intex Speaker",
        "JBL Speaker",
        "Marshall Speaker",
        "Mi Speaker",
        "Mivi Speaker",
        "Morbi Speaker",
        "Noise Speaker",
        "Philips Speaker",
        "Portronics Speaker",
        "Realme Speaker",
        "Redmi Speaker",
        "Sony Speaker",
        "Syska Speaker",
        "Ubon Speaker",
        "Ultimate Ears Speaker",
        "Xiaomi Speaker",
        "Zebronics Speaker"
    ],
    // ================= POWERBANK =================
    PowerBank: [
        "Ambrane PowerBank",
        "Anker PowerBank",
        "Boat PowerBank",
        "Callmate PowerBank",
        "Frontech PowerBank",
        "iBall PowerBank",
        "Intex PowerBank",
        "Lapcare PowerBank",
        "Mi PowerBank",
        "Morbi PowerBank",
        "OnePlus PowerBank",
        "Portronics PowerBank",
        "pTron PowerBank",
        "Realme PowerBank",
        "Redmi PowerBank",
        "Samsung PowerBank",
        "Stuffcool PowerBank",
        "Syska PowerBank",
        "Ubon PowerBank",
        "URBN PowerBank",
        "Xiaomi PowerBank",
        "Zebronics PowerBank"
    ],

    // ================= CHARGER =================
    Charger: [
        "Ambrane Charger",
        "Anker Charger",
        "Apple Charger",
        "Baseus Charger",
        "Belkin Charger",
        "Boat Charger",
        "Callmate Charger",
        "Huawei Charger",
        "Intex Charger",
        "Lapcare Charger",
        "Morbi Charger",
        "OnePlus Charger",
        "Oppo Charger",
        "Portronics Charger",
        "pTron Charger",
        "Realme Charger",
        "Redmi Charger",
        "Samsung Charger",
        "Syska Charger",
        "Ubon Charger",
        "URBN Charger",
        "Vivo Charger",
        "Xiaomi Charger",
        "Zebronics Charger"
    ],
    // ================= CABLE =================
    Cable: [
        "Ambrane Cable",
        "Anker Cable",
        "Apple Cable",
        "Baseus Cable",
        "Belkin Cable",
        "Boat Cable",
        "Callmate Cable",
        "Huawei Cable",
        "Intex Cable",
        "Lapcare Cable",
        "Morbi Cable",
        "OnePlus Cable",
        "Oppo Cable",
        "Portronics Cable",
        "pTron Cable",
        "Realme Cable",
        "Redmi Cable",
        "Samsung Cable",
        "Syska Cable",
        "Ubon Cable",
        "URBN Cable",
        "Vivo Cable",
        "Xiaomi Cable",
        "Zebronics Cable"
    ],
    // ================= KEYBOARD =================
    Keyboard: [
        "Acer Keyboard",
        "Amkette Keyboard",
        "Ant Esports Keyboard",
        "Apple Keyboard",
        "Asus Keyboard",
        "Corsair Keyboard",
        "Cosmic Byte Keyboard",
        "Dell Keyboard",
        "Frontech Keyboard",
        "HP Keyboard",
        "iBall Keyboard",
        "Lapcare Keyboard",
        "Lenovo Keyboard",
        "Logitech Keyboard",
        "Microsoft Keyboard",
        "Portronics Keyboard",
        "Razer Keyboard",
        "Redgear Keyboard",
        "Zebronics Keyboard"
    ],
    // ================= MOUSE =================
    Mouse: [
        "Acer Mouse",
        "Amkette Mouse",
        "Ant Esports Mouse",
        "Apple Mouse",
        "Asus Mouse",
        "Corsair Mouse",
        "Cosmic Byte Mouse",
        "Dell Mouse",
        "Frontech Mouse",
        "HP Mouse",
        "iBall Mouse",
        "Lapcare Mouse",
        "Lenovo Mouse",
        "Logitech Mouse",
        "Microsoft Mouse",
        "Portronics Mouse",
        "Razer Mouse",
        "Redgear Mouse",
        "Zebronics Mouse"
    ],
    // ================= HEADPHONES =================
    Headphones: [
        "Ambrane Headphones",
        "Beats Headphones",
        "Boat Headphones",
        "Bose Headphones",
        "Boult Headphones",
        "Callmate Headphones",
        "Corsair Headphones",
        "Cosmic Byte Headphones",
        "Frontech Headphones",
        "HyperX Headphones",
        "Intex Headphones",
        "JBL Headphones",
        "Lapcare Headphones",
        "Logitech Headphones",
        "Marshall Headphones",
        "Morbi Headphones",
        "Noise Headphones",
        "OnePlus Headphones",
        "Philips Headphones",
        "Portronics Headphones",
        "pTron Headphones",
        "Razer Headphones",
        "Realme Headphones",
        "Sennheiser Headphones",
        "Skullcandy Headphones",
        "Sony Headphones",
        "Ubon Headphones",
        "Zebronics Headphones"
    ],
    // ================= ACCESSORY =================
    Accessory: [
        "Caseology Accessory",
        "DailyObjects Accessory",
        "Generic Accessory",
        "Morbi Accessory",
        "OtterBox Accessory",
        "Rhinoshield Accessory",
        "Ringke Accessory",
        "Spigen Accessory",
        "UAG Accessory"
    ],

    // ================= OTHER =================
    Other: [
    ]
};

const modelSuggestionsData = {

    Samsung: [
        "Galaxy A02",
        "Galaxy A03",
        "Galaxy A04",
        "Galaxy A12",
        "Galaxy A13",
        "Galaxy A14",
        "Galaxy A16",
        "Galaxy A22",
        "Galaxy A23",
        "Galaxy A24",
        "Galaxy A26",
        "Galaxy A34",
        "Galaxy A35",
        "Galaxy A36",
        "Galaxy A46",
        "Galaxy A52",
        "Galaxy A52s",
        "Galaxy A53",
        "Galaxy A54",
        "Galaxy A56",
        "Galaxy A7 (2018)",
        "Galaxy A71",
        "Galaxy A72",
        "Galaxy A73",
        "Galaxy A9 Pro",
        "Galaxy C7",
        "Galaxy C9 Pro",
        "Galaxy Core",
        "Galaxy Core 2",
        "Galaxy Core Prime",
        "Galaxy F12",
        "Galaxy F13",
        "Galaxy F16",
        "Galaxy F21",
        "Galaxy F22",
        "Galaxy F23",
        "Galaxy F26",
        "Galaxy F34",
        "Galaxy F36",
        "Galaxy F46",
        "Galaxy F54",
        "Galaxy F56",
        "Galaxy Grand Max",
        "Galaxy Grand Prime",
        "Galaxy J2 Core",
        "Galaxy J2 Pro",
        "Galaxy J3",
        "Galaxy J4",
        "Galaxy J5",
        "Galaxy J6",
        "Galaxy J7 Max",
        "Galaxy J7 Pro",
        "Galaxy J8",
        "Galaxy M04",
        "Galaxy M12",
        "Galaxy M13",
        "Galaxy M14",
        "Galaxy M16",
        "Galaxy M26",
        "Galaxy M31s",
        "Galaxy M32",
        "Galaxy M33",
        "Galaxy M34",
        "Galaxy M36",
        "Galaxy M46",
        "Galaxy M52",
        "Galaxy M53",
        "Galaxy M54",
        "Galaxy M56",
        "Galaxy Note 10",
        "Galaxy Note 10+",
        "Galaxy Note 20",
        "Galaxy Note 20 Ultra",
        "Galaxy Note 8",
        "Galaxy Note 9",
        "Galaxy Note FE",
        "Galaxy On7",
        "Galaxy On8",
        "Galaxy S10",
        "Galaxy S10+",
        "Galaxy S10e",
        "Galaxy S20",
        "Galaxy S20 FE",
        "Galaxy S20 Ultra",
        "Galaxy S20+",
        "Galaxy S21",
        "Galaxy S21 FE",
        "Galaxy S21 Ultra",
        "Galaxy S21+",
        "Galaxy S22",
        "Galaxy S22 Ultra",
        "Galaxy S22+",
        "Galaxy S23",
        "Galaxy S23 FE",
        "Galaxy S23 Ultra",
        "Galaxy S23+",
        "Galaxy S24",
        "Galaxy S24 Ultra",
        "Galaxy S24+",
        "Galaxy S25",
        "Galaxy S25 Slim",
        "Galaxy S25 Ultra",
        "Galaxy S25+",
        "Galaxy S26",
        "Galaxy S26 Ultra",
        "Galaxy S26+",
        "Galaxy S8",
        "Galaxy S8+",
        "Galaxy S9",
        "Galaxy S9+",
        "Galaxy Z Flip",
        "Galaxy Z Flip 3",
        "Galaxy Z Flip 4",
        "Galaxy Z Flip 5",
        "Galaxy Z Flip 7",
        "Galaxy Z Fold 2",
        "Galaxy Z Fold 3",
        "Galaxy Z Fold 4",
        "Galaxy Z Fold 5",
        "Galaxy Z Fold 7"
    ],

    "Google Pixel": [
        "Pixel",
        "Pixel 2",
        "Pixel 2 XL",
        "Pixel 3",
        "Pixel 3 XL",
        "Pixel 3a",
        "Pixel 3a XL",
        "Pixel 4",
        "Pixel 4 XL",
        "Pixel 4a",
        "Pixel 4a 5G",
        "Pixel 5",
        "Pixel 5a",
        "Pixel 6",
        "Pixel 6 Pro",
        "Pixel 6a",
        "Pixel 7",
        "Pixel 7 Pro",
        "Pixel 7a",
        "Pixel 8",
        "Pixel 8 Pro",
        "Pixel 8a",
        "Pixel 9",
        "Pixel 9 Pro",
        "Pixel 9 Pro Fold",
        "Pixel 9 Pro XL",
        "Pixel 9a",
        "Pixel XL"
    ],

    Apple: [
        "iPhone 11",
        "iPhone 11 Pro",
        "iPhone 11 Pro Max",
        "iPhone 12",
        "iPhone 12 Mini",
        "iPhone 12 Pro",
        "iPhone 12 Pro Max",
        "iPhone 13",
        "iPhone 13 Mini",
        "iPhone 13 Pro",
        "iPhone 13 Pro Max",
        "iPhone 14",
        "iPhone 14 Plus",
        "iPhone 14 Pro",
        "iPhone 14 Pro Max",
        "iPhone 15",
        "iPhone 15 Plus",
        "iPhone 15 Pro",
        "iPhone 15 Pro Max",
        "iPhone 16",
        "iPhone 16 Plus",
        "iPhone 16 Pro",
        "iPhone 16 Pro Max",
        "iPhone 16e",
        "iPhone 17",
        "iPhone 17 Air",
        "iPhone 17 Pro",
        "iPhone 17 Pro Max",
        "iPhone 17e",
        "iPhone 4",
        "iPhone 4s",
        "iPhone 5",
        "iPhone 5c",
        "iPhone 5s",
        "iPhone 6",
        "iPhone 6 Plus",
        "iPhone 6s",
        "iPhone 6s Plus",
        "iPhone 7",
        "iPhone 7 Plus",
        "iPhone 8",
        "iPhone 8 Plus",
        "iPhone SE (2016)",
        "iPhone SE (2020)",
        "iPhone SE (2022)",
        "iPhone X",
        "iPhone XR",
        "iPhone XS",
        "iPhone XS Max"
    ],

    Xiaomi: [
        "Mi 10",
        "Mi 10i",
        "Mi 10S",
        "Mi 10T",
        "Mi 10T Pro",
        "Mi 11 Lite",
        "Mi 11 Ultra",
        "Mi 11X",
        "Mi 11X Pro",
        "Mi 12 Pro",
        "Mi 13 Pro",
        "Mi 8",
        "Mi 9",
        "Mi 9 SE",
        "Mi 9T",
        "Mi 9T Pro",
        "Mi A1",
        "Mi A2",
        "Mi A3",
        "Mi Civi",
        "Mi Civi 2",
        "Mi Mix",
        "Mi Mix 2",
        "Mi Mix 2S",
        "Mi Mix 3",
        "Mi Mix Fold",
        "Xiaomi 11i",
        "Xiaomi 11i HyperCharge",
        "Xiaomi 12 Lite",
        "Xiaomi 12 Pro",
        "Xiaomi 13",
        "Xiaomi 13 Lite",
        "Xiaomi 14 Civi",
        "Xiaomi 15",
        "Xiaomi 15 Pro",
        "Xiaomi 15 Ultra",
        "Xiaomi 16",
        "Xiaomi 16 Pro",
        "Xiaomi 16 Ultra",
        "Xiaomi 17",
        "Xiaomi 17 Pro",
        "Xiaomi 17 Ultra"
    ],

    Redmi: [
        "Redmi 10",
        "Redmi 10 Prime",
        "Redmi 10C",
        "Redmi 11",
        "Redmi 11C",
        "Redmi 12",
        "Redmi 12C",
        "Redmi 13",
        "Redmi 5A",
        "Redmi 6A",
        "Redmi 8",
        "Redmi 8A",
        "Redmi 9",
        "Redmi 9 Power",
        "Redmi 9 Prime",
        "Redmi 9C",
        "Redmi 9C NFC",
        "Redmi A1",
        "Redmi A2",
        "Redmi A3",
        "Redmi Note 10",
        "Redmi Note 10 Pro",
        "Redmi Note 10 Pro Max",
        "Redmi Note 10S",
        "Redmi Note 10T",
        "Redmi Note 11",
        "Redmi Note 11 Pro",
        "Redmi Note 11 Pro+",
        "Redmi Note 11S",
        "Redmi Note 11T 5G",
        "Redmi Note 12",
        "Redmi Note 12 5G",
        "Redmi Note 12 Pro",
        "Redmi Note 12 Pro+",
        "Redmi Note 12 Turbo",
        "Redmi Note 13",
        "Redmi Note 13 Pro",
        "Redmi Note 13 Pro+",
        "Redmi Note 7",
        "Redmi Note 7 Pro",
        "Redmi Note 7S",
        "Redmi Note 8",
        "Redmi Note 8 Pro",
        "Redmi Note 9",
        "Redmi Note 9 Pro",
        "Redmi Note 9 Pro Max",
        "Redmi Note 9S",
        "Xiaomi 13 Lite",
        "Xiaomi 14 Civi",
        "Xiaomi 15",
        "Xiaomi 15 Pro",
        "Xiaomi 15 Ultra",
        "Xiaomi 16",
        "Xiaomi 16 Pro",
        "Xiaomi 16 Ultra",
        "Xiaomi 17",
        "Xiaomi 17 Pro",
        "Xiaomi 17 Ultra"
    ],

    Poco: [
        "Poco C3",
        "Poco C31",
        "Poco C51",
        "Poco C55",
        "Poco C65",
        "Poco C75",
        "Poco C85x",
        "Poco F1",
        "Poco F3",
        "Poco F4",
        "Poco F5",
        "Poco F5 Pro",
        "Poco F6",
        "Poco F6 Pro",
        "Poco F7",
        "Poco F7 Pro",
        "Poco F8",
        "Poco F8 GT",
        "Poco F8 Pro",
        "Poco F8 Ultra",
        "Poco M2 Pro",
        "Poco M3 Pro",
        "Poco M4 Pro",
        "Poco M5",
        "Poco M6 Pro",
        "Poco M7 Pro",
        "Poco M8 5G",
        "Poco M8 Pro",
        "Poco X2",
        "Poco X3",
        "Poco X3 Pro",
        "Poco X4 Pro",
        "Poco X5",
        "Poco X5 Pro",
        "Poco X6",
        "Poco X6 Pro",
        "Poco X7",
        "Poco X7 Pro",
        "Poco X8",
        "Poco X8 Neo",
        "Poco X8 Pro",
        "Poco X8 Pro Max"
    ],


    Oppo: [
        "Oppo A12",
        "Oppo A15",
        "Oppo A16",
        "Oppo A17",
        "Oppo A18",
        "Oppo A38",
        "Oppo A52",
        "Oppo A53",
        "Oppo A54",
        "Oppo A55",
        "Oppo A57",
        "Oppo A5s",
        "Oppo A74",
        "Oppo A76",
        "Oppo A77",
        "Oppo A78",
        "Oppo A98",
        "Oppo F11",
        "Oppo F11 Pro",
        "Oppo F15",
        "Oppo F17",
        "Oppo F17 Pro",
        "Oppo F19",
        "Oppo F19 Pro",
        "Oppo F19 Pro+",
        "Oppo F21 Pro",
        "Oppo F25",
        "Oppo F27",
        "Oppo F31",
        "Oppo Find X",
        "Oppo Find X2",
        "Oppo Find X7",
        "Oppo Find X7 Ultra",
        "Oppo Find X8",
        "Oppo Find X8 Ultra",
        "Oppo Find X9",
        "Oppo Find X9 Ultra",
        "Oppo K1",
        "Oppo K10",
        "Oppo K12",
        "Oppo K13",
        "Oppo K14",
        "Oppo K3",
        "Oppo R17",
        "Oppo R17 Pro",
        "Oppo Reno 10",
        "Oppo Reno 10 Pro",
        "Oppo Reno 10 Pro+",
        "Oppo Reno 5",
        "Oppo Reno 5 Pro",
        "Oppo Reno 6",
        "Oppo Reno 6 Pro",
        "Oppo Reno 7",
        "Oppo Reno 7 Pro",
        "Oppo Reno 8",
        "Oppo Reno 8 Pro",
        "Oppo Reno13",
        "Oppo Reno14",
        "Oppo Reno15",
        "Oppo Reno15 Pro",
        "Oppo Reno15 Pro Mini",
        "Oppo Reno15c"
    ],

    Realme: [
        "Realme 10",
        "Realme 10 Pro",
        "Realme 10 Pro+",
        "Realme 11",
        "Realme 11 Pro",
        "Realme 11 Pro+",
        "Realme 12",
        "Realme 12 Pro",
        "Realme 12 Pro+",
        "Realme 14 Pro",
        "Realme 15 Pro",
        "Realme 16",
        "Realme 16 Pro",
        "Realme 16 Pro+",
        "Realme 5",
        "Realme 5 Pro",
        "Realme 6",
        "Realme 6 Pro",
        "Realme 6i",
        "Realme 7",
        "Realme 7 Pro",
        "Realme 7i",
        "Realme 8",
        "Realme 8 Pro",
        "Realme 8i",
        "Realme 9",
        "Realme 9 Pro",
        "Realme 9 Pro+",
        "Realme 9i",
        "Realme C20",
        "Realme C21",
        "Realme C25",
        "Realme C31",
        "Realme C33",
        "Realme C35",
        "Realme C51",
        "Realme C53",
        "Realme C55",
        "Realme C67",
        "Realme GT 7 Pro",
        "Realme GT 8",
        "Realme GT 8 Pro",
        "Realme GT Master Edition",
        "Realme GT Neo",
        "Realme GT Neo 2",
        "Realme GT Neo 3",
        "Realme Narzo 20",
        "Realme Narzo 20 Pro",
        "Realme Narzo 30",
        "Realme Narzo 30 Pro",
        "Realme Narzo 50",
        "Realme Narzo 50 Pro",
        "Realme Narzo 70 Turbo",
        "Realme Narzo N50",
        "Realme Narzo N53",
        "Realme Narzo N55",
        "Realme Narzo Power",
        "Realme P4 Power",
        "Realme P4 Pro"
    ],

    Motorola: [
        "Moto E13",
        "Moto E20",
        "Moto E22",
        "Moto E32s",
        "Moto E40",
        "Moto Edge 20",
        "Moto Edge 20 Fusion",
        "Moto Edge 20 Pro",
        "Moto Edge 30",
        "Moto Edge 30 Pro",
        "Moto Edge 30 Ultra",
        "Moto Edge 40",
        "Moto Edge 40 Neo",
        "Moto G20",
        "Moto G22",
        "Moto G30",
        "Moto G31",
        "Moto G32",
        "Moto G40 Fusion",
        "Moto G42",
        "Moto G45",
        "Moto G51",
        "Moto G52",
        "Moto G54",
        "Moto G60",
        "Moto G62",
        "Moto G71",
        "Moto G72",
        "Moto G73",
        "Moto G84",
        "Moto G85",
        "Moto G96 Power",
        "Moto One Fusion+",
        "Moto One Macro",
        "Moto One Power",
        "Moto One Vision",
        "Moto X4",
        "Moto Z Play",
        "Moto Z2 Play",
        "Motorola Edge 60 Pro",
        "Motorola Edge 60 Ultra",
        "Motorola Edge 70",
        "Motorola Edge 70 Fusion",
        "Motorola Razr 50 Ultra",
        "Motorola Razr 60 Ultra"
    ],

    Nokia: [
        "Nokia 2.2",
        "Nokia 2.3",
        "Nokia 2.4",
        "Nokia 3.2",
        "Nokia 3.4",
        "Nokia 4.2",
        "Nokia 5.1 Plus",
        "Nokia 5.3",
        "Nokia 5.4",
        "Nokia 6.1 Plus",
        "Nokia 7.2",
        "Nokia 8.1",
        "Nokia 9 PureView",
        "Nokia C12",
        "Nokia C20",
        "Nokia C21",
        "Nokia C21+",
        "Nokia C3",
        "Nokia C31",
        "Nokia C32",
        "Nokia G10",
        "Nokia G11",
        "Nokia G20",
        "Nokia G21",
        "Nokia G60",
        "Nokia X10",
        "Nokia X20",
        "Nokia X30",
        "Nokia XR20"
    ],

    Tecno: [
        "Tecno Camon 17",
        "Tecno Camon 18",
        "Tecno Camon 19",
        "Tecno Camon 20",
        "Tecno Camon 20 Pro",
        "Tecno Camon 50 Pro",
        "Tecno Camon 50 Ultra",
        "Tecno Phantom V Flip 2",
        "Tecno Phantom V Fold 3",
        "Tecno Pop 5",
        "Tecno Pop 6",
        "Tecno Pop 7",
        "Tecno Pova 2",
        "Tecno Pova 3",
        "Tecno Pova 4",
        "Tecno Pova 5",
        "Tecno POVA 7",
        "Tecno POVA 8",
        "Tecno Spark 10",
        "Tecno Spark 20",
        "Tecno Spark 30 Pro",
        "Tecno Spark 40 Pro",
        "Tecno Spark 7",
        "Tecno Spark 8",
        "Tecno Spark 9",
        "Tecno Spark Go 2022",
        "Tecno Spark Go 2023"
    ],

    Infinix: [
        "Infinix GT 30 Pro",
        "Infinix Hot 10",
        "Infinix Hot 11",
        "Infinix Hot 12",
        "Infinix Hot 20",
        "Infinix Hot 30",
        "Infinix Hot 50",
        "Infinix Hot 60",
        "Infinix Hot 9",
        "Infinix Note 10",
        "Infinix Note 11",
        "Infinix Note 12",
        "Infinix Note 30",
        "Infinix Note 50",
        "Infinix Note 60s",
        "Infinix Smart 5",
        "Infinix Smart 6",
        "Infinix Smart 7",
        "Infinix Zero 40",
        "Infinix Zero 5",
        "Infinix Zero 5G",
        "Infinix Zero 8",
        "Infinix Zero Flip"
    ],

    Nothing: [
        "CMF Phone 1",
        "Nothing Phone (2a) Plus",
        "Nothing Phone (3)",
        "Nothing Phone (3a)",
        "Nothing Phone (3a) Pro",
        "Nothing Phone (4a)",
        "Nothing Phone (4a) Pro"
    ],

    OnePlus: [
        "OnePlus 10 Pro",
        "OnePlus 10T",
        "OnePlus 11",
        "OnePlus 11R",
        "OnePlus 12",
        "OnePlus 12R",
        "OnePlus 13",
        "OnePlus 13 Pro",
        "OnePlus 13 Ultra",
        "OnePlus 13R",
        "OnePlus 9",
        "OnePlus 9 Pro",
        "OnePlus 9R",
        "OnePlus 9RT",
        "OnePlus Nord 2",
        "OnePlus Nord 2T",
        "OnePlus Nord 3",
        "OnePlus Nord 4",
        "OnePlus Nord CE 2",
        "OnePlus Nord CE 3",
        "OnePlus Nord CE 3 Lite",
        "OnePlus Nord CE 4",
        "OnePlus Nord N10",
        "OnePlus Nord N20",
        "OnePlus Nord N30"
    ],

    iQOO: [
        "iQOO 11",
        "iQOO 12",
        "iQOO 13",
        "iQOO Neo 10 Pro",
        "iQOO Neo 7",
        "iQOO Neo 7 Pro",
        "iQOO Neo 9 Pro",
        "iQOO U5",
        "iQOO U6",
        "iQOO Z6",
        "iQOO Z7",
        "iQOO Z8",
        "iQOO Z9",
        "iQOO Z9 Turbo"
    ],

    Honor: [
        "Honor 100 Pro",
        "Honor 200",
        "Honor 200 Pro",
        "Honor 80",
        "Honor 90",
        "Honor Magic 6 Pro",
        "Honor Magic 6 Ultimate",
        "Honor Magic 7 Pro",
        "Honor Magic 7 Ultimate",
        "Honor Magic V2",
        "Honor Magic V3",
        "Honor Magic Vs",
        "Honor Play 30",
        "Honor Play 40",
        "Honor X40",
        "Honor X50",
        "Honor X60 Pro"
    ],

    Huawei: [
        "Huawei Mate 60",
        "Huawei Mate 60 Pro",
        "Huawei Mate 60 Pro+",
        "Huawei Mate 70",
        "Huawei Mate 70 Pro",
        "Huawei Mate 70 RS",
        "Huawei Nova 11",
        "Huawei Nova 12 Pro",
        "Huawei Nova 12 Ultra",
        "Huawei P60",
        "Huawei P60 Pro",
        "Huawei P70",
        "Huawei P70 Pro",
        "Huawei P70 Ultra"
    ],

    Lava: [
        "Lava Agni 2",
        "Lava Agni 2 Lite",
        "Lava Agni 3",
        "Lava Blaze 2 5G",
        "Lava Blaze Curve",
        "Lava Blaze Pro",
        "Lava Yuva 2",
        "Lava Yuva 3",
        "Lava Yuva 4"
    ],

    Micromax: [
        "Micromax IN 1b",
        "Micromax IN 2",
        "Micromax IN 2b",
        "Micromax IN Note 1",
        "Micromax IN Note 2"
    ],

    Sony: [
        "Xperia 1 IV",
        "Xperia 1 V",
        "Xperia 1 VI",
        "Xperia 10 V",
        "Xperia 10 VI",
        "Xperia 5 IV",
        "Xperia 5 V",
        "Xperia Pro-I"
    ],

    Asus: [
        "ROG Phone 7",
        "ROG Phone 7 Ultimate",
        "ROG Phone 8",
        "ROG Phone 8 Pro",
        "ROG Phone 9 Pro",
        "ROG Phone 9 Ultimate",
        "Zenfone 10",
        "Zenfone 11 Ultra",
        "Zenfone 9"
    ],

    Lenovo: [
        "Lenovo K12",
        "Lenovo K13",
        "Lenovo Legion Y70",
        "Lenovo Legion Y90",
        "Lenovo Z5",
        "Lenovo Z6 Pro"
    ],

    ZTE: [
        "ZTE Axon 40 Ultra",
        "ZTE Axon 50 Ultra",
        "ZTE Axon 60 Ultra",
        "ZTE Blade V50",
        "ZTE Blade V60",
        "ZTE Nubia Z50",
        "ZTE Nubia Z60 Ultra"
    ],

    Meizu: [
        "Meizu 18",
        "Meizu 18 Pro",
        "Meizu 20",
        "Meizu 20 Pro",
        "Meizu 21",
        "Meizu 21 Pro"
    ],

    HTC: [
        "HTC Desire 22 Pro",
        "HTC U23 Pro",
        "HTC Wildfire E2",
        "HTC Wildfire E3"
    ],

    Panasonic: [
        "Panasonic Eluga A4",
        "Panasonic Eluga I9",
        "Panasonic Eluga Ray 700",
        "Panasonic Eluga Ray 810"
    ],

    LG: [
        "LG G7 ThinQ",
        "LG G8X ThinQ",
        "LG V50 ThinQ",
        "LG V60 ThinQ",
        "LG Velvet",
        "LG Wing"
    ],

    BlackBerry: [
        "BlackBerry KEY2",
        "BlackBerry KEY2 LE",
        "BlackBerry Motion",
        "BlackBerry Priv"
    ],

    "Dell Laptop": [
        "Alienware m16",
        "Alienware m18",
        "Alienware x14",
        "Alienware x16",
        "Dell G15",
        "Dell G15 5520",
        "Dell G15 5530",
        "Dell G16 7630",
        "Dell G3",
        "Dell G5",
        "Dell G7",
        "Inspiron 14 5420",
        "Inspiron 14 5430",
        "Inspiron 15 3520",
        "Inspiron 15 3535",
        "Inspiron 16 5630",
        "Inspiron 3511",
        "Inspiron 3521",
        "Inspiron 3525",
        "Inspiron 3530",
        "Inspiron 5410",
        "Inspiron 5620",
        "Inspiron 7420",
        "Latitude 3420",
        "Latitude 3430",
        "Latitude 3440",
        "Latitude 3520",
        "Latitude 3540",
        "Latitude 5410",
        "Latitude 5420",
        "Latitude 5440",
        "Latitude 7420",
        "Latitude 7440",
        "Latitude 9440",
        "Vostro 3400",
        "Vostro 3401",
        "Vostro 3420",
        "Vostro 3430",
        "Vostro 3500",
        "Vostro 3510",
        "Vostro 3520",
        "Vostro 3525",
        "Vostro 3530",
        "XPS 13",
        "XPS 13 9340",
        "XPS 13 Plus",
        "XPS 14 9440",
        "XPS 15",
        "XPS 16 9640",
        "XPS 17"
    ],


    "HP Laptop": [
        "EliteBook 830",
        "EliteBook 840",
        "EliteBook 845 G8",
        "HP 14s",
        "HP 15s eq2144AU",
        "HP 15s eq2145AU",
        "HP 15s fq5007TU",
        "HP 15s fq5008TU",
        "HP 15s gr0011AU",
        "HP EliteBook 840 G10",
        "HP EliteBook 845 G10",
        "HP EliteBook 860 G11",
        "HP Envy 13",
        "HP Envy 15",
        "HP Envy x360 14",
        "HP Envy x360 15",
        "HP Omen 15",
        "HP Omen 16",
        "HP Omen 16 (2024)",
        "HP Omen 17",
        "HP Omen Transcend 16",
        "HP Pavilion 14",
        "HP Pavilion 14 Plus",
        "HP Pavilion 15",
        "HP Pavilion 16",
        "HP Pavilion Aero",
        "HP Pavilion Aero 13",
        "HP ProBook 440 G10",
        "HP ProBook 450 G10",
        "HP Spectre x360",
        "HP Spectre x360 14 (2024)",
        "HP Victus 15",
        "HP Victus 15 (2024)",
        "HP Victus 16",
        "HP Victus 16 (2024)",
        "HP Victus 16 (2025)"
    ],

    "Lenovo Laptop": [
        "IdeaPad Gaming 3",
        "IdeaPad Gaming 3 Gen 7",
        "IdeaPad Gaming 3 Gen 8",
        "IdeaPad Slim 3",
        "IdeaPad Slim 3 Gen 8",
        "IdeaPad Slim 5",
        "IdeaPad Slim 5 Gen 8",
        "IdeaPad Slim 5i",
        "IdeaPad Slim 7",
        "IdeaPad Slim 7 Gen 9",
        "Legion 5",
        "Legion 5 Pro",
        "Legion 7",
        "Legion 7i",
        "Legion Pro 7",
        "Legion Slim 5",
        "ThinkBook 14",
        "ThinkBook 14 Gen 6",
        "ThinkBook 15",
        "ThinkBook 16",
        "ThinkBook 16 Gen 6",
        "ThinkPad E14",
        "ThinkPad E14 Gen 5",
        "ThinkPad E15",
        "ThinkPad E16 Gen 1",
        "ThinkPad L14",
        "ThinkPad T14",
        "ThinkPad T14 Gen 4",
        "ThinkPad T16 Gen 2",
        "ThinkPad X1 Carbon",
        "ThinkPad X1 Carbon Gen 11",
        "ThinkPad X1 Carbon Gen 12",
        "Yoga 7i",
        "Yoga 9i",
        "Yoga 9i Gen 8",
        "Yoga Slim 7",
        "Yoga Slim 7 Pro",
        "Yoga Slim 7x"
    ],

    "Asus Laptop": [
        "Asus TUF Dash F15",
        "Asus TUF Gaming A15 (2024)",
        "Asus TUF Gaming F15 (2024)",
        "ROG Flow X13",
        "ROG Flow Z13",
        "ROG Strix G15",
        "ROG Strix G16",
        "ROG Strix G17",
        "ROG Strix G18",
        "ROG Zephyrus G14",
        "ROG Zephyrus G14 (2024)",
        "ROG Zephyrus G16",
        "ROG Zephyrus M16",
        "TUF Dash F15",
        "TUF Gaming A15",
        "TUF Gaming F15",
        "VivoBook 14",
        "VivoBook 14 X1404",
        "VivoBook 15",
        "VivoBook 15 X1504",
        "VivoBook Pro 15",
        "VivoBook Pro 15 OLED",
        "VivoBook S14",
        "VivoBook S14 OLED",
        "ZenBook 13",
        "ZenBook 14",
        "ZenBook 14 OLED",
        "ZenBook 14X OLED",
        "ZenBook Duo",
        "ZenBook Duo (2024)"
    ],

    "Acer Laptop": [
        "Aspire 3",
        "Aspire 3 A315-59",
        "Aspire 5",
        "Aspire 5 A515-58",
        "Aspire 7",
        "Aspire 7 A715-76",
        "Nitro 16",
        "Nitro 5",
        "Nitro 5 AN515-58",
        "Nitro 7",
        "Nitro V15",
        "Predator Helios 16",
        "Predator Helios 18",
        "Predator Helios 300",
        "Predator Triton 300",
        "Predator Triton 300 SE",
        "Swift 3",
        "Swift 3 SF314",
        "Swift 5",
        "Swift 5 SF514",
        "Swift Go",
        "Swift Go 14",
        "Swift Go 16",
        "TravelMate P2",
        "TravelMate P4"
    ],

    "MSI Laptop": [
        "MSI Bravo 15",
        "MSI GF63",
        "MSI GF63 Thin",
        "MSI GF65",
        "MSI GF65 Thin",
        "MSI GF66",
        "MSI GF66 Katana",
        "MSI Katana 15",
        "MSI Katana GF66",
        "MSI Modern 14",
        "MSI Modern 14 C13M",
        "MSI Modern 15",
        "MSI Modern 15 B13M",
        "MSI Pulse GL66",
        "MSI Raider GE68",
        "MSI Raider GE78",
        "MSI Stealth 14 Studio",
        "MSI Stealth 15M",
        "MSI Stealth 16 Studio",
        "MSI Titan GT77",
        "MSI Vector GP68"
    ],

    "Apple MacBook": [
        "MacBook Air M1",
        "MacBook Air M2",
        "MacBook Air M3",
        "MacBook Air M4",
        "MacBook Pro 13 M1",
        "MacBook Pro 14 M1 Pro",
        "MacBook Pro 14 M2 Pro",
        "MacBook Pro 14 M3",
        "MacBook Pro 16 M1 Max",
        "MacBook Pro 16 M2 Max",
        "MacBook Pro 16 M3 Max"
    ],

    "LG Laptop": [
        "LG Gram 14",
        "LG Gram 14 2-in-1",
        "LG Gram 15",
        "LG Gram 16",
        "LG Gram 17",
        "LG Gram Style 14",
        "LG Gram Style 16",
        "LG Gram SuperSlim",
        "LG Ultra PC 15",
        "LG Ultra PC 16",
        "LG Ultra PC 17"
    ],

    "Samsung Laptop": [
        "Galaxy Book 2",
        "Galaxy Book 2 Pro",
        "Galaxy Book 2 Pro 360",
        "Galaxy Book 3",
        "Galaxy Book 3 Pro",
        "Galaxy Book 3 Pro 360",
        "Galaxy Book 3 Ultra",
        "Galaxy Book 4",
        "Galaxy Book 4 Pro",
        "Galaxy Book 4 Pro 360",
        "Galaxy Book 4 Ultra",
        "Galaxy Book Flex 2",
        "Galaxy Book Go",
        "Galaxy Book Go 5G",
        "Galaxy Book Odyssey"
    ],

    "Microsoft Surface": [
        "Surface Laptop 4",
        "Surface Laptop 5",
        "Surface Laptop 6",
        "Surface Laptop Go 2",
        "Surface Laptop Go 3",
        "Surface Laptop Studio",
        "Surface Laptop Studio 2",
        "Surface Pro 10",
        "Surface Pro 8",
        "Surface Pro 9",
        "Surface Pro X"
    ],

    "Gigabyte Laptop": [
        "AORUS 15",
        "AORUS 15P",
        "AORUS 15X",
        "AORUS 17",
        "AORUS 17X",
        "Gigabyte A5",
        "Gigabyte A7",
        "Gigabyte Aero 14 OLED",
        "Gigabyte Aero 15 OLED",
        "Gigabyte Aero 16 OLED",
        "Gigabyte G5",
        "Gigabyte G5 GD",
        "Gigabyte G5 GE",
        "Gigabyte G6",
        "Gigabyte G6X",
        "Gigabyte U4",
        "Gigabyte U4 U5",
        "Gigabyte U4 UD"
    ],

    "Avita Laptop": [
        "Avita Admiror",
        "Avita Admiror II",
        "Avita Cosmos",
        "Avita Cosmos 2-in-1",
        "Avita Essential",
        "Avita Essential 14",
        "Avita Essential Refresh",
        "Avita Liber",
        "Avita Liber V",
        "Avita Liber V14",
        "Avita Pura",
        "Avita Pura E14"
    ],

    "Infinix Laptop": [
        "Infinix INBook X1",
        "Infinix INBook X1 Neo",
        "Infinix INBook X1 Pro",
        "Infinix INBook X2",
        "Infinix INBook X2 Plus",
        "Infinix INBook X3",
        "Infinix INBook X3 Plus",
        "Infinix INBook Y1 Plus",
        "Infinix INBook Y1 Plus Neo"
    ],

    "Alcatel Laptop": [
        "Alcatel CloudBook",
        "Alcatel CloudBook Pro",
        "Alcatel OneTouch Book",
        "Alcatel OneTouch Book Pro",
        "Alcatel Plus 10",
        "Alcatel Plus 12",
        "Alcatel SmartBook",
        "Alcatel SmartBook Air",
        "Alcatel SmartBook Pro",
        "Alcatel V Book",
        "Alcatel V Book Pro",
        "Alcatel V Series Notebook"
    ],

    "Razer Laptop": [
        "Razer Blade 14",
        "Razer Blade 15",
        "Razer Blade 16",
        "Razer Blade 17",
        "Razer Blade 18",
        "Razer Book 13"
    ],

    "Huawei Laptop": [
        "MateBook 13",
        "MateBook 14",
        "MateBook 16",
        "MateBook 16s",
        "MateBook D14",
        "MateBook D15",
        "MateBook D16",
        "MateBook X",
        "MateBook X Pro"
    ],

    "Xiaomi Laptop": [
        "Mi Notebook Horizon",
        "Mi Notebook Pro 15",
        "Mi Notebook Pro 16",
        "Mi Notebook Pro X",
        "Mi Notebook Ultra",
        "RedmiBook 14",
        "RedmiBook Pro 15",
        "RedmiBook Pro 16"
    ],

    "Chuwi Laptop": [
        "Chuwi CoreBook Pro",
        "Chuwi CoreBook X",
        "Chuwi GemiBook Plus",
        "Chuwi GemiBook X Pro",
        "Chuwi HeroBook Plus",
        "Chuwi HeroBook Pro",
        "Chuwi MiniBook X"
    ],

    "Alienware Laptop": [
        "Alienware m15",
        "Alienware m16",
        "Alienware m17",
        "Alienware m18",
        "Alienware x14",
        "Alienware x14 R2",
        "Alienware x16",
        "Alienware x16 R2"
    ],

    "Toshiba Laptop": [
        "Toshiba Dynabook Portege X30",
        "Toshiba Dynabook Portege X40",
        "Toshiba Dynabook Tecra A40",
        "Toshiba Dynabook Tecra A50",
        "Toshiba Satellite Pro C50",
        "Toshiba Satellite Pro L50"
    ],

    "Sony Vaio": [
        "Vaio FE14",
        "Vaio FE16",
        "Vaio S13",
        "Vaio SX12",
        "Vaio SX14",
        "Vaio Z"
    ],


    "Apple iPad": [
        "iPad 10th Gen",
        "iPad 7th Gen",
        "iPad 8th Gen",
        "iPad 9th Gen",
        "iPad Air 11 (M2)",
        "iPad Air 13 (M2)",
        "iPad Air 3",
        "iPad Air 4",
        "iPad Air 5",
        "iPad Mini 4",
        "iPad Mini 5",
        "iPad Mini 6",
        "iPad Mini 7",
        "iPad Pro 11 (2021)",
        "iPad Pro 11 (2022)",
        "iPad Pro 11 (M4)",
        "iPad Pro 12.9 (2021)",
        "iPad Pro 12.9 (2022)",
        "iPad Pro 13 (M4)"
    ],

    "Samsung Tablet": [
        "Galaxy Tab A9",
        "Galaxy Tab A9+",
        "Galaxy Tab Active 4 Pro",
        "Galaxy Tab Active 5",
        "Galaxy Tab S10",
        "Galaxy Tab S10 Ultra",
        "Galaxy Tab S10+",
        "Galaxy Tab S8",
        "Galaxy Tab S8 Ultra",
        "Galaxy Tab S8+",
        "Galaxy Tab S9",
        "Galaxy Tab S9 FE",
        "Galaxy Tab S9 FE+",
        "Galaxy Tab S9 Ultra",
        "Galaxy Tab S9+"
    ],

    "Lenovo Tablet": [
        "Lenovo Legion Y700",
        "Lenovo Tab M10 FHD",
        "Lenovo Tab M10 HD",
        "Lenovo Tab M11",
        "Lenovo Tab M9",
        "Lenovo Tab P11",
        "Lenovo Tab P11 Gen 2",
        "Lenovo Tab P11 Pro",
        "Lenovo Tab P11 Pro Gen 2",
        "Lenovo Tab P12",
        "Lenovo Tab P12 Pro",
        "Lenovo Yoga Tab 11"
    ],

    "Realme Pad": [
        "Realme Pad",
        "Realme Pad 2",
        "Realme Pad 3",
        "Realme Pad Mini",
        "Realme Pad X"
    ],

    "Redmi Pad": [
        "Redmi Pad",
        "Redmi Pad Pro",
        "Redmi Pad Pro 5G",
        "Redmi Pad SE"
    ],

    "Acer Tablet": [
        "Acer Iconia One 10",
        "Acer Iconia One 8",
        "Acer Iconia Tab P10",
        "Acer Iconia Tab P11"
    ],

    "Xiaomi Pad": [
        "Mi Pad 3",
        "Mi Pad 4",
        "Xiaomi Pad 5",
        "Xiaomi Pad 6",
        "Xiaomi Pad 6 Pro",
        "Xiaomi Pad 6S Pro",
        "Xiaomi Pad 7",
        "Xiaomi Pad 7 Pro"
    ],

    "Honor Tablet": [
        "Honor MagicPad 13",
        "Honor Pad 5",
        "Honor Pad 8",
        "Honor Pad 9",
        "Honor Pad X8",
        "Honor Pad X8a",
        "Honor Pad X9"
    ],

    "Amazon Fire": [
        "Fire 7 Kids Edition",
        "Fire HD 10",
        "Fire HD 7",
        "Fire HD 8",
        "Fire HD 8 Plus",
        "Fire Max 11"
    ],
    "Huawei Tablet": [
        "Huawei MatePad 11",
        "Huawei MatePad 11.5",
        "Huawei MatePad Air",
        "Huawei MatePad Pro 11",
        "Huawei MatePad Pro 12.6",
        "Huawei MatePad Pro 13.2"
    ],

    "OnePlus Tablet": [
        "OnePlus Pad",
        "OnePlus Pad 2",
        "OnePlus Pad Go"
    ],

    "Oppo Tablet": [
        "Oppo Pad 2",
        "Oppo Pad 3",
        "Oppo Pad 3 Pro",
        "Oppo Pad Air",
        "Oppo Pad Air 2"
    ],

    "Vivo Tablet": [
        "Vivo Pad 2",
        "Vivo Pad 3",
        "Vivo Pad 3 Pro",
        "Vivo Pad Air"
    ],

    "Nokia Tablet": [
        "Nokia T10",
        "Nokia T20",
        "Nokia T21"
    ],
    "Dell Tablet": [
        "Dell Latitude 7220 Rugged",
        "Dell Latitude 7320 Detachable",
        "Dell Venue 10 Pro",
        "Dell Venue 11 Pro"
    ],
    "Alcatel Tablet": [
        "Alcatel 1T 10",
        "Alcatel 1T 7",
        "Alcatel 3T 10",
        "Alcatel 3T 8"
    ],
    "Chuwi Tablet": [
        "Chuwi Hi10 Go",
        "Chuwi Hi10 X",
        "Chuwi HiPad Max",
        "Chuwi HiPad X"
    ],

    "Apple Watch": [
        "Apple Watch SE (2020)",
        "Apple Watch SE (2022)",
        "Apple Watch SE (3rd Gen)",
        "Apple Watch Series 10",
        "Apple Watch Series 5",
        "Apple Watch Series 6",
        "Apple Watch Series 7",
        "Apple Watch Series 8",
        "Apple Watch Series 9",
        "Apple Watch Ultra",
        "Apple Watch Ultra 2",
        "Apple Watch Ultra 3"
    ],

    "Samsung Watch": [
        "Galaxy Watch 3",
        "Galaxy Watch 4",
        "Galaxy Watch 4 Classic",
        "Galaxy Watch 5",
        "Galaxy Watch 5 Pro",
        "Galaxy Watch 6",
        "Galaxy Watch 6 Classic",
        "Galaxy Watch 7",
        "Galaxy Watch 7 Classic",
        "Galaxy Watch Active 2",
        "Galaxy Watch FE",
        "Galaxy Watch Ultra"
    ],

    "Google Pixel Watch": [
        "Pixel Watch",
        "Pixel Watch 2",
        "Pixel Watch 3"
    ],

    "Xiaomi Watch": [
        "Xiaomi Mi Watch",
        "Xiaomi Mi Watch Revolve",
        "Xiaomi Mi Watch Revolve Active",
        "Xiaomi Watch 2",
        "Xiaomi Watch 2 Pro",
        "Xiaomi Watch S1",
        "Xiaomi Watch S1 Pro",
        "Xiaomi Watch S2",
        "Xiaomi Watch S3"
    ],

    "Redmi Watch": [
        "Redmi Watch",
        "Redmi Watch 2 Lite",
        "Redmi Watch 3",
        "Redmi Watch 3 Active",
        "Redmi Watch 4"
    ],

    "Vivo Watch": [
        "Vivo Watch",
        "Vivo Watch 2",
        "Vivo Watch 3",
        "Vivo Watch 3 Pro"
    ],

    "Amazfit Watch": [
        "Amazfit Active",
        "Amazfit Balance",
        "Amazfit Bip 3",
        "Amazfit Bip 5",
        "Amazfit Cheetah",
        "Amazfit Cheetah Pro",
        "Amazfit Falcon",
        "Amazfit GTR 4",
        "Amazfit GTR 5",
        "Amazfit GTR Mini",
        "Amazfit GTS 3",
        "Amazfit GTS 4",
        "Amazfit T-Rex 2",
        "Amazfit T-Rex Ultra"
    ],

    "Huawei Watch": [
        "Huawei Watch 4",
        "Huawei Watch 4 Pro",
        "Huawei Watch D",
        "Huawei Watch D2",
        "Huawei Watch Fit 2",
        "Huawei Watch Fit 3",
        "Huawei Watch GT 3",
        "Huawei Watch GT 4",
        "Huawei Watch GT 5",
        "Huawei Watch GT Runner",
        "Huawei Watch Ultimate"
    ],

    "Honor Watch": [
        "Honor Magic Watch",
        "Honor Magic Watch 2",
        "Honor Watch 4",
        "Honor Watch 5",
        "Honor Watch GS 3",
        "Honor Watch GS Pro"
    ],

    "Oppo Watch": [
        "Oppo Watch",
        "Oppo Watch 2",
        "Oppo Watch 2 ECG",
        "Oppo Watch 3",
        "Oppo Watch 3 Pro",
        "Oppo Watch 4 Pro",
        "Oppo Watch Free",
        "Oppo Watch X"
    ],

    "OnePlus Watch": [
        "OnePlus Nord Watch",
        "OnePlus Watch",
        "OnePlus Watch 2",
        "OnePlus Watch 2R",
        "OnePlus Watch 3"
    ],

    "Realme Watch": [
        "Realme TechLife Watch R100",
        "Realme TechLife Watch SZ100",
        "Realme Watch 2",
        "Realme Watch 2 Pro",
        "Realme Watch 3",
        "Realme Watch 3 Pro",
        "Realme Watch S",
        "Realme Watch S Pro"
    ],

    "Noise Watch": [
        "Noise ColorFit Pro 3",
        "Noise ColorFit Pro 4",
        "Noise ColorFit Pro 5",
        "Noise ColorFit Ultra",
        "Noise ColorFit Ultra 2",
        "Noise ColorFit Ultra 3",
        "Noise Evolve 3",
        "Noise Pulse 2",
        "Noise Pulse 2 Max",
        "Noise Pulse Go",
        "Noise Twist Go",
        "Noise Vision 3",
        "Noise Vivid Call"
    ],

    "Boat Watch": [
        "Boat Lunar Call",
        "Boat Lunar Connect",
        "Boat Storm Call 2",
        "Boat Storm Pro",
        "Boat Ultima Call Max",
        "Boat Ultima Vogue",
        "Boat Wave Armour",
        "Boat Wave Call",
        "Boat Wave Elevate",
        "Boat Wave Neo",
        "Boat Wave Sigma",
        "Boat Xtend"
    ],

    "Fire-Boltt Watch": [
        "Fire-Boltt Dream",
        "Fire-Boltt Hulk",
        "Fire-Boltt Invincible",
        "Fire-Boltt Ninja Call 3",
        "Fire-Boltt Ninja Call Pro",
        "Fire-Boltt Phoenix",
        "Fire-Boltt Phoenix Ultra",
        "Fire-Boltt Quantum",
        "Fire-Boltt Ring 3",
        "Fire-Boltt Talk Ultra",
        "Fire-Boltt Visionary"
    ],

    "CrossBeats Watch": [
        "CrossBeats Apex Regal",
        "CrossBeats Ignite Atlas",
        "CrossBeats Ignite Cube",
        "CrossBeats Ignite S4",
        "CrossBeats Orbit Infiniti",
        "CrossBeats Orbit X"
    ],

    "Zebronics Watch": [
        "Zebronics Zeb Fit 1220CH",
        "Zebronics Zeb Fit 280CH",
        "Zebronics Zeb Fit 380CH",
        "Zebronics Zeb Fit 6220CH",
        "Zebronics Zeb Fit 7220CH",
        "Zebronics Zeb Fit 9020CH"
    ],

    "Hammer Watch": [
        "Hammer Ace 3.0",
        "Hammer Ace Ultra",
        "Hammer Pulse 2.0",
        "Hammer Pulse Ace",
        "Hammer Pulse X"
    ],

    "pTron Watch": [
        "pTron PulseFit P261",
        "pTron PulseFit P461",
        "pTron Reflect Ace",
        "pTron Reflect Call"
    ],

    "CMF Watch": [
        "CMF Watch Pro",
        "CMF Watch Pro 2"
    ],

    "Garmin Watch": [
        "Garmin Enduro 2",
        "Garmin Epix Gen 2",
        "Garmin Epix Pro",
        "Garmin Fenix 6",
        "Garmin Fenix 7",
        "Garmin Fenix 7 Pro",
        "Garmin Forerunner 245",
        "Garmin Forerunner 255",
        "Garmin Forerunner 265",
        "Garmin Forerunner 965",
        "Garmin Instinct 2",
        "Garmin Instinct 3",
        "Garmin Instinct Solar",
        "Garmin Venu 2",
        "Garmin Venu 3",
        "Garmin Venu Sq 2",
        "Garmin Vivoactive 4",
        "Garmin Vivoactive 5"
    ],

    "Fitbit Watch": [
        "Fitbit Charge 4",
        "Fitbit Charge 5",
        "Fitbit Charge 6",
        "Fitbit Inspire 2",
        "Fitbit Inspire 3",
        "Fitbit Luxe",
        "Fitbit Sense",
        "Fitbit Sense 2",
        "Fitbit Versa 2",
        "Fitbit Versa 3",
        "Fitbit Versa 4"
    ],

    "Fossil Watch": [
        "Fossil Gen 5",
        "Fossil Gen 5E",
        "Fossil Gen 6",
        "Fossil Hybrid Collider",
        "Fossil Hybrid HR",
        "Fossil Sport"
    ],

    "Suunto Watch": [
        "Suunto 5",
        "Suunto 5 Peak",
        "Suunto 7",
        "Suunto 9 Baro",
        "Suunto 9 Peak",
        "Suunto 9 Peak Pro",
        "Suunto Vertical"
    ],

    "Polar Watch": [
        "Polar Grit X",
        "Polar Grit X Pro",
        "Polar Ignite 2",
        "Polar Ignite 3",
        "Polar Pacer",
        "Polar Pacer Pro",
        "Polar Vantage M2",
        "Polar Vantage V2",
        "Polar Vantage V3"
    ],

    "Apple AirPods": [
        "AirPods (2nd Gen)",
        "AirPods (3rd Gen)",
        "AirPods Max",
        "AirPods Pro",
        "AirPods Pro (2nd Gen)"
    ],

    "Samsung Buds": [
        "Galaxy Buds",
        "Galaxy Buds 2",
        "Galaxy Buds 2 Pro",
        "Galaxy Buds 3",
        "Galaxy Buds 3 Pro",
        "Galaxy Buds Live",
        "Galaxy Buds Pro",
        "Galaxy Buds+"
    ],

    "Sony Earbuds": [
        "Sony LinkBuds",
        "Sony LinkBuds S",
        "Sony WF-1000XM4",
        "Sony WF-1000XM5",
        "Sony WF-C500",
        "Sony WF-C700N"
    ],

    "JBL Earbuds": [
        "JBL Live Pro 2",
        "JBL Tour Pro 2",
        "JBL Tune 130NC",
        "JBL Tune 230NC",
        "JBL Wave Beam",
        "JBL Wave Buds"
    ],

    "Beats Audio": [
        "Beats Fit Pro",
        "Beats Powerbeats Pro",
        "Beats Studio Buds",
        "Beats Studio Buds+"
    ],

    "Nothing Ear": [
        "Nothing Ear (1)",
        "Nothing Ear (2)",
        "Nothing Ear (3)",
        "Nothing Ear Stick"
    ],

    "OnePlus Buds": [
        "OnePlus Buds 3",
        "OnePlus Buds Pro",
        "OnePlus Buds Pro 2",
        "OnePlus Buds Pro 3",
        "OnePlus Buds Z",
        "OnePlus Buds Z2"
    ],

    "Xiaomi Buds": [
        "Xiaomi Buds 3",
        "Xiaomi Buds 3T Pro",
        "Xiaomi Buds 4",
        "Xiaomi Buds 4 Pro",
        "Xiaomi FlipBuds Pro"
    ],

    "Redmi Buds": [
        "Redmi Buds 3 Lite",
        "Redmi Buds 3 Pro",
        "Redmi Buds 4",
        "Redmi Buds 4 Pro",
        "Redmi Buds 5",
        "Redmi Buds 5 Pro"
    ],

    "Oppo Enco": [
        "Oppo Enco Air 2 Pro",
        "Oppo Enco Air 3",
        "Oppo Enco Air 3 Pro",
        "Oppo Enco Buds 2",
        "Oppo Enco X",
        "Oppo Enco X2"
    ],

    "Vivo TWS": [
        "Vivo TWS 3",
        "Vivo TWS 3 Pro",
        "Vivo TWS 4",
        "Vivo TWS Neo"
    ],

    "Realme Buds": [
        "Realme Buds Air 2",
        "Realme Buds Air 3",
        "Realme Buds Air 5",
        "Realme Buds Air 5 Pro",
        "Realme Buds Air 6",
        "Realme Buds Air 6 Pro"
    ],

    "Boat Audio": [
        "Boat Airdopes 201",
        "Boat Airdopes 281 Pro",
        "Boat Airdopes 311 Pro",
        "Boat Airdopes 341 ANC",
        "Boat Airdopes 361",
        "Boat Airdopes 381",
        "Boat Airdopes 393 ANC",
        "Boat Airdopes 402",
        "Boat Airdopes 441",
        "Boat Airdopes 441 Pro",
        "Boat Airdopes 501 ANC",
        "Boat Airdopes 601 ANC",
        "Boat Airdopes 701 ANC",
        "Boat Airdopes 800",
        "Boat Airdopes Atom 81",
        "Boat Airdopes Atom 83"
    ],

    "Noise Buds": [
        "Noise Buds Aero",
        "Noise Buds Air",
        "Noise Buds Combat Z",
        "Noise Buds VS102",
        "Noise Buds VS102 Pro",
        "Noise Buds VS103",
        "Noise Buds VS104",
        "Noise Buds VS201",
        "Noise Buds VS401",
        "Noise Buds Xtreme"
    ],

    "Boult Audio": [
        "Boult Curve ANC",
        "Boult Omega",
        "Boult W20",
        "Boult X30",
        "Boult Y1",
        "Boult Z20",
        "Boult Z20 Pro",
        "Boult Z40",
        "Boult Z40 Pro"
    ],

    "pTron Audio": [
        "pTron Bassbuds Duo",
        "pTron Bassbuds Evo",
        "pTron Bassbuds Jade",
        "pTron Bassbuds Lite",
        "pTron Bassbuds Tango",
        "pTron Bassbuds Ultima",
        "pTron Bassbuds Wave"
    ],

    "CrossBeats Audio": [
        "CrossBeats Enigma",
        "CrossBeats Ignite S3",
        "CrossBeats Pebble",
        "CrossBeats Slide",
        "CrossBeats Torq"
    ],

    "Hammer Audio": [
        "Hammer Airflow",
        "Hammer Bash",
        "Hammer G Shot",
        "Hammer Pulsebuds",
        "Hammer UltraPods"
    ],

    "Zebronics Audio": [
        "Zebronics Zeb Pods",
        "Zebronics Zeb Pods 2",
        "Zebronics Zeb Pods 3",
        "Zebronics Zeb Sound Bomb 1",
        "Zebronics Zeb Sound Bomb 2",
        "Zebronics Zeb Sound Bomb 3"
    ],

    "Bose Audio": [
        "Bose QuietComfort Earbuds",
        "Bose QuietComfort Earbuds II",
        "Bose QuietComfort Ultra Earbuds",
        "Bose Sport Earbuds"
    ],

    "Sennheiser Audio": [
        "Sennheiser CX Plus True Wireless",
        "Sennheiser CX True Wireless",
        "Sennheiser Momentum True Wireless 2",
        "Sennheiser Momentum True Wireless 3",
        "Sennheiser Momentum True Wireless 4",
        "Sennheiser Sport True Wireless"
    ],

    "Anker Soundcore": [
        "Soundcore Liberty 3 Pro",
        "Soundcore Liberty 4",
        "Soundcore Liberty 4 NC",
        "Soundcore Liberty Air 2 Pro",
        "Soundcore Life A3i",
        "Soundcore Life P3",
        "Soundcore Space A40"
    ],

    "Marshall Earbuds": [
        "Marshall Minor III",
        "Marshall Mode II",
        "Marshall Motif ANC",
        "Marshall Motif II ANC"
    ],

    "Skullcandy Earbuds": [
        "Skullcandy Indy ANC",
        "Skullcandy Indy Evo",
        "Skullcandy Push Active",
        "Skullcandy Push Ultra",
        "Skullcandy Rail",
        "Skullcandy Rail ANC",
        "Skullcandy Sesh ANC"
    ],

    "Philips Earbuds": [
        "Philips TAT2236",
        "Philips TAT3216",
        "Philips TAT4506",
        "Philips TAT5506",
        "Philips TAT8506"
    ],
    "Morbi Audio": [
        "Morbi Airbuds Lite",
        "Morbi Airbuds Pro",
        "Morbi M101 TWS",
        "Morbi M102 TWS",
        "Morbi M201 Pro",
        "Morbi M301 ANC"
    ],

    "Ubon Audio": [
        "Ubon CL-110 Airbuds",
        "Ubon CL-120 Airbuds",
        "Ubon CL-135 TWS",
        "Ubon CL-140 Probuds",
        "Ubon CL-150 Airbuds"
    ],

    "Ambrane Audio": [
        "Ambrane Dots Play",
        "Ambrane Dots Slay",
        "Ambrane Dots Tune",
        "Ambrane NeoBuds 11",
        "Ambrane NeoBuds 33"
    ],

    "Portronics Audio": [
        "Portronics Harmonics Twins S3",
        "Portronics Harmonics Twins S6",
        "Portronics Harmonics Twins S7",
        "Portronics Harmonics Twins S8",
        "Portronics Harmonics Twins S9"
    ],

    "Intex Audio": [
        "Intex Elyt E305",
        "Intex Elyt E306",
        "Intex Elyt E307",
        "Intex Elyt E308"
    ],

    "Syska Audio": [
        "Syska Buds BT407",
        "Syska Buds BT408",
        "Syska Buds BT409",
        "Syska Buds BT410"
    ],

    "JBL Speaker": [
        "JBL Boombox 2",
        "JBL Boombox 3",
        "JBL Charge 4",
        "JBL Charge 5",
        "JBL Clip 4",
        "JBL Clip 5",
        "JBL Flip 5",
        "JBL Flip 6",
        "JBL Flip Essential 2",
        "JBL Go 3",
        "JBL Go 4",
        "JBL PartyBox 110",
        "JBL PartyBox 310",
        "JBL PartyBox 710",
        "JBL Xtreme 3",
        "JBL Xtreme 4"
    ],

    "Sony Speaker": [
        "Sony SRS-XB100",
        "Sony SRS-XB23",
        "Sony SRS-XB33",
        "Sony SRS-XB43",
        "Sony SRS-XE200",
        "Sony SRS-XE300",
        "Sony SRS-XG300",
        "Sony SRS-XG500",
        "Sony SRS-XP500",
        "Sony SRS-XP700",
        "Sony ULT Field 1",
        "Sony ULT Field 7"
    ],

    "Bose Speaker": [
        "Bose Home Speaker 300",
        "Bose Home Speaker 500",
        "Bose Portable Smart Speaker",
        "Bose SoundLink Flex",
        "Bose SoundLink Flex SE",
        "Bose SoundLink Revolve II",
        "Bose SoundLink Revolve+ II"
    ],

    "Marshall Speaker": [
        "Marshall Acton II",
        "Marshall Acton III",
        "Marshall Emberton",
        "Marshall Emberton II",
        "Marshall Stanmore II",
        "Marshall Stanmore III",
        "Marshall Stockwell II",
        "Marshall Willen",
        "Marshall Willen II",
        "Marshall Woburn III"
    ],

    "Harman Kardon Speaker": [
        "Harman Kardon Aura Studio 3",
        "Harman Kardon Aura Studio 4",
        "Harman Kardon Citation 200",
        "Harman Kardon Onyx Studio 6",
        "Harman Kardon Onyx Studio 7",
        "Harman Kardon Onyx Studio 8"
    ],

    "Ultimate Ears Speaker": [
        "UE Boom 3",
        "UE Hyperboom",
        "UE Megaboom 3",
        "UE Wonderboom 2",
        "UE Wonderboom 3"
    ],

    "Anker Soundcore Speaker": [
        "Soundcore Flare 2",
        "Soundcore Motion Boom",
        "Soundcore Motion Boom Plus",
        "Soundcore Motion X600",
        "Soundcore Motion+",
        "Soundcore Select Pro"
    ],

    "Philips Speaker": [
        "Philips TAS5505",
        "Philips TAS7807",
        "Philips TAX2208",
        "Philips TAX4207",
        "Philips TAX5206"
    ],
    "Boat Speaker": [
        "Boat Stone 1000",
        "Boat Stone 1200",
        "Boat Stone 1500",
        "Boat Stone 1800",
        "Boat Stone 200",
        "Boat Stone 350",
        "Boat Stone 650",
        "Boat Stone Grenade",
        "Boat Stone Lumos",
        "Boat Stone Spinx Pro"
    ],

    "Zebronics Speaker": [
        "Zebronics Zeb County",
        "Zebronics Zeb Music Bomb",
        "Zebronics Zeb Sound Bomb X1",
        "Zebronics Zeb Sound Feast 100",
        "Zebronics Zeb Sound Feast 200",
        "Zebronics Zeb Sound Feast 300",
        "Zebronics Zeb Sound Feast 400",
        "Zebronics Zeb Sound Feast 50"
    ],

    "Portronics Speaker": [
        "Portronics Dash",
        "Portronics SoundDrum",
        "Portronics SoundDrum 1",
        "Portronics SoundDrum P",
        "Portronics SoundDrum Plus",
        "Portronics SoundPot",
        "Portronics Sublime"
    ],

    "Ambrane Speaker": [
        "Ambrane BeatBox",
        "Ambrane BeatBox 10W",
        "Ambrane BT-1000",
        "Ambrane BT-2000",
        "Ambrane BT-3000",
        "Ambrane BT-6000"
    ],

    "Noise Speaker": [
        "Noise SoundCore Mini",
        "Noise SoundLink Mini",
        "Noise SoundMaster",
        "Noise SoundPulse"
    ],

    "Mivi Speaker": [
        "Mivi Fort H200",
        "Mivi Fort H350",
        "Mivi Play",
        "Mivi Roam 2",
        "Mivi Roam 3",
        "Mivi Roam 5"
    ],
    "Xiaomi Speaker": [
        "Xiaomi Mi Portable Bluetooth Speaker",
        "Xiaomi Mi Smart Speaker",
        "Xiaomi Smart Speaker",
        "Xiaomi Sound Outdoor",
        "Xiaomi Sound Pocket",
        "Xiaomi Sound Pro"
    ],

    "Dolby Speaker": [
        "Dolby Atmos Home Speaker",
        "Dolby Atmos Smart Speaker",
        "Dolby Atmos Soundbar Speaker",
        "Dolby Digital Home Speaker"
    ],

    "Realme Speaker": [
        "Realme Brick Bluetooth Speaker",
        "Realme Brick Wireless Speaker",
        "Realme Cobble Bluetooth Speaker",
        "Realme Pocket Bluetooth Speaker"
    ],

    "Redmi Speaker": [
        "Redmi AI Smart Speaker",
        "Redmi Bluetooth Speaker",
        "Redmi Computer Speaker",
        "Redmi TV Soundbar Speaker"
    ],

    "Intex Speaker": [
        "Intex IT-2616 BT",
        "Intex IT-2635 BT",
        "Intex IT-3000 SUF",
        "Intex IT-3500 SUF",
        "Intex IT-4000 SUF"
    ],

    "Syska Speaker": [
        "Syska Beat Pro Speaker",
        "Syska SoundBar Mini",
        "Syska SoundBox",
        "Syska SoundCube"
    ],
    "Morbi Speaker": [
        "Morbi M101 Speaker",
        "Morbi M201 Speaker",
        "Morbi M301 Speaker",
        "Morbi M401 Party Speaker",
        "Morbi M501 Bluetooth Speaker"
    ],

    "Ubon Speaker": [
        "Ubon SP-120 Speaker",
        "Ubon SP-140 Party Speaker",
        "Ubon SP-50 Speaker",
        "Ubon SP-70 Speaker",
        "Ubon SP-90 Speaker"
    ],

    "Artis Speaker": [
        "Artis BT12 Speaker",
        "Artis BT15 Speaker",
        "Artis BT90 Speaker",
        "Artis BTX10 Speaker",
        "Artis BTX5 Speaker"
    ],

    "iBall Speaker": [
        "iBall Musi Bar Speaker",
        "iBall Musi Cube Speaker",
        "iBall Musi Play Speaker",
        "iBall Musi Rock Speaker"
    ],

    "F&D Speaker": [
        "F&D T60X Speaker",
        "F&D T70X Speaker",
        "F&D W19 Speaker",
        "F&D W35 Speaker",
        "F&D W40 Speaker"
    ],
    "Mi Speaker": [
        "Mi Outdoor Bluetooth Speaker",
        "Mi Pocket Bluetooth Speaker 2",
        "Mi Portable Bluetooth Speaker",
        "Mi Smart Speaker",
        "Mi Smart Speaker Lite"
    ],

    "Infinity Speaker": [
        "Infinity Clubz 150",
        "Infinity Clubz 250",
        "Infinity Clubz 750",
        "Infinity Fuze 100",
        "Infinity Fuze 200",
        "Infinity Fuze 300"
    ],

    "Harman Speaker": [
        "Harman Aura Studio 1",
        "Harman Aura Studio 2",
        "Harman Go Play Mini",
        "Harman Onyx Studio 4",
        "Harman Onyx Studio 5"
    ],
    "Amazon Echo": [
        "Echo (4th Gen)",
        "Echo (5th Gen)",
        "Echo Dot (4th Gen)",
        "Echo Dot (5th Gen)",
        "Echo Pop",
        "Echo Studio"
    ],
    "Anker PowerBank": [
        "Anker PowerCore 10000 PD",
        "Anker PowerCore Essential 20000",
        "Anker PowerCore Fusion",
        "Anker PowerCore III Elite 25600",
        "Anker PowerCore Metro 20000",
        "Anker PowerCore Slim 10000"
    ],
    "Mi PowerBank": [
        "Mi Power Bank 2i 10000",
        "Mi Power Bank 2i 20000",
        "Mi Power Bank 3 Pro 20000",
        "Mi Power Bank 3i 10000",
        "Mi Power Bank 3i 20000"
    ],
    "Redmi PowerBank": [
        "Redmi Power Bank 10000",
        "Redmi Power Bank 20000",
        "Redmi Power Bank Compact 10000",
        "Redmi Power Bank Fast Charge 20000"
    ],
    "Realme PowerBank": [
        "Realme Power Bank 10000",
        "Realme Power Bank 2 10000",
        "Realme Power Bank 2 20000",
        "Realme Power Bank 20000"
    ],
    "Samsung PowerBank": [
        "Samsung 10000mAh Battery Pack",
        "Samsung 10000mAh Wireless Power Bank",
        "Samsung 20000mAh Battery Pack",
        "Samsung Super Fast Charging 10000"
    ],
    "OnePlus PowerBank": [
        "OnePlus Power Bank 10000",
        "OnePlus Power Bank 2 10000"
    ],
    "Xiaomi PowerBank": [
        "Xiaomi Power Bank 10000",
        "Xiaomi Power Bank 20000",
        "Xiaomi Power Bank 30000",
        "Xiaomi Wireless Power Bank 10000"
    ],
    "Ambrane PowerBank": [
        "Ambrane P-1310",
        "Ambrane PP-111",
        "Ambrane PP-20 Pro",
        "Ambrane PP-30 Pro",
        "Ambrane Stylo 10K",
        "Ambrane Stylo 20K"
    ],
    "Portronics PowerBank": [
        "Portronics Luxcell 10K",
        "Portronics Luxcell 20K",
        "Portronics Luxcell B",
        "Portronics Power Brick 10K",
        "Portronics Power Brick 20K"
    ],
    "Boat PowerBank": [
        "Boat EnergyShroom PB300",
        "Boat EnergyShroom PB400",
        "Boat EnergyShroom PB500",
        "Boat EnergyShroom PB600"
    ],
    "Syska PowerBank": [
        "Syska P1014B",
        "Syska P1016B",
        "Syska P1024J",
        "Syska P2016B"
    ],
    "URBN PowerBank": [
        "URBN 10000mAh Ultra Compact PowerBank",
        "URBN 10000mAh Wireless PowerBank",
        "URBN 20000mAh Fast Charging PowerBank",
        "URBN 20000mAh Slim PowerBank"
    ],
    "Intex PowerBank": [
        "Intex IT-PB11K",
        "Intex IT-PB12K",
        "Intex IT-PB15K",
        "Intex IT-PB20K"
    ],

    "Ubon PowerBank": [
        "Ubon PB-X20",
        "Ubon PB-X30",
        "Ubon PB-X40",
        "Ubon PB-X50"
    ],

    "pTron PowerBank": [
        "pTron Dynamo Lite PowerBank",
        "pTron Dynamo PowerBank 10000",
        "pTron Dynamo PowerBank 20000",
        "pTron Dynamo Pro PowerBank"
    ],

    "Zebronics PowerBank": [
        "Zebronics ZEB-MB10000",
        "Zebronics ZEB-MB20000",
        "Zebronics ZEB-PB10",
        "Zebronics ZEB-PB20"
    ],

    "Stuffcool PowerBank": [
        "Stuffcool Slim PowerBank",
        "Stuffcool Snap PowerBank",
        "Stuffcool SuperPower 10000",
        "Stuffcool SuperPower 20000"
    ],
    "Morbi PowerBank": [
        "Morbi M10 PowerBank",
        "Morbi M20 PowerBank",
        "Morbi M30 Fast Charge PowerBank",
        "Morbi M40 PowerBank"
    ],

    "Callmate PowerBank": [
        "Callmate P10 PowerBank",
        "Callmate P20 PowerBank",
        "Callmate P30 Fast Charge PowerBank",
        "Callmate Slim 10000 PowerBank"
    ],

    "Lapcare PowerBank": [
        "Lapcare FastCharge PowerBank",
        "Lapcare LPB-10K",
        "Lapcare LPB-15K",
        "Lapcare LPB-20K"
    ],

    "iBall PowerBank": [
        "iBall Compact PowerBank",
        "iBall PB-10000 PowerBank",
        "iBall PB-15000 PowerBank",
        "iBall PB-20000 PowerBank"
    ],

    "Frontech PowerBank": [
        "Frontech PB-10K",
        "Frontech PB-15K",
        "Frontech PB-20K",
        "Frontech Slim PowerBank"
    ],

    "Apple Charger": [
        "Apple 12W USB Power Adapter",
        "Apple 18W USB-C Power Adapter",
        "Apple 20W USB-C Power Adapter",
        "Apple 30W USB-C Power Adapter",
        "Apple 35W Dual USB-C Charger",
        "Apple 5W USB Power Adapter",
        "Apple 67W USB-C Power Adapter",
        "Apple 96W USB-C Power Adapter"
    ],

    "Samsung Charger": [
        "Samsung 15W Adaptive Fast Charger",
        "Samsung 25W Super Fast Charger",
        "Samsung 25W USB-C Charger",
        "Samsung 45W Super Fast Charger",
        "Samsung 65W Trio Charger",
        "Samsung Wireless Charger Duo"
    ],

    "Xiaomi Charger": [
        "Xiaomi 120W HyperCharge Charger",
        "Xiaomi 22.5W Charger",
        "Xiaomi 33W Fast Charger",
        "Xiaomi 55W Turbo Charger",
        "Xiaomi 67W Turbo Charger",
        "Xiaomi 90W HyperCharge Charger"
    ],

    "Redmi Charger": [
        "Redmi 18W Fast Charger",
        "Redmi 22.5W Fast Charger",
        "Redmi 33W Fast Charger",
        "Redmi 67W Fast Charger"
    ],

    "Realme Charger": [
        "Realme 100W SuperVOOC Charger",
        "Realme 18W Fast Charger",
        "Realme 30W Dart Charger",
        "Realme 33W Dart Charger",
        "Realme 50W SuperDart Charger",
        "Realme 65W SuperDart Charger"
    ],

    "OnePlus Charger": [
        "OnePlus SuperVOOC 100W Charger",
        "OnePlus SuperVOOC 80W Charger",
        "OnePlus Warp Charge 30",
        "OnePlus Warp Charge 65"
    ],

    "Oppo Charger": [
        "Oppo 100W SuperVOOC Charger",
        "Oppo 18W VOOC Charger",
        "Oppo 30W VOOC Charger",
        "Oppo 50W SuperVOOC Charger",
        "Oppo 65W SuperVOOC Charger",
        "Oppo 80W SuperVOOC Charger"
    ],

    "Vivo Charger": [
        "Vivo 18W FlashCharge Charger",
        "Vivo 33W FlashCharge Charger",
        "Vivo 44W FlashCharge Charger",
        "Vivo 66W FlashCharge Charger",
        "Vivo 80W FlashCharge Charger"
    ],

    "Huawei Charger": [
        "Huawei 22.5W SuperCharge Charger",
        "Huawei 40W SuperCharge Charger",
        "Huawei 66W SuperCharge Charger",
        "Huawei 88W SuperCharge Charger"
    ],
    "Anker Charger": [
        "Anker GaNPrime 120W Charger",
        "Anker Nano 20W Charger",
        "Anker Nano II 30W Charger",
        "Anker Nano II 65W Charger",
        "Anker PowerPort III 20W",
        "Anker PowerPort III 65W"
    ],

    "Belkin Charger": [
        "Belkin BoostCharge 20W",
        "Belkin BoostCharge 25W",
        "Belkin BoostCharge 30W USB-C",
        "Belkin BoostCharge 65W Dual USB-C",
        "Belkin BoostCharge Pro 45W"
    ],

    "Baseus Charger": [
        "Baseus 100W GaN Charger",
        "Baseus 20W PD Charger",
        "Baseus 30W GaN Charger",
        "Baseus 65W GaN Charger",
        "Baseus Super Si 30W Charger"
    ],

    "Ambrane Charger": [
        "Ambrane 20W Fast Charger",
        "Ambrane 33W Charger",
        "Ambrane 45W Fast Charger",
        "Ambrane 65W GaN Charger",
        "Ambrane Multiport Charger"
    ],

    "Portronics Charger": [
        "Portronics Adapto 20W Charger",
        "Portronics Adapto 30W Charger",
        "Portronics Adapto 45W Charger",
        "Portronics Adapto 65W Charger"
    ],
    "Boat Charger": [
        "Boat 18W Fast Charger",
        "Boat 20W Fast Charger",
        "Boat 30W Dual Port Charger",
        "Boat 45W Fast Charger",
        "Boat Multiport USB Charger"
    ],

    "Zebronics Charger": [
        "Zebronics Dual USB Fast Charger",
        "Zebronics ZEB-TA20 Charger",
        "Zebronics ZEB-TA30 Charger",
        "Zebronics ZEB-TA45 Charger"
    ],

    "pTron Charger": [
        "pTron Bullet 20W Charger",
        "pTron Bullet 30W Charger",
        "pTron Bullet 45W Charger",
        "pTron Turbo 65W Charger"
    ],

    "Syska Charger": [
        "Syska 18W Fast Charger",
        "Syska 20W Fast Charger",
        "Syska 33W Fast Charger",
        "Syska 45W Fast Charger"
    ],

    "URBN Charger": [
        "URBN 20W Fast Charger",
        "URBN 30W PD Charger",
        "URBN 45W Fast Charger",
        "URBN Multiport Charger"
    ],
    "Morbi Charger": [
        "Morbi 18W Fast Charger",
        "Morbi 20W Fast Charger",
        "Morbi 30W Fast Charger",
        "Morbi Dual USB Charger"
    ],

    "Ubon Charger": [
        "Ubon CH-30 Fast Charger",
        "Ubon CH-45 Fast Charger",
        "Ubon CH-60 Charger",
        "Ubon Dual USB Charger"
    ],

    "Lapcare Charger": [
        "Lapcare 18W Fast Charger",
        "Lapcare 30W Fast Charger",
        "Lapcare 45W Fast Charger",
        "Lapcare Dual USB Charger"
    ],

    "Intex Charger": [
        "Intex 18W Fast Charger",
        "Intex 20W Fast Charger",
        "Intex Compact Charger",
        "Intex Dual USB Charger"
    ],

    "Callmate Charger": [
        "Callmate 18W Fast Charger",
        "Callmate 20W Fast Charger",
        "Callmate 33W Fast Charger",
        "Callmate Dual USB Charger"
    ],
    "Apple Cable": [
        "Apple Lightning to USB Cable",
        "Apple Thunderbolt 4 Pro Cable",
        "Apple USB-C Charge Cable (1m)",
        "Apple USB-C Charge Cable (2m)",
        "Apple USB-C to Lightning Cable"
    ],

    "Samsung Cable": [
        "Samsung 25W Type-C Cable",
        "Samsung 45W Type-C Cable",
        "Samsung Super Fast Charge Cable",
        "Samsung USB-C to USB-A Cable",
        "Samsung USB-C to USB-C Cable"
    ],

    "Xiaomi Cable": [
        "Xiaomi 33W Type-C Cable",
        "Xiaomi 67W Turbo Charge Cable",
        "Xiaomi USB-A to Type-C Cable",
        "Xiaomi USB-C Fast Charging Cable"
    ],

    "Redmi Cable": [
        "Redmi 33W Type-C Cable",
        "Redmi USB-A to Type-C Cable",
        "Redmi USB-C Fast Charging Cable"
    ],

    "Realme Cable": [
        "Realme Dart Charge Cable",
        "Realme SuperDart Cable",
        "Realme USB-A to Type-C Cable",
        "Realme USB-C Fast Charge Cable"
    ],

    "OnePlus Cable": [
        "OnePlus SuperVOOC Cable",
        "OnePlus USB-C to USB-C Cable",
        "OnePlus Warp Charge Type-C Cable"
    ],

    "Oppo Cable": [
        "Oppo SuperVOOC Cable",
        "Oppo USB-C Fast Charge Cable",
        "Oppo VOOC Charging Cable"
    ],

    "Vivo Cable": [
        "Vivo FlashCharge Type-C Cable",
        "Vivo Micro USB Cable",
        "Vivo USB-C Charging Cable"
    ],

    "Huawei Cable": [
        "Huawei Micro USB Cable",
        "Huawei SuperCharge USB-C Cable",
        "Huawei USB-C to USB-C Cable"
    ],

    "Anker Cable": [
        "Anker PowerLine II USB-C Cable",
        "Anker PowerLine III USB-C Cable",
        "Anker PowerLine Lightning Cable",
        "Anker PowerLine USB-C Cable",
        "Anker USB-C to USB-C Fast Charging Cable"
    ],

    "Belkin Cable": [
        "Belkin BoostCharge Lightning Cable",
        "Belkin BoostCharge USB-C Cable",
        "Belkin Braided Fast Charge Cable",
        "Belkin USB-A to USB-C Cable",
        "Belkin USB-C to USB-C Cable"
    ],

    "Baseus Cable": [
        "Baseus 100W Type-C Cable",
        "Baseus Cafule Braided Cable",
        "Baseus USB-A to Type-C Cable",
        "Baseus USB-C Fast Charging Cable",
        "Baseus USB-C to Lightning Cable"
    ],

    "Ambrane Cable": [
        "Ambrane Braided Fast Charge Cable",
        "Ambrane Lightning Cable",
        "Ambrane Micro USB Cable",
        "Ambrane Unbreakable Type-C Cable",
        "Ambrane USB-C to USB-C Cable"
    ],

    "Portronics Cable": [
        "Portronics Konnect Lightning Cable",
        "Portronics Konnect Micro USB Cable",
        "Portronics Konnect Pro Braided Cable",
        "Portronics Konnect USB-C Cable"
    ],
    "Morbi Cable": [
        "Morbi Braided Fast Charging Cable",
        "Morbi Lightning Charging Cable",
        "Morbi Micro USB Cable",
        "Morbi Type-C Fast Charge Cable"
    ],

    "Ubon Cable": [
        "Ubon Fast Charge Braided Cable",
        "Ubon Lightning Cable",
        "Ubon Micro USB Cable",
        "Ubon USB-C Charging Cable"
    ],

    "Lapcare Cable": [
        "Lapcare Braided Charging Cable",
        "Lapcare Lightning Charging Cable",
        "Lapcare Micro USB Cable",
        "Lapcare USB-C Fast Charge Cable"
    ],

    "Intex Cable": [
        "Intex Fast Charge Cable",
        "Intex Lightning Cable",
        "Intex Micro USB Cable",
        "Intex USB-C Charging Cable"
    ],

    "Callmate Cable": [
        "Callmate Braided Charging Cable",
        "Callmate Lightning Charging Cable",
        "Callmate Micro USB Cable",
        "Callmate USB-C Fast Charge Cable"
    ],
    "Logitech Keyboard": [
        "Logitech G213 Prodigy",
        "Logitech G413 Mechanical",
        "Logitech K120",
        "Logitech K230",
        "Logitech K270",
        "Logitech K380",
        "Logitech K480",
        "Logitech K780",
        "Logitech MX Keys",
        "Logitech MX Keys Mini"
    ],

    "Dell Keyboard": [
        "Dell KB216 Wired Keyboard",
        "Dell KB522 Multimedia Keyboard",
        "Dell KM636 Wireless Keyboard",
        "Dell KM7120W Keyboard"
    ],

    "HP Keyboard": [
        "HP 350 Compact Keyboard",
        "HP K100 Wired Keyboard",
        "HP K1500 Wired Keyboard",
        "HP K3500 Wireless Keyboard"
    ],

    "Lenovo Keyboard": [
        "Lenovo 300 USB Keyboard",
        "Lenovo 510 Wireless Keyboard",
        "Lenovo Preferred Pro Keyboard",
        "Lenovo ThinkPad TrackPoint Keyboard"
    ],

    "Asus Keyboard": [
        "Asus ROG Claymore II",
        "Asus ROG Strix Scope",
        "Asus TUF Gaming K1",
        "Asus TUF Gaming K3"
    ],

    "Acer Keyboard": [
        "Acer Nitro Gaming Keyboard",
        "Acer OKR010 Wired Keyboard",
        "Acer OKW010 Wireless Keyboard"
    ],

    "Razer Keyboard": [
        "Razer BlackWidow V3",
        "Razer BlackWidow V4",
        "Razer Huntsman Mini",
        "Razer Huntsman V2",
        "Razer Ornata V3"
    ],

    "Corsair Keyboard": [
        "Corsair K100 RGB",
        "Corsair K55 RGB Pro",
        "Corsair K70 RGB Pro",
        "Corsair K95 RGB Platinum"
    ],
    "Zebronics Keyboard": [
        "Zebronics Zeb-Companion Keyboard",
        "Zebronics Zeb-K20 Keyboard",
        "Zebronics Zeb-K30 Keyboard",
        "Zebronics Zeb-K35 Keyboard",
        "Zebronics Zeb-K500 Keyboard",
        "Zebronics Zeb-K700 Keyboard",
        "Zebronics Zeb-KM2100 Keyboard",
        "Zebronics Zeb-KM2100 Wireless Keyboard",
        "Zebronics Zeb-KM3300 Keyboard",
        "Zebronics Zeb-KM4000 Keyboard",
        "Zebronics Zeb-Max Pro Keyboard",
        "Zebronics Zeb-Nitro Keyboard",
        "Zebronics Zeb-Transformer Keyboard",
        "Zebronics Zeb-War Keyboard"
    ],

    "Ant Esports Keyboard": [
        "Ant Esports KM500 Combo Keyboard",
        "Ant Esports MK1000 Gaming Keyboard",
        "Ant Esports MK1200 Mechanical Keyboard",
        "Ant Esports MK3400 Mechanical Keyboard"
    ],

    "Redgear Keyboard": [
        "Redgear Blaze Gaming Keyboard",
        "Redgear MK881 Mechanical Keyboard",
        "Redgear Shadow Blade Mechanical Keyboard"
    ],

    "Cosmic Byte Keyboard": [
        "Cosmic Byte CB-GK-16 Firefly",
        "Cosmic Byte CB-GK-18 Mechanical Keyboard",
        "Cosmic Byte CB-GK-20 Mechanical Keyboard"
    ],

    "Frontech Keyboard": [
        "Frontech KB-003 Wired Keyboard",
        "Frontech KB-004 Multimedia Keyboard",
        "Frontech KB-005 USB Keyboard"
    ],

    "Lapcare Keyboard": [
        "Lapcare LTK-01 Keyboard",
        "Lapcare LTK-02 Wired Keyboard",
        "Lapcare Wireless Keyboard Combo"
    ],
    "Microsoft Keyboard": [
        "Microsoft Bluetooth Keyboard",
        "Microsoft Surface Keyboard",
        "Microsoft Wired Keyboard 600",
        "Microsoft Wired Keyboard 850"
    ],

    "Apple Keyboard": [
        "Apple Magic Keyboard",
        "Apple Magic Keyboard for iPad",
        "Apple Magic Keyboard with Touch ID",
        "Apple Wired Keyboard with Numeric Keypad"
    ],

    "iBall Keyboard": [
        "iBall Magical Duo Keyboard",
        "iBall USB Desktop Keyboard",
        "iBall Winner Keyboard"
    ],

    "Portronics Keyboard": [
        "Portronics Hydra 10 Keyboard",
        "Portronics Key2 Keyboard",
        "Portronics Key7 Wireless Keyboard"
    ],

    "Amkette Keyboard": [
        "Amkette EvoFox Fireblade Gaming Keyboard",
        "Amkette EvoFox Warhammer Mechanical Keyboard",
        "Amkette Wireless Keyboard"
    ],
    "Logitech Mouse": [
        "Logitech G102 Lightsync",
        "Logitech G203 Lightsync",
        "Logitech G304 Lightspeed",
        "Logitech G502 Hero",
        "Logitech M100",
        "Logitech M170 Wireless",
        "Logitech M185 Wireless",
        "Logitech M221 Silent",
        "Logitech M235 Wireless",
        "Logitech M331 Silent Plus",
        "Logitech M590 Multi-Device",
        "Logitech M90",
        "Logitech MX Master 2S",
        "Logitech MX Master 3",
        "Logitech MX Master 3S"
    ],

    "Dell Mouse": [
        "Dell MS116 Wired Mouse",
        "Dell MS3320W Wireless Mouse",
        "Dell MS5120W Multi-Device Mouse",
        "Dell MS7421W Premier Mouse",
        "Dell WM126 Wireless Mouse"
    ],

    "HP Mouse": [
        "HP 220 Wireless Mouse",
        "HP 410 Slim Bluetooth Mouse",
        "HP X1000 Wired Mouse",
        "HP X200 Wireless Mouse",
        "HP X3000 Wireless Mouse",
        "HP Z3700 Wireless Mouse"
    ],

    "Lenovo Mouse": [
        "Lenovo 300 USB Mouse",
        "Lenovo 400 Wireless Mouse",
        "Lenovo 530 Wireless Mouse",
        "Lenovo 600 Bluetooth Mouse",
        "Lenovo ThinkPad Wireless Mouse"
    ],

    "Asus Mouse": [
        "Asus ROG Gladius II",
        "Asus ROG Gladius III",
        "Asus ROG Strix Impact",
        "Asus ROG Strix Impact II",
        "Asus TUF Gaming M3",
        "Asus TUF Gaming M3 Gen II"
    ],

    "Acer Mouse": [
        "Acer Nitro Gaming Mouse",
        "Acer OMR010 Gaming Mouse",
        "Acer OMW010 Wired Mouse",
        "Acer OMW020 Wireless Mouse"
    ],
    "Razer Mouse": [
        "Razer Basilisk Essential",
        "Razer Basilisk V3",
        "Razer DeathAdder Essential",
        "Razer DeathAdder V2",
        "Razer DeathAdder V3",
        "Razer Viper 8K",
        "Razer Viper Mini"
    ],

    "Corsair Mouse": [
        "Corsair Dark Core RGB",
        "Corsair Harpoon RGB",
        "Corsair Ironclaw RGB",
        "Corsair Katar Pro",
        "Corsair M55 RGB Pro",
        "Corsair M65 RGB Elite"
    ],

    "Ant Esports Mouse": [
        "Ant Esports GM100 Gaming Mouse",
        "Ant Esports GM200 Gaming Mouse",
        "Ant Esports GM300 Gaming Mouse",
        "Ant Esports GM320 Gaming Mouse"
    ],

    "Redgear Mouse": [
        "Redgear A10 Gaming Mouse",
        "Redgear A15 Gaming Mouse",
        "Redgear Cloak Wired Gaming Mouse",
        "Redgear X12 Gaming Mouse",
        "Redgear X17 Gaming Mouse",
        "Redgear Z1 Gaming Mouse",
        "Redgear Z2 Pro Gaming Mouse"
    ],
    "Cosmic Byte Mouse": [
        "Cosmic Byte Equinox Gamma Mouse",
        "Cosmic Byte Firestorm Mouse",
        "Cosmic Byte Kilonova Mouse",
        "Cosmic Byte Zero G Mouse"
    ],
    "Zebronics Mouse": [
        "Zebronics Zeb-Comfort Mouse",
        "Zebronics Zeb-Dash Mouse",
        "Zebronics Zeb-Glow Mouse",
        "Zebronics Zeb-Jaguar Mouse",
        "Zebronics Zeb-Phobos Mouse",
        "Zebronics Zeb-Phoenix Mouse",
        "Zebronics Zeb-Power Mouse",
        "Zebronics Zeb-Rise Mouse",
        "Zebronics Zeb-Rush Mouse",
        "Zebronics Zeb-Sprint Mouse",
        "Zebronics Zeb-Swift Mouse",
        "Zebronics Zeb-Tempest Mouse",
        "Zebronics Zeb-Transformer M",
        "Zebronics Zeb-Transformer Mouse"
    ],
    "Frontech Mouse": [
        "Frontech MS-002 Wired Mouse",
        "Frontech MS-003 Optical Mouse",
        "Frontech MS-004 USB Mouse",
        "Frontech Wireless Mouse"
    ],

    "Lapcare Mouse": [
        "Lapcare LM-01 Mouse",
        "Lapcare LM-02 Wired Mouse",
        "Lapcare LM-03 Optical Mouse",
        "Lapcare Wireless Mouse"
    ],

    "Microsoft Mouse": [
        "Microsoft Basic Optical Mouse",
        "Microsoft Bluetooth Mouse",
        "Microsoft Modern Mobile Mouse",
        "Microsoft Surface Precision Mouse"
    ],

    "Apple Mouse": [
        "Apple Magic Mouse",
        "Apple Magic Mouse 2",
        "Apple Wireless Mighty Mouse"
    ],

    "iBall Mouse": [
        "iBall FreeGo G20 Wireless Mouse",
        "iBall Style 63 Optical Mouse",
        "iBall Winner Wired Mouse"
    ],

    "Portronics Mouse": [
        "Portronics Hydra 10 Gaming Mouse",
        "Portronics Toad 11 Wireless Mouse",
        "Portronics Toad 23 Wireless Mouse"
    ],

    "Amkette Mouse": [
        "Amkette EvoFox Blaze Gaming Mouse",
        "Amkette EvoFox Phantom Gaming Mouse",
        "Amkette Wireless Optical Mouse"
    ],

    "Sony Headphones": [
        "Sony MDR-XB450",
        "Sony MDR-XB650BT",
        "Sony MDR-ZX110",
        "Sony WH-1000XM4",
        "Sony WH-1000XM5",
        "Sony WH-CH520",
        "Sony WH-CH720N"
    ],

    "JBL Headphones": [
        "JBL Live 460NC",
        "JBL Live 660NC",
        "JBL Quantum 100",
        "JBL Tune 510BT",
        "JBL Tune 520BT",
        "JBL Tune 710BT",
        "JBL Tune 760NC"
    ],

    "Sennheiser Headphones": [
        "Sennheiser HD 206",
        "Sennheiser HD 350BT",
        "Sennheiser HD 450BT",
        "Sennheiser HD 560S",
        "Sennheiser Momentum 4"
    ],

    "Bose Headphones": [
        "Bose Noise Cancelling Headphones 700",
        "Bose QuietComfort 45",
        "Bose QuietComfort Ultra",
        "Bose SoundLink Around-Ear II"
    ],

    "Marshall Headphones": [
        "Marshall Major III",
        "Marshall Major IV",
        "Marshall Monitor Bluetooth",
        "Marshall Monitor II ANC"
    ],

    "Beats Headphones": [
        "Beats Solo 3 Wireless",
        "Beats Solo Pro",
        "Beats Studio 3 Wireless",
        "Beats Studio Pro"
    ],
    "Boat Headphones": [
        "Boat Rockerz 370",
        "Boat Rockerz 450",
        "Boat Rockerz 510",
        "Boat Rockerz 550",
        "Boat Rockerz 558",
        "Boat Rockerz 600"
    ],

    "Skullcandy Headphones": [
        "Skullcandy Cassette Wireless",
        "Skullcandy Crusher Evo",
        "Skullcandy Hesh Evo",
        "Skullcandy Riff Wireless"
    ],

    "Philips Headphones": [
        "Philips SHB3075",
        "Philips SHL5005",
        "Philips TAH4205",
        "Philips TAH6506"
    ],

    "OnePlus Headphones": [
        "OnePlus Bullets Wireless 2",
        "OnePlus Bullets Wireless Z",
        "OnePlus Bullets Wireless Z2"
    ],

    "Realme Headphones": [
        "Realme Buds Wireless",
        "Realme Buds Wireless 2",
        "Realme Buds Wireless 2 Neo",
        "Realme Buds Wireless 3"
    ],

    "Noise Headphones": [
        "Noise Airwave",
        "Noise One Wireless",
        "Noise Two Wireless"
    ],
    "HyperX Headphones": [
        "HyperX Cloud Alpha",
        "HyperX Cloud Core",
        "HyperX Cloud II",
        "HyperX Cloud Stinger",
        "HyperX Cloud Stinger 2"
    ],

    "Corsair Headphones": [
        "Corsair HS35",
        "Corsair HS50 Pro",
        "Corsair HS60 Haptic",
        "Corsair HS70 Pro Wireless",
        "Corsair Virtuoso RGB Wireless"
    ],

    "Razer Headphones": [
        "Razer Barracuda X",
        "Razer BlackShark V2",
        "Razer BlackShark V2 Pro",
        "Razer Kraken V3",
        "Razer Kraken X"
    ],

    "Logitech Headphones": [
        "Logitech G331",
        "Logitech G335",
        "Logitech G432",
        "Logitech G435 Lightspeed",
        "Logitech G733 Lightspeed"
    ],
    "Zebronics Headphones": [
        "Zebronics Zeb-Bang",
        "Zebronics Zeb-Bang Pro",
        "Zebronics Zeb-Blast",
        "Zebronics Zeb-Blitz",
        "Zebronics Zeb-Duke",
        "Zebronics Zeb-Duke 2",
        "Zebronics Zeb-Rush",
        "Zebronics Zeb-Rush Pro",
        "Zebronics Zeb-Storm",
        "Zebronics Zeb-Thunder",
        "Zebronics Zeb-Thunder 2023",
        "Zebronics Zeb-Thunder 2024",
        "Zebronics Zeb-Thunder Max",
        "Zebronics Zeb-Thunder Neo",
        "Zebronics Zeb-Thunder Pro"
    ],

    "Boult Headphones": [
        "Boult Audio Anchor",
        "Boult Audio Boost",
        "Boult Audio ProBass Curve"
    ],

    "pTron Headphones": [
        "pTron Bassbuds Wave",
        "pTron Studio Wireless",
        "pTron Tangent Evo"
    ],

    "Ambrane Headphones": [
        "Ambrane HP-11 Headphones",
        "Ambrane HP-12 Headphones",
        "Ambrane HP-20 Headphones"
    ],

    "Portronics Headphones": [
        "Portronics Muffs A",
        "Portronics Muffs G",
        "Portronics Muffs M"
    ],

    "Ubon Headphones": [
        "Ubon CL-110 Headphones",
        "Ubon CL-120 Headphones",
        "Ubon CL-35 Headphones",
        "Ubon CL-60 Headphones"
    ],

    "Morbi Headphones": [
        "Morbi K1 Headphones",
        "Morbi K10 Headphones",
        "Morbi K11 Headphones",
        "Morbi K12 Headphones",
        "Morbi K15 Headphones",
        "Morbi K18 Headphones",
        "Morbi K2 Headphones",
        "Morbi K20 Headphones",
        "Morbi K3 Headphones",
        "Morbi K5 Headphones",
        "Morbi K7 Headphones",
        "Morbi K8 Headphones",
        "Morbi K9 Headphones"
    ],

    "Callmate Headphones": [
        "Callmate CL-01 Headphones",
        "Callmate CL-02 Headphones",
        "Callmate CL-05 Headphones",
        "Callmate CL-10 Headphones"
    ],

    "Frontech Headphones": [
        "Frontech HF-3445",
        "Frontech HF-3555",
        "Frontech HF-3755",
        "Frontech HF-3999"
    ],

    "Lapcare Headphones": [
        "Lapcare LHP-01",
        "Lapcare LHP-02",
        "Lapcare LHP-03",
        "Lapcare LHP-05"
    ],

    "Intex Headphones": [
        "Intex Jazz",
        "Intex MegaBass",
        "Intex Roar",
        "Intex Turbo"
    ],
    "Cosmic Byte Headphones": [
        "Cosmic Byte G1500 Headset",
        "Cosmic Byte GS410 Headphones",
        "Cosmic Byte GS420 Headphones",
        "Cosmic Byte GS430 Headphones",
        "Cosmic Byte GS440 Headphones",
        "Cosmic Byte H11 Headphones",
        "Cosmic Byte H3 Gaming Headset",
        "Cosmic Byte H7 Gaming Headset"
    ],
};

// ==========================================
// SPEC DEFINITIONS (Dropdowns + Inputs)
// ==========================================
const specDefinitions = {

    // ====== UNIVERSAL MOBILE/TABLET SPECS ======

    ram: {
        label: "RAM",
        list: [
            "1 GB", "2 GB", "3 GB", "4 GB", "6 GB", "8 GB",
            "12 GB", "16 GB", "24 GB", "32 GB"
        ]
    },

    storage: {
        label: "Storage",
        list: [
            "8 GB", "16 GB", "32 GB", "64 GB", "128 GB", "256 GB",
            "512 GB", "1 TB", "2 TB", "4 TB"
        ]
    },

    simtype: {
        label: "SIM Type",
        list: ["Single SIM", "Dual SIM", "eSIM", "No SIM"]
    },

    simsize: {
        label: "SIM Size",
        list: ["Nano SIM", "Micro SIM", "Standard SIM", "eSIM"]
    },

    network: {
        label: "Network",
        list: ["2G", "3G", "4G", "5G", "VoLTE", "WiFi Only"]
    },

    battery: {
        label: "Battery Capacity",
        list: [
            "100 mAh", "150 mAh", "200 mAh", "250 mAh", "300 mAh", "350 mAh",
            "400 mAh", "500 mAh", "600 mAh", "1000 mAh", "2000 mAh"
        ]
    },

    mah: {
        label: "PowerBank Capacity (mAh)",
        list: [
            "5000 mAh", "10000 mAh", "15000 mAh",
            "20000 mAh", "25000 mAh", "30000 mAh"
        ]
    },

    // ====== LAPTOP SPECS ======
    processor: {
        label: "Processor",
        list: [
            // Intel
            "Intel i3 10th Gen", "Intel i3 11th Gen", "Intel i3 12th Gen",
            "Intel i5 10th Gen", "Intel i5 11th Gen", "Intel i5 12th Gen", "Intel i5 13th Gen",
            "Intel i7 10th Gen", "Intel i7 11th Gen", "Intel i7 12th Gen", "Intel i7 13th Gen", "Intel i7 14th Gen",
            // Ryzen
            "Ryzen 3 3250U", "Ryzen 3 5300U",
            "Ryzen 5 3500U", "Ryzen 5 5500U", "Ryzen 5 5600H",
            "Ryzen 7 5700U", "Ryzen 7 6800H",
            // Apple Silicon
            "Apple M1", "Apple M2", "Apple M3",
            // Snapdragon
            "Snapdragon X Elite"
        ]
    },

    // ====== CHARGER SPECS ======
    watt: {
        label: "Charger Wattage",
        list: [
            "5W", "10W", "12W", "15W", "18W", "20W", "25W", "30W", "33W",
            "45W", "55W", "60W", "65W", "80W", "100W", "120W", "160W"
        ]
    },

    // ====== CABLE SPECS ======
    type: {
        label: "Cable Type",
        list: ["Type-C", "Micro USB", "Lightning", "USB-A to Type-C", "USB-C to USB-C"]
    },

    length: {
        label: "Cable Length",
        list: ["0.5 m", "1 m", "1.5 m", "2 m", "3 m"]
    },

    // ====== KEYBOARD/MOUSE SPECS ======
    wireless: {
        label: "Wireless",
        list: ["Yes", "No"]
    },

    dpi: {
        label: "Mouse DPI",
        list: ["800", "1200", "1600", "2400", "3200", "6400"]
    },

    // ====== NEW REFINEMENTS ======
    usage_type: {
        label: "Usage Type",
        list: ["Gaming", "Office", "Mixed"]
    },
    bass_boost: {
        label: "Extra Bass",
        list: ["Yes", "No"]
    },
    connectivity: {
        label: "Connectivity",
        list: ["Bluetooth", "Wired", "Wired + BT", "2.4GHz Wireless"]
    },
    power_output: {
        label: "Power Output (Watts)",
        list: ["3W", "5W", "10W", "20W", "40W", "60W", "100W"]
    },
    anc: {
        label: "Noise Cancellation (ANC)",
        list: ["Yes", "No"]
    },
    playtime: {
        label: "Playtime (Hours)",
        list: ["4 hrs", "8 hrs", "12 hrs", "20 hrs", "40 hrs", "60 hrs"]
    },
    headset_type: {
        label: "Headphone Type",
        list: ["In-ear", "On-ear", "Over-ear", "Neckband"]
    }
};

// ==========================================
// CATEGORY → SPEC MAPPING
// ==========================================
const specRules = {

    // ===== Mobiles =====
    Mobile: [
        "ram", "storage",
        "simtype", "simsize", "network"
    ],

    // ===== Tablets =====
    Tablet: [
        "ram", "storage", "network"
    ],

    // ===== Laptops =====
    Laptop: [
        "ram", "storage", "processor"
    ],

    // ===== Smartwatch =====
    Smartwatch: [
        "battery"
    ],

    // ===== Earbuds / Headphones =====
    Earbuds: [
        "battery", "headset_type", "anc", "playtime"
    ],
    Headphones: [
        "headset_type", "anc", "playtime", "connectivity"
    ],
    Accessory: [
        "color"
    ],
    // ===== Speakers =====
    Speaker: [
        "battery", "connectivity", "power_output", "bass_boost"
    ],

    // ===== Powerbank =====
    PowerBank: [
        "mah"
    ],

    // ===== Chargers =====
    Charger: [
        "watt"
    ],

    // ===== Cables =====
    Cable: [
        "type", "length"
    ],

    // ===== Keyboard =====
    Keyboard: [
        "wireless", "usage_type"
    ],

    // ===== Mouse =====
    Mouse: [
        "wireless", "dpi", "usage_type"
    ],

    // ===== Accessories =====
    Accessory: [
        // color only (from index.html)
    ],

    // ===== Others =====
    Other: [
        // no specs
    ]
};

let isDevMode = localStorage.getItem('isDevMode') === 'true';

// ========================================================
// SECTION 5 — LOAD SPECS BASED ON CATEGORY
// ========================================================
const specFieldsContainer = document.getElementById("specFields");
const categorySelect = document.getElementById("categorySelect");
const pForm = document.getElementById("purchaseForm");
const discount = document.getElementById("discount");
const advance = document.getElementById("advance");
const balance = document.getElementById("balance");

function loadSpecsForCategory(category) {
    specFieldsContainer.innerHTML = ""; // clear old specs

    if (!category || !specRules[category]) return;

    const requiredSpecs = specRules[category];

    requiredSpecs.forEach(specKey => {
        const spec = specDefinitions[specKey];
        if (!spec) return;

        // wrapper
        let div = document.createElement("div");
        div.className = "spec-item";

        // label
        let label = document.createElement("label");
        label.textContent = spec.label;
        div.appendChild(label);

        // input element
        let input = document.createElement("input");

        if (spec.list && spec.list.length > 0) {
            // Dropdown suggestions via datalist
            input.setAttribute("list", specKey + "_list");
            let dl = document.createElement("datalist");
            dl.id = specKey + "_list";

            spec.list.forEach(v => {
                let op = document.createElement("option");
                op.value = v;
                dl.appendChild(op);
            });

            div.appendChild(dl);
        }

        input.name = specKey;

        if (spec.type) input.type = spec.type;
        if (spec.max) input.maxLength = spec.max;

        div.appendChild(input);
        specFieldsContainer.appendChild(div);
    });
}

// ========================================================
// SECTION 6 — PRICING & PRODUCT LIST ENGINE
// ========================================================
let productList = [];

// Elements needed for both Sections 5 and 6
const brandInput = document.getElementById("brandInput");
const modelInput = document.getElementById("modelInput");
const serialInput = document.getElementById("serialInput");
const colorInput = document.getElementById("colorInput");
const batchNoInput = document.getElementById("batchNoInput");
const itemSellingPrice = document.getElementById("itemSellingPrice");
const itemPurchaseCost = document.getElementById("itemPurchaseCost");
const itemTaxRate = document.getElementById("itemTaxRate");
const globalPurchaseDate = document.getElementById("globalPurchaseDate");

const addProductBtn = document.getElementById("addProductBtn");
const productTableBody = document.getElementById("productTableBody");
const subtotalDisplay = document.getElementById("subtotalDisplay");
const finalPrice = document.getElementById("finalPrice");
const itemDiscount = document.getElementById("itemDiscount");
const profit = document.getElementById("profit");

// update specs and brands when category changes
if (categorySelect) {
    categorySelect.addEventListener("change", () => {
        let cat = categorySelect.value;
        if (brandInput) brandInput.value = "";
        if (modelInput) modelInput.value = "";
        if (serialInput) serialInput.value = "";
        if (colorInput) colorInput.value = "";

        const brandSuggestions = document.getElementById("brandSuggestions");
        const modelSuggestions = document.getElementById("modelSuggestions");
        if (brandSuggestions) brandSuggestions.innerHTML = "";
        if (modelSuggestions) modelSuggestions.innerHTML = "";

        if (brandSuggestions && brandSuggestionsData[cat]) {
            brandSuggestionsData[cat].forEach(brand => {
                let op = document.createElement("option");
                op.value = brand;
                brandSuggestions.appendChild(op);
            });
        }
        loadSpecsForCategory(cat);
    });
}

if (brandInput) {
    brandInput.addEventListener("input", () => {
        let brand = brandInput.value;
        const modelSuggestions = document.getElementById("modelSuggestions");
        if (modelSuggestions) {
            modelSuggestions.innerHTML = "";
            if (modelSuggestionsData[brand]) {
                modelSuggestionsData[brand].forEach(model => {
                    let op = document.createElement("option");
                    op.value = model;
                    modelSuggestions.appendChild(op);
                });
            }
        }
    });
}

if (modelInput) {
    modelInput.addEventListener("change", () => {
        let brand = brandInput.value;
        let model = modelInput.value;

        // Find in inventory
        const invItem = inventoryData.find(item => item.brand === brand && item.model === model);
        if (invItem) {
            if (itemSellingPrice) itemSellingPrice.value = invItem.price;
            if (itemPurchaseCost) itemPurchaseCost.value = invItem.cost;

            if (invItem.stock <= 0) {
                showToast("⚠ Warning: This item is currently OUT OF STOCK in inventory!");
            } else {
                showToast(`✔ Found in inventory. Stock: ${invItem.stock}`);
            }
        } else if (model && brand) {
            if (itemPurchaseCost) itemPurchaseCost.value = "";
            showToast("ℹ Item not found in inventory. Manual entry needed.", 4000);
        }
    });
}

if (addProductBtn) {
    addProductBtn.addEventListener("click", addProduct);
}

// ========================================================
// DEVELOPER MODE LOGIC
// ========================================================
const devModeToggle = document.getElementById("devModeToggle");
const devModeIcon = document.getElementById("devModeIcon");

function updateDevModeUI() {
    if (isDevMode) {
        devModeToggle.classList.add("active");
        devModeIcon.style.color = "#ef4444";
        showToast("🚀 Developer Mode: Restrictions Bypassed");
        // Enable manual editing of cost
        const ipc = document.getElementById("itemPurchaseCost");
        if (ipc) {
            ipc.readOnly = false;
            ipc.style.cursor = "text";
            ipc.style.opacity = "1";
            ipc.style.backgroundColor = "var(--input-bg)";
        }
    } else {
        devModeToggle.classList.remove("active");
        devModeIcon.style.color = "inherit";
        // Disable manual editing of cost
        const ipc = document.getElementById("itemPurchaseCost");
        if (ipc) {
            ipc.readOnly = true;
            ipc.style.cursor = "not-allowed";
            ipc.style.opacity = "0.8";
            ipc.style.backgroundColor = "var(--bg)";
        }
    }
}

if (devModeToggle) {
    devModeToggle.addEventListener("click", () => {
        isDevMode = !isDevMode;
        localStorage.setItem('isDevMode', isDevMode);
        updateDevModeUI();
    });
}
document.addEventListener("DOMContentLoaded", updateDevModeUI);

function addProduct() {
    const cat = categorySelect.value;
    const brand = brandInput.value;
    const model = modelInput.value;
    const sPrice = Number(itemSellingPrice.value) || 0;
    const pCost = Number(itemPurchaseCost.value) || 0;
    const tax = Number(itemTaxRate.value) || 0;

    if (!brand || !model || sPrice <= 0) {
        showToast("⚠ Please enter Brand, Model and Selling Price!");
        return;
    }

    // Check inventory stock
    const invItem = inventoryData.find(item => item.brand === brand && item.model === model);

    if (!isDevMode) {
        if (!invItem) {
            showToast("⚠ Cannot add: Item does not exist in Inventory!");
            return;
        }
        if (invItem.stock <= 0) {
            showToast("⚠ Cannot add: Item is Out of Stock!");
            return;
        }
    } else {
        if (!invItem) {
            showToast("🛠 Dev Mode: Adding item not in inventory...");
        } else if (invItem.stock <= 0) {
            showToast("🛠 Dev Mode: Bypassing zero stock restriction...");
        }
    }

    // Collect detailed specs
    let specs = {};
    document.querySelectorAll("#specFields input").forEach(input => {
        if (input.value.trim()) {
            specs[input.name] = input.value.trim();
        }
    });

    const itemDisc = Number(itemDiscount.value) || 0;

    const product = {
        category: cat,
        brand: brand,
        model: model,
        batchNo: batchNoInput.value,
        serial: serialInput.value,
        color: colorInput.value === "_custom_" ? (document.getElementById("customColorInput")?.value || "") : colorInput.value,
        purchaseCost: pCost,
        sellingPrice: sPrice,
        itemDiscount: itemDisc,
        taxRate: tax,
        specs: specs,
        id: Date.now()
    };

    productList.push(product);
    updateProductTable();
    clearProductFields();
    updatePricing();
    showToast("✔ Product added to invoice!");
}

function updateProductTable() {
    if (!productTableBody) return;
    productTableBody.innerHTML = "";

    if (productList.length === 0) {
        productTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">No items added to invoice yet.</td></tr>`;
        return;
    }

    productList.forEach((p, index) => {
        const row = document.createElement("tr");

        // Calculate item total: (Price - Item Discount) + Tax on (Price - Item Discount)
        const basePrice = p.sellingPrice - p.itemDiscount;
        const taxAmount = basePrice * (p.taxRate / 100);
        const itemTotal = basePrice + taxAmount;

        row.innerHTML = `
            <td>
                <div class="item-info">
                    <span class="item-name">${p.brand} ${p.model}</span>
                    <span class="item-meta">${p.category} | ${p.serial || 'N/A'}</span>
                    ${p.itemDiscount > 0 ? `<span class="item-meta" style="color:#ef4444; font-weight: 500;">✓ Discount applied: ₹${p.itemDiscount.toFixed(2)}</span>` : ''}
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600;">₹${basePrice.toFixed(2)}</span>
                    ${p.itemDiscount > 0 ? `<span style="text-decoration: line-through; font-size: 0.8em; color: var(--text-muted);">₹${p.sellingPrice.toFixed(2)}</span>` : ''}
                </div>
            </td>
            <td>${p.taxRate}%</td>
            <td style="font-weight:600; color: var(--primary);">₹${itemTotal.toFixed(2)}</td>
            <td>
                <button type="button" class="remove-btn" onclick="removeProduct(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

function removeProduct(index) {
    productList.splice(index, 1);
    updateProductTable();
    updatePricing();
    showToast("Product removed");
}

window.removeProduct = removeProduct;

function clearProductFields() {
    categorySelect.selectedIndex = 0;
    brandInput.value = "";
    modelInput.value = "";
    serialInput.value = "";
    colorInput.value = "";

    if (document.getElementById("customColorInput")) {
        document.getElementById("customColorInput").value = "";
        document.getElementById("customColorInput").style.display = "none";
    }

    batchNoInput.value = "";
    itemSellingPrice.value = "";
    itemDiscount.value = "";
    itemPurchaseCost.value = "";

    // Clear dynamic specs
    specFieldsContainer.innerHTML = "";
}

function updatePricing() {
    let itemsSubtotal = 0;
    let totalTaxAmount = 0;
    let totalCost = 0;

    productList.forEach(p => {
        const basePrice = p.sellingPrice - p.itemDiscount;
        // Calculate tax amount and store it in the product object for easy access
        p.taxAmount = basePrice * (p.taxRate / 100);
        itemsSubtotal += basePrice;
        totalTaxAmount += p.taxAmount;
        totalCost += p.purchaseCost;
    });

    const disc = Number(discount.value) || 0;

    let baseAfterDiscount = itemsSubtotal - disc;
    if (baseAfterDiscount < 0) baseAfterDiscount = 0;

    let totalFinalPrice = baseAfterDiscount + totalTaxAmount;
    
    // Round up the final price if it has decimals (as per user request)
    totalFinalPrice = Math.ceil(totalFinalPrice);

    if (subtotalDisplay) subtotalDisplay.value = itemsSubtotal.toFixed(2);
    if (finalPrice) finalPrice.value = totalFinalPrice.toFixed(2);

    const prof = itemsSubtotal - totalCost - disc;
    if (profit) profit.value = prof.toFixed(2);

    // --- PAYMENT Logic based on Mode ---
    const pMode = document.getElementById("paymentMode")?.value || "";
    const pStatus = document.getElementById("paymentStatus")?.value || "Paid";
    const advInput = document.getElementById("advance");

    let advTyped = Number(advInput.value) || 0;

    let adv = 0;
    if (pMode === "Credit (Udhaar)" || pMode === "EMI Finance") {
        adv = advTyped;
    } else {
        if (pMode !== "") {
            adv = (pStatus === "Paid") ? totalFinalPrice : advTyped;
            // DO NOT auto-fill advInput.value here to preserve user's typed value 
            // incase they switch to "Unpaid" mode
        }
    }

    const bal = totalFinalPrice - adv;
    if (balance) balance.value = bal.toFixed(2);

    // --- EMI Calculation ---
    if (pMode === "EMI Finance") {
        const tenure = Number(document.getElementById("emiTenure").value) || 1;
        const annualRate = Number(document.getElementById("emiInterest").value) || 0;
        const processingFee = Number(document.getElementById("emiProcessingFee").value) || 0;
        
        const principal = bal; // Loan amount is the balanced amount
        const monthlyRate = (annualRate / 100) / 12;
        
        let monthlyEMI = 0;
        let totalPayable = 0;
        
        if (annualRate > 0) {
            // Standard Equated Monthly Installment formula
            monthlyEMI = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
            totalPayable = (monthlyEMI * tenure) + processingFee + adv;
        } else {
            monthlyEMI = principal / tenure;
            totalPayable = principal + processingFee + adv;
        }
        
        document.getElementById("emiMonthlyDisplay").textContent = `₹${Math.ceil(monthlyEMI).toLocaleString()}`;
        document.getElementById("emiTotalPayableDisplay").textContent = `Total Payable: ₹${Math.ceil(totalPayable).toLocaleString()} (Incl. Interest & Fees)`;
    }

    saveFormData();
    updateSummaryUI();
}

function updateSummaryUI() {
    const summaryDiv = document.getElementById("invoiceSummary");
    if (!summaryDiv) return;

    if (productList.length > 0) {
        summaryDiv.style.display = "block";
        document.getElementById("summaryCustomer").textContent = val("customerName") || "N/A";
        document.getElementById("summaryInvoiceID").textContent = document.getElementById("invoiceID")?.value || "N/A";
        document.getElementById("summaryItemsCount").textContent = productList.length;
        document.getElementById("summaryGrandTotal").textContent = `₹${Number(finalPrice.value).toFixed(2)}`;
    } else {
        summaryDiv.style.display = "none";
    }
}

[discount, advance, 
    document.getElementById("emiTenure"), 
    document.getElementById("emiInterest"), 
    document.getElementById("emiProcessingFee")
].forEach(el => {
    if (el) el.addEventListener("input", updatePricing);
    if (el && el.tagName === "SELECT") el.addEventListener("change", updatePricing);
});

// Added Payment Mode Toggles
function togglePaymentFields() {
    const pMode = document.getElementById("paymentMode")?.value || "";
    const pStatus = document.getElementById("paymentStatus")?.value || "Paid";
    const paymentStatusField = document.getElementById("paymentStatusField");
    const advanceField = document.getElementById("advanceField");
    const balanceField = document.getElementById("balanceField");
    const emiFields = document.getElementById("emiFields");

    // Default: Reset special fields
    if (paymentStatusField) paymentStatusField.style.display = "none";
    if (advanceField) advanceField.style.display = "none";
    if (balanceField) balanceField.style.display = "none";
    if (emiFields) emiFields.style.display = "none";

    if (pMode === "Credit (Udhaar)") {
        if (advanceField) advanceField.style.display = "flex";
        if (balanceField) balanceField.style.display = "flex";
    } else if (pMode === "EMI Finance") {
        if (advanceField) advanceField.style.display = "flex";
        if (balanceField) balanceField.style.display = "flex";
        if (emiFields) emiFields.style.display = "block";
    } else if (pMode !== "") {
        // Cash, UPI, Card
        if (paymentStatusField) paymentStatusField.style.display = "flex";
        if (pStatus === "Unpaid") {
             if (advanceField) advanceField.style.display = "flex";
             if (balanceField) balanceField.style.display = "flex";
        }
    }
    updatePricing();
}

const paymentModeEl = document.getElementById("paymentMode");
const paymentStatusEl = document.getElementById("paymentStatus");
if (paymentModeEl) paymentModeEl.addEventListener("change", togglePaymentFields);
if (paymentStatusEl) paymentStatusEl.addEventListener("change", togglePaymentFields);

// ========================================================
// SECTION 7 — WARRANTY AUTO CALC (+1 YEAR)
// ========================================================
const warrantyStart = document.getElementById("warrantyStart");
const warrantyEnd = document.getElementById("warrantyEnd");

if (warrantyStart) warrantyStart.valueAsDate = new Date();

function updateWarrantyEnd() {
    if (!warrantyStart || !warrantyEnd) return;
    let startDate = new Date(warrantyStart.value);
    if (!isNaN(startDate)) {
        let endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        warrantyEnd.valueAsDate = endDate;
    }
}
if (warrantyStart) warrantyStart.addEventListener("change", updateWarrantyEnd);
updateWarrantyEnd();


// ========================================================
// SECTION 8 — TAB NAVIGATION + PROGRESS BAR & LAYOUT TOGGLES
// ========================================================
const progressBar = document.getElementById("progressBar");
const tabs = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");
const nextButtons = document.querySelectorAll(".next-btn");

// Layout Sidebar Toggles
const sidebarBrandBtn = document.getElementById("sidebarBrand");
const floatingToggleBtn = document.getElementById("floatingToggle");
const appSidebarEl = document.getElementById("appSidebar");

if (sidebarBrandBtn && floatingToggleBtn && appSidebarEl) {
    sidebarBrandBtn.addEventListener("click", () => {
        appSidebarEl.classList.add("collapsed");
    });
    floatingToggleBtn.addEventListener("click", () => {
        appSidebarEl.classList.remove("collapsed");
    });
}

function updateProgress(index) {
    if (!progressBar) return;
    let percent = ((index + 1) / tabs.length) * 100;
    progressBar.style.width = percent + "%";
}

tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        contents.forEach(c => c.classList.remove("active"));
        contents[index].classList.add("active");
        updateProgress(index);
        
        // Auto-sync customer data when opening the first tab
        if (index === 0 && typeof syncSiaWithSheets === "function") {
            syncSiaWithSheets();
        }
    });
});

nextButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        // Find parent content index
        const parentContent = btn.closest(".tab-content");
        const currentIndex = Array.from(contents).indexOf(parentContent);
        if (currentIndex !== -1 && currentIndex + 1 < tabs.length) {
            tabs[currentIndex + 1].click();
        }
    });
});

updateProgress(0);


// ========================================================
// SECTION 9 — DARK MODE TOGGLE
// ========================================================
const body = document.body;
const themeIcon = document.getElementById("themeIcon");

if (localStorage.getItem("theme") === "dark") {
    body.classList.replace("light-mode", "dark-mode");
    if (themeIcon) themeIcon.classList.replace("fa-moon", "fa-sun");
}

// Moved theme toggle logic into event listener (Mistake 7)
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        if (body.classList.contains("light-mode")) {
            body.classList.replace("light-mode", "dark-mode");
            if (themeIcon) themeIcon.classList.replace("fa-moon", "fa-sun");
            localStorage.setItem("theme", "dark");
        } else {
            body.classList.replace("dark-mode", "light-mode");
            if (themeIcon) themeIcon.classList.replace("fa-sun", "fa-moon");
            localStorage.setItem("theme", "light");
        }
    });
}


// ========================================================
// SECTION 10 — AUTO INVOICE ID GENERATOR
// ========================================================
function generateInvoiceID() {
    const invEl = document.getElementById("invoiceID");
    if (!invEl) return;

    // Only auto-generate if the field is empty (allows manual override)
    if (invEl.value.trim() !== "") return;

    const today = new Date();
    let datePart = today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getDate()).padStart(2, "0");

    let counter = Number(localStorage.getItem("invoiceCounter")) || 1;
    let id = `INV-${datePart}-${String(counter).padStart(4, "0")}`;
    invEl.value = id;
}

// Initial defaults
if (globalPurchaseDate) globalPurchaseDate.valueAsDate = new Date();
generateInvoiceID();


// ========================================================
// SECTION 11 — GOOGLE SHEETS SUBMIT (POST API)
// ========================================================
const saveToSheetsBtn = document.getElementById("saveToSheetsBtn");

if (saveToSheetsBtn) {
    saveToSheetsBtn.addEventListener("click", submitToSheets);
}

function submitToSheets() {
    if (productList.length === 0) {
        showToast("⚠ Add at least one product before saving!");
        return;
    }

    const saveBtn = document.getElementById("saveToSheetsBtn");
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    const form = document.getElementById("purchaseForm");
    const formData = new FormData(form);

    // 1. Collect Customer & Invoice Meta
    let invoiceMeta = {};
    formData.forEach((value, key) => {
        invoiceMeta[key] = value;
    });

    // Ensure crucial fields match Mandatory Headers
    invoiceMeta["Invoice ID"] = document.getElementById("invoiceID")?.value || "";
    invoiceMeta["Customer name"] = document.getElementById("customerName")?.value || "";
    invoiceMeta["Phone number"] = document.getElementById("customerPhone")?.value || "";
    invoiceMeta["phone"] = document.getElementById("customerPhone")?.value || ""; // Add alias for redundancy

    // Helper to format YYYY-MM-DD to DD/MM/YYYY
    const fmtDate = (val) => {
        if (!val) return "";
        const parts = val.split("-");
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;
    };

    invoiceMeta["Purchase date"] = fmtDate(document.getElementById("globalPurchaseDate")?.value);
    invoiceMeta["Notes"] = form.querySelector('[name="remarks"]')?.value || "";

    invoiceMeta["Subtotal"] = itemsSubtotalValue().toFixed(2);
    invoiceMeta["Discount"] = document.getElementById("discount")?.value || "0";
    invoiceMeta["Grand Total"] = document.getElementById("finalPrice")?.value || "0";
    invoiceMeta["Payment Mode"] = form.querySelector('[name="paymentMode"]')?.value || "";
    invoiceMeta["Advance"] = document.getElementById("advance")?.value || "0";
    invoiceMeta["Balance"] = document.getElementById("balance")?.value || "0";
    invoiceMeta.warrantyStart = fmtDate(document.getElementById("warrantyStart")?.value);
    invoiceMeta.warrantyEnd = fmtDate(document.getElementById("warrantyEnd")?.value);
    invoiceMeta["Payment Status"] = document.getElementById("paymentStatus")?.value || "Paid";

    // --- EMI Specific Metadata ---
    if (invoiceMeta["Payment Mode"] === "EMI Finance") {
        invoiceMeta["emiTenure"] = document.getElementById("emiTenure")?.value || "0";
        invoiceMeta["emiInterest"] = document.getElementById("emiInterest")?.value || "0";
        invoiceMeta["emiProcessingFee"] = document.getElementById("emiProcessingFee")?.value || "0";
        invoiceMeta["monthlyEMI"] = document.getElementById("emiMonthlyDisplay")?.textContent.replace("₹", "").replace(/,/g, "") || "0";
    }

    // 2. Prepare Flat Data (Each product gets its own record with Invoice Meta)
    const payload = productList.map(p => {
        // Flatten specs into a string
        const specsStr = Object.entries(p.specs)
            .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
            .join(" | ");

        return {
            ...invoiceMeta,
            category: p.category,
            brand: p.brand,
            "Item": p.model,
            serial: p.serial,
            color: p.color,
            batchNo: p.batchNo,
            specs: specsStr,
            "Price": p.sellingPrice.toFixed(2),
            "Tax": p.taxAmount.toFixed(2), // Fixed: Save Amount (₹) instead of Rate (%)
            itemDiscount: p.itemDiscount.toFixed(2),
            itemPurchaseCost: p.purchaseCost.toFixed(2)
        };
    });

    console.log("SHIPPING TO SHEETS:", payload);

    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
    })
        .then(() => {
            showToast("✔ Saved to Google Sheets!");
            let counter = Number(localStorage.getItem("invoiceCounter")) || 1;
            localStorage.setItem("invoiceCounter", counter + 1);

            // Deduct stock in inventory
            productList.forEach(p => {
                const invItemIndex = inventoryData.findIndex(item => item.brand === p.brand && item.model === p.model);
                if (invItemIndex !== -1 && inventoryData[invItemIndex].stock > 0) {
                    inventoryData[invItemIndex].stock -= 1;
                }
            });
            saveInventoryToLocal();
            renderInventory();

            // Save to Sia AI Local Database
            saveSaleToSia(invoiceMeta, productList);

            // WhatsApp Integration
            const waCheckbox = document.getElementById("whatsappAutoSend");
            if (waCheckbox && waCheckbox.checked) {
                sendWhatsAppInvoice();
            }
        })
        .catch((err) => {
            console.error("GS ERROR:", err);
            showToast("❌ Error saving data!");
        })
        .finally(() => {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        });
}

function itemsSubtotalValue() {
    return productList.reduce((sum, p) => sum + (p.sellingPrice - p.itemDiscount), 0);
}

function sendWhatsAppInvoice() {
    const phone = document.getElementById("customerPhone")?.value || "";
    const name = document.getElementById("customerName")?.value || "Customer";
    const invId = document.getElementById("invoiceID")?.value || "N/A";
    const total = document.getElementById("finalPrice")?.value || "0";

    if (!phone || phone.length !== 10) {
        showToast("⚠ Invalid phone number for WhatsApp!");
        return;
    }

    let itemsText = productList.map(p => `• *${p.brand} ${p.model}* _(${p.category})_%0A  Price: ₹${(p.sellingPrice - p.itemDiscount).toFixed(0)}`).join("%0A%0A");

    let message = `*INVOICE: ${invId}*%0A`;
    message += `━━━━━━━━━━━━━━━━━━━━%0A`;
    message += `Hello *${name}*,%0A%0A`;
    message += `Thank you for choosing us! Here are your purchase details:%0A%0A`;
    message += `${itemsText}%0A%0A`;
    message += `*Total Amount:* ₹${total}%0A`;
    message += `━━━━━━━━━━━━━━━━━━━━%0A`;
    message += `_This is a computer-generated invoice._`;

    const waUrl = `https://wa.me/91${phone}?text=${message}`;
    window.open(waUrl, '_blank');
    showToast("📱 WhatsApp message opened!");
}

// ========================================================
// SECTION 12 — PROFESSIONAL INVOICE PDF GENERATOR
// ========================================================

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const invoiceNo = document.getElementById("invoiceID")?.value || "INV-TEMP";

    // Modern Professional Palette
    const slateDark = [15, 23, 42];
    const slateGray = [100, 116, 139];
    const lightGray = [241, 245, 249];
    const lineGray = [226, 232, 240];
    const brandCol = [79, 70, 229]; // Indigo-600 subtle accent

    // --- 1. BRAND HEADER ---
    pdf.setTextColor(...slateDark);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(26);
    pdf.text("PREMIUM ELECTRONICS", 15, 25);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...slateGray);
    pdf.text("123 Tech Street, Digital City | +91 98765 43210", 15, 32);

    // Invoice Label
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...slateGray);
    pdf.text("INVOICE", 195, 25, { align: "right" });

    // Decorative Line
    pdf.setDrawColor(...slateDark);
    pdf.setLineWidth(0.8);
    pdf.line(15, 40, 195, 40);

    // --- 2. INVOICE META ---
    let y = 52;

    // Bill To
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...slateGray);
    pdf.text("BILL TO:", 15, y);

    y += 6;
    pdf.setTextColor(...slateDark);
    pdf.setFontSize(11);
    pdf.text(val("customerName") || "Valued Customer", 15, y);

    y += 5;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...slateGray);
    pdf.text(`Phone: ${val("customerPhone")}`, 15, y);

    y += 5;
    if (val("customerAddress")) {
        const addrLines = pdf.splitTextToSize(val("customerAddress"), 80);
        pdf.text(addrLines, 15, y);
        y += (addrLines.length * 5);
    }

    // Invoice Details (Right Side)
    let metaY = 52;
    const metaX1 = 150;
    const metaX2 = 195;

    const addMetaRow = (label, value, isBold = false, accent = null) => {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...slateGray);
        pdf.text(label, metaX1, metaY);

        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        if (accent) { pdf.setTextColor(...accent); } else { pdf.setTextColor(...slateDark); }
        pdf.text(value, metaX2, metaY, { align: "right" });
        metaY += 6;
    };

    addMetaRow("INVOICE #:", invoiceNo, true);
    addMetaRow("DATE:", new Date().toLocaleDateString(), false);

    // Status
    const pStatusVal = document.getElementById("paymentStatus")?.value || 'Paid';
    const isCredit = val("paymentMode") === "Credit (Udhaar)";
    const txtStatus = isCredit ? "Unpaid" : (pStatusVal === "Paid" ? "Fully Paid" : "Unpaid");
    const statusCol = txtStatus === "Fully Paid" ? [22, 163, 74] : [220, 38, 38]; // Green or Red
    addMetaRow("STATUS:", txtStatus, true, statusCol);

    y = Math.max(y, metaY) + 12;

    // --- 3. PRODUCT TABLE ---
    pdf.setFillColor(...lightGray);
    pdf.rect(15, y, 180, 10, 'F');
    pdf.setDrawColor(...lineGray);
    pdf.setLineWidth(0.3);
    pdf.line(15, y, 195, y);
    pdf.line(15, y + 10, 195, y + 10);

    pdf.setFontSize(9);
    pdf.setTextColor(...slateDark);
    pdf.setFont("helvetica", "bold");
    pdf.text("ITEM DESCRIPTION", 18, y + 6.5);
    pdf.text("PRICE", 140, y + 6.5, { align: "right" });
    pdf.text("TAX", 165, y + 6.5, { align: "right" });
    pdf.text("TOTAL", 192, y + 6.5, { align: "right" });

    y += 10;

    productList.forEach((p, i) => {
        if (y > 240) { pdf.addPage(); y = 20; }

        const basePrice = p.sellingPrice - p.itemDiscount;
        const taxAmount = p.taxAmount || (basePrice * (p.taxRate / 100));
        const itemTotal = basePrice + taxAmount;

        let itemDesc = `${p.brand} ${p.model}`;
        let subTitle = `${p.category} | S/N: ${p.serial || 'N/A'}`;

        y += 7;
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...slateDark);
        pdf.setFontSize(9.5);
        pdf.text(itemDesc, 18, y);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(...slateGray);
        pdf.text(subTitle, 18, y + 4.5);

        pdf.setFontSize(9.5);
        pdf.setTextColor(...slateDark);

        pdf.text(`Rs. ${basePrice.toFixed(2)}`, 140, y, { align: "right" });
        pdf.text(`Rs. ${taxAmount.toFixed(2)}`, 165, y, { align: "right" });

        pdf.setFont("helvetica", "bold");
        pdf.text(`Rs. ${itemTotal.toFixed(2)}`, 192, y, { align: "right" });

        y += 8;
        pdf.setDrawColor(...lineGray);
        pdf.setLineWidth(0.2);
        pdf.line(15, y, 195, y);
    });

    y += 10;

    // --- 4. SUMMARY & TOTALS ---
    const summaryX1 = 155;
    const summaryX2 = 195;

    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...slateGray);
    pdf.text("Subtotal:", summaryX1, y, { align: "right" });
    pdf.setTextColor(...slateDark);
    pdf.text(`Rs. ${Number(val("subtotalDisplay")).toFixed(2)}`, summaryX2, y, { align: "right" });

    let discountVal = Number(val("discount"));
    if (discountVal > 0) {
        y += 6;
        pdf.setTextColor(...slateGray);
        pdf.text("Discount:", summaryX1, y, { align: "right" });
        pdf.setTextColor(220, 38, 38);
        pdf.text(`- Rs. ${discountVal.toFixed(2)}`, summaryX2, y, { align: "right" });
    }

    y += 8;
    pdf.setDrawColor(...slateDark);
    pdf.setLineWidth(0.5);
    pdf.line(summaryX1 - 25, y - 4, 195, y - 4);

    y += 3;
    pdf.setTextColor(...slateDark);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("GRAND TOTAL:", summaryX1, y, { align: "right" });
    pdf.setTextColor(...brandCol);
    pdf.text(`Rs. ${Number(val("finalPrice")).toFixed(2)}`, summaryX2, y, { align: "right" });

    // Payment Info
    y += 20;
    if (y > 250) { pdf.addPage(); y = 20; }

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...slateGray);
    pdf.text("PAYMENT DETAILS", 15, y);

    pdf.setDrawColor(...lineGray);
    pdf.setLineWidth(0.3);
    pdf.line(15, y + 2, 60, y + 2);

    y += 8;
    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...slateDark);
    pdf.text(`Method: ${val("paymentMode") || 'N/A'}`, 15, y);

    if (isCredit) {
        y += 5;
        pdf.text(`Advance: Rs. ${Number(val("advance") || 0).toFixed(2)}`, 15, y);
        y += 5;
        pdf.setFont("helvetica", "bold");
        pdf.text(`Balance Due: Rs. ${Number(val("balance") || 0).toFixed(2)}`, 15, y);
    } else {
        y += 5;
        pdf.setFont("helvetica", "bold");
        pdf.text(`Status: ${txtStatus}`, 15, y);
    }

    // --- 5. FOOTER ---
    y = 270;
    pdf.setDrawColor(...lineGray);
    pdf.setLineWidth(0.5);
    pdf.line(15, y, 195, y);

    pdf.setFontSize(9);
    pdf.setTextColor(...slateDark);
    pdf.setFont("helvetica", "bold");
    pdf.text("Authorized Signatory", 15, y + 7);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...slateGray);
    pdf.text("Terms: Goods once sold will not be taken back or exchanged.", 105, 280, { align: "center" });
    pdf.text("Thank you for your business!", 105, 285, { align: "center" });

    pdf.save(`${invoiceNo}.pdf`);
}

// Print Functionality
const printInvoiceBtn = document.getElementById("printInvoiceBtn");
if (printInvoiceBtn) {
    printInvoiceBtn.addEventListener("click", () => {
        generatePDF();
        showToast("PDF generated for printing!");
    });
}

// HELPER FUNCTIONS
function val(id) {
    let el = document.getElementsByName(id)[0] || document.getElementById(id);
    return el ? el.value || "" : "";
}

function showToast(msg) {
    let toast = document.createElement("div");
    toast.className = "toastMessage";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add("show"); }, 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

function saveFormData() {
    const form = document.getElementById("purchaseForm");
    if (!form) return;
    const formData = new FormData(form);
    let dataObj = {};
    formData.forEach((value, key) => { dataObj[key] = value; });
    localStorage.setItem("salesFormDraft", JSON.stringify(dataObj));
    localStorage.setItem("productListDraft", JSON.stringify(productList));
}

function loadFormData() {
    const savedData = localStorage.getItem("salesFormDraft");
    const savedProducts = localStorage.getItem("productListDraft");

    if (savedProducts) {
        try {
            productList = JSON.parse(savedProducts);
            updateProductTable();
        } catch (e) { console.error("Load Product Er:", e); }
    }

    if (savedData) {
        try {
            const dataObj = JSON.parse(savedData);
            const form = document.getElementById("purchaseForm");
            if (form) {
                Object.keys(dataObj).forEach(key => {
                    const input = form.elements[key];
                    if (input) {
                        input.value = dataObj[key];
                        // If category is loaded, refresh specs
                        if (key === 'category' && dataObj[key]) {
                            loadSpecsForCategory(dataObj[key]);
                        }
                    }
                });
            }
        } catch (e) { console.error("Load Form Er:", e); }
    }
    updatePricing();
    if (typeof togglePaymentFields === "function") togglePaymentFields();
}

document.addEventListener("DOMContentLoaded", () => {
    loadFormData();
    // Re-initialize tab state
    if (typeof tabs !== 'undefined' && tabs.length > 0) tabs[0].click();
});

// const pForm = document.getElementById("purchaseForm"); // Already declared above
if (pForm) {
    pForm.addEventListener("input", saveFormData);
    // Prevent default form submission to handle via JS buttons (Mistake 20)
    pForm.addEventListener("submit", (e) => {
        e.preventDefault();
        submitToSheets();
    });
}

// ========================================================
// CUSTOMER LOOKUP ENGINE & PHONE SANITIZATION
// ========================================================
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const altPhoneInput = document.getElementById("altPhone");
const customerEmailInput = document.getElementById("customerEmail");
const customerAddressInput = document.getElementById("customerAddress");

function updateCustomerSuggestions() {
    const datalist = document.getElementById("customerSuggestions");
    if (!datalist || !salesHistory) return;
    
    // Get unique customer names from history
    const uniqueNames = [...new Set(salesHistory.map(s => s.customerName))].filter(n => n && n !== "Unknown");
    datalist.innerHTML = uniqueNames.map(name => `<option value="${name}">`).join("");
}

function lookupCustomer(query, type = "phone") {
    if (!salesHistory || !query) return null;
    
    // Search for most recent match (history is usually appended, so we reverse search)
    let match = null;
    const q = query.toLowerCase().trim();
    
    for (let i = salesHistory.length - 1; i >= 0; i--) {
        const s = salesHistory[i];
        if (type === "phone" && s.customerPhone === q) {
            match = s;
            break;
        } else if (type === "name" && s.customerName.toLowerCase() === q) {
            match = s;
            break;
        }
    }
    return match;
}

function autoFillCustomer(customer) {
    if (!customer) return;
    if (customerNameInput) customerNameInput.value = customer.customerName || "";
    if (customerPhoneInput) customerPhoneInput.value = customer.customerPhone || "";
    if (altPhoneInput) altPhoneInput.value = customer.altPhone || "";
    if (customerEmailInput) customerEmailInput.value = customer.customerEmail || "";
    if (customerAddressInput) customerAddressInput.value = customer.customerAddress || "";
    
    showToast("✅ Customer data auto-filled!");
    saveFormData(); // Save draft
}

const sanitizePhone = (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
};

if (customerPhoneInput) {
    customerPhoneInput.addEventListener("input", (e) => {
        sanitizePhone(e);
        const phone = e.target.value.trim();
        if (phone.length === 10) {
            // Priority 1: Server Lookup (Most Dynamic/Flexible)
            showToast("🔍 Fetching latest from Sheets...");
            performServerCustomerLookup(phone).then(success => {
                if (!success) {
                    // Priority 2: Local Fallback
                    const match = lookupCustomer(phone, "phone");
                    if (match) autoFillCustomer(match);
                }
            });
        }
    });
}

if (altPhoneInput) altPhoneInput.addEventListener("input", sanitizePhone);

if (customerNameInput) {
    const handleNameInput = (e) => {
        const name = e.target.value.trim();
        if (name.length > 2) {
            // Priority 1: Local lookup for speed
            const match = lookupCustomer(name, "name");
            if (match) {
                autoFillCustomer(match);
            } else if (e.type === "change" || name.includes(" ")) { 
                // Priority 2: Server Lookup (on change or if it looks like a full name)
                performServerCustomerLookup(name, "name");
            }
        }
    };
    customerNameInput.addEventListener("change", handleNameInput);
    customerNameInput.addEventListener("input", handleNameInput); 
}

const resetCustomerBtn = document.getElementById("resetCustomerBtn");
if (resetCustomerBtn) {
    resetCustomerBtn.addEventListener("click", () => {
        if (customerNameInput) customerNameInput.value = "";
        if (customerPhoneInput) customerPhoneInput.value = "";
        if (altPhoneInput) altPhoneInput.value = "";
        if (customerEmailInput) customerEmailInput.value = "";
        if (customerAddressInput) customerAddressInput.value = "";
        saveFormData();
        showToast("🧹 Customer fields cleared");
    });
}

async function performServerCustomerLookup(query, type = "phone") {
    try {
        const param = type === "phone" ? `phone=${query}` : `name=${encodeURIComponent(query)}`;
        const response = await fetch(`${SCRIPT_URL}?${param}`);
        const text = await response.text();

        if (text && text.trim().startsWith("{")) {
            const customer = JSON.parse(text);
            
            const mapped = {
                customerName: customer.customerName || getInvVal(customer, "Customer name", "Name", "Full Name", "customerName", "name"),
                customerPhone: customer.customerPhone || getInvVal(customer, "Phone number", "Phone Number", "Phone", "phone", "customerPhone") || (type === "phone" ? query : ""),
                altPhone: customer.altPhone || getInvVal(customer, "Alternate phone", "Alternate Phone", "altPhone", "Alt Phone", "AlternatePhone", "Alternate_Phone"),
                customerEmail: customer.customerEmail || getInvVal(customer, "Email address", "Email Address", "customerEmail", "Email", "Email_Address", "email"),
                customerAddress: customer.customerAddress || getInvVal(customer, "Billing address", "Billing Address", "customerAddress", "Address", "Permanent address", "address")
            };
            
            // Log for your confirmation (Visible in browser console)
            console.log("Mapped Customer Data:", mapped);
            
            autoFillCustomer(mapped);
            return true;
        } else {
            console.warn("Lookup failed:", text);
            return false;
        }
    } catch (err) {
        console.error("Server lookup error:", err);
        return false;
    }
}

// Background Sync every 3 minutes
setInterval(() => {
    if (typeof syncSiaWithSheets === "function") {
        console.log("Auto-sync: Refreshing customer data...");
        syncSiaWithSheets();
    }
}, 180000); 

// Initialize suggestions on load and after sync
document.addEventListener("DOMContentLoaded", updateCustomerSuggestions);
// Re-update after syncing
const originalSyncSia = window.syncSiaWithSheets;
window.syncSiaWithSheets = async function() {
    await originalSyncSia();
    updateCustomerSuggestions();
};

// initialize color dropdown
(function () {
    const colorSelect = document.getElementById("colorInput");
    const customColorInput = document.getElementById("customColorInput");
    if (colorSelect && colorSelect.tagName === "SELECT") {
        [...masterColors].sort((a, b) => a.localeCompare(b)).forEach(c => {
            let opt = document.createElement("option");
            opt.value = c;
            opt.textContent = c;
            colorSelect.appendChild(opt);
        });

        if (customColorInput) {
            colorSelect.addEventListener("change", function () {
                if (this.value === "_custom_") {
                    customColorInput.style.display = "block";
                    customColorInput.focus();
                } else {
                    customColorInput.style.display = "none";
                    customColorInput.value = "";
                }
            });
        }
    }
})();

// Quick Price Buttons
document.querySelectorAll(".priceBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        const isp = document.getElementById("itemSellingPrice");
        if (isp) {
            isp.value = btn.textContent;
            showToast(`✔ Price set to ₹${btn.textContent}`);
        }
    });
});

const resetBtn = document.getElementById("resetFormBtn");
if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear EVERYTHING?")) {
            localStorage.removeItem("salesFormDraft");
            localStorage.removeItem("productListDraft");
            location.reload();
        }
    });
}

// ========================================================
// SECTION 13 — INVOICE SEARCH & REPRINT ENGINE
// ========================================================
const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
    searchBtn.addEventListener("click", searchInvoices);
}

async function searchInvoices() {
    const type = document.getElementById("searchType").value;
    const query = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("searchResults");

    if (!query) {
        showToast("⚠ Please enter a search term!");
        return;
    }

    resultsDiv.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Searching database...</div>';

    try {
        const response = await fetch(`${SCRIPT_URL}?search=true&type=${type}&query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success && data.results.length > 0) {
            renderSearchResults(data.results);
        } else {
            resultsDiv.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 40px; background: var(--input-bg); border-radius: var(--radius-md); border: 1px dashed var(--border);">
                    <i class="fa-solid fa-face-frown" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>
                    No invoices found matching your search.
                </div>`;
        }
    } catch (err) {
        console.error("Search Error:", err);
        showToast("❌ Error connecting to database");
        resultsDiv.innerHTML = '<div style="text-align:center; padding: 20px; color: #ef4444;">Could not fetch results. Please try again.</div>';
    }
}

function renderSearchResults(results) {
    const resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = "";

    results.forEach(inv => {
        const card = document.createElement("div");
        card.className = "search-result-card";

        // Prioritize Strict Headers
        const invID = getInvVal(inv, "Invoice ID", "invoiceID") || "N/A";
        const custName = getInvVal(inv, "Customer name", "customerName", "Name") || "N/A";
        const custPhone = getInvVal(inv, "Phone number", "customerPhone", "Phone") || "N/A";

        // Calculate true invoice sum from all products (as opposed to first row's single item total)
        let calcTotal = 0;
        if (inv.products && inv.products.length > 0) {
            inv.products.forEach(p => {
                calcTotal += (Number(p.sellingPrice || 0) - Number(p.itemDiscount || 0)) + Number(p.taxAmount || p["Tax"] || 0);
            });
            calcTotal -= Number(getInvVal(inv, "Discount", "discount") || 0);
        }

        // Fallback to Sales Data "Total" if no products array existed for some reason
        const totalValue = calcTotal > 0 ? calcTotal : (getInvVal(inv, "Total", "Grand Total", "grandTotal") || 0);
        const total = Number(totalValue).toFixed(2);

        const date = getInvVal(inv, "Purchase date", "saleDate", "date") || "N/A";

        card.innerHTML = `
            <div>
                <div class="s-id">${invID}</div>
                <div class="s-name">${custName}</div>
                <div class="s-meta">${date} | ${custPhone}</div>
            </div>
            <div style="text-align: right;">
                <div class="s-total">₹${Number(total).toFixed(0)}</div>
                <button type="button" class="next-btn outline" style="padding: 10px 18px; font-size: 13px; border-radius: 8px; width: auto; margin-left: auto;" onclick='reprintFromSearch(${JSON.stringify(inv).replace(/'/g, "&apos;")})'>
                    <i class="fa-solid fa-print"></i> Reprint
                </button>
            </div>
        `;
        resultsDiv.appendChild(card);
    });
}

function reprintFromSearch(invData) {
    const invID = getInvVal(invData, "Invoice ID", "invoiceID") || "Invoice";
    showToast("📄 Generating reprint for " + invID);

    const originalProducts = [...productList];
    const originalForm = JSON.parse(localStorage.getItem("salesFormDraft"));

    // 1. Populate Hidden/Internal State for PDF Generator
    document.getElementById("invoiceID").value = invID;
    document.getElementById("customerName").value = getInvVal(invData, "Customer name", "customerName", "Name");
    document.getElementById("customerPhone").value = getInvVal(invData, "Phone number", "customerPhone", "Phone");
    document.getElementById("customerAddress").value = getInvVal(invData, "customerAddress", "Address", "Permanent address");
    document.getElementById("discount").value = getInvVal(invData, "Discount", "discount") || 0;
    document.getElementById("finalPrice").value = getInvVal(invData, "Grand Total", "grandTotal", "Total");
    document.getElementById("paymentMode").value = getInvVal(invData, "Payment Mode", "paymentMode", "Payment");

    // Auto-infer Payment Status for UI dropdown
    const advAmount = Number(getInvVal(invData, "Advance", "advancePaid")) || 0;
    const totAmount = Number(getInvVal(invData, "Grand Total", "grandTotal", "Total")) || 0;
    if (document.getElementById("paymentStatus")) {
        document.getElementById("paymentStatus").value = (totAmount > 0 && advAmount < totAmount) ? "Unpaid" : "Paid";
    }

    document.getElementById("advance").value = advAmount;
    document.getElementById("balance").value = getInvVal(invData, "Balance", "balanceDue") || 0;
    document.getElementById("warrantyStart").value = getInvVal(invData, "warrantyStart", "Warranty Start");
    document.getElementById("warrantyEnd").value = getInvVal(invData, "warrantyEnd", "Warranty End");
    document.getElementById("remarks").value = getInvVal(invData, "Notes", "remarks", "Remarks") || "";
    document.getElementById("globalPurchaseDate").value = getInvVal(invData, "Purchase date", "saleDate", "date");

    if (typeof togglePaymentFields === "function") togglePaymentFields();

    // 2. Map Products Array
    if (invData.products && Array.isArray(invData.products)) {
        productList = invData.products.map(p => {
            const sPrice = Number(p.sellingPrice || 0);
            const iDisc = Number(p.itemDiscount || 0);
            const tAmt = Number(p.taxAmount || p["Tax"] || 0);
            const basePrice = sPrice - iDisc;

            // Fixed: Recover taxRate if only taxAmount is present.
            // This prevents updatePricing() from resetting tax to 0.
            let tRate = Number(p.taxRate || p["Tax Rate %"] || 0);
            if (tRate === 0 && tAmt > 0 && basePrice > 0) {
                tRate = (tAmt / basePrice) * 100;
            }

            return {
                category: p.category || "Item",
                brand: p.brand || "Product",
                model: p.model || "Item",
                serial: p.serial || p.serialNo || "N/A",
                sellingPrice: sPrice,
                itemDiscount: iDisc,
                taxAmount: tAmt,
                taxRate: tRate,
                specs: p.specs || {},
                purchaseCost: Number(p.purchaseCost || p.itemPurchaseCost || 0)
            };
        });
    } else {
        // Fallback for flat data structure
        const sPrice = Number(getInvVal(invData, "Price", "itemSellingPrice", "sellingPrice") || getInvVal(invData, "Grand Total", "grandTotal") || 0);
        const iDisc = Number(getInvVal(invData, "itemDiscount", "Discount") || 0);
        const tAmt = Number(getInvVal(invData, "Tax", "Tax Amount", "itemTaxRate") || 0);
        const basePrice = sPrice - iDisc;

        // Recover rate for fallback too
        let tRate = 0;
        if (tAmt > 0 && basePrice > 0) {
            tRate = (tAmt / basePrice) * 100;
        }

        productList = [{
            brand: getInvVal(invData, "brand", "Brand") || "Product",
            model: getInvVal(invData, "Item", "model", "Model") || "",
            category: getInvVal(invData, "category", "Category") || "Item",
            serial: getInvVal(invData, "serial", "Serial", "S/N") || "N/A",
            sellingPrice: sPrice,
            itemDiscount: iDisc,
            taxAmount: tAmt,
            taxRate: tRate,
            specs: {},
            purchaseCost: 0
        }];
    }

    // 3. Force update the Summary UI and Subtotal fields so PDF doesn't use stale data
    updatePricing();

    // 4. Generate
    generatePDF();

    // 5. Restore original state
    productList = originalProducts;
    if (originalForm) {
        Object.keys(originalForm).forEach(key => {
            const el = document.getElementById(key) || document.getElementsByName(key)[0];
            if (el) el.value = originalForm[key];
        });
    }
    updatePricing();
}

window.reprintFromSearch = reprintFromSearch;

// ========================================================
// INVENTORY MANAGEMENT LOGIC
// ========================================================
let inventoryData = JSON.parse(localStorage.getItem('saleSyncInventory'));

if (!inventoryData || inventoryData.length === 0) {
    inventoryData = [];
    for (const [key, models] of Object.entries(modelSuggestionsData)) {
        let parts = key.split(' ');
        let category = parts.pop();
        let brand = parts.join(' ');

        models.forEach(model => {
            inventoryData.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                category: category,
                brand: brand,
                model: model,
                stock: 10,
                cost: 0,
                price: 0,
                specs: {}
            });
        });
    }
    localStorage.setItem('saleSyncInventory', JSON.stringify(inventoryData));
}

function saveInventoryToLocal() {
    localStorage.setItem('saleSyncInventory', JSON.stringify(inventoryData));
}

function renderInventory(filterText = "") {
    const tbody = document.getElementById("inventoryTableBody");
    const totalItemsEl = document.getElementById("stat-total-items");
    const lowStockEl = document.getElementById("stat-low-stock");

    if (!tbody || !totalItemsEl || !lowStockEl) return;

    tbody.innerHTML = "";

    let lowStockCount = 0;
    let overStockCount = 0;

    const filteredData = inventoryData.filter(item => {
        const query = filterText.toLowerCase();
        return item.brand.toLowerCase().includes(query) ||
            item.model.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);
    });

    inventoryData.forEach(item => {
        let s = Number(item.stock);
        if (s < 5) lowStockCount++;
        if (s > 25) overStockCount++;
    });

    totalItemsEl.innerText = inventoryData.length;
    lowStockEl.innerText = lowStockCount;
    // Update the UI if a stat-over-stock element exists
    const overStockStat = document.getElementById("stat-over-stock");
    if (overStockStat) overStockStat.innerText = overStockCount;

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr>
            <td colspan="6" style="text-align:center; color: var(--text-muted); padding: 40px;">
                <i class="fa-solid fa-box-open" style="font-size: 32px; margin-bottom: 12px; opacity:0.5;"></i><br>
                No items found. Click 'Add New Item' to start.
            </td>
        </tr>`;
        return;
    }

    filteredData.forEach(item => {
        const row = document.createElement("tr");

        let stockColor = "var(--text)";
        let s = Number(item.stock);
        if (s === 0) stockColor = "#ef4444"; // Out
        else if (s < 5) stockColor = "#f59e0b"; // Low
        else if (s > 25) stockColor = "#3b82f6"; // Over
        else stockColor = "#10b981"; // Healthy

        row.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="inv-checkbox" data-id="${item.id}" style="cursor: pointer; transform: scale(1.2);"></td>
            <td>
                <div style="font-weight: 600;">${item.brand}</div>
                <div style="font-size: 13px; color: var(--text-muted);">${item.model}</div>
                ${item.specs && Object.keys(item.specs).length > 0 ? `<div style="font-size: 11px; color: var(--primary); margin-top: 6px; border: 1px dashed var(--border); padding: 4px 8px; border-radius: 4px; display: inline-block;">${Object.entries(item.specs).map(([k, v]) => `<b>${k.toUpperCase()}</b>: ${v}`).join(' | ')}</div>` : ''}
            </td>
            <td><span class="category-badge" style="background: var(--bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1px solid var(--border);">${item.category}</span></td>
            <td style="font-weight: bold; color: ${stockColor};"><i class="fa-solid fa-cubes"></i> ${item.stock}</td>
            <td>₹${Number(item.cost).toLocaleString('en-IN')}</td>
            <td>₹${Number(item.price).toLocaleString('en-IN')}</td>
            <td>
                <button type="button" class="icon-btn edit-inv-btn" data-id="${item.id}" title="Edit" style="background:transparent;border:none;color:var(--primary);cursor:pointer;margin-right:12px;font-size:16px;"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" class="icon-btn del-inv-btn" data-id="${item.id}" title="Delete" style="background:transparent;border:none;color:#ef4444;cursor:pointer;font-size:16px;"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;

        // Checkbox event logic
        const cb = row.querySelector('.inv-checkbox');
        cb.addEventListener('change', toggleDeleteSelectedBtn);

        // Add Edit & Delete Handlers
        row.querySelector('.edit-inv-btn').addEventListener('click', () => openInventoryModal(item.id));
        row.querySelector('.del-inv-btn').addEventListener('click', () => deleteInventoryItem(item.id));

        tbody.appendChild(row);
    });
}

function loadInvSpecsForCategory(category, existingSpecs = {}) {
    const container = document.getElementById("invSpecFieldsContainer");
    const fieldsDiv = document.getElementById("invSpecFields");

    if (!container || !fieldsDiv) return;
    fieldsDiv.innerHTML = "";

    if (!category || !specRules[category] || specRules[category].length === 0) {
        container.style.display = "none";
        return;
    }

    container.style.display = "block";
    const requiredSpecs = specRules[category];

    requiredSpecs.forEach(specKey => {
        const spec = specDefinitions[specKey];
        if (!spec) return;

        let div = document.createElement("div");
        div.className = "field";

        let label = document.createElement("label");
        label.textContent = spec.label;
        div.appendChild(label);

        let input = document.createElement("input");
        if (spec.list && spec.list.length > 0) {
            input.setAttribute("list", "inv_" + specKey + "_list");
            let dl = document.createElement("datalist");
            dl.id = "inv_" + specKey + "_list";
            spec.list.forEach(v => {
                let op = document.createElement("option");
                op.value = v;
                dl.appendChild(op);
            });
            div.appendChild(dl);
        }

        input.name = "inv_spec_" + specKey;
        if (spec.type) input.type = spec.type;
        if (spec.max) input.maxLength = spec.max;

        if (existingSpecs && existingSpecs[specKey]) {
            input.value = existingSpecs[specKey];
        }

        div.appendChild(input);
        fieldsDiv.appendChild(div);
    });
}

function openInventoryModal(id = null) {
    const modal = document.getElementById("inventoryModal");
    const title = modal.querySelector(".section-title");

    // Reset fields
    document.getElementById("invBrand").value = "";
    document.getElementById("invModel").value = "";
    document.getElementById("invCategory").value = "";
    document.getElementById("invStock").value = "";
    document.getElementById("invCost").value = "";
    document.getElementById("invPrice").value = "";
    document.getElementById("invId").value = "";

    loadInvSpecsForCategory("");

    if (id) {
        title.innerHTML = `<i class="fa-solid fa-pen"></i> Edit Stock Item`;
        const item = inventoryData.find(i => i.id === id);
        if (item) {
            document.getElementById("invBrand").value = item.brand;
            document.getElementById("invModel").value = item.model;
            document.getElementById("invCategory").value = item.category;
            document.getElementById("invStock").value = item.stock;
            document.getElementById("invCost").value = item.cost;
            document.getElementById("invPrice").value = item.price;
            document.getElementById("invId").value = item.id;

            loadInvSpecsForCategory(item.category, item.specs || {});
        }
    } else {
        title.innerHTML = `<i class="fa-solid fa-boxes-stacked"></i> Add New Stock`;
    }

    modal.style.display = "flex";
}

function closeInventoryModal() {
    document.getElementById("inventoryModal").style.display = "none";
}

function toggleDeleteSelectedBtn() {
    const checked = document.querySelectorAll(".inv-checkbox:checked");
    const btn = document.getElementById("deleteSelectedBtn");
    if (btn) {
        btn.style.display = checked.length > 0 ? "inline-flex" : "none";
    }
}
window.toggleDeleteSelectedBtn = toggleDeleteSelectedBtn;

function deleteInventoryItem(id) {
    if (confirm("Are you sure you want to delete this specific inventory item?")) {
        inventoryData = inventoryData.filter(i => i.id !== id);
        saveInventoryToLocal();
        renderInventory(document.getElementById("inventorySearch").value);
        showToast("✓ Item deleted from inventory");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Inventory Handlers
    const addBtn = document.getElementById("addNewItemBtn");
    if (addBtn) addBtn.addEventListener("click", () => openInventoryModal());

    const closeBtn = document.getElementById("closeInvModalBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeInventoryModal);

    const saveBtn = document.getElementById("saveInvStockBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const brand = document.getElementById("invBrand").value.trim();
            const model = document.getElementById("invModel").value.trim();
            const category = document.getElementById("invCategory").value;
            const stock = document.getElementById("invStock").value;
            const cost = document.getElementById("invCost").value || 0;
            const price = document.getElementById("invPrice").value || 0;
            const id = document.getElementById("invId").value;

            let specs = {};
            document.querySelectorAll("#invSpecFields input").forEach(input => {
                if (input.value.trim()) {
                    let specKey = input.name.replace("inv_spec_", "");
                    specs[specKey] = input.value.trim();
                }
            });

            if (!brand || !model || !category || !stock) {
                showToast("⚠ Please fill out all required fields.");
                return;
            }

            if (id) {
                // Update
                const index = inventoryData.findIndex(i => i.id === id);
                if (index !== -1) {
                    inventoryData[index] = { id, brand, model, category, stock, cost, price, specs };
                    showToast("✓ Inventory item updated successfully.");
                }
            } else {
                // Add
                const newId = "inv_" + Date.now();
                inventoryData.push({ id: newId, brand, model, category, stock, cost, price, specs });
                showToast("✓ New item added to inventory.");
            }

            saveInventoryToLocal();
            renderInventory(document.getElementById("inventorySearch").value);
            closeInventoryModal();
        });
    }

    const searchInput = document.getElementById("inventorySearch");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            renderInventory(e.target.value);
            const masterCheckbox = document.getElementById("selectAllInv");
            if (masterCheckbox) masterCheckbox.checked = false;
            toggleDeleteSelectedBtn();
        });
    }

    // Select All Checkbox Logic
    const selectAllInv = document.getElementById("selectAllInv");
    if (selectAllInv) {
        selectAllInv.addEventListener("change", (e) => {
            const checkboxes = document.querySelectorAll(".inv-checkbox");
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
            });
            toggleDeleteSelectedBtn();
        });
    }

    // Delete Selected Button Logic
    const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener("click", () => {
            const checked = document.querySelectorAll(".inv-checkbox:checked");
            if (checked.length === 0) return;

            if (confirm(`Are you sure you want to permanently delete these ${checked.length} items from inventory?`)) {
                const idsToDelete = Array.from(checked).map(cb => cb.getAttribute("data-id"));
                inventoryData = inventoryData.filter(item => !idsToDelete.includes(item.id));
                saveInventoryToLocal();

                renderInventory(document.getElementById("inventorySearch")?.value || "");
                if (selectAllInv) selectAllInv.checked = false;
                toggleDeleteSelectedBtn();

                showToast(`✓ Removed ${idsToDelete.length} items from inventory.`);
            }
        });
    }

    // Modal Dropdown Logic
    const invCategory = document.getElementById("invCategory");
    const invBrand = document.getElementById("invBrand");
    const invModel = document.getElementById("invModel");
    const invBrandSuggestions = document.getElementById("invBrandSuggestions");
    const invModelSuggestions = document.getElementById("invModelSuggestions");

    if (invCategory) {
        invCategory.addEventListener("change", () => {
            let cat = invCategory.value;
            if (invBrand) invBrand.value = "";
            if (invModel) invModel.value = "";

            if (invBrandSuggestions) invBrandSuggestions.innerHTML = "";
            if (invModelSuggestions) invModelSuggestions.innerHTML = "";

            loadInvSpecsForCategory(cat);

            if (invBrandSuggestions && brandSuggestionsData[cat]) {
                brandSuggestionsData[cat].forEach(brand => {
                    let op = document.createElement("option");
                    op.value = brand;
                    invBrandSuggestions.appendChild(op);
                });
            }
        });
    }

    if (invBrand) {
        invBrand.addEventListener("input", () => {
            let brand = invBrand.value;
            if (invModelSuggestions) {
                invModelSuggestions.innerHTML = "";
                if (modelSuggestionsData[brand]) {
                    modelSuggestionsData[brand].forEach(model => {
                        let op = document.createElement("option");
                        op.value = model;
                        invModelSuggestions.appendChild(op);
                    });
                }
            }
        });
    }

    // Initial render
    renderInventory();
});

// ========================================================
// SIA AI (SMART SALES BRAIN) ENGINE — EVOLVED
// ========================================================
let salesHistory = JSON.parse(localStorage.getItem('saleSyncSales')) || [];

function saveSaleToSia(invoiceMeta, productList) {
    let sales = JSON.parse(localStorage.getItem('saleSyncSales')) || [];
    let totalProfit = 0;
    productList.forEach(p => { totalProfit += (p.sellingPrice - p.purchaseCost); });

    const newSale = {
        id: invoiceMeta["Invoice ID"],
        date: new Date().toISOString(),
        customerName: invoiceMeta["Customer name"],
        customerPhone: invoiceMeta["Phone number"],
        altPhone: invoiceMeta["altPhone"] || invoiceMeta["alt-phone"] || "",
        customerEmail: invoiceMeta["customerEmail"] || invoiceMeta["email"] || "",
        customerAddress: invoiceMeta["customerAddress"] || invoiceMeta["address"] || invoiceMeta["Permanent address"] || "",
        paymentMode: invoiceMeta["Payment Mode"],
        grandTotal: Number(invoiceMeta["Grand Total"]),
        profit: totalProfit,
        items: productList.map(p => ({ category: p.category, brand: p.brand, model: p.model, qty: 1 }))
    };

    sales.push(newSale);
    localStorage.setItem('saleSyncSales', JSON.stringify(sales));
    salesHistory = sales;
}

function initSia() {
    const alertsContainer = document.getElementById("sia-alerts-container");
    const suggestionsContainer = document.getElementById("sia-suggestions-container");
    if (!alertsContainer || !suggestionsContainer) return;

    alertsContainer.innerHTML = "";
    suggestionsContainer.innerHTML = "";

    // 1. DATA ANALYSIS FOR PREDICTIONS
    let lowStockItems = inventoryData.filter(i => Number(i.stock) < 5);
    let overStockItems = inventoryData.filter(i => Number(i.stock) > 25);

    // Identify Hot Items (Sold > 3 in last 7 days)
    let itemSalesCount = {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    salesHistory.forEach(s => {
        if (new Date(s.date) > sevenDaysAgo) {
            s.items.forEach(i => {
                let key = i.brand + " " + i.model;
                itemSalesCount[key] = (itemSalesCount[key] || 0) + i.qty;
            });
        }
    });

    let hotItems = Object.entries(itemSalesCount).filter(e => e[1] >= 3).sort((a, b) => b[1] - a[1]);

    // 2. RENDER ALERTS
    if (lowStockItems.length > 0) {
        lowStockItems.slice(0, 2).forEach(item => {
            alertsContainer.innerHTML += `
                <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; display: flex; align-items: flex-start; gap: 8px;">
                    <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; margin-top: 2px;"></i>
                    <div>
                        <div style="font-weight: 600; font-size: 13px; color: #991b1b;">Order Soon</div>
                        <div style="font-size: 12px; color: #b91c1c;">${item.brand} ${item.model} is critically low (${item.stock} left).</div>
                    </div>
                </div>`;
        });
    }

    if (overStockItems.length > 0) {
        alertsContainer.innerHTML += `
            <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 6px; display: flex; align-items: flex-start; gap: 8px;">
                <i class="fa-solid fa-box-open" style="color: #d97706; margin-top: 2px;"></i>
                <div>
                    <div style="font-weight: 600; font-size: 13px; color: #92400e;">Overstock Warning</div>
                    <div style="font-size: 12px; color: #b45309;">You have ${overStockItems.length} models with >25 units. Consider a "Clearance Sale".</div>
                </div>
            </div>`;
    }

    // 3. RENDER STRATEGIC SUGGESTIONS
    if (hotItems.length > 0) {
        suggestionsContainer.innerHTML += `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; display: flex; align-items: flex-start; gap: 8px;">
                <i class="fa-solid fa-fire-flame-curved" style="color: #10b981; margin-top: 2px;"></i>
                <div>
                    <div style="font-weight: 600; font-size: 13px; color: #166534;">Trending Now</div>
                    <div style="font-size: 12px; color: #15803d;">${hotItems[0][0]} is selling fast! Ensure you have enough stock for the weekend.</div>
                </div>
            </div>`;
    }

    // Profit Advice
    let bestMarginItem = inventoryData.reduce((prev, curr) =>
        (Number(curr.price) - Number(curr.cost) > Number(prev.price) - Number(prev.cost)) ? curr : prev, inventoryData[0]);

    if (bestMarginItem && (Number(bestMarginItem.price) - Number(bestMarginItem.cost)) > 500) {
        suggestionsContainer.innerHTML += `
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px; display: flex; align-items: flex-start; gap: 8px;">
                <i class="fa-solid fa-lightbulb" style="color: #3b82f6; margin-top: 2px;"></i>
                <div>
                    <div style="font-weight: 600; font-size: 13px; color: #1e3a8a;">Profit Tip</div>
                    <div style="font-size: 12px; color: #1d4ed8;">Pushing ${bestMarginItem.brand} ${bestMarginItem.model} earns you ₹${bestMarginItem.price - bestMarginItem.cost} per unit. It's your best ROI!</div>
                </div>
            </div>`;
    }
}

// Navigation and Chat Setup
document.addEventListener("DOMContentLoaded", () => {
    const navSia = document.querySelector('[data-view="view-sia"]');
    if (navSia) navSia.addEventListener("click", initSia);

    const chatInput = document.getElementById("sia-chat-input");
    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => { if (e.key === "Enter") askSia(); });
    }
    const sendBtn = document.getElementById("sia-send-btn");
    if (sendBtn) sendBtn.addEventListener("click", askSia);

    // Analytics Dashboard Trigger
    const navAnalytics = document.querySelector('[data-view="view-analytics"]');
    if (navAnalytics) {
        navAnalytics.addEventListener("click", () => {
            const sidebarBtn = document.getElementById("appSidebar");
            if (sidebarBtn) sidebarBtn.classList.add("collapsed");
            updateDashboard();
        });
    }

    const analyticsSidebarToggle = document.getElementById("analyticsToggleSidebarBtn");
    if (analyticsSidebarToggle) {
        analyticsSidebarToggle.addEventListener("click", () => {
            const sideNav = document.getElementById("analyticsSideNav");
            if (sideNav) {
                sideNav.classList.toggle("hidden-nav");
                // Allow CSS transition to finish then trigger resize for charts
                setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
            }
        });
    }
});

function appendSiaMessage(msg, isUser = false) {
    const chat = document.getElementById("sia-chat-history");
    if (!chat) return;
    const typeClass = isUser ? 'user' : 'sia';
    const align = isUser ? 'flex-end' : 'flex-start';
    const bg = isUser ? 'var(--primary)' : 'var(--card)';
    const color = isUser ? 'white' : 'var(--text)';
    const radius = isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px';
    const icon = isUser ? 'fa-user' : 'fa-wand-magic-sparkles';
    const iconBg = isUser ? 'var(--primary)' : '#a855f7';

    chat.innerHTML += `
        <div style="display: flex; gap: 12px; align-items: flex-start; max-width: 85%; align-self: ${align}; margin-bottom: 16px; ${isUser ? 'flex-direction: row-reverse;' : ''}">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${iconBg}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;"><i class="fa-solid ${icon}"></i></div>
            <div style="background: ${bg}; color: ${color}; padding: 12px 16px; border-radius: ${radius}; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid var(--border);">
                <div style="margin: 0; font-size: 14px; line-height: 1.6;">${msg}</div>
            </div>
        </div>
    `;
    chat.scrollTop = chat.scrollHeight;
}

// ADVANCED BRAIN — INTENT SCORING
window.askSia = function () {
    const input = document.getElementById("sia-chat-input");
    if (!input || !input.value.trim()) return;
    const rawQ = input.value.trim();
    const q = rawQ.toLowerCase();
    input.value = "";
    appendSiaMessage(rawQ, true);

    // Typing Simulation
    const chat = document.getElementById("sia-chat-history");
    const typingId = "typing-" + Date.now();
    chat.innerHTML += `<div id="${typingId}" style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px; padding-left: 44px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Sia is thinking...</div>`;
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
        document.getElementById(typingId)?.remove();
        let response = "";

        // 1. CUSTOMER PROFILE EXTRACTION
        let targetCustomerRows = [];
        const phoneMatch = q.match(/\d{10}/);

        if (phoneMatch) {
            targetCustomerRows = salesHistory.filter(s => String(s.customerPhone).includes(phoneMatch[0]));
        } else {
            const searchStr = q.trim();
            if (searchStr.length > 2) {
                targetCustomerRows = salesHistory.filter(s => {
                    const n = (s.customerName || "").toLowerCase();
                    if (!n || n === "unknown") return false;

                    if (n === searchStr || n.startsWith(searchStr + " ")) return true;
                    if (searchStr.includes(n)) return true;

                    const firstName = n.split(' ')[0];
                    if (firstName.length > 3 && searchStr.includes(firstName)) return true;

                    return false;
                });
            }
        }

        if (targetCustomerRows.length > 0) {
            const cName = targetCustomerRows[0].customerName || "Unknown Customer";
            const cPhone = targetCustomerRows[0].customerPhone || "No Phone";
            let totalSpent = 0;
            let historyHtml = "";

            const sortedInvoices = [...targetCustomerRows].sort((a, b) => new Date(b.date) - new Date(a.date));
            sortedInvoices.forEach(inv => {
                totalSpent += Number(inv.grandTotal || 0);
                const itemNames = inv.items.map(i => `${i.qty}x ${i.brand} ${i.model}`).join(", ");
                const dStr = new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                historyHtml += `▪️ <b>${dStr}</b>: ${itemNames} <i>(₹${Number(inv.grandTotal).toLocaleString('en-IN')})</i><br>`;
            });

            // Dynamic Description feature
            let cDescription = "";
            if (totalSpent > 15000 || targetCustomerRows.length >= 3) {
                cDescription = "⭐ <b>VIP Customer:</b> This person is a high-value, recurring buyer. Offer them excellent service and consider loyalty discounts!";
            } else if (targetCustomerRows.length === 1) {
                cDescription = "🌱 <b>New Customer:</b> They've only visited once. Follow up on WhatsApp to build a long-term relationship!";
            } else {
                cDescription = "🤝 <b>Returning Customer:</b> They've shopped here multiple times and are familiar with your business.";
            }

            response = `👤 **Customer Profile: ${cName.toUpperCase()}**<br>
            <div style="padding: 8px; margin: 8px 0; background: rgba(168, 85, 247, 0.1); border-left: 3px solid #a855f7; border-radius: 4px; font-size: 13px;">${cDescription}</div>
            <b>📞 Phone:</b> ${cPhone}<br>
            <b>🛍️ Total Visits:</b> ${targetCustomerRows.length}<br>
            <b>💰 Lifetime Spend:</b> ₹${totalSpent.toLocaleString('en-IN')}<br><br>
            📋 **Purchase History:**<br>
            ${historyHtml}<br>
            *(Extracted instantly from your database!)*`;

            appendSiaMessage(response, false);
            return;
        }

        // Define Intents by keywords (Expanded NLP Database)
        const intents = {
            PERFORMANCE: ["revenue", "profit", "sales", "money", "total", "earn", "performance", "business", "make", "made", "income", "cash", "worth", "value", "margin"],
            INVENTORY: ["stock", "inventory", "count", "items", "available", "left", "units", "warehouse", "quantity", "hold", "amount", "many", "much", "empty", "full"],
            TRENDS: ["top", "best", "selling", "popular", "hot", "trending", "lowest", "slow", "bad", "worst", "perform", "moving", "bought", "purchased", "favorites", "winners", "loser", "stuck"],
            CUSTOMERS: ["customer", "client", "buyer", "shopper", "loyalty", "vip", "people", "person", "who", "user"],
            ADVICE: ["advice", "suggest", "help", "improve", "increase", "strategy", "plan", "predict", "should", "recommend", "idea", "tip", "better", "grow", "boost"]
        };

        const scores = { PERFORMANCE: 0, INVENTORY: 0, TRENDS: 0, CUSTOMERS: 0, ADVICE: 0 };
        const tokens = q.split(/\W+/).filter(t => t.length > 2); // Ignore very short words like 'is', 'a', 'my'

        tokens.forEach(t => {
            for (let intent in intents) {
                // Fuzzy Match (checks if user word contains the intent keyword or vice-versa)
                if (intents[intent].some(kw => t.includes(kw) || kw.includes(t))) {
                    scores[intent]++;
                }
            }
        });

        // Determine Primary Intent
        const bestIntent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

        if (scores[bestIntent] === 0) {
            response = `<div style="margin-bottom: 12px;">I'm your <b>Sales Assistant</b>. I didn't quite catch that. Here are some quick questions you can ask me:</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button onclick="document.getElementById('sia-chat-input').value='What is my total revenue?'; window.askSia();" style="padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--card); color: var(--text); text-align: left; cursor: pointer; font-size: 13px;">
                    <i class="fa-solid fa-money-bill-trend-up" style="color: #10b981; margin-right: 8px;"></i> How is my revenue and profit?
                </button>
                <button onclick="document.getElementById('sia-chat-input').value='Show me my top selling items'; window.askSia();" style="padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--card); color: var(--text); text-align: left; cursor: pointer; font-size: 13px;">
                    <i class="fa-solid fa-fire" style="color: #f59e0b; margin-right: 8px;"></i> Show me trending products
                </button>
                <button onclick="document.getElementById('sia-chat-input').value='Which items have low stock?'; window.askSia();" style="padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--card); color: var(--text); text-align: left; cursor: pointer; font-size: 13px;">
                    <i class="fa-solid fa-boxes-stacked" style="color: #ef4444; margin-right: 8px;"></i> Check inventory levels
                </button>
                <button onclick="document.getElementById('sia-chat-input').value='Give me some business advice'; window.askSia();" style="padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--card); color: var(--text); text-align: left; cursor: pointer; font-size: 13px;">
                    <i class="fa-solid fa-lightbulb" style="color: #3b82f6; margin-right: 8px;"></i> Give me some business advice
                </button>
            </div>`;
        }
        else if (bestIntent === "TRENDS") {
            let map = {};
            salesHistory.forEach(s => s.items.forEach(i => { let n = i.brand + " " + i.model; map[n] = (map[n] || 0) + i.qty; }));
            let sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

            if (q.includes("low") || q.includes("bad") || q.includes("slow")) {
                let slow = sorted.reverse().slice(0, 3);
                response = `I've analyzed your slow-movers. **${slow.map(s => s[0]).join(", ")}** aren't selling much. Maybe we should try a small discount to clear the shelves?`;
            } else {
                let top = sorted.slice(0, 3);
                response = `Based on your sales, your clear winners are **${top.map(t => t[0]).join(", ")}**. These are driving your growth!`;
            }
        }
        else if (bestIntent === "PERFORMANCE") {
            let rev = salesHistory.reduce((acc, s) => acc + s.grandTotal, 0);
            let prof = salesHistory.reduce((acc, s) => acc + s.profit, 0);
            let avg = salesHistory.length > 0 ? (rev / salesHistory.length).toFixed(0) : 0;
            response = `Your total revenue is **₹${rev.toLocaleString('en-IN')}** with a gross profit of **₹${prof.toLocaleString('en-IN')}**. On average, every bill you generate is worth about **₹${avg}**. How does that sound for this period?`;
        }
        else if (bestIntent === "INVENTORY") {
            let total = inventoryData.reduce((acc, i) => acc + Number(i.stock), 0);
            let val = inventoryData.reduce((acc, i) => acc + (Number(i.stock) * Number(i.cost)), 0);
            let low = inventoryData.filter(i => Number(i.stock) < 5).length;
            response = `Your warehouse currently holds **${total} units** valued at **₹${val.toLocaleString('en-IN')}**. I'm currently tracking **${low} items** that are running dangerously low and need attention.`;
        }
        else if (q.includes("what is a flash sale") || q.includes("explain flash sale") || q.includes("flash sale")) {
            response = "💡 **Flash Sale Strategy (Explained):**<br><br>A flash sale is a massive discount offered for a very short time (24-48 hours). It creates **urgency** and **fear of missing out** (FOMO).<br><br><b>How to do it practically:</b><br>1️⃣ Find your overstocked or dead items (e.g. items sitting for >30 days).<br>2️⃣ Slash the price to near cost-price to clear it instantly.<br>3️⃣ Broadcast a WhatsApp message to all your old customers: *'24-Hour Deal! 30% OFF on specific accessories.'*<br><br><b>Why?</b> It liquidates dead stock so you get your cash back to reinvest in fast-moving items like the newest mobiles.";
        }
        else if (q.includes("margin") || q.includes("high margin")) {
            response = "💡 **High Margin Strategy (Explained):**<br><br>High margin means the difference between your buying price and selling price is huge. Typically, small accessories have massive margins compared to phones.<br><br><b>How to use this practically:</b><br>1️⃣ Identify your highest margin item (e.g. Earbuds which cost ₹300 but sell for ₹800).<br>2️⃣ Whenever someone buys a low-margin phone, offer them the earbuds at a 'Special Combo Price' of ₹600.<br>3️⃣ You just made a huge profit on the add-on!<br><br><b>Why?</b> Securing profit lies in the accessories, not the main device.";
        }
        else if (bestIntent === "ADVICE" || bestIntent === "CUSTOMERS") {
            // Give one specific practical suggestion based on data
            let over = inventoryData.filter(i => Number(i.stock) > 25);
            let bestMarginItem = inventoryData.length > 0 ? inventoryData.reduce((prev, curr) => (Number(curr.price) - Number(curr.cost) > Number(prev.price) - Number(prev.cost)) ? curr : prev, inventoryData[0]) : null;

            let advices = [];

            if (over.length > 0) {
                advices.push(`📉 **Clear Dead Stock to Free Up Cash:**<br><br>You currently have **${over[0].stock} units** of **${over[0].brand} ${over[0].model}**. This is locking up your capital!<br><br><b>Practical Action:</b> Run a weekend 'Flash Sale' specifically for this item. Discount it slightly to clear it fast, and reinvest the cash onto fast-moving items. <br><br>*(Ask me "What is a flash sale?" for a step-by-step guide.)*`);
            }
            if (bestMarginItem && (bestMarginItem.price - bestMarginItem.cost > 200)) {
                advices.push(`📈 **Push High Margin Accessories:**<br><br>Your **${bestMarginItem.brand} ${bestMarginItem.model}** gives a massive profit of ₹${bestMarginItem.price - bestMarginItem.cost} per unit! <br><br><b>Practical Action:</b> Instruct your sales team to explicitly recommend this item as an 'add-on' whenever a customer buys a new mobile phone. Bundle it with a ₹50 discount to close the deal instantly. <br><br>*(Ask me "How to improve margins?" for more.)*`);
            }
            // Add a general customer retention strategy
            advices.push(`🤝 **Tap Into Customer Loyalty:**<br><br>It costs 5x more to acquire a new customer than to keep an existing one.<br><br><b>Practical Action:</b> Go to the 'Database' tab, extract the last 20 customers' phone numbers, and WhatsApp them a polite message offering a flat 10% discount on any speaker or earbud this week. Re-engagement is free marketing!`);

            // Pick ONE random advice
            response = advices[Math.floor(Math.random() * advices.length)];
        }

        appendSiaMessage(response, false);
    }, 1200);
};

window.syncSiaWithSheets = async function () {
    const btn = document.getElementById("sia-sync-btn");
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
    btn.disabled = true;
    appendSiaMessage("Connecting to master database... I'm reading your entire sales history! 🔄", false);

    try {
        const response = await fetch(`${SCRIPT_URL}?action=syncSia`);
        const data = await response.json();

        if (data.success && data.results) {
            let invoices = {};
            data.results.forEach(row => {
                let invId = row["Invoice ID"] || row["invoiceId"] || row["Invoice id"] || row["ID"];
                if (!invId) return;
                if (!invoices[invId]) {
                    invoices[invId] = {
                        id: invId,
                        date: row["Purchase date"] || row["Date"] || new Date().toISOString(),
                        customerName: getInvVal(row, "Customer name", "Name", "Full Name", "customer"),
                        customerPhone: getInvVal(row, "Phone number", "phone", "Mobile", "WhatsApp"),
                        altPhone: getInvVal(row, "Alternate phone", "Alternate Phone", "Alt Phone"),
                        customerEmail: getInvVal(row, "Email address", "Email Address", "Email"),
                        customerAddress: getInvVal(row, "Billing address", "Billing Address", "Address", "Permanent address"),
                        grandTotal: Number(row["Grand Total"] || row["Subtotal"] || row["Total"] || 0),
                        profit: 0,
                        items: []
                    };
                }
                let sellingPrice = Number(row["Price"] || row["price"] || row["Selling Price"] || 0);
                let costPrice = Number(row["itemPurchaseCost"] || row["ItemPurchaseCost"] || row["Cost"] || row["Purchase Cost"] || 0);
                invoices[invId].profit += (sellingPrice - costPrice);
                invoices[invId].items.push({
                    brand: row["brand"] || row["Brand"] || "",
                    model: row["Item"] || row["Model"] || row["model"] || "Unknown",
                    category: row["category"] || row["Category"] || "Accessory", // Default to Accessory if missing
                    qty: Number(row["Qty"] || row["Quantity"] || 1)
                });
            });

            let newSalesHistory = Object.values(invoices);
            localStorage.setItem('saleSyncSales', JSON.stringify(newSalesHistory));
            salesHistory = newSalesHistory;
            appendSiaMessage(`**Knowledge Absorb Complete!** ✨ I now remember all **${newSalesHistory.length}** bills in your history. I'm ready to give you much deeper advice now.`, false);
            initSia();
        } else {
            appendSiaMessage("I couldn't reach the database. ⚠️ Ensure the Apps Script is deployed properly.", false);
        }
    } catch (e) {
        appendSiaMessage("Connection error! ⚠️ Please check your internet or the Deployment URL in script.js.", false);
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
};

// ========================================================
// SECTION 13 — ANALYTICS DASHBOARD (CHART.JS)
// ========================================================
let revenueCountryChartObj = null;
let revenueVsBudgetChartObj = null;
let revenueSegmentsChartObj = null;
let profitProductsChartObj = null;
let unitsProductsChartObj = null;
let inventoryStatusChartObj = null;
let inventoryPieChartObj = null;
let revenueTimelineMonthlyChartObj = null;
let revenueQuarterlyChartObj = null;

let globalAnalyticsData = [];
let filteredMonth = null;
let filteredYear = 2026;
let filteredQuarter = null;
let filteredExactDate = null;
let filteredSegment = null;
let yearlyMode = true;

function updateDashboard() {
    const dashTotalRev = document.getElementById("dash-total-revenue");
    if (dashTotalRev) dashTotalRev.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    fetch(`${SCRIPT_URL}?action=getAnalytics`)
        .then(res => {
            if (!res.ok) throw new Error("Network error");
            return res.json();
        })
        .then(data => {
            if (data.success && data.results && data.results.length > 0) {
                globalAnalyticsData = data.results;
                populateAnalyticsNav();
                processAndRenderAnalytics();
            } else {
                if (dashTotalRev) dashTotalRev.innerText = "No Data";
                console.warn("Analytics: Success but no results", data);
            }
        })
        .catch(err => {
            console.error("Analytics Error:", err);
            showToast("Failed to load Analytics data");
            if (dashTotalRev) dashTotalRev.innerText = "Offline";
        });
}

function populateAnalyticsNav() {
    const monthsList = document.getElementById('analytics-months-list');
    const yearsList = document.getElementById('analytics-years-list');
    const quartersList = document.getElementById('analytics-quarters-list');
    const segmentsList = document.getElementById('analytics-segments-list');
    if (!monthsList || !yearsList || !quartersList) return;

    monthsList.innerHTML = '';
    yearsList.innerHTML = '';
    quartersList.innerHTML = '';
    if (segmentsList) segmentsList.innerHTML = '';

    const years = [2026, 2027, 2028, 2029];
    const quarters = ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    years.forEach(year => {
        const btn = document.createElement('div');
        btn.className = `nav-item ${filteredYear === year ? 'active' : ''}`;
        btn.innerText = year;
        btn.onclick = () => {
            filteredYear = year;
            filteredExactDate = null;
            updateNavActiveStates();
            processAndRenderAnalytics();
        };
        yearsList.appendChild(btn);
    });

    quarters.forEach((qStr, idx) => {
        const btn = document.createElement('div');
        btn.className = `nav-item ${filteredQuarter === (idx + 1) ? 'active' : ''}`;
        btn.innerText = qStr;
        btn.style.fontSize = "10px"; // Slightly smaller for the new label
        btn.onclick = () => {
            filteredQuarter = (filteredQuarter === (idx + 1)) ? null : (idx + 1);
            if (filteredQuarter !== null) {
                filteredMonth = null;
                filteredExactDate = null;
                yearlyMode = false;
            }
            updateNavActiveStates();
            processAndRenderAnalytics();
        };
        quartersList.appendChild(btn);
    });

    months.forEach((month, index) => {
        const btn = document.createElement('div');
        btn.className = `nav-item ${filteredMonth === index ? 'active' : ''}`;
        btn.innerText = month;
        btn.dataset.monthIndex = index;
        btn.onclick = () => {
            filteredMonth = (filteredMonth === index) ? null : index;
            if (filteredMonth !== null) {
                filteredQuarter = null;
                filteredExactDate = null;
                yearlyMode = false;
            }
            updateNavActiveStates();
            processAndRenderAnalytics();
        };
        monthsList.appendChild(btn);
    });

    const getPaymentMode = (r) => {
        let val = getInvVal(r, "paymentMode", "PaymentMode", "Payment Mode", "Payment_Mode", "Payment", "Payment method", "Mode", "Pay Mode", "Type", "Sales Mode");
        return val ? String(val).trim() : "";
    };
    const uniqueSegments = [...new Set(globalAnalyticsData.map(getPaymentMode))].filter(Boolean);
    uniqueSegments.forEach(seg => {
        const btn = document.createElement('div');
        btn.className = `nav-item ${filteredSegment === seg ? 'active' : ''}`;
        btn.innerText = seg;
        btn.onclick = () => {
            filteredSegment = (filteredSegment === seg) ? null : seg;
            updateNavActiveStates();
            processAndRenderAnalytics();
        };
        if (segmentsList) segmentsList.appendChild(btn);
    });

    const yearlyBtn = document.getElementById('yearly-analysis-btn');
    if (yearlyBtn) {
        yearlyBtn.onclick = () => {
            yearlyMode = true;
            filteredMonth = null;
            filteredQuarter = null;
            filteredExactDate = null;
            filteredSegment = null;
            updateNavActiveStates();
            processAndRenderAnalytics();
        };
    }

    const exactDateInput = document.getElementById('analytics-exact-date');
    const clearExactBtn = document.getElementById('clear-exact-date');

    if (exactDateInput) {
        // Force today's date in YYYY-MM-DD format
        const today = new Date().toLocaleDateString('en-CA');
        if (!exactDateInput.value) {
            exactDateInput.value = today;
            filteredExactDate = today; // Sync logic
        }
        exactDateInput.onchange = (e) => {
            if (e.target.value) {
                filteredExactDate = e.target.value;
                filteredYear = null;
                filteredMonth = null;
                filteredQuarter = null;
                yearlyMode = false;
                updateNavActiveStates();
                processAndRenderAnalytics();
            }
        };
    }

    if (clearExactBtn) {
        clearExactBtn.onclick = () => {
            if (filteredExactDate) {
                filteredExactDate = null;
                exactDateInput.value = '';
                filteredYear = 2026;
                yearlyMode = true;
                updateNavActiveStates();
                processAndRenderAnalytics();
            }
        };
    }

    const backBtn = document.getElementById('backToAppBtn');
    if (backBtn) {
        backBtn.onclick = () => {
            // Restore main app view (assuming first menu item is 'New Invoice')
            const firstTab = document.querySelector('.sidebar-menu .menu-item');
            if (firstTab) firstTab.click();
        };
    }
}

function updateNavActiveStates() {
    // Years
    document.querySelectorAll('#analytics-years-list .nav-item').forEach(btn => {
        btn.classList.toggle('active', filteredYear === parseInt(btn.innerText));
    });
    // Quarters
    document.querySelectorAll('#analytics-quarters-list .nav-item').forEach(btn => {
        btn.classList.toggle('active', filteredQuarter === parseInt(btn.innerText.substring(1)));
    });
    // Months
    document.querySelectorAll('#analytics-months-list .nav-item').forEach(btn => {
        btn.classList.toggle('active', filteredMonth === parseInt(btn.dataset.monthIndex));
    });
    // Segments
    document.querySelectorAll('#analytics-segments-list .nav-item').forEach(btn => {
        btn.classList.toggle('active', filteredSegment === btn.innerText);
    });
    // Yearly Btn
    const yearlyBtn = document.getElementById('yearly-analysis-btn');
    if (yearlyBtn) yearlyBtn.classList.toggle('active', yearlyMode);

    // Exact Date UI
    const exactDateInput = document.getElementById('analytics-exact-date');
    if (exactDateInput) {
        if (filteredExactDate) {
            exactDateInput.value = filteredExactDate;
            exactDateInput.style.borderColor = 'var(--primary)';
            exactDateInput.style.boxShadow = '0 0 0 2px var(--primary-glow)';
        } else {
            exactDateInput.value = '';
            exactDateInput.style.borderColor = 'var(--border)';
            exactDateInput.style.boxShadow = 'none';
        }
    }
}

function processAndRenderAnalytics() {
    let totalRev = 0;
    let totalProf = 0;
    let totalUnits = 0;

    const brandMap = {};
    const segmentsMap = {
        "Cash": 0,
        "UPI / QR Scan": 0,
        "Debit/Credit Card": 0,
        "EMI Finance": 0,
        "Credit (Udhaar)": 0
    };
    const timelineMap = {};
    const budgetTimelineMap = {};
    const quarterlyMap = { "Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0 };

    // Toggle Yearly Mode Class for visibility
    const container = document.querySelector('.analytics-layout-container');
    if (container) {
        if (yearlyMode) container.classList.add('yearly-mode');
        else container.classList.remove('yearly-mode');
    }

    const timelineMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    timelineMonths.forEach(mKey => {
        timelineMap[mKey] = 0;
        budgetTimelineMap[mKey] = 120000 + (Math.random() * 40000); // Simulated target
    });

    const filteredResults = globalAnalyticsData.filter(row => {
        if (filteredSegment) {
            const seg = getInvVal(row, "paymentMode", "PaymentMode", "Payment Mode", "Payment_Mode", "Payment", "Payment method", "Mode", "Pay Mode", "Type", "Sales Mode");
            const finalSeg = seg ? String(seg).trim() : "";
            if (finalSeg !== filteredSegment) return false;
        }

        let dateStr = getInvVal(row, "Purchase date", "Date", "saleDate", "date");
        const dateObj = parseSheetDate(dateStr);

        if (filteredExactDate) {
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            const rowDate = `${y}-${m}-${d}`;
            return rowDate === filteredExactDate;
        }

        const yMatch = filteredYear === null || dateObj.getFullYear() === filteredYear;
        const mMatch = filteredMonth === null || dateObj.getMonth() === filteredMonth;

        let qMatch = true;
        if (filteredQuarter !== null) {
            const q = Math.floor(dateObj.getMonth() / 3) + 1;
            qMatch = q === filteredQuarter;
        }

        return yMatch && mMatch && qMatch;
    });

    const productsUnitsMap = {};
    const productsProfitMap = {};

    filteredResults.forEach(row => {
        let rev = Number(getInvVal(row, "Revenue_Pricing", "Revenue", "Grand Total", "Total", "Price", "Selling Price", "Subtotal") || 0);
        let prof = Number(getInvVal(row, "Profit_Pricing", "Profit") || 0);
        let qty = Number(getInvVal(row, "Qty", "Quantity") || 1);
        let brand = getInvVal(row, "Brand", "brand") || "Unknown";
        let segmentRaw = getInvVal(row, "paymentMode", "PaymentMode", "Payment Mode", "Payment_Mode", "Payment", "Payment method", "Mode", "Pay Mode", "Type", "Sales Mode");
        let segment = segmentRaw ? String(segmentRaw).trim() : "";
        let product = getInvVal(row, "Product_Name", "Product", "Model", "Item", "model") || "Unknown";
        let dateStr = getInvVal(row, "Purchase date", "Date", "saleDate", "date");

        const dateObj = parseSheetDate(dateStr);

        totalRev += rev;
        totalProf += prof;
        totalUnits += qty;

        brandMap[brand] = (brandMap[brand] || 0) + rev;
        if (segment) {
            // Find matching key in segmentsMap (case-insensitive & trimmed)
            const targetSeg = segment.trim().toLowerCase();
            const mapKey = Object.keys(segmentsMap).find(k => k.trim().toLowerCase() === targetSeg);
            if (mapKey) {
                segmentsMap[mapKey] += rev;
            } else {
                // If not in the pre-defined 5 points, add it anyway for the chart to decide (or just skip)
                // segmentsMap[segment] = (segmentsMap[segment] || 0) + rev; 
            }
        }
        productsUnitsMap[product] = (productsUnitsMap[product] || 0) + qty;
        productsProfitMap[product] = (productsProfitMap[product] || 0) + prof;

        if (!isNaN(dateObj)) {
            const mKey = timelineMonths[dateObj.getMonth()];
            timelineMap[mKey] += rev;
            // Simulated budget logic
            budgetTimelineMap[mKey] += rev * (1.1 + (Math.random() * 0.1));

            const qIdx = Math.floor(dateObj.getMonth() / 3) + 1;
            quarterlyMap[`Q${qIdx}`] += rev;
        }
    });

    // Toggle Yearly Mode Class
    const layoutContainer = document.querySelector('.analytics-layout-container');
    if (layoutContainer) {
        if (yearlyMode) layoutContainer.classList.add('yearly-mode');
        else layoutContainer.classList.remove('yearly-mode');
    }

    // ---------------------------------------------------------
    // PERIOD COMPARISON LOGIC
    // ---------------------------------------------------------
    const getPrevPeriodResults = () => {
        return globalAnalyticsData.filter(row => {
            let dateStr = getInvVal(row, "Purchase date", "Date", "saleDate", "date");
            const dateObj = parseSheetDate(dateStr);
            if (isNaN(dateObj)) return false;

            if (filteredExactDate) {
                // Compare with previous day
                const curr = new Date(filteredExactDate);
                curr.setDate(curr.getDate() - 1);
                const y = curr.getFullYear();
                const m = String(curr.getMonth() + 1).padStart(2, '0');
                const d = String(curr.getDate()).padStart(2, '0');
                const prevDate = `${y}-${m}-${d}`;

                const ry = dateObj.getFullYear();
                const rm = String(dateObj.getMonth() + 1).padStart(2, '0');
                const rd = String(dateObj.getDate()).padStart(2, '0');
                return `${ry}-${rm}-${rd}` === prevDate;
            }

            if (filteredMonth !== null) {
                let pm = filteredMonth - 1;
                let py = filteredYear || new Date().getFullYear();
                if (pm < 0) { pm = 11; py--; }
                return dateObj.getMonth() === pm && dateObj.getFullYear() === py;
            }

            if (filteredQuarter !== null) {
                let pq = filteredQuarter - 1;
                let py = filteredYear || new Date().getFullYear();
                if (pq < 1) { pq = 4; py--; }
                const q = Math.floor(dateObj.getMonth() / 3) + 1;
                return q === pq && dateObj.getFullYear() === py;
            }

            if (filteredYear !== null) {
                return dateObj.getFullYear() === (filteredYear - 1);
            }
            return false;
        });
    };

    const prevResults = getPrevPeriodResults();
    let prevRev = 0, prevProf = 0, prevUnits = 0;
    prevResults.forEach(r => {
        prevRev += Number(getInvVal(r, "Revenue_Pricing", "Revenue", "Grand Total", "Total", "Price", "Selling Price", "Subtotal") || 0);
        prevProf += Number(getInvVal(r, "Profit_Pricing", "Profit") || 0);
        prevUnits += Number(getInvVal(r, "Qty", "Quantity") || 1);
    });

    const calcChange = (curr, prev) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev * 100).toFixed(1);
    };

    const periodLabel = filteredExactDate ? "PREV DAY" :
        filteredMonth !== null ? "PREV MONTH" :
            filteredQuarter !== null ? "PREV QUARTER" :
                filteredYear !== null ? "PREV YEAR" : "PREV PERIOD";

    // Update KPI UI
    document.getElementById("dash-total-revenue").innerText = `₹${totalRev.toLocaleString('en-IN')}`;
    const revChange = calcChange(totalRev, prevRev);
    const revComp = document.querySelector("#dash-total-revenue + .kpi-compare");
    if (revComp) revComp.innerHTML = `<span class="trend ${revChange >= 0 ? 'up' : 'down'}"><i class="fa-solid fa-arrow-trend-${revChange >= 0 ? 'up' : 'down'}"></i> ${revChange >= 0 ? '+' : ''}${revChange}%</span> VS ${periodLabel}`;

    document.getElementById("dash-total-profit").innerText = `₹${totalProf.toLocaleString('en-IN')}`;
    const profChange = calcChange(totalProf, prevProf);
    const profComp = document.querySelector("#dash-total-profit + .kpi-compare");
    if (profComp) profComp.innerHTML = `<span class="trend ${profChange >= 0 ? 'up' : 'down'}"><i class="fa-solid fa-arrow-trend-${profChange >= 0 ? 'up' : 'down'}"></i> ${profChange >= 0 ? '+' : ''}${profChange}%</span> VS ${periodLabel}`;

    let profitMargin = totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(1) : 0;
    document.getElementById("dash-profit-margin").innerText = `${profitMargin}%`;
    const currMarginVal = parseFloat(profitMargin);
    const prevMarginVal = prevRev > 0 ? (prevProf / prevRev * 100) : 0;
    const margChange = (currMarginVal - prevMarginVal).toFixed(1);
    const margComp = document.querySelector("#dash-profit-margin + .kpi-compare");
    if (margComp) margComp.innerHTML = `<span class="trend ${margChange >= 0 ? 'up' : 'down'}"><i class="fa-solid fa-arrow-trend-${margChange >= 0 ? 'up' : 'down'}"></i> ${margChange >= 0 ? '+' : ''}${margChange}%</span> VS ${periodLabel}`;

    document.getElementById("dash-total-units").innerText = totalUnits.toLocaleString('en-IN');
    const unitsChange = calcChange(totalUnits, prevUnits);
    const unitsComp = document.querySelector("#dash-total-units + .kpi-compare");
    if (unitsComp) unitsComp.innerHTML = `<span class="trend ${unitsChange >= 0 ? 'up' : 'down'}"><i class="fa-solid fa-arrow-trend-${unitsChange >= 0 ? 'up' : 'down'}"></i> ${unitsChange >= 0 ? '+' : ''}${unitsChange}%</span> VS ${periodLabel}`;

    // Populate Inventory Change Boxes
    const invContainer = document.getElementById('inventoryChangeContainer');
    if (invContainer) {
        invContainer.innerHTML = invChangeData.map(item => `
            <div class="inv-change-box ${item.type === 'positive' ? 'pos' : 'neg'}">
                <span class="period">${item.period}</span>
                <div class="change-val">${item.val}</div>
                <span class="label">${item.label}</span>
            </div>
        `).join('');
    }

    const chartData = {
        brands: Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 6),
        timeline: { labels: Object.keys(timelineMap), actual: Object.values(timelineMap), budget: Object.values(budgetTimelineMap) },
        segments: { labels: Object.keys(segmentsMap), data: Object.values(segmentsMap) },
        quarters: { labels: Object.keys(quarterlyMap), data: Object.values(quarterlyMap) },
        productsUnits: Object.entries(productsUnitsMap).sort((a, b) => b[1] - a[1]).slice(0, 5),
        productsProfit: Object.entries(productsProfitMap).sort((a, b) => b[1] - a[1]).slice(0, 4),
        inventorySegments: { labels: [], data: [] }
    };

    // Calculate Inventory by Category
    const invCategoriesMap = {};
    inventoryData.forEach(item => {
        invCategoriesMap[item.category] = (invCategoriesMap[item.category] || 0) + Number(item.stock);
    });
    chartData.inventorySegments = { labels: Object.keys(invCategoriesMap), data: Object.values(invCategoriesMap) };

    // Render Sparklines for KPIs
    const sparkData = timelineMonths.map(m => timelineMap[m]);
    renderSparkline('sparkline-revenue', sparkData, '#4f46e5');
    renderSparkline('sparkline-profit', sparkData.map(v => v * 0.15), '#10b981');
    renderSparkline('sparkline-margin', sparkData.map(v => 10 + Math.random() * 5), '#f59e0b');
    renderSparkline('sparkline-units', sparkData.map(v => v / 1000), '#3b82f6');

    renderAdvancedCharts(chartData);
}

function renderSparkline(canvasId, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 160;
    const height = canvas.height = 60;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const max = Math.max(...data) || 1;
    const min = Math.min(...data) || 0;
    const range = max - min || 1;

    data.forEach((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 10) - 5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill gradient
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color + '44');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fill();
}

const customColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

function renderAdvancedCharts(cData) {
    Chart.defaults.color = "rgba(100, 116, 139, 0.8)";
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.font.weight = 'normal';

    const createGradient = (ctx, color) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 400);
        grad.addColorStop(0, color + '33');
        grad.addColorStop(1, color + '00');
        return grad;
    };

    // SaleSync Primary Theme colors
    const primary = '#4f46e5';
    const secondary = '#8b5cf6';
    const success = '#10b981';

    // 1. Profit by Products (Doughnut)
    if (revenueSegmentsChartObj) revenueSegmentsChartObj.destroy();
    let ctx2 = document.getElementById('revenueSegmentsChart');
    if (ctx2) {
        revenueSegmentsChartObj = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: cData.productsProfit.map(x => x[0]),
                datasets: [{
                    data: cData.productsProfit.map(x => x[1]),
                    backgroundColor: customColors,
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.1)'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 6, font: { size: 10 } } } }
            }
        });
    }

    // 2. Revenue by Payments (Radar / Spider)
    if (inventoryStatusChartObj) inventoryStatusChartObj.destroy();
    let ctx4 = document.getElementById('inventoryStatusChart');
    if (ctx4) {
        inventoryStatusChartObj = new Chart(ctx4, {
            type: 'radar',
            data: {
                labels: cData.segments.labels,
                datasets: [{
                    label: 'Revenue',
                    data: cData.segments.data,
                    backgroundColor: 'rgba(79, 70, 229, 0.2)', // primary glow
                    borderColor: '#4f46e5', // primary color
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#4f46e5',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: { display: false },
                        grid: { color: 'rgba(100, 116, 139, 0.2)' },
                        angleLines: { color: 'rgba(100, 116, 139, 0.2)' },
                        pointLabels: {
                            font: { size: 10, family: "'Inter', sans-serif" },
                            color: 'rgba(100, 116, 139, 0.8)'
                        }
                    }
                }
            }
        });
    }

    // 4. Inventory by Category (Pie)
    if (inventoryPieChartObj) inventoryPieChartObj.destroy();
    let ctx6 = document.getElementById('inventoryPieChart');
    if (ctx6) {
        inventoryPieChartObj = new Chart(ctx6, {
            type: 'pie',
            data: {
                labels: cData.inventorySegments.labels,
                datasets: [{
                    data: cData.inventorySegments.data,
                    backgroundColor: customColors.slice().reverse(), // Use a slightly different color order
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.1)'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 6, font: { size: 10 } } } }
            }
        });
    }

    // 3. Units Sold by Products (V-Bar)
    if (revenueQuarterlyChartObj) revenueQuarterlyChartObj.destroy();
    let ctx5 = document.getElementById('revenueQuarterlyChart');
    if (ctx5) {
        revenueQuarterlyChartObj = new Chart(ctx5, {
            type: 'bar',
            data: {
                labels: cData.productsUnits.map(x => x[0]),
                datasets: [{ label: 'Units', data: cData.productsUnits.map(x => x[1]), backgroundColor: success, borderRadius: 6, barThickness: 16 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { display: false, grid: { display: false } } }
            }
        });
    }
}

// ========================================================
// SECTION 14 — BARCODE SCANNER (HTML5-QRCODE)
// ========================================================
let html5QrCode = null;
let currentScannerTarget = null;

window.openScanner = function (targetId) {
    currentScannerTarget = targetId;
    document.getElementById("scannerModal").style.display = "flex";

    // Check for camera permission first
    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length > 0) {
            html5QrCode = new Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 250, height: 150 } };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                onScanSuccess
            ).catch(err => {
                console.error("Scanner Error:", err);
                showToast("❌ Could not start camera. Check permissions.");
                closeScanner();
            });
        } else {
            showToast("❌ No camera found on this device.");
            closeScanner();
        }
    }).catch(err => {
        showToast("❌ Camera Error: " + err);
        closeScanner();
    });
};

function onScanSuccess(decodedText, decodedResult) {
    if (currentScannerTarget) {
        const input = document.getElementById(currentScannerTarget);
        if (input) {
            input.value = decodedText;
            showToast("✅ Code Scanned: " + decodedText);

            // If it's the main serial input, trigger lookup if needed
            input.dispatchEvent(new Event('input'));
        }
    }
    closeScanner();
}

window.closeScanner = function () {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
            document.getElementById("scannerModal").style.display = "none";
        }).catch(err => {
            console.warn("Scanner stop error:", err);
            document.getElementById("scannerModal").style.display = "none";
        });
    } else {
        document.getElementById("scannerModal").style.display = "none";
    }
};

// ========================================================
// DYNAMIC LABEL FOR SERIAL / IMEI
// ========================================================
document.body.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'categorySelect') {
        const label = document.getElementById('serialLabel');
        if (label) {
            if (e.target.value === 'Mobile') {
                label.innerText = 'IMEI Number';
                document.getElementById('serialInput').placeholder = 'Enter 15-digit IMEI';
            } else {
                label.innerText = 'Serial Number';
                document.getElementById('serialInput').placeholder = 'Serial or unique ID';
            }
        }
    }
});

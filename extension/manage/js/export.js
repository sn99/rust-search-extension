import Statistics from "../../statistics.js";
import Compat from "../../core/compat.js";
import storage from "../../core/storage.js";
import CrateDocManager from "../../crate-manager.js";
import settings from "../../settings.js";

(async function () {
    document.querySelector(".btn-export").onclick = async (event) => {
        let target = event.target.parentElement;
        let data = Object.create(null)
        if (target.querySelector(".settings").checked) {
            data["settings"] = {
                "auto-update": await settings.autoUpdate,
                "crate-registry": await settings.crateRegistry,
                "offline-mode": await settings.isOfflineMode,
                "offline-path": await settings.offlineDocPath,
            };
        }
        if (target.querySelector(".search-history").checked) {
            data["history"] = await storage.getItem("history") || [];
        }
        if (target.querySelector(".search-statistics").checked) {
            data["stats"] = await Statistics.load();
        }
        if (target.querySelector(".crates").checked) {
            let catalog = await CrateDocManager.getCrates();
            let list = Object.create(null)
            for (const name of Object.keys(catalog)) {
                list[`@${name}`] = await CrateDocManager.getCrateSearchIndex(name);
            }
            data["crates"] = {
                catalog,
                list,
            };
        }
        let date = new Compat().normalizeDate(new Date());
        saveToFile(JSON.stringify(data), `rust-search-extension-${date}.json`, 'text/plain');
    };

    function saveToFile(content, fileName, contentType) {
        let a = document.createElement("a");
        let file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
})();
/* ==========================================================================
   SUPER-APP ADMIN DASHBOARD MODULE - admin-dashboard.js
   ========================================================================== */

window.AdminDashboardModule = (function() {
    function init() {
        setupForm();
        setupBackupRestore();
    }

    function setupForm() {
        const form = document.getElementById("admin-add-vocab-form");
        if (!form) return;

        form.onsubmit = (e) => {
            e.preventDefault();

            const lessonId = parseInt(document.getElementById("admin-lesson-id").value);
            const newVocab = {
                word: document.getElementById("admin-word-en").value,
                phonetic: document.getElementById("admin-phonetic").value,
                pos: document.getElementById("admin-pos").value,
                meaning: document.getElementById("admin-word-fa").value,
                example: document.getElementById("admin-example").value,
                example_fa: document.getElementById("admin-example-fa").value
            };

            const lesson = window.AppState.data.lessons.find(l => l.id === lessonId);
            if (lesson) {
                lesson.vocab.push(newVocab);
                alert(`واژه "${newVocab.word}" با موفقیت به درس اضافه شد!`);
                form.reset();
            }
        };
    }

    function setupBackupRestore() {
        const exportBtn = document.getElementById("btn-export-database");
        const importInput = document.getElementById("import-database-file");
        const resetBtn = document.getElementById("btn-reset-all-data");

        if (exportBtn) {
            exportBtn.onclick = () => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.AppState.data));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", "prospect3_backup.json");
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            };
        }

        if (importInput) {
            importInput.onchange = (e) => {
                const fileReader = new FileReader();
                fileReader.onload = (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        window.AppState.data = importedData;
                        alert("داده‌ها با موفقیت بازیابی شدند!");
                        location.reload();
                    } catch (err) {
                        alert("فایل انتخاب شده معتبر نیست.");
                    }
                };
                fileReader.readAsText(e.target.files[0]);
            };
        }

        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm("آیا مطمئن هستید؟ تمام اطلاعات ذخیره‌شده و پیشرفت شما پاک خواهد شد!")) {
                    localStorage.clear();
                    location.reload();
                }
            };
        }
    }

    return { init };
})();

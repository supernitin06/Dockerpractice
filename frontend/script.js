const names = document.getElementById("nameinput");
const email = document.getElementById("emailinput");
const submitBtn = document.getElementById("submit");
const form = document.getElementById("contactform");
const output = document.getElementById("Formoutput");
const getdataBtn = document.getElementById("getdata");
const tablebody = document.getElementById("tablebody");
const recordCount = document.getElementById("recordCount");

const submitdata = async (name, email) => {
    const response = await fetch("http://localhost:3000/api/information", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email
        })
    });
    return response;
};

const getdatas = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/information", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
        return { error: error.message };
    }
};

const renderRecords = (records) => {
    if (!tablebody) return;

    tablebody.innerHTML = "";

    if (!records || records.length === 0) {
        tablebody.innerHTML = `
            <tr class="empty-row">
                <td colspan="2">
                    <div class="empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <ellipse cx="12" cy="5" rx="9" ry="3"/>
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                        </svg>
                        <p>No records found</p>
                        <span>Database returned no entries.</span>
                    </div>
                </td>
            </tr>
        `;
        if (recordCount) recordCount.textContent = "0 records";
        return;
    }

    records.forEach((element) => {
        const row = document.createElement("tr");

        // User cell with avatar initials
        const nameTd = document.createElement("td");
        const userCell = document.createElement("div");
        userCell.className = "user-cell";

        const avatar = document.createElement("div");
        avatar.className = "user-avatar";
        const initial = (element.name && element.name.trim().length > 0)
            ? element.name.trim()[0].toUpperCase()
            : "?";
        avatar.textContent = initial;

        const userName = document.createElement("span");
        userName.className = "user-name";
        userName.textContent = element.name || "Anonymous";

        userCell.appendChild(avatar);
        userCell.appendChild(userName);
        nameTd.appendChild(userCell);

        // Email cell with badge styling
        const emailTd = document.createElement("td");
        const emailBadge = document.createElement("span");
        emailBadge.className = "email-badge";
        emailBadge.textContent = element.email || "No email";
        emailTd.appendChild(emailBadge);

        row.appendChild(nameTd);
        row.appendChild(emailTd);
        tablebody.appendChild(row);
    });

    if (recordCount) {
        recordCount.textContent = `${records.length} ${records.length === 1 ? 'record' : 'records'}`;
    }
};

// Form submit event
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameValue = names.value.trim();
    const emailValue = email.value.trim();

    if (!nameValue || !emailValue) return;

    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";

    try {
        const response = await submitdata(nameValue, emailValue);

        if (response.ok) {
            output.innerHTML = "";
            const el = document.createElement("p");
            el.innerText = `Added: ${nameValue} (${emailValue})`;
            output.appendChild(el);

            form.reset();

            // Refresh table list automatically
            fetchAndRender();

            setTimeout(() => {
                el.style.transition = "opacity 0.4s";
                el.style.opacity = "0";
                setTimeout(() => el.remove(), 400);
            }, 4000);
        } else {
            const el = document.createElement("p");
            el.className = "error";
            el.innerText = "Failed to save information.";
            output.appendChild(el);
        }
    } catch (err) {
        console.error("Submit error:", err);
        const el = document.createElement("p");
        el.className = "error";
        el.innerText = "Error connecting to server.";
        output.appendChild(el);
    } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }
});

// Fetch records button
const fetchAndRender = async () => {
    if (!getdataBtn) return;

    getdataBtn.classList.add("loading");
    const btnText = getdataBtn.querySelector(".btn-text");
    const originalText = btnText ? btnText.textContent : "Fetch Records";
    if (btnText) btnText.textContent = "Loading...";

    try {
        const data = await getdatas();
        const records = data.result || [];
        renderRecords(records);
    } catch (err) {
        console.error("Error loading data:", err);
    } finally {
        getdataBtn.classList.remove("loading");
        if (btnText) btnText.textContent = originalText;
    }
};

getdataBtn.addEventListener("click", fetchAndRender);

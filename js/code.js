const urlBase = 'https://sharktronauts.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 ){		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
				userId = jsonObject.id;
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contact.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

// Controls a register window if the user wants to create an account
function toggleRegister(show)
{
	var registerDiv = document.getElementById("registerDiv");
	var registerResult = document.getElementById("registerResult");

	var loginDiv = document.getElementById("loginDiv");
	var loginResult = document.getElementById("loginResult");

	if (show)
	{
		loginDiv.style.display = "none"
		registerDiv.style.display = "block";
		registerResult.innerHTML = "";
	}
	else
	{
		registerDiv.style.display = "none";
		loginDiv.style.display = "block";
		loginResult.innerHTML = "";
	}
}

function doRegister() {
    var firstName = document.getElementById("regFirstName").value;
    var lastName = document.getElementById("regLastName").value;
	var username  = document.getElementById("regLogin").value;
    var password  = document.getElementById("regPassword").value;



    if (!firstName || !lastName || !username || !password) {
        document.getElementById("registerResult").innerHTML = "Must fill out all fields";
        return;
    }

	let pwError = validatePassword(password);
    if (pwError) {
        document.getElementById("registerResult").innerHTML = pwError;
        return;
    }

	//var hash = md5(password);

    document.getElementById("registerResult").innerHTML = "";

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        login: username,
        password: password
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {

			if (this.readyState == 4)
            {
                if (this.status != 200)
                {
                    document.getElementById("registerResult").innerHTML = "Server error (" + this.status + ").";
                    return;
                }

                var json = {};
                try { json = JSON.parse(xhr.responseText); } catch (e) {}

                if (json.error && json.error.length > 0)
                {
                    document.getElementById("registerResult").innerHTML = json.error;
                    return;
                }

                document.getElementById("registerResult").style.color = "green";
                document.getElementById("registerResult").innerHTML = "Account created! You can now log in.";
			}
        };

        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("registerResult").innerHTML = err.message;
    }
}

//  Helper: validate password strength 
function validatePassword(password) {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[\W]/.test(password)) return "Password must contain at least one special character.";
    return null; // means valid
}


function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt(tokens[1].trim());
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}


// Returns user to the index page + signs out of account
function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

// Controls a window section where the user can add a contact
function toggleAddContact(show)
{
    var addDiv = document.getElementById("addContactDiv");
    var table = document.getElementById("contactsTable");
    var msg = document.getElementById("addContactResult");

    if (show) {
        addDiv.style.display = "block";
        table.style.display = "none";
        if (msg) msg.innerHTML = "";
    } else {
        addDiv.style.display = "none";
        table.style.display = "table";
    }
}


function addContact()
{
	let contactFirst = document.getElementById("contactFirstName").value.trim();
    let contactLast = document.getElementById("contactLastName").value.trim();
    let email = document.getElementById("contactEmail").value.trim();
    let phone = document.getElementById("contactPhone").value.trim();

    document.getElementById("addContactResult").innerHTML = "";

	if (!contactFirst || !contactLast || !email || !phone) {
		document.getElementById("addContactResult").innerHTML = "All fields are required";
        return;
    }

    if (!validateEmail(email)) {
        document.getElementById("addContactResult").innerHTML = "Must enter a valid email address";
        return;
    }

    if (!validatePhone(phone)) {
        document.getElementById("addContactResult").innerHTML = "Must enter a valid phone number";
        return;
    }

    let tmp = { contactFirst, contactLast, email, phone, userId };
	console.log("Sending new contact:", tmp);

	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/CreateContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        try {
            let jsonObject = JSON.parse(xhr.responseText);
            console.log("CreateContact response:", jsonObject);

            if (jsonObject.error && jsonObject.error.length > 0) {
                document.getElementById("addContactResult").innerHTML = jsonObject.error;
                return;
            }

            document.getElementById("addContactResult").innerHTML = "Contact has been added";

            // Clear inputs
            document.getElementById("contactFirstName").value = "";
            document.getElementById("contactLastName").value = "";
            document.getElementById("contactEmail").value = "";
            document.getElementById("contactPhone").value = "";

            toggleAddContact(false);

            pullContacts();
        } catch (err) {
            console.error("Invalid JSON from backend:", xhr.responseText);
            document.getElementById("addContactResult").innerHTML = "Server error — check backend logs.";
        }
    }
	

};
xhr.send(jsonPayload);
	
}

// --- Validate email format ---
function validateEmail(email) {
    // Simple regex for common email patterns
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// --- Validate phone format ---
function validatePhone(phone) {
    const digits = phone.replace(/\D/g, ""); // strip non-digits
    return digits.length === 10;
}


// Based on the users search the conacts will appear 
function searchContacts() {
    const content = document.getElementById("searchBar").value.toUpperCase().trim();
    const selections = content.split(" ");
    const table = document.getElementById("contactsTable");
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        const td_fn = tr[i].getElementsByTagName("td")[0];
        const td_ln = tr[i].getElementsByTagName("td")[1];

        if (td_fn && td_ln) {
            const txtValue_fn = td_fn.textContent || td_fn.innerText;
            const txtValue_ln = td_ln.textContent || td_ln.innerText;

            tr[i].style.display = "none"; 

            for (let selection of selections) {
                if (
                    txtValue_fn.toUpperCase().indexOf(selection) > -1 ||
                    txtValue_ln.toUpperCase().indexOf(selection) > -1
                ) {
                    tr[i].style.display = "";
                }
            }
        }
    }
}

// Pulls all the contacts and puts them in the table once page is loaded 
function pullContacts() {
    let tmp = { search: "", userId: userId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SearchContacts.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                let contactList = document.getElementById("contactList");
                contactList.innerHTML = "";

                if (jsonObject.error && jsonObject.error.length > 0) {
                    document.getElementById("contactSearchResult").innerHTML = jsonObject.error;
                    return;
                }

                if (!jsonObject.results || jsonObject.results.length === 0) {
                    document.getElementById("contactSearchResult").innerHTML = "No contacts found.";
                    return;
                }

                jsonObject.results.forEach(c => {
					console.log(c);
                    let row = document.createElement("tr");

                    let td_first = document.createElement("td");
                    td_first.textContent = c.FirstName || c.firstName || "";
                    row.appendChild(td_first);

                    let td_last = document.createElement("td");
                    td_last.textContent  = c.LastName || c.lastName || "";

                    row.appendChild(td_last);

                    let td_email = document.createElement("td");
					td_email.textContent = c.Email || c.email || "";
                    row.appendChild(td_email);

                    let td_phone = document.createElement("td");
					let rawPhone = c.Phone || c.phone || "";
					td_phone.textContent = formatPhoneNumber(rawPhone);

                    row.appendChild(td_phone);

					let td_actions = document.createElement("td");

					// Edit button
					let editBtn = document.createElement("button");
					editBtn.className = "button small edit";
					editBtn.onclick = function () {
						editContact(c.Contact_ID, c.FirstName || c.firstName, c.LastName || c.lastName, c.Email || c.email, c.Phone || c.phone);
					};

					let editIcon = document.createElement("i");
					editIcon.className = "fas fa-pencil-alt";
					editBtn.appendChild(editIcon);

					td_actions.appendChild(editBtn);

					// Delete button
					let deleteBtn = document.createElement("button");
					deleteBtn.className = "button small delete";
					deleteBtn.onclick = function () { deleteContact(c.Contact_ID); };

					let deleteIcon = document.createElement("i");
					deleteIcon.className = "fas fa-trash";
					deleteBtn.appendChild(deleteIcon);

					td_actions.appendChild(deleteBtn);

					row.appendChild(td_actions);

                    contactList.appendChild(row);
                });
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function formatPhoneNumber(phone) {
    const digits = phone.replace(/\D/g, ""); // remove all non-digits
    if (digits.length === 10) {
        return `(${digits.substring(0,3)}) ${digits.substring(3,6)}-${digits.substring(6)}`;
    }
    return phone; // fallback if not 10 digits
}

function toggleEditContact(show) {
    var editDiv = document.getElementById("editContactDiv");
    var table = document.getElementById("contactsTable");
    var msg = document.getElementById("editContactResult");

    if (show) {
        editDiv.style.display = "block";
        table.style.display = "none";   
        if (msg) msg.innerHTML = "";
    } else {
        editDiv.style.display = "none";
        table.style.display = "table";  
    }
}


function editContact(id, first, last, email, phone) {
    editingContactId = id;

    // Fill the form directly
    document.getElementById("editFirstName").value = first || "";
    document.getElementById("editLastName").value  = last || "";
    document.getElementById("editEmail").value     = email || "";
    document.getElementById("editPhone").value     = phone || "";

    toggleEditContact(true);
}

function saveEditedContact() {
    let first = document.getElementById("editFirstName").value.trim();
    let last  = document.getElementById("editLastName").value.trim();
    let email = document.getElementById("editEmail").value.trim();
    let phone = document.getElementById("editPhone").value.trim();

    let resultEl = document.getElementById("editContactResult");
    resultEl.innerHTML = "";

    if (!first || !last || !email || !phone) {
        resultEl.innerHTML = "All fields are required.";
        return;
    }
    if (!validateEmail(email)) {
        resultEl.innerHTML = "Invalid email address.";
        return;
    }
    if (!validatePhone(phone)) {
        resultEl.innerHTML = "Phone number must be 10 digits.";
        return;
    }

    let tmp = {
        id: editingContactId,
        contactFirst: first,
        contactLast: last,
        email: email,
        phone: phone,
        userId: userId
    };

    console.log("Saving contact:", tmp);

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/UpdateContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("Update response:", xhr.responseText);
			
            try {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error && jsonObject.error.length > 0) {
                    resultEl.innerHTML = jsonObject.error;
                    return;
                }
                toggleEditContact(false);
                pullContacts();
            } catch (err) {
                resultEl.innerHTML = "Server error - invalid JSON.";
            }
        }
    };
    xhr.send(jsonPayload);
}


function deleteContact(id) {
    if (!confirm("Are you sure you want to delete this contact?")) {
        return;
    }

    let tmp = { id: id };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/DeleteContact.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Delete response:", xhr.responseText);
                pullContacts(); // refresh contacts after delete
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}


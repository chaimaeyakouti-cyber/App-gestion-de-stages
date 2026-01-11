let currentUser = null; // Elle doit être TOUT EN HAUT pour être accessible partout
let offers = []; // On crée une liste vide qui accueillera les données du serveur
async function fetchOffers() {
    try {
        const response = await fetch('http://localhost:3000/api/offers');
        const data = await response.json();
        offers = data; // On remplit notre variable avec les vraies données de MySQL
        displayOffers(); // On appelle ton affichage original
    } catch (error) {
        console.error("Erreur serveur:", error);
    }
}

// 1. Navigation entre les vues
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Gérer les classes actives sur le menu
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Cacher toutes les sections et afficher la bonne
        const target = this.getAttribute('data-target');
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        
        const targetSection = document.getElementById(target);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // --- DÉCLENCHEURS DE CONTENU ---
        if (target === 'mes-offres') {
            displayMyOffers();
        } 
        else if (target === 'entreprise') {
            displayCompanyForm();
        }
       
        else if (target === 'offres') {
            displayOffers();
        }
        else if (target === 'candidats-recus') {
            displayReceivedApplications();
        }
        else if (target === 'admin-etudiants' || target === 'admin-stats') {
            displayAdminDashboard();
        }
        else if (target === 'admin-conventions') {
            displayAdminConventions();
        }
    });
});

// 2. Générer les offres de stage
function displayOffers(searchTerm = "") {
    const list = document.getElementById('offers-list');
    
    // On filtre les données avant de les afficher
    const filteredOffers = offers.filter(off => 
        off.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        off.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        off.filiere.toLowerCase().includes(searchTerm.toLowerCase())
    );

    list.innerHTML = filteredOffers.map(off => `
        <div class="offer-card">
            <span class="badge">${off.filiere}</span>
            <h3>${off.title}</h3>
            <p style="color: #64748B; margin-bottom: 16px;">${off.company_name}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 0.9rem;">${off.type}</span>
                <button class="btn-postuler" style="background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                 Postuler
                </button>
            </div>
        </div>
    `).join('');
}

// 3. Simuler le clic sur l'upload
// --- GESTION DU DÉPÔT DE RAPPORT ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const btnSubmit = document.querySelector('.btn-submit-premium');

// Ouvrir l'explorateur de fichiers au clic
if(dropZone) dropZone.addEventListener('click', () => fileInput.click());

// Gérer le changement de fichier (sélection manuelle)
if(fileInput) fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
        updateDropZoneVisual(this.files[0].name);
    }
});

// Gérer le Drag & Drop
if(dropZone) {
    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => e.preventDefault());
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files; // Lie le fichier déposé à l'input
            updateDropZoneVisual(files[0].name);
        }
    });
}

// Fonction pour changer l'apparence une fois le fichier reçu
function updateDropZoneVisual(fileName) {
    dropZone.innerHTML = `
        <div class="upload-icon" style="color: #10b981;">✅</div>
        <h3>Fichier prêt : ${fileName}</h3>
        <p>Cliquez sur le bouton ci-dessous pour valider</p>
    `;
}
if(btnSubmit) {
    btnSubmit.addEventListener('click', () => {
        if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name;
            
            // Simulation du signal d'envoi
            alert("Signal envoyé : Le rapport '" + fileName + "' a été transmis avec succès à l'administration.");
            
            // Réinitialisation visuelle
            window.location.reload(); 
        } else {
            alert("Erreur : Veuillez d'abord sélectionner un fichier PDF.");
        }
    });
}
// Initialisation
document.addEventListener('DOMContentLoaded', () => {
   fetchOffers(); // On demande au serveur les offres dès que la page est prête
    const loginForm = document.getElementById('main-login-form');
    const authOverlay = document.getElementById('auth-overlay');



if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('auth-id').value;
        const password = document.getElementById('auth-password')?.value || "ocp2026"; // Utilise ton champ password

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password })
            });

            const data = await response.json();

            if (data.success) {
                currentUser = data.user; // On stocke les vraies infos (ex: OCP Group, ID: 2)
            
                authOverlay.classList.add('fade-out');
                document.querySelector('.user-info .name').innerText = currentUser.full_name;
                document.querySelector('.user-info .role').innerText = "Rôle: " + currentUser.role;

                filterSidebar(currentUser.role);
                
                // Redirection selon le rôle
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                if (currentUser.role === 'admin') {
                    document.getElementById('admin-stats').classList.add('active');
                } else if (currentUser.role === 'company') {
                    document.getElementById('entreprise').classList.add('active');
                    displayCompanyForm();
                } else {
                    document.getElementById('offres').classList.add('active');
                }
            } else {
                alert(data.message); // Affiche "Identifiant ou mot de passe incorrect"
            }
        } catch (error) {
            alert("Erreur de connexion au serveur.");
        }
    });
}

    // Gestion de la déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        authOverlay.classList.remove('fade-out');
        loginForm.reset();
        
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById('offres').classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-target="offres"]').classList.add('active');
    });
    const mainSearchInput = document.querySelector('.filters input[type="text"]');
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', (e) => {
            displayOffers(e.target.value);
        });
    }
});

function filterSidebar(role) {
    const allLinks = document.querySelectorAll('.nav-link, .menu-label');
    allLinks.forEach(el => el.style.display = 'none');

    document.querySelectorAll('.menu-label').forEach(el => el.style.display = 'block');

    if (role === 'student') {
        document.querySelectorAll('.student-only').forEach(el => el.style.display = 'block');
    } 
    else if (role === 'company') {
        document.querySelectorAll('.company-only').forEach(el => el.style.display = 'block');
    } 
    else if (role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
    }
}

function displayCandidatureForm(offerId) {
    const container = document.getElementById('candidature-container');
    
    container.innerHTML = `
        <div class="publish-card">
            <h2>📄 Formulaire de Postulation</h2>
            <form id="application-form">
                <div class="input-wrapper">
                    <label>Lien vers votre CV (Google Drive/Dropbox)</label>
                    <input type="url" id="cv-link" class="modern-input" placeholder="https://..." required>
                </div>
                <div class="input-wrapper">
                    <label>Lettre de Motivation</label>
                    <textarea id="motivation-text" class="modern-input modern-textarea" placeholder="Expliquez votre intérêt..."></textarea>
                </div>
                <button type="submit" class="btn-publish">🚀 Envoyer ma candidature</button>
            </form>
        </div>`;

    document.getElementById('application-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // On vérifie que currentUser existe bien avant d'envoyer
        if (!currentUser) {
            alert("Erreur : Vous devez être connecté pour postuler.");
            return;
        }

        const applicationData = {
            offer_id: offerId,
            student_id: currentUser.id, // On utilise l'ID réel de l'étudiant (ex: 3)
            cv_url: document.getElementById('cv-link').value,
            motivation_text: document.getElementById('motivation-text').value // Correspond à MySQL
        };

        try {
            const response = await fetch('http://localhost:3000/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationData)
            });

            if (response.ok) {
                alert("✅ Félicitations Anas ! Ta candidature a été enregistrée dans la base de données.");
                window.location.reload(); 
            } else {
                const errorData = await response.json();
                console.error("Détails erreur:", errorData);
                alert("Erreur lors de l'envoi au serveur.");
            }
        } catch (error) {
            console.error("Erreur Fetch:", error);
            alert("Le serveur Node.js ne répond pas. Vérifie qu'il est lancé.");
        }
    });
}
function displayCompanyForm() {
    const container = document.getElementById('entreprise-container');
    container.innerHTML = `
        <div class="publish-card">
            <form id="job-offer-form">
                <div class="input-wrapper"><label>🎯 Titre de la mission</label><input type="text" id="pub-title" class="modern-input" placeholder="ex: Ingénieur Data" required></div>
                <div class="form-group-grid">
                    <div class="input-wrapper">
                        <label>📂 Type</label>
                        <select id="pub-type" class="modern-input">
                            <option value="PFE">PFE</option>
                            <option value="Stage d'initiation">Stage d'initiation</option>
                            <option value="Stage technique">Stage technique</option>
                        </select>
                    </div>
                    <div class="input-wrapper">
                        <label>🎓 Filière cible</label>
                        <select id="pub-filiere" class="modern-input">
                            <option>ASEDS</option><option>AMOA</option><option>Cloud & IoT</option><option>Cybersécurité</option><option>Data Engineering</option>
                        </select>
                    </div>
                </div>
                <div class="input-wrapper"><label>📝 Description</label><textarea id="pub-desc" class="modern-input modern-textarea"></textarea></div>
                <div style="display: flex; justify-content: flex-end; margin-top: 10px;"><button type="submit" class="btn-publish">🚀 Publier maintenant</button></div>
            </form>
        </div>
    `;

    // Écouter la soumission du formulaire
    document.getElementById('job-offer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Erreur : session expirée. Veuillez vous reconnecter.");
            return;
        }
        
        const newOffer = {
            title: document.getElementById('pub-title').value,
            type: document.getElementById('pub-type').value,
            filiere: document.getElementById('pub-filiere').value,
            description: document.getElementById('pub-desc').value,
            company_name: currentUser.full_name, // Nom dynamique
            company_id: currentUser.id          // ID dynamique (ex: 8)
        };

        try {
            const response = await fetch('http://localhost:3000/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOffer)
            });

            if (response.ok) {
                const result = await response.json();
                alert("✅ " + result.message); // Affiche "Offre publiée avec succès !"
                window.location.reload(); 
            }
        } catch (error) {
            console.error("Erreur publication:", error);
            alert("Le serveur ne répond pas.");
        }
    });
}

function displayMyOffers() {
    const container = document.getElementById('mes-offres-container');
    if (!container) return;

    // On filtre la liste globale pour ne garder que les offres de l'entreprise actuelle
    const currentCompanyName = document.querySelector('.user-info .name').innerText;
    const myPublishedOffers = offers.filter(off => off.company_name === currentCompanyName);

    if (myPublishedOffers.length === 0) {
        container.innerHTML = "<p style='color: var(--text-muted);'>Vous n'avez pas encore publié d'offres.</p>";
        return;
    }

    container.innerHTML = myPublishedOffers.map(off => `
        <div class="offer-card">
            <span class="badge">${off.type}</span>
            <h3>${off.title}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin: 10px 0;">Filière : ${off.filiere}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid var(--border); padding-top: 15px;">
                <span style="font-weight: 600; font-size: 0.9rem; color: var(--primary);">Candidats : 0</span>
                <button onclick="editOffer(${JSON.stringify(off).replace(/"/g, '&quot;')})" class="btn-action-accept" style="background: #10b981; border: none; color: white; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">Modifier</button>
            </div>
        </div>
    `).join('');
}
window.editOffer = function(offerData) {
    // 1. On change de vue vers le formulaire de l'entreprise
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('entreprise').classList.add('active');
    
    // 2. On met à jour visuellement la sidebar
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-target="entreprise"]').classList.add('active');

    // 3. On affiche le formulaire vierge
    displayCompanyForm();

    // 4. On attend un court instant que le formulaire soit dessiné pour le remplir
    setTimeout(() => {
        const form = document.getElementById('job-offer-form');
        if (form) {
            form.querySelector('input[type="text"]').value = offerData.title;
            form.querySelector('select').value = offerData.type;
            form.querySelector('textarea').value = offerData.desc || "";
            
            // On change le texte du bouton pour montrer qu'on modifie
            const submitBtn = form.querySelector('.btn-publish');
            if(submitBtn) {
                submitBtn.innerHTML = "💾 Enregistrer les modifications";
                submitBtn.style.background = "#10b981";
            }
        }
    }, 50);
};

async function displayReceivedApplications() {
    const container = document.getElementById('candidats-tbody');
    if (!container || !currentUser) return;

    try {
        const response = await fetch(`http://localhost:3000/api/applications/company/${currentUser.id}`);
        const applications = await response.json();

        if (applications.length === 0) {
            container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Aucune candidature reçue.</td></tr>`;
            return;
        }

        container.innerHTML = applications.map(app => `
            <tr>
                <td style="font-weight: 600;">${app.student_name}</td>
                <td><span class="badge-filiere">${app.student_filiere}</span></td>
                <td>${app.offer_title}</td>
                <td>${new Date(app.app_date).toLocaleDateString('fr-FR')}</td>
                <td style="text-align: right;" class="action-cell">
                    <button onclick="updateApplicationStatus(${app.app_id}, 'Acceptée')" class="btn-action-accept">Accepter</button>
                    <button onclick="updateApplicationStatus(${app.app_id}, 'Refusée')" class="btn-action-reject" style="margin-left:5px;">Refuser</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Erreur chargement candidatures:", error);
    }
}
window.acceptApplication = function(appId) {
    const row = document.getElementById(`row-app-${appId}`);
    const actionCell = row.querySelector('.action-cell');

    // 1. Confirmation visuelle
    actionCell.innerHTML = `
        <span style="color: #10b981; font-weight: 700; display: flex; align-items: center; justify-content: flex-end; gap: 5px;">
            ✅ Candidat Accepté
        </span>
    `;

    // 2. Notification de succès
    alert("La candidature a été acceptée. Un mail de confirmation sera envoyé à l'étudiant.");
    
    // Ici, vous pourriez plus tard ajouter un appel serveur pour enregistrer ce changement
};

async function displayAdminDashboard() {
    const container = document.getElementById('admin-etudiants');
    if (!container) return; // Sécurité si l'élément n'existe pas

    // 1. Injection de la structure HTML (Statique)
    container.innerHTML = `
        <div class="page-header">
            <div class="header-text">
                <h1>Suivi des Étudiants</h1>
                <p>Gérez les filières et attribuez les <span class="keyword-highlight">notes de soutenance</span>.</p>
            </div>
            <div class="header-badge">Académique</div>
        </div>

        <div class="data-card">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Étudiant</th>
                        <th>Filière</th>
                        <th>Note /20</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="admin-students-tbody">
                    <tr><td colspan="4" style="text-align:center;">Chargement des données...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    try {
        // 2. Appel au serveur pour récupérer les vrais étudiants (role='student')
        const response = await fetch('http://localhost:3000/api/admin/students');
        const students = await response.json();
        const tbody = document.getElementById('admin-students-tbody');

        // 3. Remplissage dynamique avec les données de ta table users
        tbody.innerHTML = students.map(st => `
            <tr>
                <td style="font-weight:600;">${st.full_name}</td>
                <td><span class="badge-filiere">${st.filiere || 'Non définie'}</span></td>
                <td>
                    <input type="number" id="note-${st.id}" min="0" max="20" step="0.25" class="modern-input" style="width:80px;" placeholder="--">
                </td>
                <td>
                    <button onclick="saveGrade(${st.id})" class="btn-action-accept" style="padding: 6px 12px;">Enregistrer</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Erreur lors du chargement des étudiants:", error);
        document.getElementById('admin-students-tbody').innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Erreur de connexion au serveur</td></tr>`;
    }
}

function displayAdminConventions() {
    const tbody = document.getElementById('admin-conventions-tbody');
    
    const conventions = [
        { id: 1, student: "Anas Naji", company: "Orange Business", file: "convention_naji.pdf", status: "En attente" },
        { id: 2, student: "Sara Alami", company: "Thales", file: "convention_alami.pdf", status: "Signée" },
        { id: 3, student: "Mehdi Benani", company: "OCP Group", file: "convention_benani.pdf", status: "En attente" }
    ];

    tbody.innerHTML = conventions.map(conv => `
        <tr>
            <td style="font-weight:600;">${conv.student}</td>
            <td>${conv.company}</td>
            <td>
                <span onclick="downloadPDF('${conv.file}')" style="cursor:pointer; color:#7c3aed; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                    📄 ${conv.file}
                </span>
            </td>
            <td>
                <span id="status-${conv.id}" class="badge-filiere" style="background: ${conv.status === 'Signée' ? '#DCFCE7' : '#FEF3C7'}; 
                color: ${conv.status === 'Signée' ? '#166534' : '#92400E'};">
                    ${conv.status}
                </span>
            </td>
            <td style="text-align: right;">
                ${conv.status === 'En attente' ? 
                    `<button class="btn-action-accept" onclick="signConvention(${conv.id})" style="padding: 6px 12px; font-size: 0.8rem;">Signer</button>` : 
                    `<span style="color: #166534; font-weight: 600;">✅ Terminé</span>`
                }
            </td>
        </tr>
    `).join('');
}

// Fonction pour simuler le téléchargement du PDF
window.downloadPDF = function(fileName) {
    // Dans une vraie application, cela pointerait vers l'URL du fichier sur le serveur
    alert("Préparation du téléchargement de : " + fileName);
    
    // Simulation d'un délai de téléchargement
    setTimeout(() => {
        console.log("Fichier " + fileName + " téléchargé.");
    }, 1000);
};

// Nouvelle fonction pour gérer la signature
window.signConvention = function(id) {
    const statusBadge = document.getElementById(`status-${id}`);
    const actionCell = statusBadge.parentElement.nextElementSibling;

    // 1. Simulation visuelle de signature
    statusBadge.innerText = "Signée";
    statusBadge.style.background = "#DCFCE7";
    statusBadge.style.color = "#166534";

    // 2. Remplacer le bouton par une confirmation
    actionCell.innerHTML = `<span style="color: #166534; font-weight: 600;">✅ Terminé</span>`;

    // 3. Notification
    alert("La convention a été signée électroniquement avec succès !");
};

document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('btn-postuler')) {
        console.log("Clic sur Postuler détecté"); // Pour vérifier dans la console (F12)
        
        const card = e.target.closest('.offer-card');
        const title = card.querySelector('h3').innerText;
        
        // On cherche l'offre dans la liste
        const selectedOffer = offers.find(o => o.title === title);
        
        if (selectedOffer) {
            // 1. On bascule sur la vue candidature
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById('candidature').classList.add('active');
            
            // 2. On met à jour le menu sidebar
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-target="candidature"]').classList.add('active');

            // 3. On lance le formulaire avec l'ID réel
            displayCandidatureForm(selectedOffer.id); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error("Offre non trouvée pour le titre :", title);
        }
    }
});
window.updateApplicationStatus = async function(appId, newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/applications/${appId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert(`✅ La candidature a été ${newStatus}`);
            displayReceivedApplications(); // On rafraîchit la liste
        }
    } catch (error) {
        console.error("Erreur mise à jour statut:", error);
    }
};
window.saveGrade = async function(studentId) {
    const noteInput = document.getElementById(`note-${studentId}`);
    const noteValue = noteInput.value;

    if (noteValue === "") {
        alert("Veuillez saisir une note avant d'enregistrer.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/admin/save-grade`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, note: noteValue })
        });

        if (response.ok) {
            alert("✅ Note enregistrée avec succès dans la table conventions !");
        }
    } catch (error) {
        console.error("Erreur enregistrement note:", error);
    }
};
// Définition d'un objet pour assigner des couleurs aux compétences
const skillColors = {
    "bootstrap": "blue",
    "html5": "red",
    "symfony": "yellow",
    "css3": "blue",
    "javascript": "green",
    "vue.js": "green",
    "figma": "pink",
    "php": "yellow",
    "c#": "purple",
    "tailwind": "blue"
};

// Exécute du code lorsque le document HTML est complètement chargé
document.addEventListener('DOMContentLoaded', (event) => { 
    // Référence au conteneur des apprenants dans le HTML
    const apprenantsContainer = document.getElementById('apprenants-container');
    let selectedSkills = []; // Tableau pour stocker les compétences sélectionnées
    let selectedPromotion = 'all'; // Promotion sélectionnée, par défaut 'all'
    let searchQuery = ''; // Query de recherche, par défaut vide

    // Objets pour stocker les correspondances entre IDs et noms des promotions/compétences
    let promotionMap = {};
    let competencesMap = {};

    // Fonction pour normaliser une chaîne de caractères (supprimer accents, mettre en minuscules)
    const normalizeString = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    // Fonction pour récupérer les données des promotions et des compétences depuis l'API
    const fetchPromotionsAndCompetences = () => {
        return Promise.all([
            fetch('https://api-trombi.webedy.fr/wp-json/wp/v2/promotions').then(response => response.json()),
            fetch('https://api-trombi.webedy.fr/wp-json/wp/v2/competences').then(response => response.json())
        ]).then(([promotions, competences]) => {
            promotions.forEach(promotion => {
                promotionMap[promotion.id] = promotion.name;
            });

            competences.forEach(competence => {
                competencesMap[competence.id] = competence.name;
            });
        });
    };

    // Fonction pour récupérer les apprenants depuis l'API et filtrer selon les critères
    const fetchApprenants = () => {
        let url = 'https://api-trombi.webedy.fr/wp-json/wp/v2/apprenants?per_page=100';

        fetch(url)
            .then(response => response.json())
            .then(apprenants => {
                apprenantsContainer.innerHTML = ''; // Nettoie les résultats précédents
                const filteredApprenants = apprenants.filter(apprenant => {
                    const hasSkills = selectedSkills.every(skill => apprenant.competences.includes(parseInt(skill)));
                    const hasPromotion = selectedPromotion === 'all' || apprenant.promotions.includes(parseInt(selectedPromotion));
                    const hasName = normalizeString(apprenant.title.rendered).includes(normalizeString(searchQuery));
                    return (!selectedSkills.length || hasSkills) && hasPromotion && hasName;
                });

                filteredApprenants.forEach(apprenant => {
                    const promotionId = apprenant.promotions[0];
                    const promotionName = promotionMap[promotionId] || 'Unknown';

                    const competencesElements = apprenant.competences.map(skillId => {
                        const skillName = competencesMap[skillId] || 'Unknown';
                        const colorClass = skillColors[skillName.toLowerCase()] || 'gray';
                        return `<span class="skill ${colorClass}">${skillName}</span>`;
                    });

                    const excerptContent = apprenant.excerpt.rendered.trim(); 
                    const isEmptyExcerpt = excerptContent === "" || excerptContent === "<p></p>";

                    const card = document.createElement('div');
                    card.className = 'card';
                    card.setAttribute('onclick', 'flipCard(this)');

                    card.innerHTML = `
                                    <div class="card-inner">
                                        <div class="card-front">
                                            <h2 class="name">${apprenant.title.rendered}</h2>
                                            <div class="container-image"><img class="profilePic" src="${apprenant.image}"></div>
                                            <p class="promo">Promotion: ${promotionName}</p>
                                            <div class = "container-skill"><p class="skills">${competencesElements.join('')}</p></div>
                                            <div class="links">
                                                <a href="${apprenant.urlgit}" target="_blank" onclick="event.stopPropagation();">
                                                <img src="assets/icones/logoGithub.svg"></a>
                                                <a href="${apprenant.linkedin}" target="_blank" onclick="event.stopPropagation();">
                                                <img src="assets/icones/logoLinkedin.svg"></a>
                                                <a href="${apprenant.cv}" target="_blank" onclick="event.stopPropagation();">
                                                <img src="assets/icones/logoCV.svg"></a>
                                                <a href="${apprenant.portfolio}" target="_blank" onclick="event.stopPropagation();">
                                                <img src="assets/icones/logoPortfolio.svg"></a>
                                            </div>
                                        </div>
                                            <div class="card-back ${isEmptyExcerpt ? 'hidden' : ''}">
                                            <p class="excerpt">${excerptContent}</p>
                                        </div>
                                    </div>
                                `;
                    apprenantsContainer.appendChild(card);
                });
            })
            .catch(error => console.error('Erreur:', error));
    };

    // Récupération initiale des promotions et compétences, puis des apprenants
    fetchPromotionsAndCompetences().then(() => {
        fetchApprenants(); // Affiche tous les apprenants par défaut
    });

    // Gestion des événements pour la recherche, le dropdown et les boutons de tags
    document.getElementById('search').addEventListener('input', (event) => {
        searchQuery = event.target.value;
        fetchApprenants();
    });

    document.getElementById('dropdown').addEventListener('change', (event) => {
        selectedPromotion = event.target.value;
        fetchApprenants();
    });

    document.querySelectorAll('.tags').forEach(button => {
        button.addEventListener('click', (event) => {
            const skillId = event.target.id.replace('tag-', '');
            if (selectedSkills.includes(skillId)) {
                // Si la compétence est déjà sélectionnée, la retirer et réinitialiser la couleur de fond
                selectedSkills = selectedSkills.filter(s => s !== skillId);
                event.target.style.backgroundColor = ''; // Réinitialise la couleur de fond
            } else {
                // Si la compétence n'est pas sélectionnée, l'ajouter et changer la couleur de fond
                selectedSkills.push(skillId);
                event.target.style.backgroundColor = '#f8a11c';
            }
            fetchApprenants();
        });
    });

    // Ajouter l'event listener pour le bouton de réinitialisation des filtres
    document.getElementById('tag-reset').addEventListener('click', () => {
        selectedSkills = [];
        selectedPromotion = 'all';
        searchQuery = '';
        document.getElementById('search').value = '';
        document.getElementById('dropdown').value = 'all';
        document.querySelectorAll('.tags').forEach(button => {
            button.style.backgroundColor = '';
        });
        fetchApprenants();
    });
});

// Fonction pour retourner la carte lors du clic
function flipCard(card) {
    card.classList.toggle('flipped');
}


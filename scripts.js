document.addEventListener('DOMContentLoaded', (event) => {
    const apprenantsContainer = document.getElementById('apprenants-container');

    // Fetch les données des promotions et les stocker dans une map pour une recherche rapide
    fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/promotions')
        .then(response => response.json())
        .then(promotions => {
            // Créer une map des promotions pour une recherche rapide
            const promotionMap = {};
            promotions.forEach(promotion => {
                promotionMap[promotion.id] = promotion.slug;
            });

            // Fetch les compétences et les stocker dans une map pour une recherche rapide
            fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/competences')
                .then(response => response.json())
                .then(competences => {
                    // Créer une map des compétences pour une recherche rapide
                    const competencesMap = {};
                    competences.forEach(competence => {
                        competencesMap[competence.id] = competence.name;
                    });

                    // Fetch la liste des apprenants avec une limite de 100 par page
                    fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants?per_page=100')
                        .then(response => response.json())
                        .then(apprenants => {
                            apprenants.forEach(apprenant => {
                                // Trouver le nom de la promotion
                                const promotionId = apprenant.promotions[0]; // Supposer que chaque apprenant a une promotion
                                const promotionName = promotionMap[promotionId] || 'Unknown';

                                // Trouver les noms des compétences et attribuer des classes de couleurs
                                const competencesElements = apprenant.competences.map(skillId => {
                                    const skillName = competencesMap[skillId] || 'Unknown';
                                    let colorClass;
                                    switch(skillName) {
                                        case 'HTML5':
                                            colorClass = 'font-semibold bg-red-400';
                                            break;
                                        case 'CSS':
                                            colorClass = 'font-semibold bg-sky-500';
                                            break;
                                        case 'TailwindCSS':
                                            colorClass = 'font-semibold bg-teal-500';
                                            break;
                                        case 'JavaScript':
                                            colorClass = 'font-semibold bg-yellow-500';
                                            break;
                                        case 'Figma':
                                            colorClass = 'font-semibold bg-purple-600';
                                            break;
                                        default:
                                            colorClass = 'font-semibold bg-gray-800';
                                    }
                                    return `<span class="skill ${colorClass}">${skillName}</span>`;
                                });

                                // Créer un élément de carte
                                const card = document.createElement('div');
                                card.className = 'card';
                                card.setAttribute('onclick', 'flipCard(this)');

                                // Remplir la carte avec les données de l'apprenant
                                card.innerHTML = `
                                    <div class="card-inner">
                                        <div class="card-front">
                                            <h2 class="name">${apprenant.nom}<br>${apprenant.prenom}</h2>
                                            <img class="profilePic" src="${apprenant.image}"/>
                                            <p class="promo">Promotion: ${promotionName}</p>
                                            <p class="skills">${competencesElements.join('')}</p>
                                            <div class="links">
                                                <a href="${apprenant.urlgit}" target="_blank"><img src="logoGithub.svg"></a>
                                                <a href="${apprenant.linkedin}" target="_blank"><img src="logoLinkedin.svg"></a>
                                                <a href="${apprenant.cv}" target="_blank"><img src="logoCV.svg"></a>
                                                <a href="${apprenant.portfolio}" target="_blank"><img src="logoPortfolio.svg"></a>
                                            </div>
                                        </div>
                                        <div class="card-back">
                                            <p class="excerpt">${apprenant.excerpt.rendered}</p>
                                        </div>
                                    </div>
                                `;

                                // Ajouter la carte au conteneur
                                apprenantsContainer.appendChild(card);
                            });
                        })
                        .catch(error => console.error('Erreur:', error)); // Gérer les erreurs pour le fetch des apprenants
                })
                .catch(error => console.error('Erreur:', error)); // Gérer les erreurs pour le fetch des compétences
        })
        .catch(error => console.error('Erreur:', error)); // Gérer les erreurs pour le fetch des promotions
});

// Fonction pour retourner la carte
function flipCard(card) {
    card.classList.toggle('flipped');
}
